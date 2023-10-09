const express = require("express");
const router = express.Router();


const { googleAuth, googleCallback } = require("../controllers/user/google");


//socia logins
// Define authentication routes
router.get('/google', googleAuth);
router.get('/google/callback',googleCallback, (req, res) => {
  res.redirect('/good');
});

module.exports = router;