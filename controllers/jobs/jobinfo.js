const uuidV4 = require('uuid');
const asynHandler = require("../../middleware/async");
const GlobalModel = require("../../models/Global");
const JobModel = require("../../models/Job");
const { sendResponse, CatchHistory } = require("../../helper/utilfunc");
const { prePareLocations, spreadLocations } = require('../../helper/func');

exports.ViewJobCategory = asynHandler(async (req, res, next) => {
  let { viewAction } = req.body
  let actor = req.user.userInfo

  let results = await GlobalModel.ViewWithAction('job_category', viewAction);
  if (results.length == 0) {
    CatchHistory({ event: `user with id: ${actor.userId} viewed ${results.length} job_category`, functionName: 'ViewJobCategory', response: `No Record Found For Job Category`, dateStarted: req.date, requestStatus: 200, actor: actor.userId }, req);
    return sendResponse(res, 0, 200, 'No Record Found')
  }
  CatchHistory({ event: `user with id: ${actor.userId} viewed ${results.length} job_category`, functionName: 'ViewJobCategory', response: `Record Found, Job Category contains ${results.length} record's`, dateStarted: req.date, requestStatus: 200, actor: actor.userId }, req);

  return sendResponse(res, 1, 200, 'Record Found', results)

});



exports.CreateJobInfo = asynHandler(async (req, res, next) => {
  let payload = req.body;
  let actor = req.user.userInfo
  payload.jobId = uuidV4.v4()
  let preparedLocations = prePareLocations(payload?.jobLocation,  payload.jobId)
  payload.jobLocation = spreadLocations(payload?.jobLocation)

  payload.createdByName = actor.fullName
  payload.createdById = actor.userId

  let results = await GlobalModel.Create('job_info', payload);
  let locationresults = await JobModel.create(preparedLocations);
  if (results.affectedRows === 1 && locationresults.affectedRows > 0) {
    CatchHistory({ event: `user with id: ${actor.userId} added new job category `, functionName: 'CreateJobCategory', dateStarted: req.date, sql_action: "INSERT", actor: actor.userId }, req)

    return sendResponse(res, 1, 200, "Record saved", [])
  } else {
    CatchHistory({ event: `Sorry, error saving record for job category  with name :${payload.jobCategoryName}`, functionName: 'CreateJobCategory', dateStarted: req.date, sql_action: "INSERT", actor: actor.userId }, req)

    return sendResponse(res, 0, 200, "Sorry, error saving record", [])
  }

})

exports.UpdateJobCategory = asynHandler(async (req, res, next) => {
  const { patch, patchData, deleterecord, restore,jobCategoryId } = req.body;
  let actor = req.user.userInfo

  let deletePayload = {
    updatedAt: req.date,
    deletedById: actor.userId,
    deletedByName: actor.fullName,
    deletedAt: !restore ? req.date : null,
  };
  let patchUserPayload = {
    updatedAt: req.date,
    updatedByName: actor.fullName,
    updatedById: actor.userId,
    jobCategoryName: patchData.jobCategoryName,
    jobCategoryDescription: patchData.jobCategoryDescription,
  };

  let switchActionPayload = patch ? patchUserPayload :deletePayload

  let result = await GlobalModel.Update('job_category', switchActionPayload, 'jobCategoryId', jobCategoryId);

  if (result.affectedRows === 1) {
    CatchHistory({ event: 'Update Job Category', functionName: 'UpdateJobCategory', response: `Job Category record with id ${jobCategoryId} was updated by ${actor.userId}`, dateStarted: req.date, state: 1, requestStatus: 200, actor: actor.userId }, req);
    return sendResponse(res, 1, 200, 'Record Updated')

  } else {
    CatchHistory({ event: 'Update Job Category', functionName: 'UpdateJobCategory', response: `Error Updating Record with id ${jobCategoryId}`, dateStarted: req.date, state: 0, requestStatus: 200, actor: actor.userId }, req);
    return sendResponse(res, 0, 200, 'Error Updating Record')
  }

})