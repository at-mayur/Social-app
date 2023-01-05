// importing express and declaring port
const express = require("express");
const port = 8000;

// importing layouts module
const ejsLayouts = require("express-ejs-layouts");

// importing routes
const routes = require("./routes/index_route");

const app = express();

app.set("view engine", "ejs");
app.set("Views", "./Views");

// setting up style and script extraction for layouts
app.set("layout extractStyles", true);
app.set("layout extractScripts", true);

app.use(ejsLayouts);

app.use(express.static("./Views/Static"));

app.use("/", routes);


app.listen(port, function(error){
    if(error){
        console.log(`Oops, Error starting Server..\n${error}`);
        return;
    }

    console.log(`Server running on port ${port}`);
});