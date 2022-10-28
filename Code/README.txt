How to run the program
1. make sure you have all the dependencies
/* install the following dependencies in backend folder */
// run the following commands in the terminal after you cd into backend folder

// express
npm install express

// dotenv - to allow package to load .env file into program
npm install dotenv

// database - mongoose
npm install mongoose

// hashing
npm install bcrypt

// validator - for appropriate username and password checking
npm install validator

// json web token
npm install jsonwebtoken

// nodemon (-g flag for global installation)
npm install -g nodemon

/* install the following dependencies in frontend folder */
// run the following commands in the terminal after you cd into frontend folder

// react router dom
npm install react-router-dom

// date-fns
npm install date-fns

2. cd into backend folder and run it by typing 'npm run dev' in the terminal
--> upon successful launch, terminal should output 'Connected to MongoDB and Listening on port 3000'

3. cd into frontend folder and run it by typing 'npm start' in the terminal
--> upon successful launch, a browser window should open up with localhost:3000