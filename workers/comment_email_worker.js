const queue = require("../config/kue");

const commentMailer = require("../controllers/commentMailer");


queue.process("emails", function(job){
    // console.log("Inside email worker");

    commentMailer.mailComment(job.data);

});