let acceptArray = document.querySelectorAll(".accept");
let deleteArray = document.querySelectorAll(".decline");

acceptArray.forEach((element)=>{
    element.addEventListener("click",sendData(true));
})

deleteArray.forEach((element)=>{
    element.addEventListener("click",sendData(false));
})

function sendData(objective){
    return function(event){
        let obj = {
            room_id : event.target.parentNode.getAttribute("id"),
            objective : objective
        };

        var request = new XMLHttpRequest();
        request.open("post","/invites");
        request.setRequestHeader("Content-type","application/json");
        request.send(JSON.stringify(obj));

        request.addEventListener("load",()=>{
            let parent = event.target.parentNode.parentNode;
            parent.removeChild(event.target.parentNode);
            if(!parent.children.length){
                window.location.href = '/';
            }
        })
    }
}