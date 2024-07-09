const express = require('express');
const path = require("path");
const bcrypt = require("bcrypt");
const collection = require("./config")

const app = express();

app.use(express.json());
app.use(express.urlencoded)
app.set('view engine','ejs');

app.get("/", (req, res)=> {
    res.render("login")
});


app.get("/register", (req, res)=> {
    res.render("register")
});

app.post("/register", async (req,res)=>{


    const data = {
        name: req.body.name,
        password: req.body.password
    }

    const userdata = await collection.insertMany(data);
    console.log(userdata);
})


const port = 3001;
app.listen(port, ()=>{
    console.log('server running on port : $(port)')
});