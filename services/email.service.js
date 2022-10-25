const nodemailer = require('nodemailer');
const APIService = require('../services/search.service');

async function sendEmail(res, body) {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'text.editor.jsramverk@gmail.com',
            pass: 'hquecpxhdcufuekg'
        }
    });

    let mailOptions = {
        from: 'ampheris@gmail.com',
        to: body.to,
        subject: body.subject,
        text: body.text,
    }

    await APIService.addUserToInviteList(body.to, body.documentId);

   transporter.sendMail(mailOptions, function(error, info){
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
}

module.exports = {sendEmail}