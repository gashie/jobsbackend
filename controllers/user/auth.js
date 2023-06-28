const USERS = require("../../models/User");
const {FilterMenu} = require('../../helper/filtermenus')
const bcyrpt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const asynHandler = require("../../middleware/async");
const { sendResponse } = require("../../helper/utilfunc");
const { CatchHistory } = require("../../helper/global");
dotenv.config({ path: "./config/config.env" });
const systemDate = new Date().toISOString().slice(0, 19).replace("T", " ");
exports.AuthUser = asynHandler(async (req, res, next) => {
  const { username, password } = req.body;

  const ad = new AD({
    url: process.env.url,
    user: `${username}@calbank.test`,
    pass: password,
  });

  //AUHTENTICATE USER
  let authme = await ad.user(username).authenticate(password);

  if (!authme) {
    CatchHistory({event:'ADMIN AUTHENTICATION',functionName:'AuthUser',response:`Invalid Username Or Password`,dateStarted:systemDate,state:0,requestStatus:200,channelUsername:req.body.username,channelUserId:req.body.username}, req);
    return sendResponse(res,0,200,'Invalid Username Or Password')
  }

  //Get user Details From Active Directory
  let userDetails = await ad.user(username).get();
  let user = {
    username: userDetails.sAMAccountName,
    email: userDetails.userPrincipalName,
    fullname: userDetails.displayName,
    roleid: 1,
    status: 1,
  };

  /**
   * check if user exist
   */
  

  let userDbResult = await USERS.Authenticate(user.username);
  if (!userDbResult) {
    CatchHistory({event:'ADMIN AUTHENTICATION',functionName:'AuthUser',response:`User not assigned to oauth admin`,dateStarted:systemDate,state:0,requestStatus:200,channelUsername:req.body.username,channelUserId:req.body.username}, req);
    return sendResponse(res,0,200,'Sorry, you have not been assigned to the system')
  } 
    userDbResult.password = undefined
    let roleResult = await USERS.FindRole(userDbResult.roleid);
    if (!roleResult) {
      CatchHistory({event:'ADMIN AUTHENTICATION',functionName:'AuthUser',response:`Sorry, no role has been assigned to this account`,dateStarted:systemDate,state:0,requestStatus:200,channelUsername:req.body.username,channelUserId:req.body.username}, req);
      return sendResponse(res,0,200,'Sorry, no role has been assigned to this account')
    }
    req.session.username = username
    req.session.password = password
    //Get Role Menu List
    let getUserinfo = await FilterMenu(userDbResult)
    CatchHistory({event:'ADMIN AUTHENTICATION',functionName:'AuthUser',response:`Logged in successfully`,dateStarted:systemDate,state:1,requestStatus:200,channelUsername:req.body.username,channelUserId:req.body.username}, req);

    res.status(200).json({
      Status: 1,
     User:getUserinfo,
    });


  /**
   * Check username
   */

  /**
   * Check password
   */

  //Get User role

  // sendTokenResponse(
  //   username,
  //   200,
  //   issuer,
  //   audience,
  //   timetolive,
  //   token_name,
  //   res
  // );
});

// const sendTokenResponse = (
//   username,
//   statusCode,
//   issuer,
//   audience,
//   timetolive,
//   token_name,
//   res
// ) => {
//   const payload = {
//     sub: username,
//     iss: issuer,
//     aud: audience,
//   };
//   const token = jwt.sign(payload, process.env.jwtPrivateKey, {
//     expiresIn: timetolive,
//   });

//   const options = {
//     maxAge: 60 * 60 * 1000,
//     httpOnly: true,
//   };

//   if (process.env.NODE_ENV === "production") {
//     options.secure = true;
//   }
//   res
//     .status(statusCode)
//     .cookie(token_name, token, options)
//     .json({ success: true, message: "Logged in successfully" });
// };
