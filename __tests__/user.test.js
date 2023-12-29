const express = require('express');
const mongoose = require('mongoose');
const request = require('supertest');

const initializeMongoServer = require('../database/mongoConfigTesting');
const passport = require('../auth/passportConfig');
const userRouter = require('../routes/userRouter');

const app = express();

// Apply Express middleware
app.use(passport.initialize());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Define routes
app.use('/', userRouter);

// Declare variables for token, user ID
let token;
let userId;

beforeAll(async () => {
  // Initialize MongoDB server
  await initializeMongoServer();
});

afterAll(async () => {
  // Disconnect from MongoDB
  await mongoose.disconnect();
});

// Test for user signup endpoint
describe('POST /user/signup', () => {
  // Define sample signup data
  const signupData = {
    firstName: 'John',
    lastName: 'Doe',
    username: 'JohnDoe',
    email: 'john.doe@example.com',
    password: 'SecurePass123!',
    passwordConfirmation: 'SecurePass123!',
  };

  // Test case: successful user creation
  it('creates a new user', async () => {
    // Send a request to signup endpoint
    const response = await request(app).post('/user/signup').send(signupData);

    // Assertions for a successful signup
    expect(response.status).toBe(200);
    expect(response.body.errors).toBeFalsy();
  });

  // Test case: invalid data leads to error array
  it('returns an array named "errors" on unsuccessful validation', async () => {
    // Modify password for an invalid request
    signupData.password = 'SecurePass321@';

    // Send a request with invalid signup data
    const response = await request(app).post('/user/signup').send(signupData);

    // Assertions for an error response
    expect(response.status).toBe(200);
    expect(response.body.errors).toBeTruthy();
  });
});

// Test for user login endpoint
describe('POST /user/login', () => {
  // Define sample signin data
  const signinData = {
    username: 'JohnDoe',
    password: 'SecurePass123!',
  };

  // Test case: successful user login
  it('logs in the user successfully', async () => {
    // Send a request to login endpoint
    const response = await request(app).post('/user/login').send(signinData);

    // Save the token for use in another test
    token = response.body.token;

    // Assertions for a successful login
    expect(response.status).toBe(200);
    expect(response.body.errors).toBeFalsy();
  });

  // Test case: invalid data leads to error array
  it('returns an array named "errors" on on unsuccessful validation', async () => {
    // Modify password for an invalid request
    signinData.password = 'SecurePass321@';

    // Send a request with invalid signin data
    const response = await request(app).post('/user/login').send(signinData);

    // Assertions for an error response
    expect(response.status).toBe(200);
    expect(response.body.errors).toBeTruthy();
  });
});

// Test for retrieving a list of users
describe('GET /users', () => {
  // Test case: successful retrieval of user list
  it('retrieves a list of users successfully', async () => {
    // Send a request to get users, authenticating with the saved token
    const response = await request(app)
      .get('/users')
      .auth(token, { type: 'bearer' });

    // Save the user identifier for use in another test
    userId = response.body[0].id;

    // Assertions for a successful user list retrieval
    expect(response.status).toBe(200);
  });

  // Test case: invalid token leads to 401 status
  it('returns status "401" on for invalid token', async () => {
    // Send a request with an invalid token
    const response = await request(app)
      .get('/users')
      .auth(`${token.slice(0, -2)}10`, { type: 'bearer' });

    // Assertions for a 401 status response
    expect(response.status).toBe(401);
  });
});

// Test for retrieving a specific user
describe('GET /user/:userId', () => {
  // Test case: successful retrieval of a specific user
  it('retrieves a specific user successfully', async () => {
    // Send a request to get a specific user, authenticating with the saved token
    const response = await request(app)
      .get(`/user/${userId}`)
      .auth(token, { type: 'bearer' });

    // Assertions for a successful user retrieval
    expect(response.status).toBe(200);
  });

  // Test case: invalid user identifier leads to 404 status
  it('returns status "404" for an invalid user id', async () => {
    // Send a request with an invalid user identifier
    const response = await request(app)
      .get(`/user/${`${userId.slice(0, -2)}10`}`)
      .auth(token, { type: 'bearer' });

    // Assertions for a 404 status response
    expect(response.status).toBe(404);
  });
});
