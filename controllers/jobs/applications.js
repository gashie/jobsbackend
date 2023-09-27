const dotenv = require("dotenv");
dotenv.config({ path: "./config/config.env" });
const asynHandler = require("../../middleware/async");
const JobModel = require("../../models/Job");
const { sendResponse, CatchHistory } = require("../../helper/utilfunc");

exports.ViewMyAppliedJobs = asynHandler(async (req, res, next) => {
  let actor = req.user.userInfo

  let results = await JobModel.JobSeekerViewJobApplicants(actor.userId);
  if (results.length == 0) {
    CatchHistory({ event: `user with id: ${actor.userId} viewed ${results.length} applied jobs`, functionName: 'ViewMyAppliedJobs', response: `No Record Found For applied jobs`, dateStarted: req.date, requestStatus: 200, actor: actor.userId }, req);
    return sendResponse(res, 0, 200, 'No Record Found')
  }
  CatchHistory({ event: `user with id: ${actor.userId} viewed ${results.length} applied jobs`, functionName: 'ViewMyAppliedJobs', response: `Record Found, applied jobs contains ${results.length} record's`, dateStarted: req.date, requestStatus: 200, actor: actor.userId }, req);

  return sendResponse(res, 1, 200, 'Record Found', results)

});
