const passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;
const express = require('express');
const router = express.Router();
const { Find, Create } = require('../../models/Global');

require('dotenv').config();
let userProfile;

passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_SECRET_KEY,
      callbackURL: process.env.FACEBOOK_CALLBACK_URL,
    },
    async function (accessToken, refreshToken, profile, cb) {
      userProfile = profile;
      return cb(null, userProfile);
    }
  )
);

router.get('/facebook', passport.authenticate('facebook', { scope: 'email' }));

router.get(
  '/facebook/callback',
  passport.authenticate('facebook', {
    failureRedirect: '/facebook/error',
  }),
  function (req, res) {
    // Successful authentication, redirect to success screen.
    res.redirect('/facebook/success');
  }
);

router.get('/facebook/success', async (req, res) => {
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
      provider: "facebook",
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

router.get('/facebook/error', (req, res) => res.send('Error logging in via Facebook..'));

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