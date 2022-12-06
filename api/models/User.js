
const mongoose= require('mongoose')

const UserSchema = new mongoose.Schema({
  email: {type:String,unique:true},
  password: {type:String},
});

const User = mongoose.model('User', UserSchema);
// mongoose.exports=mongoose.module(mongoose.model('User', UserSchema))
mongoose.exports= User;