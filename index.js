const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = 3001;

// Middleware to parse form data
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Serve the login page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Handle form submission
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    // Implement your authentication logic here
    if (username === 'user' && password === 'pass') {
        res.send('Login successful!');
    } else {
        res.send('Login failed. Invalid username or password.');
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});