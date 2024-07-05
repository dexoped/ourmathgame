const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const url = 'mongodb://localhost:27017';
const dbName = 'loginDB';
let db;
const MongoClient = require('mongodb').MongoClient;

const app = express();
const port = 3001;


app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));

MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }, (err, client) => {
    if (err) return console.error(err);
    console.log('Connected to Database');
    db = client.db(dbName);
});

// Middleware to parse form data
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Serve the login page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});


app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html');
});

app.post('/register', (req, res) => {
    const { name, password } = req.body;
   

    const user = { username: name, password: password };

    db.collection('users').insertOne(user, (err, result) => {
        if (err) {
            return res.status(500).send('Error occurred while inserting user');
        }
        res.redirect('/login.html');
    });
});

app.post('/login', (req, res) => {
    const { name, password } = req.body;
    if (!name || !password) {
        return res.status(400).send('Both name and password are required');
    }

    db.collection('users').findOne({ username: name, password: password }, (err, user) => {
        if (err) return res.status(500).send('Error occurred while checking credentials.');
        if (!user) return res.status(401).send('Invalid credentials');
        res.redirect('/Dash.html');
    });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
