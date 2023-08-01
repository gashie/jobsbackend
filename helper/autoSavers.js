const uuidV4 = require('uuid');
const GlobalModel = require("../models/Global");
const QuestionModel = require("../models/Questions");
const { sendResponse, CatchHistory } = require('./utilfunc');
const { autoFindLinkage } = require('./autoFinder');
module.exports = {
  autoSaveCompany: async (payload, req, res) => {
    let comapanyId = uuidV4.v4()
    let { location, website, companyName, userType, roleid, username, companySize, companyProfile, companyLogo, userId, fullName, email, phone, password, address, country, birthDate, maritalStatus, gender, highestEducation } = payload
    let companyPayload = {
      comapanyId,
      companyName,
      userId,
      createdByName: fullName,
      location,
      companyProfile,
      website,
      companySize,
    };
    let userPayload = {
      userId,
      email,
      username,
      fullName,
      password,
      phone,
      address,
      country,
      birthDate,
      maritalStatus,
      gender,
      highestEducation,
      userType,
      roleid,
    }
    let saveuserresult = await GlobalModel.Create('users', userPayload);
    if (saveuserresult.affectedRows === 1) {
      CatchHistory({ api_response: `New user signup with id :${userId}`, function_name: 'CreateUser', date_started: req.date, sql_action: "INSERT", event: "User Signup", actor: userId }, req)
      let results = await GlobalModel.Create('company', companyPayload);
      if (results.affectedRows === 1) {
        CatchHistory({ api_response: `User with id :${userId} created new company `, function_name: 'autoSave', date_started: req.date, sql_action: "INSERT", event: "Company Signup", actor: userId }, req)
        return sendResponse(res, 1, 200, "Record saved", [])
      } else {
        CatchHistory({ api_response: `Sorry, error saving record,User with id :${id} created new company `, function_name: 'autoSave', date_started: req.date, sql_action: "INSERT", event: "Company Signup", actor: userId }, req)
        return sendResponse(res, 0, 200, "Sorry, error saving record", [])
      }

    }


  },
  autoSaveUser: async (payload, req, res) => {
    let results = await GlobalModel.Create('users', payload);
    if (results.affectedRows === 1) {
      CatchHistory({ api_response: `New user signup with id :${payload.userId}`, function_name: 'CreateUser', date_started: req.date, sql_action: "INSERT", event: "User Signup", actor: payload.userId }, req)
      return sendResponse(res, 1, 200, "User Signup Record Saved", [])
    } else {
      CatchHistory({ api_response: `Sorry, error saving record for user  with id :${id}`, function_name: 'CreateUser', date_started: req.date, sql_action: "INSERT", event: "User Signup", actor: payload.userId }, req)
      return sendResponse(res, 0, 200, "Sorry, error saving record", [])
    }


  },
  autoSaveWithOptions: async (questionPayload, preparedOptions, actor, req, res) => {

    let results = await GlobalModel.Create('job_question', questionPayload);
    let optionresults = await QuestionModel.create(preparedOptions);
    if (questionPayload?.jobId !== "") {
      autoFindLinkage(questionPayload)
    }
    if (results.affectedRows === 1 && optionresults.affectedRows > 0) {
      CatchHistory({ event: `user with id: ${actor.userId} added new questionnaire `, functionName: 'CreateQuestionnaire', dateStarted: req.date, sql_action: "INSERT", actor: actor.userId }, req)
      return sendResponse(res, 1, 200, "Record saved", [])
    } else {
      CatchHistory({ event: `Sorry, error saving record for user  with id :${actor.userId}`, functionName: 'CreateQuestionnaire', dateStarted: req.date, sql_action: "INSERT", actor: actor.userId }, req)
     return sendResponse(res, 0, 200, "Sorry, error saving record", [])
    }


  },
  autoSaveNoOptions: async (questionPayload, actor, req, res) => {

    let results = await GlobalModel.Create('job_question', questionPayload);
    if (questionPayload?.jobId !== "") {
      autoFindLinkage(questionPayload)
    }

    if (results.affectedRows === 1) {
      CatchHistory({ event: `user with id: ${actor.userId} added new questionnaire `, functionName: 'CreateQuestionnaire', dateStarted: req.date, sql_action: "INSERT", actor: actor.userId }, req)
      return sendResponse(res, 1, 200, "Record saved", [])
    } else {
      CatchHistory({ event: `Sorry, error saving record for user  with id :${actor.userId}`, stack: results, functionName: 'CreateQuestionnaire', dateStarted: req.date, sql_action: "INSERT", actor: actor.userId }, req)
      return sendResponse(res, 0, 200, "Sorry, error saving record", [])
    }


  },
  autoLinkQuestionJob: async (payload, actor, req, res) => {
    let linkedResult = await QuestionModel.FindLinkage(payload.jobId, payload.questionId);
    if (linkedResult) {
      return sendResponse(res, 0, 200, `Sorry,job with id: ${payload.jobId} has already been linked to question with id ${payload.questionId}`, [])
    }
    let results = await GlobalModel.Create('job_linked_question', payload);
    if (results.affectedRows === 1) {
      CatchHistory({ event: `user with id: ${actor.userId} linked job with id: ${payload.jobId} to question with id ${payload.questionId} `, functionName: 'autoLinkQuestionJob', dateStarted: req.date, sql_action: "SELECT|INSERT", actor: actor.userId }, req)
      return sendResponse(res, 1, 200, "Record saved", [])
    } else {
      CatchHistory({ event: `Sorry, error saving or linking record for job with id: ${payload.jobId} to question with id ${payload.questionId} `, functionName: 'autoLinkQuestionJob', dateStarted: req.date, sql_action: "SELECT|INSERT", actor: actor.userId }, req)
      return sendResponse(res, 0, 200, "Sorry, error saving record", [])
    }


  },
  autoSaveBulkWithOptions: async (questionPayload, preparedOptions, actor, req, res) => {

    let results = await GlobalModel.Create('job_question', questionPayload);
    let optionresults = await QuestionModel.create(preparedOptions);
    if (questionPayload?.jobId !== "") {
      autoFindLinkage(questionPayload)
    }
    if (results.affectedRows === 1 && optionresults.affectedRows > 0) {
      CatchHistory({ event: `user with id: ${actor.userId} added new questionnaire `, functionName: 'CreateQuestionnaire', dateStarted: req.date, sql_action: "INSERT", actor: actor.userId }, req)
      return;
    } else {
      CatchHistory({ event: `Sorry, error saving record for user  with id :${actor.userId}`, functionName: 'CreateQuestionnaire', dateStarted: req.date, sql_action: "INSERT", actor: actor.userId }, req)
     return ;
    }


  },
  autoSaveBulkNoOptions: async (questionPayload, actor, req, res) => {

    let results = await GlobalModel.Create('job_question', questionPayload);
    if (questionPayload?.jobId !== "") {
      autoFindLinkage(questionPayload)
    }

    if (results.affectedRows === 1) {
      CatchHistory({ event: `user with id: ${actor.userId} added new questionnaire `, functionName: 'CreateQuestionnaire', dateStarted: req.date, sql_action: "INSERT", actor: actor.userId }, req)
      return;
    } else {
      CatchHistory({ event: `Sorry, error saving record for user  with id :${actor.userId}`, stack: results, functionName: 'CreateQuestionnaire', dateStarted: req.date, sql_action: "INSERT", actor: actor.userId }, req)
      return;
    }


  },
}