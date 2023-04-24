const bcrypt = require("bcryptjs");
const userService = require("../Services/userService");
const auth = require("../Middlewares/auth");
const jwt = require("jsonwebtoken");


const register = async (req, res) => {
  const { name, surname, email, password } = req.body;
  if (!(name && surname && email && password))
    return res
      .status("400")
      .send({ errMessage: "Please fill all required areas!" });

  const salt = bcrypt.genSaltSync(10);
  const hashedPassword = bcrypt.hashSync(password, salt);
  req.body.password = hashedPassword;

  await userService.register(req.body, (err, result) => {
    if (err) return res.status(400).send(err);
    return res.status(201).send(result);
  });
};

const login = async (req, res) => {
  const { email, password } = req.body;
  console.log(req.body.email,req.body.password)
  if (!(email && password))
    return res
      .status(400)
      .send({ errMessage: "Please fill all required areas!" });

  await userService.login(email, (err, result) => {
    if (err) return res.status(400).send(err);

    const hashedPassword = result.password;
    if (!bcrypt.compareSync(password, hashedPassword))
      return res
        .status(400)
        .send({ errMessage: "Your email/password is wrong!" });

    result.token = auth.generateToken(result._id.toString(), result.email);
    result.password = undefined;
    result.__v = undefined;

    return res
      .status(200)
      .send({ message: "User login successful!", user: result });
  });
};

// Prepare the forgot password screen
const forgot = async (req, res) => {
  res.send(`
  <h2>I forgot my password</h2>
  <form action="/forgot" method="POST">
    <input type="email" name="email" placeholder="E-Mail Address">
    <button type="submit">Send</button>
  </form>
`);
}

const forgotPassword = async (req, res) => {
  console.log("forgotPassword")
  const { email } = req.body;
  console.log(req.body.email)
  if (!(email))
    return res
      .status(400)
      .send({ errMessage: "Please fill all required areas!" });

  await userService.forgotPassword(email, (err, result) => {
    if (err) return res.status(400).send(err);

    return res
      .status(200)
      .send({message:`
      <p>Password reset instructions have been sent to your email address.</p>
      <p>Open the email and follow the instructions.</p>
    `});
  });
};

const resetPassword = async (req, res) => {
 
  const token = req.params.token;

  // console.log("11", token);

  // If the token is correct, prepare the password reset screen
   jwt.verify(token, "s3cr3t", (err, decoded) => {
     if (err) {
       console.error(err);
       return res.status(400).send("Invalid or expired token.");
     }
     const email = decoded.email;
     res.send(`
       <h2>Password reset</h2>
       <form action="/user/reset/${token}" method="POST">
         <input type="password" name="password" placeholder="Your new password">
         <input type="password" name="confirmPassword" placeholder="Your new password (again)">
         <button type="submit">Send</button>
       </form>
     `);
   });
}

const createPassword = async (req, res) => {
  const header = req.originalUrl;
  const token = header.split("/")[3];
  // const token = req.params.token;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;

  if (!(password) || !(confirmPassword))
    return res
      .status(400)
      .send({ errMessage: "Please fill all required areas!" });

  await userService.createPassword(token, password, confirmPassword, (err, result) => {
    if (err) return res.status(400).send(err);

  return res
  .status(200)
  .send(`
  <p>Your password has been successfully updated.</p>
  <p><a href="/login">Click here to enter</a>.</p>
`);

    
  });

}

const getUser = async (req, res) => {
  const userId = req.user.id;
  await userService.getUser(userId, (err, result) => {
    if (err) return res.status(404).send(err);

    result.password = undefined;
    result.__v = undefined;

    return res.status(200).send(result);
  });
};

const getUserWithMail = async(req,res) => {
  const {email} = req.body;
  await userService.getUserWithMail(email,(err,result)=>{
    if(err) return res.status(404).send(err);

    const dataTransferObject = {
      name: result.name,
      surname: result.surname,
      color: result.color,
      email : result.email
    };
    return res.status(200).send(dataTransferObject);
  })
}

module.exports = {
  register,
  login,
  forgot,
  forgotPassword,
  resetPassword,
  createPassword,
  getUser,
  getUserWithMail,
};
