const path = require("path");
const https = require("https");
const http = require("http");
const fs = require("fs");
const express = require("express");
const helmet = require("helmet");
const session = require('express-session');
const xss = require("xss-clean");
const fileupload = require("express-fileupload");
const dotenv = require("dotenv");
const errorHandler = require("./middleware/error");
const { logger, morganMiddleware } = require("./logs/winston");
const routes = require("./routes/setup");
const googleAuthRouter = require('./controllers/user/google');
const facebookAuthRouter = require('./controllers/user/facebook');
const linkedinAuthRouter = require('./controllers/user/linkedin');

const cookieParser = require('cookie-parser')
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
//load env vars
dotenv.config({ path: "./config/config.env" });
//initialise express
const app = express();

const ssslServer = https.createServer({
    key: fs.readFileSync(path.join(__dirname, 'certp', 'key.pem')),
    cert: fs.readFileSync(path.join(__dirname, 'certp', 'cert.pem')),
}, app)
const httpServer = http.createServer({
    key: fs.readFileSync(path.join(__dirname, 'certp', 'key.pem')),
    cert: fs.readFileSync(path.join(__dirname, 'certp', 'cert.pem')),
}, app)
//body parser
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//fileuploader middleware
app.use(fileupload());

//Set Security Headers
app.use(helmet({ crossOriginResourcePolicy: false }));
//Set Security Headers
// var __dirname = path.resolve()
// app.use(express.static(path.join(__dirname, 'build')))

//Prevent XSS Attack
app.use(xss())

// app.use(
//     cookieSession({ name: "jtsid-session", keys: ["jtsid"], maxAge: 24 * 60 * 60 * 100 })
// );
app.use(
    session({
      resave: false,
      saveUninitialized: true,
      secret: 'jtsid-session',
    })
  );

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function (user, cb) {
    console.log('====================================');
    console.log(user);
    console.log('====================================');
    if (user) {
        cb(null, user);
      } else {
        cb(new Error('User not found'), null);
      }
    // cb(null, user);
  });
  passport.deserializeUser(function (obj, cb) {
    cb(null, obj);
  });

//   //Google strategy
// passport.use(new GoogleStrategy({
//     clientID: process.env.GOOGLE_CLIENT_ID,
//     clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//     callbackURL: "https://localhost:5050/google/callback",
//     passReqToCallback: true,
// }, (request, accessToken, refreshToken, profile, cb) => {
//     // console.log(profile)
//     return cb(null, profile)
// }));

// app.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// app.get('/google/callback',passport.authenticate('google',{ failureRedirect: '/failed' }),(req, res) => {
//         res.redirect('/good');
//     })
// if (process.env.NODE_ENV === "development") {
//     app.use(morganMiddleware);

// }

app.use(cookieParser())


app.use(function (req, res, next) {
    res.removeHeader("x-powered-by");
    res.removeHeader("set-cookie");
    res.removeHeader("Date");
    res.removeHeader("Connection");

    next();
});
app.use(function (req, res, next) {
    /* Clickjacking prevention */
    res.header('Content-Security-Policy', "frame-ancestors directive")
    next()
})


//Mount routes
app.use("/api/v1/jobs", routes);
app.use("/", googleAuthRouter);
app.use("/", facebookAuthRouter);
app.use("/", linkedinAuthRouter);

app.use('/uploads', express.static(path.join(__dirname, '/uploads')))
// app.get('/*',function(req,res){
//     res.sendFile(path.join(__dirname,'build','index.html'))
//   })


// app.get('/failed', (req, res) => res.send('You Failed to log in!'))

// app.get('/good', (req, res) => {
//     console.log('Registering new Google user..');
//   res.send(req.user)
// })
app.use(errorHandler);

//errror middleware
app.use((req, res, next) => {
    const error = new Error("Not found");
    error.status = 404;
    next(error);
});

app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        status: 0,
        message: error.message,
    });
    logger.error(error.message);
});
//create port
const PORT = process.env.PORT || 9000;
//listen to port
ssslServer.listen(PORT, () => {
    console.log(
        `JOBSINGH: Running in ${process.env.NODE_ENV} mode and listening on port http://:${PORT}`
    );
    logger.debug(`JOBSINGH: Running in ${process.env.NODE_ENV} mode and listening on port http://:${PORT}`);
});
httpServer.listen(5055, () => {
    console.log(
        `JOBSINGH: Running in ${process.env.NODE_ENV} mode and listening on port http://:${PORT}`
    );
    logger.debug(`JOBSINGH: Running in ${process.env.NODE_ENV} mode and listening on port http://:${PORT}`);
});
// Handle unhandled promise rejections
process.on("unhandledRejection", (err, promise) => {
    console.log(`Error: ${err.message}`);
    logger.error(err.message);
    // Close server & exit process
    // server.close(() => process.exit(1));
});
