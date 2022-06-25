const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const roomSchema = new Schema({

    roomname : 
    {
        type : String,
        required : true
    },

    description :
    {
        type : String,
        required : true
    },

    createdBy :
    {
        type : String,
        required : true
    },

    members :
    {
        type : Array,
    },
    
    tags :
    {
        type : Array,
    }
},
{
    timestamps : true
});

module.exports = mongoose.model('room',roomSchema);

