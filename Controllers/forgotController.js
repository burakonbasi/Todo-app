const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");

const userModel = require("../Models/userModel");
const resetTokens = require("../Models/resetTokens");

// Prepare the forgot password screen
const forgot = async (req, res) => {
  res.send(`
    <h2>I forgot my password</h2>
    <form action="/forgot" method="POST">
      <input type="email" name="email" placeholder="E-Mail Address">
      <button type="submit">Gönder</button>
    </form>
  `);
};

// Perform forgot password operation
const forgotPassword = async (req, res) => {
    console.log("forgotPassword")
  const email = req.body.email;

  // Send error message if we can't find the user

   userModel.findOne({ email }, (err, user) => {
    if (err) {
      console.error(err);
      return res.status(500).send("An error occurred while searching for a user.");
    }
    if (!user) {
      return res.status(404).send("No such user was found.");
    }

    // Create and save token
     const token = jwt.sign({ email }, process.env.JWT_SECRET || "s3cr3t", { expiresIn: "1h" });
    console.log(token)
    resetTokens.create({ email, token }, (err, result) => {
      if (err) {
        console.error(err);
        return res
          .status(500)
          .send("An error occurred while saving the password reset token.");
      }

      // Send an email
      const transporter = nodemailer.createTransport({
        host: "smtp.hostinger.com",
        port: 465,
        secure: true,
        auth: {
          user: "info@oncreativemedia.com", // Sender e-mail address
          pass: "Brk1995-fb", // Password of the sender email address
        },
      });

      const mailOptions = {
        from: "info@oncreativemedia.com",
        to: email,
        subject: "Password reset request",
        html: `
          <p>Hi! ${user.name},</p>
          <p>Click here <a href="http://localhost:3000/reset/${token}">to reset your password</a>.</p>
          <p>Note that the token will be valid within 1 hour.</p>
        `,
      };

      transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
          console.error(err);
          return res
            .status(500)
            .send("An error occurred while sending the e-mail.");
        }
        console.log("Email sent:", info.response);
        res.send(`
          <p>Password reset instructions have been sent to your email address.</p>
          <p>Open the email and follow the instructions.</p>
        `);
      });
    });
  });
};

// Prepare the password reset screen
const resetPassword = async (req, res) => {
  const token = req.params.token;

  // If the token is correct, prepare the password reset screen
  jwt.verify(token, process.env.JWT_SECRET || "s3cr3t", (err, decoded) => {
    if (err) {
      console.error(err);
      return res.status(400).send("Invalid or expired token.");
    }
    const email = decoded.email;
    res.send(`
      <h2>Password reset</h2>
      <form action="/reset/${token}" method="POST">
        <input type="password" name="password" placeholder="Your new password">
        <input type="password" name="confirmPassword" placeholder="Your new password (again)">
        <button type="submit">Send</button>
      </form>
    `);
  });
};

// Perform password reset
const createPassword = async (req, res) => {
  const token = req.params.token;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;

  // If token is correct, update password
  jwt.verify(token, process.env.JWT_SECRET || "s3cr3t", (err, decoded) => {
    if (err) {
      console.error(err);
      return res.status(400).send("Invalid or expired token.");
    }
    const email = decoded.email;

    if (password !== confirmPassword) {
      return res.status(400).send("The passwords you entered do not match.");
    }


     userModel.updateOne({ email }, { $set: { password } }, (err, result) => {
      if (err) {
        console.error(err);
        return     res.status(500).send("An error occurred while updating the password.");
    }
    console.log("Password updated:", result);
    res.send(`
      <p>Your password has been successfully updated.</p>
      <p><a href="/login">Click here to enter</a>.</p>
    `);
  });
  
});
};


module.exports = {
    forgot,
    forgotPassword,
    resetPassword,
    createPassword,
  };
  
