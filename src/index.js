const express = require('express');
const path = require("path");
const bcrypt = require("bcrypt");
const collection = require("./config")
const bodyparser = require("body-parser");
const session = require('express-session');

const app = express();

app.use(bodyparser.json());
app.use(bodyparser.urlencoded({extended: true}));
app.set('view engine','ejs');
app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set secure: true in production with HTTPS
  }));
  

app.get("/", (req, res)=> {
    res.render("login")
    
});

app.get("/Dash",(req,res)=>{
    if (req.session.user) {
        res.render("Dash");
      } else {
        res.redirect("/");
      }
})
app.get("/register", (req, res)=> {
    res.render("register")
});

app.post("/register", async (req,res)=>{
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const data = {
          name: req.body.name,
          password: hashedPassword
        };
        const userdata = await collection.insertMany([data]);
        console.log(userdata);
        res.redirect("/");
      } catch (error) {
        console.error('Error registering user:', error);
        res.send('Error registering user');
      }
})

app.post("/login", async (req, res) => {
    const { name, password } = req.body;
    try {
      const user = await collection.findOne({ name: name });
      if (!user) {
        console.log('User not found');
        return res.send('Invalid credentials');
      }
      console.log('User found:', user);
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        console.log('Password does not match');
        return res.send('Invalid credentials');
      }
      console.log('Password matches');
      req.session.user = user;
      res.redirect("/Dash");
    } catch (error) {
      console.error('Error logging in user:', error);
      res.send('Error logging in user');
    }
  });


app.listen(3001, ()=>{
    console.log('server running on 3001')
});