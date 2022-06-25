const socket = io();
const chatForm = document.getElementById("chat-form");
const message = document.getElementById("text");
const usernameDiv = document.getElementById("username-div");
const postContainer = document.querySelector(".container");


socket.emit('joinRoom',{
    username : usernameDiv.innerText,
    room_id : postContainer.getAttribute("id")
})

socket.on('message', message =>{
    postContainer.appendChild(createPost(message));
})

chatForm.addEventListener("submit",(event)=>{
    event.preventDefault();
    
    let messageObj = {
        message : message.value,
        username : usernameDiv.innerText,
        room_id : postContainer.getAttribute("id")
    };
    message.value = "";
    socket.emit('chatMessage',messageObj);  
})


function createPost(post){
    var postDiv = document.createElement("div");
    postDiv.setAttribute("class" , "post");

    var nameDiv = document.createElement("h5");
    nameDiv.innerText = post.username;

    var textDiv = document.createElement("p");
    textDiv.innerText = post.message;

    var created = document.createElement("p");
    created.innerText = post.time;

    postDiv.appendChild(nameDiv);
    postDiv.appendChild(textDiv);
    postDiv.appendChild(created);

    return postDiv;
}


