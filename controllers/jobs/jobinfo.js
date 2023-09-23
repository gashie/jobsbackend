const uuidV4 = require('uuid');
const dotenv = require("dotenv");
dotenv.config({ path: "./config/config.env" });
const asynHandler = require("../../middleware/async");
const GlobalModel = require("../../models/Global");
const JobModel = require("../../models/Job");
const { sendResponse, CatchHistory } = require("../../helper/utilfunc");
const { prePareLocations, spreadLocations } = require('../../helper/func');
const { makeApiCall } = require('../../helper/autoCalls');

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

exports.ViewMyJobs = asynHandler(async (req, res, next) => {
  let { viewAction } = req.body
  let actor = req.user.userInfo
  let results = await GlobalModel.ViewWithActionById('job_info', viewAction, 'createdById', actor.userId);
  if (results.length == 0) {
    CatchHistory({ event: `user with id: ${actor.userId} viewed ${results.length} job info`, functionName: 'ViewMyJobs', response: `No Record Found For Job info`, dateStarted: req.date, requestStatus: 200, actor: actor.userId }, req);
    return sendResponse(res, 0, 200, 'No Record Found')
  }
  CatchHistory({ event: `user with id: ${actor.userId} viewed ${results.length} job info`, functionName: 'ViewMyJobs', response: `Record Found, job info contains ${results.length} record's`, dateStarted: req.date, requestStatus: 200, actor: actor.userId }, req);

  return sendResponse(res, 1, 200, 'Record Found', results)

});

exports.CreateJobInfo = asynHandler(async (req, res, next) => {
  let payload = req.body;
  let actor = req.user.userInfo
  payload.jobId = uuidV4.v4()
  let preparedLocations = prePareLocations(payload?.jobLocation, payload.jobId)
  payload.jobLocation = spreadLocations(payload?.jobLocation)
  payload.jobSkills = req.body.jobSkills.join(',')
  payload.createdByName = actor.fullName
  payload.createdById = actor.userId

  let results = await GlobalModel.Create('job_info', payload);
  let locationresults = await JobModel.create(preparedLocations);

  if (results.affectedRows === 1 && locationresults.affectedRows > 0) {
    CatchHistory({ event: `user with id: ${actor.userId} added new job  `, functionName: 'CreateJobInfo', dateStarted: req.date, sql_action: "INSERT", actor: actor.userId }, req)

    return sendResponse(res, 1, 200, "Record saved", { jobId: payload.jobId })
  } else {
    CatchHistory({ event: `Sorry, error saving record for job   with name :${payload.jobCategoryName}`, functionName: 'CreateJobInfo', dateStarted: req.date, sql_action: "INSERT", actor: actor.userId }, req)

    return sendResponse(res, 0, 200, "Sorry, error saving record", [])
  }

})

exports.UpdateJobInfo = asynHandler(async (req, res, next) => {
  const { patch, patchData, deleterecord, restore, jobId } = req.body;
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
    jobTitle: patchData.jobTitle,
    jobCategoryId: patchData.jobCategoryId,
    jobSalaryAmount: patchData.jobSalaryAmount,
    companyId: patchData.companyId,
    isCompanyConfidential: patchData.isCompanyConfidential,
    jobDescription: patchData.jobDescription,
    jobSkillsId: patchData.jobSkillsId,
    jobSalaryCurrency: patchData.jobSalaryCurrency,
    jobStatusId: patchData.jobStatusId,
    applyMode: patchData.applyMode,
    applyLink: patchData.applyLink
  };

  let switchActionPayload = patch ? patchUserPayload : deletePayload

  let result = await GlobalModel.Update('job_info', switchActionPayload, 'jobId', jobId);

  if (result.affectedRows === 1) {
    CatchHistory({ event: 'Update Job Info', functionName: 'UpdateJobInfo', response: `Job Info record with id ${jobId} was updated by ${actor.userId}`, dateStarted: req.date, state: 1, requestStatus: 200, actor: actor.userId }, req);
    return sendResponse(res, 1, 200, 'Record Updated')

  } else {
    CatchHistory({ event: 'Update Job Info', functionName: 'UpdateJobInfo', response: `Error Updating Record with id ${jobId}`, dateStarted: req.date, state: 0, requestStatus: 200, actor: actor.userId }, req);
    return sendResponse(res, 0, 200, 'Error Updating Record')
  }

})

exports.AdminApproveJobInfo = asynHandler(async (req, res, next) => {
  const { jobState, jobId } = req.body;
  let actor = req.user.userInfo

  let patchUserPayload = {
    updatedAt: req.date,
    updatedByName: actor.fullName,
    updatedById: actor.userId,
    jobState: jobState,
  };

  let result = await GlobalModel.Update('job_info', patchUserPayload, 'jobId', jobId);

  if (result.affectedRows === 1) {
    CatchHistory({ event: 'Approve Job Info', functionName: 'AdminApproveJobInfo', response: `Job Info record with id ${jobId} was approved by ${actor.userId}`, dateStarted: req.date, state: 1, requestStatus: 200, actor: actor.userId }, req);
    return sendResponse(res, 1, 200, 'Record Updated')

  } else {
    CatchHistory({ event: 'Approve Job Info', functionName: 'AdminApproveJobInfo', response: `Error Updating Record with id ${jobId}`, dateStarted: req.date, state: 0, requestStatus: 200, actor: actor.userId }, req);
    return sendResponse(res, 0, 200, 'Error Updating Record')
  }

})