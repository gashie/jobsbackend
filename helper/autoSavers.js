const uuidV4 = require('uuid');
const path = require("path");
const GlobalModel = require("../models/Global");
const QuestionModel = require("../models/Questions");
const { sendResponse, CatchHistory } = require('./utilfunc');
const { autoFindLinkage } = require('./autoFinder');
const { SendEmailApi } = require('../sevices/comm');
module.exports = {
  autoSaveCompany: async (payload, req, res, rawResetToken) => {
    let companyId = uuidV4.v4();
    const appLogo = req?.files?.appLogo;
    if (appLogo && !appLogo?.mimetype?.startsWith("image")) {
      return sendResponse(res, 0, 200, "Please make sure to upload an image", [])

  }
  if (appLogo && appLogo?.mimetype.startsWith("image")) {

      //change filename
      // removeFile('./uploads/images/logos/', oldsettings.appLogo)
      appLogo.name = `logo_id_${companyId}_md_${appLogo.md5}_${path.parse(appLogo.name).ext}`;
      appLogo.mv(`./uploads/image/logos/${appLogo.name}`, async (err) => {
          if (err) {
              console.log(err);
              return sendResponse(res, 0, 200, "Problem with file upload", [])
          }
      });

  }
    let { location, website, companyName, userType, roleid, username, companySize, companyProfile, userId, fullName, email, phone, password, address, country, birthDate, maritalStatus, gender, highestEducation, industryId, facebook, linkedin, twitter } = payload
    let companyPayload = {
      companyId,
      companyName,
      userId,
      createdByName: fullName,
      location,
      companyProfile,
      website,
      companySize,
      industryId,
      facebook,
      linkedin,
      twitter,
      createdByName:userId,
      companyLogo: appLogo?.name,
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
        SendEmailApi("gashie@asimeglobal.com",
          `Hi ${payload.fullName},
  
        You have created an account on the Jobsinghana web site. To fully enjoy our services, please confirm registration by clicking the link below:
        http://localhost:3000/emailaction?token=${rawResetToken}&email=${email}
        
        If the link above does not work, please copy and paste it into your browser's address bar and press the Enter key.
        
        After successful confirmation, you can login and enjoy all the features of Jobsinghana.`
          , "Confirm your Account Details", payload.email)
        CatchHistory({ api_response: `User with id :${userId} created new company `, function_name: 'autoSave', date_started: req.date, sql_action: "INSERT", event: "Company Signup", actor: userId }, req)
        return sendResponse(res, 1, 200, "Record saved", [])
      } else {
        CatchHistory({ api_response: `Sorry, error saving record,User with id :${id} created new company `, function_name: 'autoSave', date_started: req.date, sql_action: "INSERT", event: "Company Signup", actor: userId }, req)
        return sendResponse(res, 0, 200, "Sorry, error saving record", [])
      }

    }


  },
  autoSaveUser: async (payload, req, res, rawResetToken) => {
    const myCv = req?.files?.myCv;
    let resumeId = uuidV4.v4()

    if (myCv && !myCv.mimetype.startsWith("application/pdf")) {
      return sendResponse(res, 0, 200, "Please make sure to upload a pdf file", [])

    }
    if (myCv && !myCv.mimetype.startsWith("application/pdf")) {

      //change filename
      myCv.name = `resumeId_id_${resumeId}_md_${myCv?.md5}_${path.parse(myCv?.name).ext}`;
      myCv.mv(`./uploads/pdf/resume/${myCv.name}`, async (err) => {
        if (err) {
          console.log(err);
          return sendResponse(res, 0, 200, "Problem with file upload", [])
        }
      });
    }
    let resumePayload = {
      resumeId: resumeId,
      userId: payload.userId,
      fileName: myCv?.name
    }
    let results = await GlobalModel.Create('users', payload);
    if (results.affectedRows === 1) {
      GlobalModel.Create('resume', resumePayload); //save resume silently

      SendEmailApi("gashie@asimeglobal.com",
        `Hi ${payload.fullName},

      You have created an account on the Jobsinghana web site. To fully enjoy our services, please confirm registration by clicking the link below:
      http://localhost:3000/emailaction?token=${rawResetToken}&email=${payload.email}
      
      If the link above does not work, please copy and paste it into your browser's address bar and press the Enter key.
      
      After successful confirmation, you can login and enjoy all the features of Jobsinghana.`
        , "Confirm your Account Details", payload.email)
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
      return;
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