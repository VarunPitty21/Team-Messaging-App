const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const messageSchema = new Schema({

    room_id : 
    {
        type : String,
        required : true
    },

    username :
    {
        type : String,
        required : true
    },
    
    text : {
        type : String,
        required : true
    },
    createdAt:{
        type : String,
        required : true
    }
},
{
    timestamps : true
});

module.exports = mongoose.model('roomMessages',messageSchema);

