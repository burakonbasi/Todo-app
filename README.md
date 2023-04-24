# Todo-app
my test project for agentbook company

&nbsp;
# Features

- Register and Login
- Create multiple boards, select any background and add members
- Create multiple lists
- Create multiple cards
- Drag and drop lists or cards
- Change title and background of board
- Add description for board
- Change title of lists
- Add description, cover color, members, labels, start date, due date, multiple checklist and multiple attachements
- Delete boards, lists or cards
- Track all activity logs of cards and boards
- Comment on cards or boards
- Search boards or cards titles

&nbsp;
# Used Technologies

| Server Side    	| Only Development 	|
|----------------	|-------------------|
| expressjs      	| nodemon          	|
| express-unless 	|                  	|
| mongoose       	|                  	|
| cors           	|                  	|
| path           	|                  	|
| dotenv         	|                  	|
| jsonwebtoken   	|                  	|
| bcryptjs       	|                  	|
|                  	|                  	|
|                	|                  	|
|                	|                 	|

&nbsp;
## How to run?

- Download nodejs [here](https://nodejs.org/en/download/) 
- For database, you can use local mongodb or mongo atlas. See [here](https://www.mongodb.com/)
- Clone the repository:

  ```git clone https://github.com/burakonbasi/Todo-app``` 

- Change directory:

  ```cd Todo-aoo```

- Open second terminal same location:
    * Ubuntu: &nbsp; ```gnome-terminal```
    * Windows: &nbsp; ```start```

- Change directory of first terminal and install packages:

    ```cd Todo-app```

    ```npm install```

- Create .env file in project directory like .env.example and enter required variables
&nbsp;
Example ;
&nbsp;
PORT="****"&nbsp;
MONGO_URI="mongodb://localhost:27017/todo"&nbsp;
JWT_SECRET="****"&nbsp;
TOKEN_EXPIRE_TIME="60d"&nbsp;
EMAIL_ADDRESS="****"&nbsp;
EMAIL_PASSWORD="****"&nbsp;


- Start the project:

    ```npm run start```
