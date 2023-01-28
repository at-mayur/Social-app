const kue = require("kue");


let queue = kue.createQueue();


module.exports = queue;