
let channelArray = document.querySelectorAll(".channel");

channelArray.forEach((element)=>{
    element.addEventListener("click",getId(element.getAttribute("id")));
})

function getId(_id){
    return (event)=>{
        var url = "/channel/" + _id;
        console.log(url);
        window.location.href = url;
    }
}

