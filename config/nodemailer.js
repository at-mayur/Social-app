const nodemailer = require("nodemailer");
const ejs = require("ejs");
const path = require("path");

require("dotenv").config();

// creating transport with googles smtp server as host
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

// function to get template for email
let getMailTemplate = function(data, relativePath){
    let htmlTemp;

    // ejs render template with 3 Arguments path for template, data for template, callback
    ejs.renderFile(path.join(__dirname, "../Views/mailer/", relativePath), data, function(error, template){
        if(error){
            console.log(`Error rendering template for mail\n${error}`);
            return;
        }

        // if no error returning template
        htmlTemp = template;
    });

    return htmlTemp;

};


module.exports = {
    transporter: transporter,
    getTemplate: getMailTemplate
};