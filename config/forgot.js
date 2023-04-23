const express = require("express");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const { MongoClient } = require("mongodb");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');

const app = express();
const port = 3000;

const userModel = require("../Models/userModel");
const resetTokens = require("../Models/resetTokens");

 // MongoDB bağlantısı sağla
//  const mongoClient = new MongoClient("mongodb://localhost:37017", {
//    useUnifiedTopology: true,
//  });
//  mongoClient.connect((err) => {
//    if (err) {
//      console.error(err);
//      process.exit(1);
//    }
//    console.log("MongoDB bağlantısı başarılı.");

//    // Kullanıcılar koleksiyonunu oluştur
//    const db = mongoClient.db("mydb");
// //    db.createCollection("users", (err, res) => {
// //      if (err) throw err;
// //      console.log("Kullanıcılar koleksiyonu oluşturuldu.");
// //    });

//    // Şifre sıfırlama token'ları koleksiyonunu oluştur
// //    db.createCollection("resetTokens", (err, res) => {
// //      if (err) throw err;
// //      console.log("Şifre sıfırlama token'ları koleksiyonu oluşturuldu.");
// //    });
//  });

//MONGODB CONNECTION

 mongoose.Promise = global.Promise;
 mongoose
 	.connect("mongodb://localhost:37017/todo", {
 		useNewUrlParser: true,
 		useUnifiedTopology: true,
 	})
 	.then(() => {
 		console.log('Database connection is succesfull!');
 	})
 	.catch((err) => {
 		console.log(`Database connection failed!`);
 		console.log(`Details : ${err}`);
 	});

// İstek verilerini işle
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
    res.send("çalıştı");
});


// Prepare the forgot password screen
app.get("/forgot", (req, res) => {
  res.send(`
    <h2>I forgot my password</h2>
    <form action="/forgot" method="POST">
      <input type="email" name="email" placeholder="E-Mail Address">
      <button type="submit">Gönder</button>
    </form>
  `);
});

// Perform forgot password operation
app.post("/forgot", (req, res) => {
  const email = req.body.email;
console.log(email)
  // Send error message if we can't find the user

   userModel.findOne({ email }, (err, user) => {
    if (err) {
      console.error(err);
      return res.status(500).send("An error occurred while searching for a user.");
    }
    if (!user) {
      return res.status(404).send("No such user was found.");
    }
console.log("kullanıcı bulundu")
    // Create and save token
     const token = jwt.sign({ email }, "s3cr3t", { expiresIn: "1h" });
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
});

// Prepare the password reset screen
app.get("/reset/:token", (req, res) => {
  const token = req.params.token;

  // If the token is correct, prepare the password reset screen
  jwt.verify(token, "s3cr3t", (err, decoded) => {
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
});

// Perform password reset
app.post("/reset/:token", (req, res) => {
  const token = req.params.token;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;

  // If token is correct, update password
  jwt.verify(token, "s3cr3t", (err, decoded) => {
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
});

app.listen(3000, () => {
console.log("Server started on http://localhost:3000");
});


// Bu örnekte, `mongodb` modülü kullanılarak MongoDB veritabanına bağlanılıyor ve şifre sıfırlama talepleri `resetRequests` koleksiyonunda saklanıyor. Bu koleksiyonda her talep için bir token, e-posta adresi ve talep zamanı kaydediliyor.

// Şifre sıfırlama e-postası gönderildikten sonra, kullanıcının tıkladığı linkteki URL'deki token, `jsonwebtoken` modülü kullanılarak doğrulanıyor. Eğer token doğruysa, kullanıcıya şifre sıfırlama formu gösteriliyor ve kullanıcının girdiği yeni şifre MongoDB veritabanında güncelleniyor.

// Örnekte kullanılan teknolojiler:

// - Node.js
// - Express
// - MongoDB
// - `nodemailer` modülü (e-posta göndermek için)
// - `jsonwebtoken` modülü (JWT token'ları oluşturmak ve doğrulamak için)

// Tabii ki bu örnek, gerçek dünya uygulamalarına uyarlanabilir şekilde geliştirilmelidir. Örneğin, şifre sıfırlama taleplerinin güvenliği artırılabilir, kullanıcıya daha fazla geri bildirim sağlanabilir, ve daha pek çok iyileştirme yapılabilir. Ancak bu örnek, temel olarak bir şifre sıfırlama mekanizması nasıl oluşturulur ve bu mekanizmanın nasıl kodlanır konusunda bir fikir vermek için hazırlanmıştır.
