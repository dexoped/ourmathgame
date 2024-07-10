const request = require('supertest');
const express = require('express');
const session = require('express-session');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const collection = require('../src/config'); // Correct relative path to config

const app = express();

// Middleware setup
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Set secure: true in production with HTTPS
}));

// Routes for login and register
app.post("/login", async (req, res) => {
  const { name, password } = req.body;
  try {
    const user = await collection.findOne({ name: name });
    if (!user) {
      return res.status(401).send('Invalid credentials');
    }
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).send('Invalid credentials');
    }
    req.session.user = user;
    res.status(200).send('Login successful');
  } catch (error) {
    res.status(500).send('Error logging in user');
  }
});

// Test cases
describe('POST /login', () => {
  beforeAll(async () => {
    const hashedPassword = await bcrypt.hash('password', 10);
    await collection.insertMany([{ name: 'testuser', password: hashedPassword }]);
  });

  afterAll(async () => {
    await collection.deleteMany({ name: 'testuser' });
  });

  test('should return 200 and login user with correct credentials', async () => {
    const response = await request(app)
      .post('/login')
      .send({ name: 'testuser', password: 'password' });

    expect(response.statusCode).toBe(200);
    expect(response.text).toBe('Login successful');
  });

  test('should return 401 for incorrect password', async () => {
    const response = await request(app)
      .post('/login')
      .send({ name: 'testuser', password: 'wrongpassword' });

    expect(response.statusCode).toBe(401);
    expect(response.text).toBe('Invalid credentials');
  });

  test('should return 401 for non-existent user', async () => {
    const response = await request(app)
      .post('/login')
      .send({ name: 'nonexistentuser', password: 'password' });

    expect(response.statusCode).toBe(401);
    expect(response.text).toBe('Invalid credentials');
  });

  test('should return 500 if there is an error logging in user', async () => {
    jest.spyOn(collection, 'findOne').mockImplementation(() => {
      throw new Error('Database error');
    });

    const response = await request(app)
      .post('/login')
      .send({ name: 'testuser', password: 'password' });

    expect(response.statusCode).toBe(500);
    expect(response.text).toBe('Error logging in user');

    collection.findOne.mockRestore();
  });
});
