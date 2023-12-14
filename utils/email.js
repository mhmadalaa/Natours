const nodemailer = require('nodemailer');
const pug = require('pug');
const { htmlToText } = require('html-to-text');

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstname = user.name.split(' ')[0];
    this.url = url;
    this.from = `Natours Admin <${process.env.EMAIL_FROM}>`;
  }

  createNodemailerTransport() {
    if (process.env.NODE_ENV === 'production') {
      // use sendgrid
      return 1;
    }

    // development env
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  async send(template, subject) {
    const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
      firstname: this.firstname,
      url: this.url,
      subject,
    });

    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText(html, {}),
    };

    await this.createNodemailerTransport().sendMail(mailOptions);
  }

  async sendWelcome() {
    await this.send('welcome', 'Welcome to the Natours Family');
  }

  async sendEmailSignupConfirm() {
    await this.send(
      'emailSignupConfirm',
      `Your email confirmation token (valid for 10 minutes) ${this.url}`,
    );
  }

  async sendPasswordReset() {
    await this.send(
      'passwordReset',
      `Your password reset token (valid for 10 minutes) ${this.url}`,
    );
  }

  async sendEmailReset() {
    await this.send(
      'emailReset',
      `Your email reset token (valid for 10 minutes) ${this.url}`,
    );
  }

  // await transporter.sendMail(mailOptions);
};
