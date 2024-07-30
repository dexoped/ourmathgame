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
    res.render("login");
});

app.get("/Dash", async (req, res) => {
  if (req.session.user) {
    try {
      const userId = req.session.user._id;
      const user = await collection.findOne({ _id: userId });

      if (user && user.quizzes && user.quizzes.length > 0) {
        const quizzes = user.quizzes;

        // Calculate average accuracy and speed
        const totalAccuracy = quizzes.reduce((sum, quiz) => sum + quiz.accuracy, 0);
        const totalSpeed = quizzes.reduce((sum, quiz) => sum + quiz.speed, 0);
        const averageAccuracy = (totalAccuracy / quizzes.length).toFixed(2);
        const averageSpeed = (totalSpeed / quizzes.length).toFixed(2);

        // Calculate accuracy change (month over month)
        const sortedQuizzes = quizzes.sort((a, b) => new Date(a.date) - new Date(b.date));
        const latestQuiz = sortedQuizzes[sortedQuizzes.length - 1];
        const previousMonthQuizzes = sortedQuizzes.filter(
          quiz => new Date(quiz.date).getMonth() === new Date(latestQuiz.date).getMonth() - 1 && 
                  new Date(quiz.date).getFullYear() === new Date(latestQuiz.date).getFullYear()
        );

        let previousMonthAccuracy = 0;
        let previousMonthSpeed = 0;
        if (previousMonthQuizzes.length > 0) {
          previousMonthAccuracy = previousMonthQuizzes.reduce((sum, quiz) => sum + quiz.accuracy, 0) / previousMonthQuizzes.length;
          previousMonthSpeed = previousMonthQuizzes.reduce((sum, quiz) => sum + quiz.speed, 0) / previousMonthQuizzes.length;
        }

        const accuracyChange = (averageAccuracy - previousMonthAccuracy).toFixed(2);
        const speedChange = (averageSpeed - previousMonthSpeed).toFixed(2);

        // Render the template with the calculated values
        res.render("Dash", {
          username: req.session.user.name,
          averageAccuracy,
          accuracyChange,
          averageSpeed,
          speedChange,
          timesPlayed: quizzes.length,
          records: quizzes.slice(-5), // Last 5 quizzes
          timesPlayedData: quizzes.map(quiz => quiz.totalTime)
        });
      } else {
        res.render("Dash", {
          username: req.session.user.name,
          averageAccuracy: "0.00",
          accuracyChange: "0.00",
          averageSpeed: "0.00",
          speedChange: "0.00",
          timesPlayed: 0,
          records: [],
          timesPlayedData: []
        });
      }
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

app.post('/submit-quiz', async (req, res) => {
  if (req.session.user) {
      const { accuracy, speed, totalTime } = req.body;
      const userId = req.session.user._id;

      try {
          // Save quiz results to database
          await collection.updateOne(
              { _id: userId },
              { $push: { quizzes: { accuracy, speed, totalTime, date: new Date() } } }
          );
          res.status(200).send('Quiz results saved');
      } catch (error) {
          console.error('Error saving quiz results:', error);
          res.status(500).send('Error saving quiz results');
      }
  } else {
      res.status(403).send('Unauthorized');
  }
});

app.get("/register", (req, res)=> {
    res.render("register");
});

app.post("/register", async (req, res)=>{
    try {
        const existingUser = await collection.findOne({ name: req.body.name });
        if (existingUser) {
            return res.json({ success: false, message: 'Invalid credentials. Account already exists with the same name.' });
        }
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const data = {
          name: req.body.name,
          password: hashedPassword
        };
        await collection.insertMany([data]);
        res.json({ success: true, message: 'Registration successful!' });
    } catch (error) {
        console.error('Error registering user:', error);
        res.json({ success: false, message: 'Error registering user' });
    }
});

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
    console.log('server running on 3001');
});
