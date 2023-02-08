const mongoose = require("mongoose");

// Connecting to a Mongo DB
// mongoose connect with 2 options db link & callback
mongoose.connect("mongodb://localhost/users", function(error){
    if(error){
        console.log(`Error connecting database..\n${error}`);
        return;
    }

    console.log(`Connected to a DB..`);
});

// fetching connection object
const con = mongoose.connection;

con.on("error", function(error){
    console.error(`Error in connection..\n${error}`);
});

// exporting connection
module.exports = con;