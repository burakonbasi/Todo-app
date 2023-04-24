const dotenv = require('dotenv');
const express = require('express');
const unless = require('express-unless');
const mongoose = require('mongoose');
const cors = require('cors');
const userRoute = require('./Routes/userRoute');
const boardRoute = require('./Routes/boardRoute');
const listRoute = require('./Routes/listRoute');
const cardRoute = require('./Routes/cardRoute');
const auth = require('./Middlewares/auth');
const bodyParser = require('body-parser');

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// AUTH VERIFICATION AND UNLESS

auth.verifyToken.unless = unless;

// for parsing application/json
app.use(bodyParser.json()); 

// for parsing application/xwww-
app.use(bodyParser.urlencoded({ extended: true })); 
//form-urlencoded

app.use(
	auth.verifyToken.unless({
		path: [
			{ url: '/user/login', method: ['POST'] },
			{ url: '/user/register', method: ['POST'] },
			{ url: '/user/forgot', method: ['GET'] },
			{ url: '/user/forgot_password', method: ['POST'] },
			// { url: '/user/reset/', method: ['GET'] },
			{ url: '/user/reset/:token', method: ['GET'] },
			{ url: '/user/reset/:token', method: ['POST'] },
		],
	})
);


//MONGODB CONNECTION

mongoose.Promise = global.Promise;
mongoose
	.connect(process.env.MONGO_URI, {
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

//ROUTES

app.use('/user', userRoute);
app.use('/board', boardRoute);
app.use('/list', listRoute);
app.use('/card', cardRoute);

app.listen(process.env.PORT, () => {
	console.log(`Server is online! Port: ${process.env.PORT}`);
});
