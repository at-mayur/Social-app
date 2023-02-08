// Importing queue created using kue
const queue = require("../config/kue");

// Importing mailer which will send mail
const commentMailer = require("../controllers/commentMailer");

// Creating new process named emails.
// It takes job and executes action defined using function below for every job
queue.process("emails", function(job){
    // console.log("Inside email worker");

    // job.data holds data passed while creating job
    commentMailer.mailComment(job.data);

});