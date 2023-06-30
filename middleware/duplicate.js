const asynHandler = require("./async");
const GlobalModel = require("../models/Global");
const { sendResponse, CatchHistory } = require("../helper/utilfunc");
const systemDate = new Date().toISOString().slice(0, 19).replace("T", " ");

exports.checkDuplicateaccount = asynHandler(async (req, res, next) => {
  let email = req.body.email;
  let phone = req.body.phone;
  let username = req.body.username;

  //check if menu is a child and no parent exist

  let findemail = await GlobalModel.Find('users','email',email);
  //if email exist
  if (findemail) {
    CatchHistory({ api_response: `Sorry, email record already exist :${email}`, function_name: 'CreateUser', date_started: systemDate, sql_action: "INSERT", event: "User Signup", actor: email }, req)
    return sendResponse(res, 0, 200, "Sorry, email record already exist")

  }

  let findphone = await GlobalModel.Find('users','phone',phone);
  //if email exist
  if (findphone) {
    CatchHistory({ api_response: `Sorry, phone record already exist :${phone}`, function_name: 'CreateUser', date_started: systemDate, sql_action: "INSERT", event: "User Signup", actor: phone }, req)
    return sendResponse(res, 0, 200, "Sorry, phone record already exist")

  }
  let findusername = await GlobalModel.Find('users','username',username);
  //if email exist
  if (findusername) {
    CatchHistory({ api_response: `Sorry, username record already exist :${username}`, function_name: 'CreateUser', date_started: systemDate, sql_action: "INSERT", event: "User Signup", actor: username }, req)
    return sendResponse(res, 0, 200, "Sorry,username record already exist")

  }

   req.date = systemDate

  return next();
});
