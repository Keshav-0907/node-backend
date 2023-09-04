const express = require('express')
const PORT = 8080;
const app = express()
const mongoose = require('mongoose')
const cookieParser = require('cookie-parser')
const jwt = require('jsonwebtoken')
const bycrypt = require('bcrypt')

const User = require('./model/formmodel');
const { name } = require('ejs');


app.use(cookieParser())
app.set("view engine", "ejs")
app.use(express.urlencoded({ extended: true }))


mongoose.connect('mongodb://127.0.0.1:27017/', {
    dbName: 'entries',
}).then(() => console.log("DB Connected"))
    .catch((e) => console.log(e))

const isAuthenticated =  async (req, res, next) => {
    const token = req.cookies.token;
    if (token) {
        const decode = jwt.decode(token, "hjbjknm")

        res.user = await User.findById(decode._id)
        console.log(res.user)
        next()
    } else {
        res.render('login')
    }
}

app.get('/', isAuthenticated, (req, res) => {
    res.render('success', {name:res.user.name})
})

app.get('/login', (req, res)=>{
    res.render('login')
})

app.post('/login', async (req, res) => {

    const user = await User.findOne({email:req.body.email})

    if(!user){
        return res.redirect('/register')
    }

    const match = await bycrypt.compare(req.body.password, user.password)
    console.log(user.password)
    console.log(req.body.password)
    console.log(match)
    
    if(!match){
        return res.render('login')
    }

    const jwt1 = jwt.sign({_id:user._id}, "hjbjknm,")

    res.cookie("token", jwt1, {
        httpOnly: true,
        expires: new Date(Date.now() + 100 * 100)
    })
    res.redirect('/')

})

app.post('/logout', (req, res) => {
    res.cookie("token", null, {
        httpOnly: true,
        expires: new Date(Date.now())
    })
    res.redirect('/')
})


app.get('/register', (req, res)=>{
    res.render('register')
})

app.post('/register', async (req, res)=>{
    const hashpass = await bycrypt.hash(req.body.password, 10)
    const newuser = await User.create({name:req.body.name, email:req.body.email, password:hashpass})
    console.log(newuser)

    const jwt1 = jwt.sign({_id:newuser._id}, "hjbjknm,")

    res.cookie("token", jwt1, {
        httpOnly: true,
        expires: new Date(Date.now() + 100 * 100)
    })
    res.redirect('/')

})

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`)
})