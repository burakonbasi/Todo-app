const express = require("express");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const app = express();
const port = 3000;

// Veritabanına örnek bir kullanıcı ekleyelim
const users = [
  { email: "ornek@ornek.com", password: "ornek123" }
];

// POST isteklerinde kullanılacak bodyParser ayarlaması
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Şifremi unuttum ekranını hazırla
app.get("/forgot", (req, res) => {
  res.send(`
    <h2>Şifremi Sıfırla</h2>
    <form action="/forgot" method="POST">
      <input type="email" name="email" placeholder="E-posta adresiniz">
      <button type="submit">Gönder</button>
    </form>
  `);
});

// Şifremi unuttum isteğine cevap ver
app.post("/forgot", (req, res) => {
  const email = req.body.email;
  const user = users.find(user => user.email === email);

  // Kullanıcıyı bulamazsak, hata mesajı gönder
  if (!user) {
    return res.status(404).send("Böyle bir kullanıcı bulunamadı.");
  }

  // Token oluşturma
  const token = jwt.sign({ email: user.email }, "secretkey", { expiresIn: "1h" });

  // Tokeni kaydetme (bu örnekte bellekte tutuyoruz)
  const tokens = {};
  tokens[email] = token;

  // E-posta gönderme
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "ornek@gmail.com", // E-posta hesabınız
      pass: "ornek123" // E-posta hesabınızın şifresi
    }
  });

  const mailOptions = {
    from: "ornek@gmail.com",
    to: email,
    subject: "Şifre Sıfırlama Talebi",
    text: `
      Merhaba,

      Şifrenizi sıfırlamak için aşağıdaki linke tıklayabilirsiniz:

      http://localhost:3000/reset/${token}

      Eğer şifrenizi sıfırlamak istemiyorsanız, bu e-postayı görmezden gelebilirsiniz.
    `
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
    console.log(error);
    res.status(500).send("E-posta gönderirken bir hata oluştu.");
    } else {
    console.log("E-posta gönderildi: " + info.response);
    res.send("E-posta gönderildi.");
    }
    });
    });
    
    // Şifre sıfırlama ekranını hazırla
    app.get("/reset/:token", (req, res) => {
    const token = req.params.token;
    const email = jwt.decode(token).email;
    
    // Token geçersizse, hata mesajı gönder
    if (!email || !tokens[email] || tokens[email] !== token) {
    return res.status(400).send("Geçersiz veya süresi dolmuş bir bağlantı.");
    }
    
    res.send(` 
    <h2>Şifre Sıfırla</h2> 
    <form action="/reset" method="POST"> 
    <input type="hidden" name="email" value="${email}"> 
    <input type="password" name="password" placeholder="Yeni şifreniz">
    <button type="submit">Gönder</button> 
    </form> `);
    });
    
    // Şifre sıfırlama işlemini gerçekleştir
    app.post("/reset", (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    
    // Kullanıcıyı bulamazsak, hata mesajı gönder
    const user = users.find(user => user.email === email);
    if (!user) {
    return res.status(404).send("Böyle bir kullanıcı bulunamadı.");
    }
    
    // Yeni şifreyi kaydet
    user.password = password;
    
    res.send("Şifreniz başarıyla değiştirildi.");
    });
    
    // Uygulamayı başlat
    app.listen(port, () => {
        console.log(`Sunucu http://localhost:${port} adresinde çalışıyor.`);
    });
    
    

    // Bu kod, şifremi unuttum ekranını, kullanıcının e-posta adresini girdiği POST isteğini, e-posta gönderme işlemini, şifre sıfırlama ekranını, kullanıcının yeni şifresini girdiği POST isteğini ve şifrenin kaydedilmesini işleyen basit bir Express uygulamasıdır. Ancak, gerçek bir uygulama geliştirirken bazı güvenlik ve diğer önlemler almanız gerektiğini unutmayın.
