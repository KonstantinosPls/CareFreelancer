const nodemailer = require('nodemailer');

// Create reusable transporter using Mailtrap SMTP
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'sandbox.smtp.mailtrap.io',
  port: process.env.SMTP_PORT || 2525,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// Verify transporter connection on startup
transporter.verify((error, success) => {
  if (error) {
    console.error('Email service error:', error.message);
  } else {
    console.log('Email service ready');
  }
});

/**
 * Send email verification link to user
 * @param {Object} user - User object with email and username
 * @param {String} token - Verification token
 */
const sendVerificationEmail = async (user, token) => {
  const appUrl = process.env.APP_URL || 'http://localhost:3000';
  const verificationLink = `${appUrl}/auth/verify-email/${token}`;

  const mailOptions = {
    from: `"CareFreelancer" <${process.env.SMTP_FROM || 'noreply@carefreelancer.com'}>`,
    to: user.email,
    subject: 'Verify your CareFreelancer account',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #0d6efd 0%, #0a58ca 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">CareFreelancer</h1>
        </div>

        <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #333; margin-top: 0;">Welcome, ${user.username}!</h2>

          <p>Thank you for registering with CareFreelancer. To complete your registration and access all features, please verify your email address.</p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationLink}"
               style="background-color: #0d6efd; color: white; padding: 14px 28px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
              Verify My Email
            </a>
          </div>

          <p style="color: #666; font-size: 14px;">Or copy and paste this link into your browser:</p>
          <p style="background: #e9ecef; padding: 10px; border-radius: 5px; word-break: break-all; font-size: 12px;">
            ${verificationLink}
          </p>

          <hr style="border: none; border-top: 1px solid #dee2e6; margin: 20px 0;">

          <p style="color: #666; font-size: 12px; margin-bottom: 0;">
            This link will expire in 24 hours. If you didn't create an account with CareFreelancer, you can safely ignore this email.
          </p>
        </div>

        <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
          <p>&copy; ${new Date().getFullYear()} CareFreelancer. All rights reserved.</p>
        </div>
      </body>
      </html>
    `,
    text: `
      Welcome to CareFreelancer, ${user.username}!

      Please verify your email address by clicking the link below:
      ${verificationLink}

      This link will expire in 24 hours.

      If you didn't create an account with CareFreelancer, you can safely ignore this email.
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Verification email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Failed to send verification email:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send password reset link to user
 * @param {Object} user - User object with email and username
 * @param {String} token - Password reset token
 */
const sendPasswordResetEmail = async (user, token) => {
  const appUrl = process.env.APP_URL || 'http://localhost:3000';
  const resetLink = `${appUrl}/auth/reset-password/${token}`;

  const mailOptions = {
    from: `"CareFreelancer" <${process.env.SMTP_FROM || 'noreply@carefreelancer.com'}>`,
    to: user.email,
    subject: 'Reset your CareFreelancer password',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #0d6efd 0%, #0a58ca 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">CareFreelancer</h1>
        </div>

        <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #333; margin-top: 0;">Password Reset Request</h2>

          <p>Hi ${user.username},</p>

          <p>We received a request to reset your password. Click the button below to create a new password:</p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}"
               style="background-color: #0d6efd; color: white; padding: 14px 28px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
              Reset My Password
            </a>
          </div>

          <p style="color: #666; font-size: 14px;">Or copy and paste this link into your browser:</p>
          <p style="background: #e9ecef; padding: 10px; border-radius: 5px; word-break: break-all; font-size: 12px;">
            ${resetLink}
          </p>

          <hr style="border: none; border-top: 1px solid #dee2e6; margin: 20px 0;">

          <p style="color: #dc3545; font-size: 14px;">
            <strong>This link will expire in 1 hour.</strong>
          </p>

          <p style="color: #666; font-size: 12px; margin-bottom: 0;">
            If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
          </p>
        </div>

        <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
          <p>&copy; ${new Date().getFullYear()} CareFreelancer. All rights reserved.</p>
        </div>
      </body>
      </html>
    `,
    text: `
      Password Reset Request

      Hi ${user.username},

      We received a request to reset your password. Click the link below to create a new password:
      ${resetLink}

      This link will expire in 1 hour.

      If you didn't request a password reset, you can safely ignore this email.
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Password reset email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Failed to send password reset email:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail
};
