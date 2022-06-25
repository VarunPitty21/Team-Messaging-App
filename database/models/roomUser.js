const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const roomUserSchema = new Schema({

    username : 
    {
        type : String,
        required : true
    },
    id :
    { 
        type : String,
        required : true
    },
    
    room_id :
    {
        type : String,
        required : true
    }
},
{
    timestamps : true
});

module.exports = mongoose.model('roomUser',roomUserSchema);

