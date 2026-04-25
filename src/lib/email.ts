import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_FROM,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export async function sendVerificationEmail(
  to: string,
  name: string,
  pin: string,
) {
  await transporter.sendMail({
    from: `"DramaLog" <${process.env.EMAIL_FROM}>`,
    to,
    subject: "Your DramaLog verification code",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #d4a5a5;">Welcome to DramaLog! 📺</h2>
        <p>Hi ${name},</p>
        <p>Thanks for registering! Here is your verification code:</p>
        <div style="background: #f5e6e8; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0;">
          <h1 style="color: #d4a5a5; letter-spacing: 8px; font-size: 36px; margin: 0;">${pin}</h1>
        </div>
        <p style="color: #888;">This code expires in <strong>24 hours</strong>.</p>
        <p style="color: #888;">If you did not register, please ignore this email.</p>
      </div>
    `,
  });
}
