const path = require("path");
const fs = require("fs");

const rfs = require("rotating-file-stream");

const logPath = path.join(__dirname, "../", "logs");

// create directory if not exists
if(!fs.existsSync(logPath)){
    fs.mkdirSync(logPath);
}

const rotatingLogStream = rfs.createStream("accessLogs.log", {
    // Rotate file after 1 day
    interval: "1d",
    compress: "gzip", // compress old files
    path: logPath
});

module.exports = rotatingLogStream;