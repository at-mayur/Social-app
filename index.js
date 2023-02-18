// importing express and declaring port
const express = require("express");
const port = 8000;

// importing layouts module
const ejsLayouts = require("express-ejs-layouts");

// importing routes
const routes = require("./routes/index_route");
// API router
const apiRouter = require("./routes/api/index_api_routes");

// DB related imports
const dbConnection = require("./config/mongoConnect");

// importing passport
// Importing strategies for passport
const localStrategy = require("./config/passportAuth");
const jwtPassport = require("./config/passportJWT");
const googleAuthPassport = require("./config/passportGoogleAuthStrategy");
// Importing passport module
const passport = require("passport");
// Passport uses express session to store cookies
const expSession = require("express-session");
// ccokie parser can be used for cookie related tasks
const cookieParser = require("cookie-parser");

// importing mongo store to store session in DB. It will prevent session loss on server restart
const MongoStore = require("connect-mongo");


//Flash message
const flash = require("connect-flash");

// Custom middle ware that we have created for transferring flash msgs from request to response
const customMware = require("./config/customMiddleWare");



// Loading environment variables
require("dotenv").config();

// Importing logger for our app
// It is the middleware which will create logs for our app
const morgan = require("morgan");
// Rotating file stream to write logs to file
const rotatingLogStream = require("./config/rotatingFileStream");


// Declaring our Express app
const app = express();


// chat server configurations
// Creating a new http server required for socket io by passing our express app instance
const chatServer = require("http").Server(app);

// Passing this http server to our socket io configuration file
const chatSocket = require("./config/chat_server").createChatServer(chatServer);

// making http server to listen at port 5000
// i.e. our chat server will listen on port 5000
chatServer.listen(5000);

// Setting our express app's view engine
app.set("view engine", "ejs");
// Setting default path for view templates
app.set("Views", "./Views");

// setting up style and script extraction for layouts
// It will extract styles and scripts from view tamplate and include them at common point in layout template
app.set("layout extractStyles", true);
app.set("layout extractScripts", true);

// Seeting our express app to use urlencoded middleware
// It will extract form data sent using post request and include it in request.body
app.use(express.urlencoded());

// Seeting our express app to use json middleware
// It will extract raw data sent using post request and include it in request.body
app.use(express.json());

// Setting our express app use ejs layouts using this middleware
app.use(ejsLayouts);

// Declaring static files path for our app
app.use(express.static("./Views/Static"));

// We are storing profile pictures from user at this path
// Here we are asking our app to refer below static path for request like /upload
app.use("/upload", express.static("./upload"));

// Declaring express session middleware
app.use(expSession({
    // name that will be used as key to store session data (cookie)
    name: 'currUser',
    // Secret key for express session
    secret: process.env.EXPRESS_SECRET,

    // Preventing express session to save every time of page load
    resave: false,
    // Prevent saving uninitialized sessions
    saveUninitialized: false,
    // Declaring cookie max age in miliSeconds
    cookie: {
        maxAge: 1000*60*10
    },
    // using mongo store here to store session in db to avoid session loss on server restart
    store: MongoStore.create({
        mongoUrl: "mongodb://localhost/users",
        // It will store object instead of strings
        stringify: false
    })
}));

// Setting passport for authentication
// passport uses express session hence declaring it after express session
app.use(passport.initialize());
app.use(passport.session());

// Using custome middleware while setting up passport local strategy
// It will pass current logged user to response.locals
app.use(passport.setAuthenticatedUser);

// Declaring flash middleware
app.use(flash());
// Custom middle ware that we have created for transferring flash msgs from request to response
app.use(customMware.flashSet);


// Setting up logger for our app with rotating file stream
app.use(morgan("combined", {
    stream: rotatingLogStream
}));


// Making our app to refer our index route file
app.use("/", routes);
// Making our app to refer API index route file for /api requests
app.use("/api", apiRouter);


// Making our app to listen at port
app.listen(port, function(error){
    if(error){
        console.log(`Oops, Error starting Server..\n${error}`);
        return;
    }

    console.log(`Server running on port ${port}`);
});