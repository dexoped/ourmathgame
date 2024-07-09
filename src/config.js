const mongoose = require("mongoose");
const connect = mongoose.connect("mongodb://localhost:27017/loginDB");

connect.then(()=>{
    console.log("database connected successfully");
})
.catch(()=>{
    console.log("Not Connected to database");
});

const LoginSchema = new mongoose.Schema({
name:{
    type: String,
    required: true
},
password:{
    type:String,
    required: true
}
});

const collection = new mongoose.model("users", LoginSchema);

module.exports = collection;