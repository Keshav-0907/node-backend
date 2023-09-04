const mongoose = require('mongoose')

//defining schema
const userSchema = new mongoose.Schema({
    name:String,
    email:String,
    password: String
})

//defining model
const User = mongoose.model("Users", userSchema)

module.exports = User;