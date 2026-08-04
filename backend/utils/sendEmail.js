import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: Number(process.env.EMAIL_PORT) === 465, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendOtpEmail = async (toEmail, otp, purpose = "login") => {
  const heading = purpose === "register" ? "Verify your TrackGoal account" : "Your TrackGoal login OTP";

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; border: 1px solid #e5e7eb; border-radius: 10px; overflow: hidden;">
      <div style="background: #4f46e5; padding: 18px 24px;">
        <h2 style="color: #ffffff; margin: 0;">TrackGoal</h2>
      </div>
      <div style="padding: 24px;">
        <h3 style="margin-top: 0;">${heading}</h3>
        <p>Use the code below. It is valid for ${process.env.OTP_EXPIRES_MIN || 5} minutes.</p>
        <div style="font-size: 32px; letter-spacing: 6px; font-weight: bold; background: #eef2ff; color: #4338ca; padding: 14px 0; text-align: center; border-radius: 8px; margin: 16px 0;">
          ${otp}
        </div>
        <p style="color: #6b7280; font-size: 13px;">If you did not request this, you can safely ignore this email.</p>
      </div>
    </div>
  `;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: toEmail,
    subject: heading,
    html,
  });
};

export const sendTaskShareEmail = async (toEmail, fromName, taskTitle) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; border: 1px solid #e5e7eb; border-radius: 10px; overflow: hidden;">
      <div style="background: #4f46e5; padding: 18px 24px;">
        <h2 style="color: #ffffff; margin: 0;">TrackGoal</h2>
      </div>
      <div style="padding: 24px;">
        <h3 style="margin-top: 0;">${fromName} shared a task with you</h3>
        <p><b>${taskTitle}</b></p>
        <p style="color: #6b7280; font-size: 13px;">Log in to TrackGoal to view it in your task list.</p>
      </div>
    </div>
  `;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: toEmail,
    subject: `${fromName} shared a task with you on TrackGoal`,
    html,
  });
};

export const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6 digit
};
