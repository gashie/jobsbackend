const USERS = require("../../models/User");
const dotenv = require("dotenv");
const asynHandler = require("../../middleware/async");
const { sendResponse, CatchHistory } = require("../../helper/utilfunc");
dotenv.config({ path: "./config/config.env" });



exports.FetchVariousUsers = asynHandler(async (req, res, next) => {
    let { viewAction,userType } = req.body
    let actor = req.user.userInfo
    let results = await USERS.VariousUsers(viewAction,userType);
    if (results.length == 0) {
      CatchHistory({ event: `user with id: ${actor.userId} viewed ${results.length} user's with ${userType == 1?"Admin":2?"Jobseekers":"Employers" } role`, functionName: 'FetchVariousUsers', response: `No Record Found`, dateStarted: req.date, requestStatus: 200, actor: actor.userId }, req);
      return sendResponse(res, 0, 200, 'No Record Found')
    }
    CatchHistory({ event: `user with id: ${actor.userId} viewed ${results.length} user's with ${userType == 1?"Admin":2?"Jobseekers":"Employers" } role`, functionName: 'FetchVariousUsers', response: `Record Found`, dateStarted: req.date, requestStatus: 200, actor: actor.userId }, req);
  
    return sendResponse(res, 1, 200, 'Record Found', results)
  
  });


