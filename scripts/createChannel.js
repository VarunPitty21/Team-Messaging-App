const nameInput = document.getElementById("name-input");
const descInput = document.getElementById("description-input");
const tagsInput = document.getElementById("tags-input");
const userInput = document.getElementById("user-input");
const addTagBtn = document.getElementById("addTag");
const addUser = document.getElementById("addUser");
const createChannelBtn = document.getElementById("createChannel");
const tagDiv = document.getElementById("tags");
const userDiv = document.getElementById("users");


addTagBtn.addEventListener("click",onAddTagClicked());
addUser.addEventListener("click",onAddUserClicked());

function onAddUserClicked(){
    return ()=>{
        if(userInput.value==""){
            alert("Username cannot be empty");
        }
        else{

            let username = userInput.value;
            
            let request = new XMLHttpRequest()
            request.open("POST","/checkUser");
            request.setRequestHeader("Content-type","application/json");
            request.send(JSON.stringify({username : username}));
            
            request.addEventListener("load",()=>{
                if(request.status==201){
                    let userNode = document.createElement('li');
                    userNode.innerText = userInput.value;
                    userDiv.appendChild(userNode);
                    userInput.value = "";
                }
                else{
                    alert("User not found");
                }
            })
        }
    }
}

function onAddTagClicked(){
    return ()=>{
        if(tagsInput.value==""){
            alert("Empty tag cannot be added");
        }
        else{
            var tagNode = document.createElement('li');
            tagNode.innerText = tagsInput.value;

            tagDiv.appendChild(tagNode);

            tagsInput.value = "";
        }
    }
}

createChannelBtn.addEventListener("click",createChannelClicked());

function createChannelClicked(){
    return ()=>{
        if(nameInput.value=="" || descInput.value==""){
            alert("Name/description cannot be empty");
            return;
        }

        let channelObj = {
            name : nameInput.value,
            description : descInput.value,
            tags : [],
            users : []
        };

        

        if(tagDiv.children.length!=0){
            for(let i=0;i<tagDiv.children.length;i++){
                channelObj.tags.push(tagDiv.children[i].innerText);
            }
        }

        if(userDiv.children.length!=0){
            for(let i=0;i<userDiv.children.length;i++){
                channelObj.users.push(userDiv.children[i].innerText);
            }
        }

        nameInput.value = "";
        descInput.value = "";
        userDiv.innerHTML = "";
        tagDiv.innerHTML = "";

        var request = new XMLHttpRequest()
        request.open("POST","/createChannel");
        request.setRequestHeader("Content-type","application/json");
        request.send(JSON.stringify(channelObj));

        request.addEventListener("load",()=>{
            if(request.status==(200)){
                alert("Channel created");
                window.location.href = "/";
            }
            else{
                alert("Failed to create Channel");
            }
        })
    }
}



