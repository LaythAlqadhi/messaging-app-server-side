const express = require('express');
const mongoose = require('mongoose');
const request = require('supertest');

const initializeMongoServer = require('../database/mongoConfigTesting');
const passport = require('../auth/passportConfig');
const userRouter = require('../routes/userRouter');
const messageRouter = require('../routes/messageRouter');

const app = express();

// Apply Express middleware
app.use(passport.initialize());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Define routes
app.use('/', userRouter);
app.use('/', messageRouter);

// Declare variables for token, user IDs, and message ID
let token;
let userOneId;
let userTwoId;
let userThreeId;
let messageId;

// Sample user data for testing
const userOneData = {
  firstName: 'John',
  lastName: 'Doe',
  username: 'JohnDoe',
  email: 'john.doe@example.com',
  password: 'SecurePass123!',
  passwordConfirmation: 'SecurePass123!',
};

const userTwoData = {
  firstName: 'Sarah',
  lastName: 'Johnson',
  username: 'SarahJ',
  email: 'sarah.johnson@example.com',
  password: 'StrongPwd456!',
  passwordConfirmation: 'StrongPwd456!',
};

const userThreeData = {
  firstName: 'Mike',
  lastName: 'Tyson',
  username: 'MikeTyson',
  email: 'mike.tyson@example.com',
  password: 'PowerfulPwd789!',
  passwordConfirmation: 'PowerfulPwd789!',
};

beforeAll(async () => {
  // Initialize MongoDB server
  await initializeMongoServer();

  // Function to sign up a user
  const signUpUser = async (userData) =>
    request(app).post('/user/signup').send(userData);

  // Sign up three users
  await signUpUser(userOneData);
  await signUpUser(userTwoData);
  await signUpUser(userThreeData);

  // Sign in user One and get the token
  const signInRes = await request(app).post('/user/login').send({
    username: userOneData.username,
    password: userOneData.password,
  });
  token = signInRes.body.token;

  // Get users using the obtained token
  const getUsersRes = await request(app)
    .get('/users')
    .auth(token, { type: 'bearer' });

  // Set user IDs based on the response
  userOneId = getUsersRes.body[0].id;
  userTwoId = getUsersRes.body[1].id;
  userThreeId = getUsersRes.body[2].id;
});

afterAll(async () => {
  // Disconnect from MongoDB
  await mongoose.disconnect();
});

// Test for creating a new message
describe('POST /message', () => {
  it('creates a new message correctly', async () => {
    // Define payload for creating a message
    const payload = {
      receiver: userTwoId,
      content: 'mockContent',
    };

    // Send a valid message request
    const validRes = await request(app)
      .post('/message')
      .auth(token, { type: 'bearer' })
      .send(payload);

    // Retrieve the created message ID
    messageId = validRes.body.message.id;

    // Assertions for a valid response
    expect(validRes.status).toBe(200);
    expect(validRes.body.message).toBeTruthy();
    expect(validRes.body.errors).toBeFalsy();

    // Modify payload for an invalid request (empty content)
    payload.content = '';

    // Send an invalid message request
    const invalidRes = await request(app)
      .post('/message')
      .auth(token, { type: 'bearer' })
      .send(payload);

    // Assertions for an invalid response
    expect(invalidRes.status).toBe(200);
    expect(invalidRes.body.message).toBeFalsy();
    expect(invalidRes.body.errors).toBeTruthy();
  });
});

// Test for retrieving messages
describe('GET /messages', () => {
  it('retrieves messages correctly', async () => {
    // Define payload for retrieving messages
    const payload = {
      senderId: userOneId,
      receiverId: userTwoId,
    };

    // Send a valid request to retrieve messages
    const validRes = await request(app)
      .get('/messages')
      .auth(token, { type: 'bearer' })
      .set('Content-Type', 'application/json')
      .send(payload);

    // Assertions for a valid response
    expect(validRes.status).toBe(200);
    expect(validRes.body).toHaveProperty('messages');

    // Modify payload for an empty result scenario
    payload.receiverId = userThreeId;

    // Send a request expecting an empty result
    const emptyRes = await request(app)
      .get('/messages')
      .auth(token, { type: 'bearer' })
      .set('Content-Type', 'application/json')
      .send(payload);

    // Assertions for an empty result
    expect(emptyRes.status).toBe(404);
    expect(emptyRes.body).not.toHaveProperty('messages');

    // Modify payload for an invalid sender scenario
    payload.senderId += 'randomString';

    // Send a request with an invalid sender
    const invalidSenderRes = await request(app)
      .get('/messages')
      .auth(token, { type: 'bearer' })
      .set('Content-Type', 'application/json')
      .send(payload);

    // Assertions for an invalid sender response
    expect(invalidSenderRes.status).toBe(403);
    expect(invalidSenderRes.body).not.toHaveProperty('messages');
  });
});

// Test for editing a message
describe('PATCH /message/:messageId', () => {
  it('edits a message correctly', async () => {
    // Define payload for editing a message
    const payload = {
      content: 'mockContent2',
    };

    // Send a request to edit the message
    const validRes = await request(app)
      .patch(`/message/${messageId}`)
      .auth(token, { type: 'bearer' })
      .send(payload);

    // Assertions for a valid edit response
    expect(validRes.status).toBe(200);
    expect(validRes.body).toHaveProperty('message');
  });
});

// Test for deleting a message
describe('DELETE /message/:messageId', () => {
  it('deletes a message correctly', async () => {
    // Send a request to delete the message
    const validRes = await request(app)
      .delete(`/message/${messageId}`)
      .auth(token, { type: 'bearer' });

    // Assertions for a valid delete response
    expect(validRes.status).toBe(200);
  });
});
