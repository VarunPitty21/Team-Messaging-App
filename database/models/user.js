const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({

    username : 
    {
        type : String,
        required : true
    },

    password :
    {
        type : String,
        required : true
    },
    region : 
    {
      type : String,
      required : true  
    },
    email :
    {
        type : String,
        required : true
    },

    profile_picture :
    {
        type : String,
        required : true
    },
    
    isVerified :
    {
        type : Boolean,
        required : true
    },
    token : 
    {
        type : String,
        default : JSON.stringify(Math.random()) + JSON.stringify(Date.now()) + JSON.stringify(Math.random())
    }
},
{
    timestamps : true
});

module.exports = mongoose.model('user',userSchema);

