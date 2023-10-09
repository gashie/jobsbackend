const passport  = require('passport');

const dotenv = require("dotenv");
dotenv.config({ path: "./config/config.env" });

const GoogleStrategy = require('passport-google-oauth20').Strategy;
const facebookStrategy = require('passport-facebook').Strategy;
const LinkedInStrategy = require('passport-linkedin-oauth2').Strategy;
const TwitterStrategy = require('passport-twitter').Strategy;



//Google strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "https://localhost:5050/google/callback",
    passReqToCallback: true,
}, (request, accessToken, refreshToken, profile, cb) => {
    // console.log(profile)
    return cb(null, profile)
}));

// //facebook strategy
// passport.use(new facebookStrategy({

//     // pull in our app id and secret from our auth.js file
//     clientID        : process.env.FACEBOOK_CLIENT_ID,
//     clientSecret    : process.env.FACEBOOK_SECRET_ID,
//     callbackURL     : "http://localhost:3000/facebook/callback",
//     profileFields: ['id', 'displayName', 'name', 'gender', 'picture.type(large)','email']

// },// facebook will send back the token and profile
// function(token, refreshToken, profile, done) {

//     console.log(profile)
//     return done(null,profile)
// }));

// //LinkedIn strategy
// passport.use(new LinkedInStrategy({
//     clientID        : process.env.LINKEDIN_CLIENT_ID,
//     clientSecret    : process.env.LINKEDIN_SECRET_ID,
//     callbackURL: "http://localhost:3000/linkedin/callback",
//     scope: ['r_emailaddress', 'r_liteprofile'],
//   }, function (token, tokenSecret, profile, done) {
//     return done(null, profile);
//   }
// ));

// //Twitter Strategy
// passport.use(new TwitterStrategy({
//     clientID        : process.env.TWITTER_CLIENT_ID,
//     clientSecret    : process.env.TWITTER_SECRET_ID,
//     callbackURL: "http://localhost:3000/twitter/callback",
// }, function (token, tokenSecret, profile, cb) {
//     console.log('call');
//     process.nextTick(function () {
//         console.log(profile);
//     });
//   }));

// // used to serialize the user for the session
// passport.serializeUser(function (user, done) {
//     done(null, user);
// });

// // used to deserialize the user
// passport.deserializeUser(function (user, done) {
//         done(null, user);
// });