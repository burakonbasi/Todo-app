const nodemailer = require("nodemailer");

// Create SMTP bearer
let transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_ADDRESS, // Sender e-mail address
    pass: process.env.EMAIL_PASSWORD, // Password of the sender email address
  },
});

// Compose email with password reset instructions
function createPasswordResetEmail(email, token) {
  return {
    from: process.env.EMAIL_ADDRESS,
    to: email,
    subject: "Password Reset",
    html: `<p>Merhaba,</p>
    <p>Click the link below to reset your password:</p>
    <a href="http://localhost:3000/reset?token=${token}">http://localhost:3000/reset?token=${token}</a>
    <p>If you haven't done this, please ignore it.</p>`,
  };
}

// Function to run when the form is submitted
function handleFormSubmit(req, res) {
  const email = req.body.email; // Email address from form
  const token = "abc123"; // Token to be used for password reset

  // Compose email with password reset instructions
  const mailOptions = createPasswordResetEmail(email, token);

  // send email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
      res.send("An error has occurred, please try again.");
    } else {
      console.log("Email sent: " + info.response);
      res.send("Password reset instructions have been sent to your email.");
    }
  });
}




