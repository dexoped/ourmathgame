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

app.get("/Dash", async (req, res) => {
    if (req.session.user) {
        try {
            // Fetch data for the dashboard
            const averageAccuracy = 78.90; // Replace with actual query
            const accuracyChange = '20%'; // Replace with actual query
            const averageSpeed = 59.48; // Replace with actual query
            const speedChange = '8%'; // Replace with actual query
            const timesPlayed = 3000; // Replace with actual query
            const records = [
                { gameNumber: 300, accuracy: 123, speed: 456 },
                { gameNumber: 299, accuracy: 123, speed: 456 },
                { gameNumber: 298, accuracy: 123, speed: 456 },
                { gameNumber: 297, accuracy: 123, speed: 456 },
                { gameNumber: 296, accuracy: 123, speed: 456 }
            ]; // Replace with actual query
            const timesPlayedData = [3000, 2500, 2000, 4000, 5000, 3500, 3000, 2800, 3200, 2900, 100, 50]; // Replace with actual query

            res.render("Dash", {
                username: req.session.user.name,
                averageAccuracy,
                accuracyChange,
                averageSpeed,
                speedChange,
                timesPlayed,
                records,
                timesPlayedData
            });
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            res.send('Error fetching dashboard data');
        }
    } else {
        res.redirect("/");
    }
});
app.get("/selection", (req, res) => {
  if (req.session.user) {
      res.render("selection");
  } else {
      res.redirect("/");
  }
});

app.get('/game', (req, res) => {
  const { operator, difficulty } = req.query;
  res.render('game', { operator, difficulty });
});


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