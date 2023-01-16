// importing express and declaring port
const express = require("express");
const port = 8000;

// importing layouts module
const ejsLayouts = require("express-ejs-layouts");

// importing routes
const routes = require("./routes/index_route");

// DB related imports
const dbConnection = require("./config/mongoConnect");
const User = require("./models/user");

// importing passport
const localStrategy = require("./config/passportAuth");
const passport = require("passport");
const expSession = require("express-session");
const cookieParser = require("cookie-parser");

// importing mongo store to store session permanantly
const MongoStore = require("connect-mongo");

// sass middleware

//Flash message
const flash = require("connect-flash");
const customMware = require("./config/customMiddleWare");


const app = express();

app.set("view engine", "ejs");
app.set("Views", "./Views");

// setting up style and script extraction for layouts
app.set("layout extractStyles", true);
app.set("layout extractScripts", true);

app.use(express.urlencoded());

app.use(ejsLayouts);

app.use(express.static("./Views/Static"));

app.use(expSession({
    name: 'currUser',
    secret: 'myEncryption',
    resave: true,
    saveUninitialized: true,
    cookie: {
        maxAge: 1000*60*10
    },
    // using mongo store here to store session in db to avoid session loss on server restart
    store: MongoStore.create({
        mongoUrl: "mongodb://localhost",
        stringify: false,
        autoRemove: false
    })
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(passport.setAuthenticatedUser);

app.use(flash());
app.use(customMware.flashSet);

app.use("/", routes);


app.listen(port, function(error){
    if(error){
        console.log(`Oops, Error starting Server..\n${error}`);
        return;
    }

    console.log(`Server running on port ${port}`);
});