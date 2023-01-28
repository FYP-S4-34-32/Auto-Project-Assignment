How to run the program (in VS Code)
1. open up a terminal inside VS Code and cd into Code/backend/ folder
--> run the following commands:
npm install
npm run dev
--> upon successful launch, terminal should output 'Connected to MongoDB and Listening on port 4000'

2. cd into Code/frontend/ folder
--> run the following commands:
npm install
npm start
NOTE: if terminal read 'react-scripts is not recognised ...', check that youre in the right folder and run npm install again before running npm start
--> upon successful launch, a browser window should open up with localhost:3000

===========================================================================================

/* lists of dependencies - should be installed via npm install above */
NOTE: make sure you have all the dependencies, in case youre missing something, the terminal will prompt you and just install according to what is missing
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

// nodemailer - for sending automated emails
npm install nodemailer

//react-chartjs-2 - for viewing statistics
npm install react-chartjs-2