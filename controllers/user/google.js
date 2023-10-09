const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const express = require('express');
const { Find,Create } = require('../../models/Global');
const router = express.Router();
require('dotenv').config();

let userProfile;
passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: 'https://localhost:5050/google/callback',
        },
        function (accessToken, refreshToken, profile, done) {
            userProfile = profile;
            return done(null, userProfile);
        }
    )
);

// request at /auth/google, when user click sign-up with google button transferring
// the request to google server, to show emails screen
router.get('/google/',
    passport.authenticate('google', { scope: ['profile', 'email'] }),
);

// URL Must be same as 'Authorized redirect URIs' field of OAuth client, i.e: /auth/google/callback
router.get(
    '/google/callback',
    passport.authenticate('google', { failureRedirect: '/auth/google/error' }),
    (req, res) => {
        res.redirect('/good'); // Successful authentication, redirect success.
    }
);

router.get('/good', async (req, res) => {
//find providers with id
//if id 
let finduser = await Find('auth_providers', 'providerId', userProfile?.id);
//if user does not exist
if (!finduser) {
    //create new user
    let providerPayload = {
        providerId: userProfile?.id,
        fullName : userProfile?.displayName,
        email:userProfile?._json?.email,
        isEmailVerified:userProfile?._json?.email_verified,
        picture:userProfile?._json?.picture,
        provider:"google",
        providerRaw:JSON.stringify(userProfile?._json),
    }
    let results = await Create('auth_providers', providerPayload);
    if (results.affectedRows === 1) {
       return res.send(userProfile)
    }

}else{
     res.json({...userProfile,userExist:true})
}
});

router.get('/failed', (req, res) => res.send('Error logging in via Google..'));

router.get('/signout', (req, res) => {
    try {
        req.session.destroy(function (err) {
            console.log('session destroyed.');
        });
        res.send('auth');
    } catch (err) {
        res.status(400).send({ message: 'Failed to sign out user' });
    }
});

module.exports = router;