const uuidV4 = require('uuid');
const dotenv = require("dotenv");
dotenv.config({ path: "./config/config.env" });
const asynHandler = require("../../middleware/async");
const GlobalModel = require("../../models/Global");
const JobModel = require("../../models/Job");
const { sendResponse, CatchHistory } = require("../../helper/utilfunc");
const { prePareLocations, spreadLocations, scoring } = require('../../helper/func');
const { autoFindQuestionsWithJobId, autoFindProcessQuestionsWithJobId } = require('../../helper/autoFinder');

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
let preparedLocations = ''
  if (patchData.jobLocation) {
    let preparedLocations = prePareLocations(patchData?.jobLocation,jobId)
    patchData.jobLocation = spreadLocations(patchData?.jobLocation)
  }
  if (patchData.jobSkills) {
    patchData.jobSkills = patchData.jobSkills.join(',')
  }
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
    ...patchData
    // jobTitle: patchData.jobTitle,
    // jobCategoryId: patchData.jobCategoryId,
    // jobSalaryAmount: patchData.jobSalaryAmount,
    // companyId: patchData.companyId,
    // isCompanyConfidential: patchData.isCompanyConfidential,
    // jobDescription: patchData.jobDescription,
    // jobSkillsId: patchData.jobSkillsId,
    // jobSalaryCurrency: patchData.jobSalaryCurrency,
    // jobStatusId: patchData.jobStatusId,
    // applyMode: patchData.applyMode,
    // applyLink: patchData.applyLink
  };

  let switchActionPayload = patch ? patchUserPayload : deletePayload

  if (patchData.jobLocation) {
    let result = await GlobalModel.Update('job_info', switchActionPayload, 'jobId', jobId);

  }
  // let result = await GlobalModel.Update('job_location', preparedLocations, 'jobId', jobId);

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

exports.ViewJobDetails = asynHandler(async (req, res, next) => {
  let { jobId } = req.body
  // let actor = req.user.userInfo
  let results = await JobModel.OpenJob(jobId);
  if (results) {
    let getQuestionsData = await autoFindQuestionsWithJobId(jobId)
    return sendResponse(res, 1, 200, 'Record Found', { jobInfo: results, Questions: getQuestionsData })
  }
  return sendResponse(res, 0, 200, 'No Record Found')

})

exports.ViewJobsData = asynHandler(async (req, res, next) => {
  let results = await JobModel.PublicOpenJob();
  if (results.length == 0) {
    return sendResponse(res, 0, 200, 'No Record Found')
  }

  return sendResponse(res, 1, 200, 'Record Found', results)

})

exports.ApplyJob = asynHandler(async (req, res, next) => {
  let { jobId, fullName, email, phone, answers } = req.body
  const resume = req.files.resume;
  let actor = req.user.userInfo   //get userInfo
  let jobInfo = req.job

  let processAnswers = answers ? JSON.parse(answers) : {}
  let applicationData = {
    userId: actor.userId,
    jobId,
    applicantName: fullName,
    applicantEmail: email,
    applicantPhone: phone,
    applicationId: uuidV4.v4()
  }
  if (jobInfo?.hasQuestions === "no") {
    //save application info
    let results = await GlobalModel.Create('job_application', applicationData);

    if (results.affectedRows === 1) {
      CatchHistory({ event: `user with id: ${actor.userId} applied for job with id ${jobId}  `, functionName: 'ApplyJob', dateStarted: req.date, sql_action: "INSERT", actor: actor.userId }, req)
      return sendResponse(res, 1, 200, "Record saved", [])
    } else {
      CatchHistory({ event: `Sorry, error saving record for job   with name :${payload.jobCategoryName}`, functionName: 'ApplyJob', dateStarted: req.date, sql_action: "INSERT", actor: actor.userId }, req)
      return sendResponse(res, 0, 200, "Sorry, error saving record", [])
    }

  }
  if (jobInfo?.hasQuestions === "yes" && !processAnswers?.answers || processAnswers?.answers?.length < 1) {
    return sendResponse(res, 0, 200, "Sorry, kindly provide all answers", [])
  }

  // if has questions and nothing has been answered send error messaeg
  if (jobInfo?.hasQuestions === "yes" && processAnswers?.answers?.length > 0) {
    let itemCount = processAnswers?.answers?.length;
    let isDone = false

    let getQuestionsData = await autoFindQuestionsWithJobId(jobId)
    const { Scoreresults, overallScore } = scoring(getQuestionsData, processAnswers?.answers)

    for (const iterator of processAnswers?.answers) {
      let responseId = uuidV4.v4()
      let responseAnswers = {
        questionId: iterator.questionId,
        responseId,
        answerValue: Array.isArray(iterator.ans) ? iterator.ans.toString() : iterator.ans,
        userId: actor.userId

      }
      let userResponses = {
        responseId,
        userId: actor.userId,
        jobId

      }
      await GlobalModel.Create('job_question_response_answers', responseAnswers);
      await GlobalModel.Create('job_question_response', userResponses);

      if (!--itemCount) {
        isDone = true;
        console.log(" => This is the last iteration...");

      } else {
        console.log(" => Still saving data...");

      }
    }

    if (isDone) {
      applicationData.sumQuestions = getQuestionsData.length
      applicationData.sumAnswers = Scoreresults?.length
      applicationData.applicationScore = overallScore
      let results = await GlobalModel.Create('job_application', applicationData);

      if (results.affectedRows === 1) {
        CatchHistory({ event: `user with id: ${actor.userId} applied for job with id ${jobId}  `, functionName: 'ApplyJob', dateStarted: req.date, sql_action: "INSERT", actor: actor.userId }, req)
        return sendResponse(res, 1, 200, "Record saved", [])
      } else {
        CatchHistory({ event: `Sorry, error saving record for job   with name :${payload.jobCategoryName}`, functionName: 'ApplyJob', dateStarted: req.date, sql_action: "INSERT", actor: actor.userId }, req)
        return sendResponse(res, 0, 200, "Sorry, error saving record", [])
      }
    }
  }





})

exports.ApproveJobApplication = asynHandler(async (req, res, next) => {
  const { applicationStatus, applicationId } = req.body;
  let actor = req.user.userInfo
  //find job application with id,and applicationStatus !approved

  let patchUserPayload = {
    approvedAt: req.date,
    approvedById: actor.userId,
    applicationStatus: applicationStatus == true ? "accepted" : "rejected",

  };


  let result = await GlobalModel.Update('job_application', patchUserPayload, 'applicationId', applicationId);

  if (result.affectedRows === 1) {
    CatchHistory({ event: 'Approve/Deny job application', functionName: 'ApproveJobApplication', response: `job application record with id ${applicationId} was ${applicationStatus == true ? "accepted" : "rejected"} by ${actor.userId}`, dateStarted: req.date, state: 1, requestStatus: 200, actor: actor.userId }, req);
    return sendResponse(res, 1, 200, 'Record Updated')

  } else {
    CatchHistory({ event: 'Approve/Deny job application', functionName: 'ApproveJobApplication', response: `Error Updating Record with id ${applicationId}`, dateStarted: req.date, state: 0, requestStatus: 200, actor: actor.userId }, req);
    return sendResponse(res, 0, 200, 'Error Updating Record')
  }

})

exports.ViewJobApplications = asynHandler(async (req, res, next) => {
  let { jobId } = req.body
  let actor = req.user.userInfo
  let results = await JobModel.ViewJobApplicants(jobId);
  if (results.length == 0) {
    CatchHistory({ event: `user with id: ${actor.userId} viewed ${results.length} job applications`, functionName: 'ViewJobApplications', response: `No Record Found For Job applications`, dateStarted: req.date, requestStatus: 200, actor: actor.userId }, req);
    return sendResponse(res, 0, 200, 'No Record Found')
  }
  CatchHistory({ event: `user with id: ${actor.userId} viewed ${results.length} job applications`, functionName: 'ViewJobApplications', response: `Record Found, job applications contains ${results.length} record's`, dateStarted: req.date, requestStatus: 200, actor: actor.userId }, req);

  return sendResponse(res, 1, 200, 'Record Found', results)

});
exports.ViewMyJobApplications = asynHandler(async (req, res, next) => {
  let { jobId } = req.body
  let actor = req.user.userInfo

  let results = await JobModel.EmployerViewJobApplicants(jobId,actor?.company?.companyId);
  if (results.length == 0) {
    CatchHistory({ event: `user with id: ${actor.userId} viewed ${results.length} job applications`, functionName: 'ViewMyJobApplications', response: `No Record Found For Job applications`, dateStarted: req.date, requestStatus: 200, actor: actor.userId }, req);
    return sendResponse(res, 0, 200, 'No Record Found')
  }
  CatchHistory({ event: `user with id: ${actor.userId} viewed ${results.length} job applications`, functionName: 'ViewMyJobApplications', response: `Record Found, job applications contains ${results.length} record's`, dateStarted: req.date, requestStatus: 200, actor: actor.userId }, req);

  return sendResponse(res, 1, 200, 'Record Found', results)

});
exports.ViewMyShortlistedJobApplicants = asynHandler(async (req, res, next) => {
  let { jobId } = req.body
  let actor = req.user.userInfo
  let jobInfo = req.job
  let results = await JobModel.EmployerViewShortlistedJobApplicants(jobId, actor?.company?.companyId, jobInfo?.jobScore);
  if (results.length == 0) {
    CatchHistory({ event: `user with id: ${actor.userId} viewed ${results.length} shortlisted job applicants`, functionName: 'ViewMyShortlistedJobApplicants', response: `No Record Found For Shortlisted Job applicants`, dateStarted: req.date, requestStatus: 200, actor: actor.userId }, req);
    return sendResponse(res, 0, 200, 'No Record Found')
  }
  CatchHistory({ event: `user with id: ${actor.userId} viewed ${results.length} shortlisted job applicants`, functionName: 'ViewMyShortlistedJobApplicants', response: `Record Found,shortlisted job applicants contains ${results.length} record's`, dateStarted: req.date, requestStatus: 200, actor: actor.userId }, req);

  return sendResponse(res, 1, 200, 'Record Found', results)

});