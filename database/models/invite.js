const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const inviteSchema = new Schema({

    roomname : 
    {
        type : String,
        required : true
    },

    room_id : {
        type : String,
        required : true
    },
    createdBy :
    {
        type : String,
        required : true
    },
    
    tags :
    {
        type : Array,
    },

    receiver :
    {
        type : String,
        required : true
    },

    isAccepted : {
        type : Boolean,
        default : false
    }
},
{
    timestamps : true
});

module.exports = mongoose.model('invites',inviteSchema);

