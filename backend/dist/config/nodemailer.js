"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMailHtml = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({
    path: path_1.default.resolve(__dirname.replace("\\dist", ""), "../../.env"),
});
const nodemailer_1 = __importDefault(require("nodemailer"));
const mailTransporter = nodemailer_1.default.createTransport({
    service: "Gmail",
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: process.env.GMAIL_EMAIL,
        pass: process.env.GMAIL_PASSWORD,
    },
});
function getMailHtml(username, resetLink) {
    return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reset Your Password</title>
      <style>
          body {
              font-family: Arial, sans-serif;
              background-color: #f4f4f4;
              margin: 0;
              padding: 0;
              -webkit-font-smoothing: antialiased;
          }
          .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #ffffff;
              border-radius: 8px;
              box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
          }
          .content {
              padding: 20px;
              text-align: center;
          }
          .content h1 {
              font-size: 24px;
              margin-bottom: 10px;
          }
          .content p {
              font-size: 16px;
              margin-bottom: 20px;
          }
          .button {
              display: inline-block;
              padding: 10px 20px;
              font-size: 16px;
              color: white !important;
              background-color: #007BFF;
              border-radius: 5px;
              text-decoration: none;
          }
          .footer {
              text-align: center;
              padding: 20px;
              font-size: 12px;
              color: #888888;
          }
      </style>
  </head>
  <body>
      <div class="container">
          <div class="content">
              <h1>Reset Your Password</h1>
              <p>Hi ${username},</p>
              <p>We received a request to reset your password for your Pulse Chat account. Click the button below to reset it.</p>
              <a href="${resetLink}" class="button">Reset Password</a>
              <p>If you did not request a password reset, please ignore this email or contact support if you have questions.</p>
              <p>Thanks,<br>The Pulse Chat Team</p>
          </div>
          <div class="footer">
              <p>&copy; 2024 Pulse Chat. All rights reserved.</p>
          </div>
      </div>
  </body>
  </html>
  `;
}
exports.getMailHtml = getMailHtml;
exports.default = mailTransporter;
