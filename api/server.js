const express = require('express');
const bodyParser = require('body-parser')
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const User = require("./models/User.js");
const bcrypt = require('bcrypt');
const cors = require('cors');
const jwt = require("jsonwebtoken");
const Todo = require("./models/Todo.js");
require("dotenv").config();





 mongoose.connect('mongodb+srv://nandu:nandu@instaclone2.b5gznfv.mongodb.net/rapidqube');
try{
  console.log("db connected")
}catch{console.log("error")}
 const db = mongoose.connection;
db.on('error', console.log);

const app = express();
app.use(cookieParser());
app.use(bodyParser.json({ extended: true }));
app.use(cors());


app.get('/', (req, res) => {
  res.send('ok');
});

app.get('/user', (req, res) => {
  if (!req.cookies.token) {
    return res.json({});
  }
  const payload = jwt.verify(req.cookies.token, process.env.SC_KEY);
  User.findById(payload.id)
    .then(userInfo => {
      if (!userInfo) {
        return res.json({});
      }
      res.json({ id: userInfo._id, email: userInfo.email });
    });
});

app.post('/register', (req, res) => {
  const { email, password } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10);
  const user = new User({ password: hashedPassword, email });
  user.save().then(userInfo => {
    jwt.sign({ id: userInfo._id, email: userInfo.email }, process.env.SC_KEY, (err, token) => {
      if (err) {
        console.log(err);
        res.sendStatus(500);
      } else {
        res.cookie('token', token).json({ id: userInfo._id, email: userInfo.email });
      }
    });
  });
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;
  User.findOne({ email })
    .then(userInfo => {
      if (!userInfo) {
        return res.sendStatus(401);
      }
      const passOk = bcrypt.compareSync(password, userInfo.password);
      if (passOk) {
        jwt.sign({ id: userInfo._id, email }, process.env.SC_KEY, (err, token) => {
          if (err) {
            console.log(err);
            res.sendStatus(500);
          } else {
            res.cookie('token', token).json({ id: userInfo._id, email: userInfo.email });
          }
        });
      } else {
        res.sendStatus(401);
      }
    })
});

app.post('/logout', (req, res) => {
  res.cookie('token', '').send();
});

app.get('/todos', (req, res) => {
  const payload = jwt.verify(req.cookies.token, process.env.SC_KEY);
  Todo.where({ user: new mongoose.Types.ObjectId(payload.id) })
    .find((err, todos) => {
      res.json(todos);
    })
});

app.put('/todos', (req, res) => {
  const payload = jwt.verify(req.cookies.token, process.env.SC_KEY);
  const todo = new Todo({
    text: req.body.text,
    done: false,
    user: new mongoose.Types.ObjectId(payload.id),
  });
  todo.save().then(todo => {
    res.json(todo);
  })
});

app.post('/todos', (req, res) => {
  const payload = jwt.verify(req.cookies.token, process.env.SC_KEY);
  Todo.updateOne({
    _id: new mongoose.Types.ObjectId(req.body.id),
    user: new mongoose.Types.ObjectId(payload.id)
  }, {
    done: req.body.done,
  }).then(() => {
    res.sendStatus(200);
  });
});

app.listen(4000);