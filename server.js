// Lets build for cause

// dependencies--------------------------------------------------------------
//--------------------------------------------------------------------------
const express = require("express");
const session = require('express-session');
const db = require("./database");
const multer = require("multer");
const userModel = require("./database/models/user.js");
const sendEmail = require("./utilities/sendEmail.js");
const http = require('http');
const socketio = require("socket.io");
const roomModel = require("./database/models/room.js");
const inviteModel = require("./database/models/invite.js");
const formatMessage = require("./utilities/message.js");
const roomUserModel = require("./database/models/roomUser.js");
const messageSchema = require("./database/models/message.js");
const user = require("./database/models/user.js");



//=============================================================================
//=============================================================================

const app = express();
db.init();
const server = http.createServer(app);
const io = socketio(server);

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './profile-pictures');
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
      cb(null, file.fieldname + '-' + uniqueSuffix)
    }
})
  
const profiles = multer({ storage: storage })


//============================================================================
//===========================================================================
//middlewares--

app.use(express.json());
app.use(express.urlencoded());
app.use(express.static("profile-pictures"));
app.use(express.static("scripts"));
app.use(express.static("styles"));

app.set('view engine','ejs');
app.use(session({
    secret: 'Team messaging app',
    saveUninitialized: true,
}))



//===========================================================================
//==========================================================================

app.route("/")
.get((request,response)=>{
    if(request.session.isLoggedIn){

        roomModel.find({
            members : {
                $elemMatch : {username : request.session.username}
            }
        })
        .then((result) => {
            response.render("home",{
                username : request.session.username,
                token : request.session.token,
                profile_picture : request.session.profile_picture,
                channel : result
            });
        }).catch((err) => {
            request.session.destroy();
            response.render("index",{error : "Please Login again"});
        });
        
    }
    else{
        response.render("index",{error : ""});
    }
})
.post((request,response)=>{
    var user = request.body;

    if(!user.username||!user.password){
        response.render("index",{error: "Fields are empty"});
    }

    userModel.findOne(user)
    .then((result)=>{
        if(!result){
            response.render("index",{error : "User does not exists"});
            return;
        }
        if(result.isVerified==false){
            response.render("index",{error : "Please Verify for Logging in"});
        }
        else{
            request.session.isLoggedIn = true;
            request.session.token = result.token;
            request.session.username = result.username;
            request.session.profile_picture = result.profile_picture;
            //socket.request.session.username = result.username;

            response.redirect("/"); 
        }
    })
    .catch((err)=>{
        response.render("index",{error : "Something went wrong"});
    })
})



app.route("/signUp")
.get(function(request,response){
    response.render("signUp",{error : ""});
})
.post(profiles.single("profile-pic"),(request,response)=>{
    
    if(!request.file){
        response.render("signUp",{error : "Profile cannot be Null"});
        return;
    }

    let user = request.body;
    if(!user.username||!user.email||!user.password||!user.region){
        response.render("signUp",{error : "Fields are empty"});
        return;
    }

    userModel.create({
        username : user.username,
        password : user.password,
        profile_picture : request.file.filename,
        email : user.email,
        isVerified : false,
        region : user.region
    })
    .then((result) => {

        const url = '<a href = "http://localhost:5500/verifyUser/'+result.token+'">Verify Your Email</a>';
        sendEmail(
            result.email,
            "Team Messeger : Verify your email",
            url,
            function(error){
                if(error){
                    response.render("signUp",{error : "E-mail verification failed"});
                }
                else{
                    response.render("index",{error : "Verification email is sent to you"}); 
                }
            }
        )
    })
    .catch((err) => {
        response.render("signUp",{error : "Something went wrong"});
    });
})



app.get("/verifyUser/:token",(request,response)=>{
    let token = request.params.token;

    userModel.updateOne({token : token},{$set : {isVerified : true}})
    .then((result)=>{
        if(result.matchedCount==0){
            response.render("index",{error : "Verification failed"});
        }
        else{
           // console.log(result);
            response.render("index",{error : "Verification Successful"});
        }
    })
    .catch((err)=>{
        response.render("index",{error : "Verification failed"});
    })
})


app.route("/forgotPassword")
.get((request,response)=>{
    response.render("forgotPasswordPage",{error : ""});
})
.post((request,response)=>{
    if(!request.body.email){
        response.render("forgotPasswordPage",{error : "Email can't be empty"});
        return;
    }

    userModel.findOne(request.body)
    .then((result)=>{
        if(!result){
            response.render("forgotPasswordPage",{error : "Entered email is not registered with us"});
            return;
        }
        const url = '<a href = "http://localhost:5500/changePassword/'+result.token+'">Change your Passoword</a>';
        sendEmail(
            result.email,
            "Team Messeger : Change your Password",
            url,
            function(error){
                if(error){
                    response.render("index",{error : error});
                }
                else{
                    response.render("index",{error:"Email is sent on registered email"})
                }
            }
        )
    })
    .catch((err)=>{
        response.render("index",{error : "Something went wrong"});
    })
})


app.route("/changePassword/:token")
.get((request,response)=>{
    let token = request.params.token;
    response.render("changePasswordPage",{token : token,error : ""});
})
.post((request,response)=>{
    let token = request.params.token;
    if(!request.body.password||!request.body.password2||request.body.password!=request.body.password2){
        response.render("changePasswordPage",{token : token,error : "Password didn't match"});
        return;
    }

    userModel.updateOne({token : token},{$set : {password : request.body.password}})
    .then((result)=>{
        if(result.matchedCount==0){
            response.render("changePasswordPage",{token : token,error : "Something went wrong"});
        }
        else{
            if(request.session){
                request.session.destroy();
            }
            response.render("index",{token : token,error : "Password successfully changed! Please Login"});
        }
    })
    .catch((err)=>{
        response.render("changePasswordPage",{token : token,error : "Something went wrong"});
    })
})


app.get("/logout",(request,response)=>{
    if(request.session.isLoggedIn){
        request.session.destroy();
        response.render("index",{error : "Logout Successful"});
    }
    else{
        response.render("index",{error : ""});
    }
})

app.route("/createChannel")
.get((request,response)=>{
    if(!request.session.isLoggedIn){
        response.render("index",{error : "Please Login to access this feature"});
        return;
    }

    response.render("createChannel",{error : ""});
})
.post((request,response)=>{
    let channelObj = request.body;

    if(channelObj.name=="" || channelObj.description==""){
        response.status(404).send();
        return;
    }

    let members = [];
    let obj = {
        username : request.session.username
    };
    members.push(obj)
    roomModel.create({
        roomname : channelObj.name,
        description : channelObj.description,
        createdBy : request.session.username,
        members : members,
        tags : request.body.tags
    })
    .then((result)=>{
        if(!result){
            response.status(404).send();
        }
        else{
            sendChannelRequest(request.body.users,result);
            response.status(200).send();
        }
    })
    .catch((err)=>{
        if(err){
            response.status(404);
        }
    })
})


app.post("/checkUser",(request,response)=>{
    if(request.body.username==""){
        response.status(404).end();
        return;
    }

    userModel.findOne(request.body)
    .then((result)=>{
        if(!result){
            response.status(404).send();
        }
        else{
            response.status(201).send();
        }
    })
    .catch((err)=>{
        response.status(404).send();
    })
})


app.route("/invites")
.get((request,response)=>{
    if(!request.session.isLoggedIn){
        response.render("index",{error : "Please Login to access this feature"});
    }
    else{
        let username = request.session.username;
        inviteModel.find({receiver : username})
        .then((result)=>{
            console.log(result);
            if(result.length==0){
                response.render("invitePage",{invites : [], error : "No invites Yet"});
            }
            else{
                response.render("invitePage",{error : "",invites : result});
            }
        })
    }
})
.post((request,response)=>{
    if(!request.session.isLoggedIn){
        response.send();
        return;
    }
    //console.log(request.body);
        inviteModel.deleteOne({
            receiver : request.session.username,
            room_id : request.body.room_id
        })
        .then((result) => {
            if(request.body.objective){
                var obj = {
                    username : request.session.username
                };
                roomModel.updateOne({
                        _id : request.body.room_id
                },
                {
                    $push : 
                        {
                            members : obj
                        }
                
                })
                .then((result)=>{
                    //console.log(result);
                    response.status(200).end(); 
                })
            }
            else{
                response.status(200).send();
            }
             
        })
        .catch((err) => {
            response.status(404).send();
        });
})

app.get("/channel/:id",(request,response)=>{
    if(!request.session.isLoggedIn){
        response.render("index",{error : "Please Login to access this feature"});
        return;
    }

    let id = request.params.id;

    roomModel.findOne({_id : id})
    .then((result)=>{
        //console.log(result);
        messageSchema.find({room_id : id}).then((data)=>{
            //console.log(data);
            response.render("channel",{
                channel : result ,
                 error : "",
                 username : request.session.username,
                 token : request.session.token,
                 profile_picture : request.session.profile_picture,
                posts : data
            });
        })
    })
    .catch((err)=>{
        response.render("channel",{channel : [],error : err});
    })
})


app.route("/dashboard")
.get((request,response)=>{
    if(!request.session.isLoggedIn){
        response.render("index",{error : "Please login to access this feature"});
    }
    else{
        getTop5((obj,err)=>{
            //console.log(obj.rooms)
            response.render("dashboardPage",{channel : obj.rooms,users : obj.users,error : err});
        });
    }
})

//===========================================================================
//==========================================================================
//socket io code

io.on('connection',socket =>{

        socket.on('joinRoom',(obj)=>{
            joinUserToRoom(obj,socket.id).then((result)=>{
                socket.join(result.room_id);
            })
        })
    
    
        socket.on('chatMessage',(message)=>{
                let messageObj = formatMessage(message.username,message.message);
                saveMessageInRoom(messageObj,message.room_id).then((result)=>{
                    io.to(message.room_id).emit('message',messageObj);
                })
        })

        socket.on("disconnect",()=>{
            deleteUser(socket.id).then((result)=>{
                //console.log(result);
            })
        })
})



//==========================================================================
//============================================================================

function sendChannelRequest(users,channel){
    users.forEach(function(user){
        inviteModel.create({
            roomname : channel.roomname,
            room_id : channel._id,
            createdBy : channel.createdBy,
            receiver : user,
            tags : channel.tags
        })
    })
}

function saveMessageInRoom(message,room_id){
    return messageSchema.create({
        username : message.username,
        room_id : room_id,
        text : message.message,
        createdAt : message.time
    })
}

function joinUserToRoom(obj,id){
    return roomUserModel.create({
        username : obj.username,
        id : id,
        room_id : obj.room_id
    })
}


function deleteUser(id){
    return roomUserModel.deleteOne({id:id})
}


async function getTop5(callback){
    let rooms = await getTop5rooms();
    if(rooms.length>5){
        rooms.splice(5);
    }
    let object = [];

    rooms.forEach((element)=>{
        object.push(element._id);
    })

    let roomArray = await getRooms(object);

    let sortedRooms = [];
    object.forEach((mm)=>{
        //console.log(mm);
        let curr = roomArray.filter((ele)=>{
            if(ele._id==mm){
                return true;
            }
        });
        //console.log(curr);
        sortedRooms.push(curr[0]);
    })

    let users = await getTop5users();
    if(users.length>=5){
        users.splice(0,5);
    }

    let obj = {
        rooms : sortedRooms,
        users : users
    }
    callback(obj,"");
}

function getTop5rooms(){
    return messageSchema.aggregate([
        { $match: {} },
        {$sortByCount : "$room_id"}
    ])
}

function getTop5users(){
    return messageSchema.aggregate([
        {$match : {}},
        {$sortByCount : "$username"}
    ])
}

function getRooms(obj){
    return roomModel.find({ room_id : obj });
}

//============================================================================
//=============================================================================
server.listen(5500,()=>{
    console.log("Server started at port 5500");
})