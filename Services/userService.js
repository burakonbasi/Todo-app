const userModel = require("../Models/userModel");
const resetTokens = require("../Models/resetTokens");
const { createRandomHexColor } = require("./helperMethods");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");

const register = async (user, callback) => {
  const newUser = userModel({ ...user, color:createRandomHexColor()});
  await newUser
    .save()
    .then((result) => {
      return callback(false, { message: "User created successfuly!" });
    })
    .catch((err) => {
      return callback({ errMessage: "Email already in use!", details: err });
    });
};

const login = async (email, callback) => {
  try {
    let user = await userModel.findOne({ email });
    if (!user) return callback({ errMessage: "Your email/password is wrong!" });
    return callback(false, { ...user.toJSON() });
  } catch (err) {
    return callback({
      errMessage: "Something went wrong",
      details: err.message,
    });
  }
};

const forgotPassword = async (email, callback) => {
  try {
    // let user = await userModel.findOne({ email });
    // if (!user) return callback({ errMessage: "Your email is wrong!" });
    // return callback(false, { ...user.toJSON() });
        // Send error message if we can't find the user

        userModel.findOne({ email }, (err, user) => {
          if (err) {
            console.error(err);
            return callback({ errMessage: "An error occurred while searching for a user."});
          }
          if (!user) {
            return callback({ errMessage: "No such user was found."});
          }

          // Create and save token
          const token = jwt.sign({ email }, "s3cr3t", { expiresIn: "1h" });
          console.log(token)
          resetTokens.create({ email, token }, (err, result) => {
            if (err) {
              console.error(err);
              return callback({ errMessage: "An error occurred while saving the password reset token."});
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
                return callback({ errMessage: "An error occurred while sending the e-mail."});
              }
              console.log("Email sent:", info.response);
             
            });
          });
        });

  } catch (err) {
    return callback({
      errMessage: "Something went wrong",
      details: err.message,
    });
  }
};

const createPassword = async (token, password, confirmPassword, callback) => {
    // If token is correct, update password
    jwt.verify(token, "s3cr3t", (err, decoded) => {
      if (err) {
        console.error(err);
        return callback({ errMessage:"Invalid or expired token."});
      }
      const email = decoded.email;
  
      if (password !== confirmPassword) {
        return callback({ errMessage:"The passwords you entered do not match."});
      }
  
  
       userModel.updateOne({ email }, { $set: { password } }, (err, result) => {
        if (err) {
          console.error(err);
          return callback({ errMessage:"An error occurred while updating the password."});
      }
      console.log("Password updated:", result);
    });
    
  });
}
const getUser = async (id, callback) => {
  try {
    let user = await userModel.findById(id);
    if (!user) return callback({ errMessage: "User not found!" });
    return callback(false, { ...user.toJSON() });
  } catch (err) {
    return callback({
      errMessage: "Something went wrong",
      details: err.message,
    });
  }
};

const getUserWithMail = async (email, callback) => {
  try {
    let user = await userModel.findOne({ email });
    if (!user)
      return callback({
        errMessage: "There is no registered user with this e-mail.",
      });
    return callback(false, { ...user.toJSON() });
  } catch (error) {
    return callback({
      errMessage: "Something went wrong",
      details: error.message,
    });
  }
};

module.exports = {
  register,
  login,
  forgotPassword,
  createPassword,
  getUser,
  getUserWithMail,
};
