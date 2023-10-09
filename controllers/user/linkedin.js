const passport = require('passport');
const LinkedInStrategy = require('passport-linkedin-oauth2').Strategy;
const express = require('express');
const router = express.Router();
const { Find, Create } = require('../../models/Global');

require('dotenv').config();
let userProfile;

//LinkedIn strategy
passport.use(new LinkedInStrategy({
    clientID: process.env.LINKEDIN_CLIENT_ID,
    clientSecret: process.env.LINKEDIN_SECRET_KEY,
    callbackURL: "https://localhost:5050/linkedin/callback",
    profileFields: [
        "first-name",
        "last-name",
        "email-address",
        "picture-url",
    ],
    scope: ['profile'],
    passReqToCallback: true
}, function (token, tokenSecret, profile, done) {
    // asynchronous verification, for effect...
    process.nextTick(function () {
        // To keep the example simple, the user's LinkedIn profile is returned to
        // represent the logged-in user. In a typical application, you would want
        // to associate the LinkedIn account with a user record in your database,
        // and return that user instead.
        return done(null, profile);
      });
}
));

router.get('/linkedin', passport.authenticate('linkedin', { scope: ['profile'] }));

router.get(
    '/linkedin/callback',
    passport.authenticate('linkedin', {
        failureRedirect: '/linkedin/error',
    }),
    function (req, res) {
        // Successful authentication, redirect to success screen.
        res.redirect('/linkedin/success');
    }
);

router.get('/linkedin/success', async (req, res) => {
    //find providers with id
    //if id 
    let finduser = await Find('auth_providers', 'providerId', userProfile?.id);
    //if user does not exist
    if (!finduser) {
        //create new user
        let providerPayload = {
            providerId: userProfile?.id,
            fullName: userProfile?.displayName,
            email: userProfile?._json?.email,
            isEmailVerified: userProfile?._json?.email_verified,
            picture: userProfile?._json?.picture,
            provider: "linkedin",
            providerRaw: JSON.stringify(userProfile?._json),
        }
        let results = await Create('auth_providers', providerPayload);
        if (results.affectedRows === 1) {
            return res.send(userProfile)
        }

    } else {
        res.json({ ...userProfile, userExist: true })
    }
});

router.get('/linkedin/error', (req, res) => res.send('Error logging in via linkedin..'));

router.get('/signout', (req, res) => {
    try {
        req.session.destroy(function (err) {
            console.log('session destroyed.');
        });
        res.render('auth');
    } catch (err) {
        res.status(400).send({ message: 'Failed to sign out fb user' });
    }
});

module.exports = router;