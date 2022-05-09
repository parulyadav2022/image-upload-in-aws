// const mongoose = require('mongoose');

// const ObjectId = mongoose.Schema.Types.ObjectId;

// const bookSchema = new mongoose.Schema({
//     title : {type : String, required : true,unique : true},
//     excerpt : {type : String, required : true},
//     userId : {type : ObjectId,required : true,ref :'Users'}, 
//     ISBN : {type : String, required : true,unique : true},
//     category : {type : String, required : true},
//     subcategory : {type : [String], required : true},
//     reviews : {type:Number,default:false,comment:Number},
//     deletedAt : {type:Date,default:null}
// })