module.exports = function createMessage(username,text){
    var obj = {
        username : username,
        message : text,
        time : new Date(Date.now()).toLocaleString()
    };

    return obj;
}