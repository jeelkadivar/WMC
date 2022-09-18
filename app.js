const express = require('express');
const bodyParser = require('body-parser');
// const date = require(__dirname + "/date.js");
let item = ["Buy Food", "Cook Food", "Eat Food"];
const cors = require('cors');
const { connection } = require('mongoose');
let workItems = [];
const connections = require('./database.js');
const e = require('express');
const app = express();
const User = connections.models.userData;
const session = require('express-session');
const MongoStore = require('connect-mongo');
app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use("/public", express.static(__dirname + "/public"));
app.use(cors());
// const sessionStore = new MongoStore({ mongooseConnection: connections, collection: 'sessions' });

app.use(session({
  secret: 'SECRET',
  resave: false,
  saveUninitialized: true,
  store: MongoStore.create({ mongoUrl: "mongodb://127.0.0.1:27017/todo" }),
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 // Equals 1 day (1 day * 24 hr/1 day * 60 min/1 hr * 60 sec/1 min * 1000 ms / 1 sec)
  }
}));


app.get("/current/:date", function (req, res) {
  var date = req.params.date;
  var todoitems=[];
  console.log(req.session.userid);
  User.findById(req.session.userid).then((user) => {
    if (user) {
      console.log(user);
      for (let i = 0; i < user.todolist.length; i++) {
        const element = user.todolist[i];
        if (element.Date == date) {
          todoitems = user.todolist[i].list;
          break;
        }
      }
      res.render("list", { date: date, todoitems: todoitems });
    } else {
      res.redirect("/");
    }
  });
});

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/public/login/login.html");
});

app.post("/", function (req, res) {
  res.sendFile(__dirname + "/public/login/login.html");
});

app.post("/in", function (req, res) {
  var userN = req.body.username;
  var passW = req.body.password;
  console.log(userN);
  console.log(passW);
  User.findOne({ name: userN })
    .then((user) => {
      if (user) {
        console.log(user);
        if (user.password == passW) {
          req.session.userid = user._id;

          res.redirect('login');
        }
        else {
          res.redirect('failure');
        }
      }
      else {
        res.redirect('failure');
      }
    })
});

app.get("/failure", function (req, res) {
  res.sendFile(__dirname + "/public/failure/failure.html");;
});

app.post("/todoadd/:date/:list", function (req, res) {
  const date = req.params.date;
  var x = 1;
  User.findById(req.session.userid).then((user) => {
    for (let i = 0; i < user.todolist.length; i++) {
      const element = user.todolist[i];
      if (element.Date == date) {
        user.todolist[i].list.push(req.params.list);
        user.save().then((usr) => {
          console.log(usr);
        });
        x = 0;
        break;
      }
    }
    if (x == 1) {
      user.todolist.push({
        Date: date,
        list: req.params.list
      });
      user.save().then((usr) => {
        console.log(usr.todolist);
      });
    }


  });
  res.send();
});

app.get("/delete/:date/:pos", function (req, res) {
  const date = req.params.date;
  User.findById(req.session.userid).then((user) => {
    for (let i = 0; i < user.todolist.length; i++) {
      const element = user.todolist[i];
      if (element.Date == date) {
        user.todolist[i].list.splice(req.params.pos,1);
        user.save().then((usr)=>{
          console.log(user.todolist[i].list);
        });
        x = 0;
        break;
      }
    }
  });
  res.redirect(`/current/${date}`);
});

app.get("/signup", function (req, res) {
  // res.cookie('cookie string',);
  res.sendFile(__dirname + "/public/signup/signup.html");
});

app.post("/signup", function (req, res) {
  var userN = req.body.username;
  var passW = req.body.password;
  console.log(userN);
  console.log(passW);
  User.findOne({ name: userN })
    .then((user) => {
      if (user) {
        res.send('<script>alert("username already exists");window.location.replace("http://localhost:3000/signup");</script>')
      }
      else {
        const newuser = new User({
          name: userN,
          password: passW
        })
        newuser.save().then((user) => {
          console.log(user);
          res.redirect("/");
        })
      }
    })
});

app.get("/login", function (req, res) {
  // res.send(req.session.userid);
  res.sendFile(__dirname + "/public/calender/index.html");
});

app.listen(3000, function () {
  console.log("server started on port 3000");
});