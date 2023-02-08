const kue = require("kue");

// Initiating queue for mailer
let queue = kue.createQueue();


module.exports = queue;