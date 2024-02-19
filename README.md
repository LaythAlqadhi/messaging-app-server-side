# Messaging App Server Side
This this a social media web application built using the MERN stack (MongoDB, Express.js, React.js, Node.js) along with the Tailwind CSS framework for styling.
Check out the [client-side repo](https://github.com/LaythAlqadhi/messaging-app-client-side).

## Preview
Check out the web application [Messaging App](https://messaging-app-three.vercel.app) to explore its features.

## Routers
- Index router
- Chat router
- Users router

## Models
- User
- Chat

## Features
- Designed using RESTful architectural style.
- Preventing unauthenticated users from accessing private routes.
- Authenticating users using the Passport-JWT and Passport-Local strategies.
- Validating and sanitizing client data using Express-validator.

## Installation
1. **Clone the Repository:**
   ```bash
   git clone <repository_url>
   cd <repository_directory>
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

   or

   ```bash
   yarn install
   ```

3. **Start the Server:**
   To start the server in production mode, run:
   ```bash
   npm start
   ```

   To start the server in development mode with automatic restart on file changes, run:
   ```bash
   npm run devstart
   ```

   You can also start the server with debug logs enabled by running:
   ```bash
   npm run serverstart
   ```

4. **Running Tests:**
   To run tests, execute:
   ```bash
   npm test
   ```

## Additional Notes
- Make sure to have Node.js and npm/yarn installed and properly configured on your machine.
- This application uses ESLint for code linting and Prettier for code formatting. You can run linting using:
  ```bash
  npm run lint
  ```
  or
  ```bash
  yarn lint
  ```

- The application utilizes various middleware and packages for functionality such as authentication (Passport.js), data validation (express-validator), logging (morgan), etc.
- For detailed configuration and customization, refer to the `package.json` file and the respective configuration files (`eslintConfig`, `prettier`, etc.).
