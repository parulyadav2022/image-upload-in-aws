const moment = require('moment');
const mongoose = require('mongoose');

const ObjectId = mongoose.Schema.Types.ObjectId;


const bookSchema = new mongoose.Schema({
    title : {type : String, required : true,trim:true},
    excerpt : {type : String, required : true,trim:true},
    userId : {type : ObjectId,required : true,ref :'Users'}, 
    ISBN : {type : String, required : true,unique : true},
    category : {type : String, required : true},
    subcategory : {type : [String], required : true},
    reviews : {type:Number,default:0},
    deletedAt :{type:Date,default:null},
    isDeleted : {type:Boolean,default:false},
    releasedAt:{type : String,required : true},
    deletedAt : {type:Date,default:null}
},{timestamps:true})

module.exports = mongoose.model('Books',bookSchema)