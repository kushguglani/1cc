var nodemailer = require("nodemailer");

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_ID,
        pass: process.env.GMAIL_PASSWORD
    }
  });


function sendNodeEmail(mailOptions) {
    return transporter.sendMail(mailOptions)
}
module.exports = sendNodeEmail;

// var rand,mailOptions,host,link;
// app.get('/send', function (req, res) {
//     rand = Math.floor((Math.random() * 100) + 54);
//     host = req.get('host');
//     link = "http://" + req.get('host') + "/verify?id=" + rand;
//     mailOptions = {
//         to: req.query.to,
//         subject: "Please confirm your Email account",
//         html: "Hello,<br> Please Click on the link to verify your email.<br><a href=" + link + ">Click here to verify</a>"
//     }
//     console.log(mailOptions);
//     smtpTransport.sendMail(mailOptions, function (error, response) {
//         if (error) {
//             console.log(error);
//             res.end("error");
//         } else {
//             console.log("Message sent: " + response.message);
//             res.end("sent");
//         }
//     });
// })