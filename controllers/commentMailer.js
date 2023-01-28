const nodemailer = require("../config/nodemailer");


module.exports.mailComment = function(comment){

    let mailBody = nodemailer.getTemplate({ comment: comment }, "comment/newComment.ejs");

    nodemailer.transporter.sendMail({
        from: "mayureshattarde@gmail.com",
        to: comment.post.user.email,
        subject: `New comment on your post from ${comment.user.username}`,
        html: mailBody
    }, function(error, info){
        if(error){
            console.log(`Error sending mail\n ${error}`);
            return;
        }

        // console.log(`Mail sent successfully\n${info}`);
        return;
    });
};