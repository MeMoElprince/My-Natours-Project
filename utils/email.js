const path = require('path');
const pug = require('pug');
const nodemailer = require('nodemailer');
const htmlToText = require('html-to-text');
// const sendGridMail = require('@sendgrid/mail').setApiKey(process.env.EMAIL_PROD_PASSWORD);


// const email = new Email(user, url);
// email.sendWelcome();  ->  send('welcome', 'Welcome To our website');
module.exports = class Email{
  constructor(user, url){
      this.to = user.email;
      this.firstName = user.name.split(' ')[0];
      this.from = `Mustafa Elsharawy <${process.env.EMAIL_FROM}>`;
      this.url = url;
    }

    newTransport(){
      if(process.env.NODE_ENV === 'production'){
        return nodemailer.createTransport({
          service: 'Gmail',
          auth: {
            user: process.env.EMAIL_PROD_USER,
            pass: process.env.EMAIL_PROD_PASSWORD
          }
        });
      }

      return nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD
        }
      });
    }
    
    async send(template, subject){
      // 1) render html based on a pug template
      const fullPath = path.join(__dirname, '../', 'views', 'email', `${template}.pug`);
      const html = pug.renderFile(fullPath, {
        firstName: this.firstName,
        url: this.url,
        subject: subject
      });

      // 2) email options

      const mailOptions = {
        from: this.from,
        to: this.to,
        subject,
        html,
        text: htmlToText.convert(html)
    }

      // 3) create a transporter and send email
      await this.newTransport().sendMail(mailOptions);
    }

    async sendWelcome(){
      await this.send('welcome', 'Welcome To our website');
    }

    async sendResetPassword(){
      await this.send('passwordReset', 'Natours password reset');
    }
} 
