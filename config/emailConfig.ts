import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

// CREATE TRANSPORTER
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// VERIFY TRANSPORTER
transporter.verify((error, success) => {
  if (error) {
    console.error(
      `Gmail service is not ready to send the email, Please check the email configuration`
    );
  } else {
    console.log("Gmail service is ready to send the email");
  }
});

// SEND EMAIL
const sendEmail = async (to: string, subject: string, body: string) => {
  try {
    await transporter.sendMail({
      from: `"Gyaanik" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html: body,
    });

    console.log(`Email sent successfully to ${to} with subject "${subject}"`);
  } catch (error) {
    console.error(`Error sending email to ${to}: `, error);
    throw new Error("Error sending email");
  }
};

// VERIFICATION EMAIL STRUCTURE
export const sendVerificationEmail = async (to: string, token: string) => {
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${token}`;

  const html = `
    <h1>Welcome to Gyaanik!</h1>
    <p>Thank you for registering with Gyaanik. To complete your registration and verify your email address, please click the button below:</p>

    <p>
      <a href="${verificationUrl}" style="background-color: #4CAF50; color: white; padding: 14px 20px; text-align: center; text-decoration: none; font-size: 16px; border-radius: 5px;">
          Verify Your Email Address
      </a>
    </p>

    <p>If you did not create an account with Gyaanik or have already verified your email, you can safely ignore this message.</p>

    <p>Thank you for choosing Gyaanik!</p>
    <p>Best Regards, <br />The Gyaanik Team</p>
  `;

  await sendEmail(to, "Please Verify Your Email to Access Gyaanik", html);
};

// RESET PASSWORD EMAIL STRUCTURE
export const sendResetPasswordLinkToEmail = async (
  to: string,
  token: string
) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${token}`;

  const html = `
    <h1>Password Reset Request for Your Gyaanik Account</h1>
    <p>We received a request to reset your password. To proceed, please click the button below:</p>

    <p>
      <a href="${resetUrl}" style="background-color: #007BFF; color: white; padding: 14px 20px; text-align: center; text-decoration: none; font-size: 16px; border-radius: 5px;">
          Reset Your Password
      </a>
    </p>

    <p>If you did not request a password reset, please ignore this email. Your account will remain secure, and no changes have been made.</p>

    <p>For any assistance, feel free to contact our support team.</p>

    <p>Best Regards, <br />The Gyaanik Team</p>
    `;

  await sendEmail(to, "Please Reset Your Password", html);
};
