const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function sendOtpEmail(to, otp) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log(`[DEV MODE] OTP for ${to}: ${otp}`);
    return { messageId: "dev-mode" };
  }

  const info = await transporter.sendMail({
    from: `"Bandhan" <${process.env.SMTP_USER}>`,
    to,
    subject: "Your Bandhan OTP Code",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #7A3F23;">Bandhan OTP Verification</h2>
        <p>Your one-time password is:</p>
        <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; text-align: center;
                    padding: 16px; background: #FBF7F2; border-radius: 8px; margin: 16px 0;">
          ${otp}
        </div>
        <p>This code expires in 10 minutes. Do not share it with anyone.</p>
        <hr style="border: none; border-top: 1px solid #E7DED4;" />
        <p style="color: #6B625A; font-size: 12px;">If you did not request this, please ignore this email.</p>
      </div>
    `,
  });

  return info;
}

module.exports = { sendOtpEmail };
