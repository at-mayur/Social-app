const nodemailer = require("nodemailer");
const ejs = require("ejs");
const path = require("path");

require("dotenv").config();


let transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_SECRET
    }
});


let getMailTemplate = function(data, relativePath){
    let htmlTemp;

    ejs.renderFile(path.join(__dirname, "../Views/mailer/", relativePath), data, function(error, template){
        if(error){
            console.log(`Error rendering template for mail\n${error}`);
            return;
        }

        htmlTemp = template;
    });

    return htmlTemp;

};


module.exports = {
    transporter: transporter,
    getTemplate: getMailTemplate
};