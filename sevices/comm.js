const dotenv = require("dotenv");

dotenv.config({ path: "./config/config.env" });

module.exports = {

    SendSms: async (phone, message) => {
        let config = {
            method: 'post',
            url: `${process.env.SMS_API_URL}?key=${SMS_API_KEY}&to=${phone}&msg=${message}&sender_id=${process.env.SENDER_ID}`,

        };
        let response = await axios(config);
        return response
    },
    SendEmail: async (email, body, subject) => {
        const nodemailer = require("nodemailer");

        const transporter = nodemailer.createTransport

            ({

                host: process.env.EMAIL_HOST,

                port: process.env.EMAIL_PORT,

                secure: true,

                auth:

                {

                    user: process.env.EMAIL_USER,

                    pass: process.env.EMAIL_PASS

                },

                tls: {

                    // do not fail on invalid certs

                    rejectUnauthorized: false,

                }

            });
        // send mail with defined transport object

        const mailOptions = {

            from: process.env.EMAIL_ID,

            to: email,

            subject: subject,

            text: body,

        };

        const info = await transporter.sendMail(mailOptions);
    },
    SendEmailApi: async (from, body, subject,to) => {
        const axios = require('axios');
        let data = JSON.stringify({
          "text": body,
          "subject": subject,
          "from": from,
          "to": to
        });
        
        let config = {
          method: 'post',
          url: 'https://asimeglobal.com/mailapi/send-email',
          headers: { 
            'Content-Type': 'application/json'
          },
          data : data
        };
        
      let firemail = await  axios.request(config)
      return firemail
        
    },

};