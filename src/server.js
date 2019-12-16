require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const passport = require("passport");
const path = require("path");
const index = require("./routes/index");
const user = require('./routes/user');
const auth = require("./routes/auth");
const authenticate = require('./middlewares/authenticate');

// Setting up port
const connUri = process.env.MONGO_LOCAL_CONN_URL;
let PORT = process.env.PORT || 3000;

//=== 1 - CREATE APP
// Creating express app and configuring middleware needed for authentication
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

//=== 2 - SET UP DATABASE
mongoose.connect(connUri, {
    useNewUrlParser: true,
    useFindAndModify: false,
    useCreateIndex: true,
    useUnifiedTopology: true
  }).then(() => {
    console.log("Connected to DB");
  }).catch(err => {
    console.log("Error:", err.message);
  });

//=== 3 - INITIALIZE PASSPORT MIDDLEWARE
app.use(passport.initialize());
require("./middlewares/jwt")(passport);

//=== 4 - CONFIGURE ROUTES
//Configure Route
app.use("/", index);
app.use('/api/auth', auth);
app.use('/api/user', authenticate, user);

//=== 5 - START SERVER
app.listen(PORT, () => console.log('Server running on http://localhost:'+PORT+'/'));