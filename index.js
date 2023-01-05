// importing express and declaring port
const express = require("express");
const port = 8000;


const app = express();


app.listen(port, function(error){
    if(error){
        console.log(`Oops, Error starting Server..\n${error}`);
        return;
    }

    console.log(`Server running on port ${port}`);
});