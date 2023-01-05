const mongoose = require("mongoose");

mongoose.connect("mongodb://localhost/users", function(error){
    if(error){
        console.log(`Error connecting database..\n${error}`);
        return;
    }

    console.log(`Connected to a DB..`);
});

const con = mongoose.connection;

con.on("error", function(error){
    console.error(`Error in connection..\n${error}`);
});

module.exports = con;