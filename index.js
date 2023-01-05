// importing express and declaring port
const express = require("express");
const port = 8000;

// importing routes
const routes = require("./routes/index_route");

const app = express();

app.set("view engine", "ejs");
app.set("Views", "./Views");

app.use(express.static("./Views/Static"));

app.use("/", routes);


app.listen(port, function(error){
    if(error){
        console.log(`Oops, Error starting Server..\n${error}`);
        return;
    }

    console.log(`Server running on port ${port}`);
});