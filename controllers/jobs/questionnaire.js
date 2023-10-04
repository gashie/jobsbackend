const asynHandler = require("../../middleware/async");
const uuidV4 = require('uuid');
const GlobalModel = require("../../models/Global");
const QuestionsModel = require("../../models/Questions");
const { sendResponse, CatchHistory } = require("../../helper/utilfunc");
const { prePareQuestionOptions } = require("../../helper/func");
const { autoSaveWithOptions, autoSaveNoOptions, autoLinkQuestionJob, autoSaveBulkWithOptions, autoSaveBulkNoOptions } = require("../../helper/autoSavers");

exports.ViewSkills = asynHandler(async (req, res, next) => {
  let { viewAction } = req.body
  let actor = req.user.userInfo

  let results = await GlobalModel.ViewWithAction('skills', viewAction);
  if (results.length == 0) {
    CatchHistory({ event: `user with id: ${actor.userId} viewed ${results.length} skills`, functionName: 'ViewSkills', response: `No Record Found For Skills`, dateStarted: req.date, requestStatus: 200, actor: actor.userId }, req);
    return sendResponse(res, 0, 200, 'No Record Found')
  }
  CatchHistory({ event: `user with id: ${actor.userId} viewed ${results.length} skills`, functionName: 'ViewSkills', response: `Record Found, skills contains ${results.length} record's`, dateStarted: req.date, requestStatus: 200, actor: actor.userId }, req);

  return sendResponse(res, 1, 200, 'Record Found', results)

});

exports.ViewMySkills = asynHandler(async (req, res, next) => {
  let { viewAction } = req.body
  let actor = req.user.userInfo
  let results = await GlobalModel.ViewWithActionById('skills', viewAction, 'createdById', actor.userId);
  if (results.length == 0) {
    CatchHistory({ event: `user with id: ${actor.userId} viewed ${results.length} skills`, functionName: 'ViewMySkills', response: `No Record Found For Skills`, dateStarted: req.date, requestStatus: 200, actor: actor.userId }, req);
    return sendResponse(res, 0, 200, 'No Record Found')
  }
  CatchHistory({ event: `user with id: ${actor.userId} viewed ${results.length} skills`, functionName: 'ViewMySkills', response: `Record Found, skills contains ${results.length} record's`, dateStarted: req.date, requestStatus: 200, actor: actor.userId }, req);

  return sendResponse(res, 1, 200, 'Record Found', results)

});

exports.CreateQuestionnaire = asynHandler(async (req, res, next) => {
  let payload = req.body;
  let actor = req?.user?.userInfo
  let qOption = payload?.questionOption
  let questionId = uuidV4.v4()


  let preparedOptions = payload?.questionType === 'multi' || payload?.questionType === 'single' ? prePareQuestionOptions(qOption, questionId) : ""


  let questionPayload = {
    questionId,
    isAdmin: actor?.roleid == 1 ? 'yes' : 'no',
    questionTitle: payload.questionTitle,
    minimumValue: payload.minimumValue,
    maximumValue: payload.maximumValue,
    questionType: payload.questionType,
    jobId: payload.jobId,
    benchMark: payload.benchMark,
    createdByName: actor.fullName,
    createdById: actor.userId
  }

  return payload?.questionType === 'multi' || payload?.questionType === 'single' ? autoSaveWithOptions(questionPayload, preparedOptions, actor, req, res) : autoSaveNoOptions(questionPayload, actor, req, res)

})

exports.UpdateSkills = asynHandler(async (req, res, next) => {
  const { patch, patchData, deleterecord, restore, skillsId } = req.body;
  let actor = req.user.userInfo

  let deleteUserPayload = {
    updatedAt: req.date,
    deletedById: actor.userId,
    deletedByName: actor.fullName,
    deletedAt: !restore ? req.date : null,
  };
  let patchUserPayload = {
    updatedAt: req.date,
    updatedByName: actor.fullName,
    updatedById: actor.userId,
    skillName: patchData.skillName,
    skillDescription: patchData.skillDescription,
  };

  let switchActionPayload = patch ? patchUserPayload : deleteUserPayload

  let result = await GlobalModel.Update('skills', switchActionPayload, 'skillsId', skillsId);

  if (result.affectedRows === 1) {
    CatchHistory({ event: 'UPDATE ADMIN USER', functionName: 'UpdateUser', response: `Record Updated`, dateStarted: req.date, state: 1, requestStatus: 200, actor: actor.userId }, req);
    return sendResponse(res, 1, 200, 'Record Updated')

  } else {
    CatchHistory({ event: 'UPDATE ADMIN USER', functionName: 'UpdateUser', response: `Error Updating Record`, dateStarted: req.date, state: 0, requestStatus: 200, actor: actor.userId }, req);
    return sendResponse(res, 0, 200, 'Error Updating Record')
  }

})

exports.LinkQuestionnaire = asynHandler(async (req, res, next) => {
  let payload = req.body;
  let actor = req?.user?.userInfo
  return autoLinkQuestionJob(payload, actor, req, res)
})

exports.DeleteLinkage = asynHandler(async (req, res, next) => {
  const { id } = req.body;
  let actor = req.user.userInfo

  let result = await QuestionsModel.RemoveLinkage(id);
  console.log(result);
  if (result.affectedRows === 1) {
    CatchHistory({ event: 'Remove link between job and question', functionName: 'UpdateUser', response: `Job and question linked with id ${id} has been removed by ${actor.userId}`, dateStarted: req.date, state: 1, requestStatus: 200, actor: actor.userId }, req);
    return sendResponse(res, 1, 200, 'Record Updated')

  } else {
    CatchHistory({ event: 'Remove link between job and question', functionName: 'UpdateUser', response: `System failed to unlink job to question with id ${id}`, dateStarted: req.date, state: 0, requestStatus: 200, actor: actor.userId }, req);
    return sendResponse(res, 0, 200, 'Error Updating Record')
  }

})
exports.CreateBulkQuestionnaire = asynHandler(async (req, res, next) => {
  let bulk = req.body.questions;
  let jobId = req.body.jobId;
  let actor = req?.user?.userInfo
  let itemCount = bulk.length;
  let isDone = false
  let jobInfo = req.job

  // if (jobInfo.jobState === 'approved') {
  //   return sendResponse(res, 0, 200, "Sorry this job has already been approved", [])

  // }
  for (const payload of bulk) {
    let qOption = payload?.questionOption
    let questionId = uuidV4.v4()
    let preparedOptions = payload?.questionType === 'multi' || payload?.questionType === 'single' ? prePareQuestionOptions(qOption, questionId) : ""


    let questionPayload = {
      isAdmin: actor?.roleid == 1 ? 'yes' : 'no',
      questionId,
      questionTitle: payload.questionTitle,
      minimumValue: payload.minimumValue,
      maximumValue: payload.maximumValue,
      questionType: payload.questionType,
      jobId,
      benchMark: payload.benchMark,
      createdByName: actor.fullName,
      createdById: actor.userId
    }


    payload?.questionType === 'multi' || payload?.questionType === 'single' ? autoSaveBulkWithOptions(questionPayload, preparedOptions, actor, req, res) : autoSaveBulkNoOptions(questionPayload, actor, req, res)

    if (!--itemCount) {
      isDone = true;
      console.log(" => This is the last iteration...");

    } else {
      console.log(" => Still saving data...");

    }
  }
  if (isDone) {
    GlobalModel.Update('job_info', { hasQuestions: true }, 'jobsId', jobId);

    return sendResponse(res, 1, 200, "Saved successfully", { jobId: jobId })
  }


})

exports.AdminViewQuestionnaire = asynHandler(async (req, res, next) => {
  let actor = req.user.userInfo


  // Define your dynamic query parameters
  const tableName = 'job_question';
  const columnsToSelect = ['questionId', 'questionTitle', 'jobId', 'questionType', 'benchMark', 'minimumValue', 'maximumValue', 'createdAt', 'updatedAt', 'createdByName']; // Replace with your desired columns

  // Define an array of conditions (each condition is an object with condition and value

  const conditions = [
    { column: 'deletedAt', operator: 'IS', value: null },
    // Add more conditions as needed
  ];


  let results = await GlobalModel.QueryDynamicArray(tableName, columnsToSelect, conditions);

  if (results.length == 0) {
    CatchHistory({ event: `user with id: ${actor.userId} viewed ${results?.length} approved job_question`, functionName: 'ViewApprovedRateCards', response: `No Record Found For Rate Card `, dateStarted: req.date, requestStatus: 200, actor: actor.userId }, req);
    return sendResponse(res, 0, 200, 'No Record Found')
  } else {
    CatchHistory({ event: `user with id: ${actor.userId} viewed ${results?.length} approved job_question`, functionName: 'ViewApprovedRateCards', response: `Record Found, Rate Card  contains ${results?.length} record's`, dateStarted: req.date, requestStatus: 200, actor: actor.userId }, req);

    return sendResponse(res, 1, 200, 'Record Found', results)
  }

});
exports.ViewMyQuestionnaire = asynHandler(async (req, res, next) => {
  let actor = req.user.userInfo


  // Define your dynamic query parameters
  const tableName = 'job_question';
  const columnsToSelect = ['questionId', 'questionTitle', 'jobId', 'questionType', 'benchMark', 'minimumValue', 'maximumValue', 'createdAt', 'updatedAt', 'createdByName']; // Replace with your desired columns

  // Define an array of conditions (each condition is an object with condition and value

  const conditions = [
    { column: 'deletedAt', operator: 'IS', value: null },
    { column: 'createdById', operator: '=', value: actor.userId }
    // Add more conditions as needed
  ];


  let results = await GlobalModel.QueryDynamicArray(tableName, columnsToSelect, conditions);

  if (results.length == 0) {
    CatchHistory({ event: `user with id: ${actor.userId} viewed ${results?.length}  job_questions`, functionName: 'ViewMyQuestionnaire', response: `No Record Found For Rate Card `, dateStarted: req.date, requestStatus: 200, actor: actor.userId }, req);
    return sendResponse(res, 0, 200, 'No Record Found')
  } else {
    CatchHistory({ event: `user with id: ${actor.userId} viewed ${results?.length}  job_questions`, functionName: 'ViewMyQuestionnaire', response: `Record Found, Rate Card  contains ${results?.length} record's`, dateStarted: req.date, requestStatus: 200, actor: actor.userId }, req);

    return sendResponse(res, 1, 200, 'Record Found', results)
  }

});
exports.ViewJointQuestionnaire = asynHandler(async (req, res, next) => {
  let actor = req.user.userInfo


  // Define your dynamic query parameters
  const tableName = 'job_question';
  const columnsToSelect = ['questionId', 'questionTitle', 'jobId', 'questionType', 'benchMark', 'minimumValue', 'maximumValue', 'createdAt', 'updatedAt', 'createdByName']; // Replace with your desired columns

  // Define an array of conditions (each condition is an object with condition and value
  const conditionsTwo = [
    { column: 'deletedAt', operator: 'IS', value: null },
    { column: 'createdById', operator: '=', value: actor.userId },
    // Add more conditions as needed
  ];


  let results = await GlobalModel.QueryDynamicArray(tableName, columnsToSelect, conditionsTwo);

  const conditionsOne = [
    { column: 'deletedAt', operator: 'IS', value: null },
    { column: 'isAdmin', operator: '=', value: 'yes' }
    // Add more conditions as needed
  ];


  let adminQuestions = await GlobalModel.QueryDynamicArray(tableName, columnsToSelect, conditionsOne);

  if (results.length == 0) {
    CatchHistory({ event: `user with id: ${actor.userId} viewed ${results?.length}  joint job_questions`, functionName: 'ViewJointQuestionnaire', response: `No Record Found For Rate Card `, dateStarted: req.date, requestStatus: 200, actor: actor.userId }, req);
    return sendResponse(res, 0, 200, 'No Record Found')
  } else {
    CatchHistory({ event: `user with id: ${actor.userId} viewed ${results?.length}  joint job_questions`, functionName: 'ViewJointQuestionnaire', response: `Record Found, Rate Card  contains ${results?.length} record's`, dateStarted: req.date, requestStatus: 200, actor: actor.userId }, req);

    return sendResponse(res, 1, 200, 'Record Found', [...results, ...adminQuestions])
  }

});

exports.ViewMySingleQuestionnaire = asynHandler(async (req, res, next) => {
  let actor = req.user.userInfo
  let { questionId } = req.body



  // Define your dynamic query parameters
  const tableName = 'job_question';
  const columnsToSelect = ['questionId', 'questionTitle', 'jobId', 'questionType', 'benchMark', 'minimumValue', 'maximumValue', 'createdAt', 'updatedAt', 'createdByName']; // Replace with your desired columns

  // Define an array of conditions (each condition is an object with condition and value

  const conditions = [
    { column: 'deletedAt', operator: 'IS', value: null },
    { column: 'createdById', operator: '=', value: actor.userId },
    { column: 'questionId', operator: '=', value: questionId }
    // Add more conditions as needed
  ];


  let results = await GlobalModel.QueryDynamic(tableName, columnsToSelect, conditions);

  if (results && results?.questionType === "yesno" || results?.questionType === "range") {
    CatchHistory({ event: `user with id: ${actor.userId} viewed ${results?.length}  job_questions`, functionName: 'ViewMyQuestionnaire', response: `Record Found, Rate Card  contains ${results?.length} record's`, dateStarted: req.date, requestStatus: 200, actor: actor.userId }, req);
    return sendResponse(res, 1, 200, 'Record Found', results)
  }
  if (results && results?.questionType === "multi" || results?.questionType === "single") {
    let optionsData = []
    const conditionsTwo = [
      { column: 'questionId', operator: '=', value: questionId },
      // Add more conditions as needed
    ];
    let optionsArray = await GlobalModel.QueryDynamicArray('job_question_option', [], conditionsTwo)
    optionsData.push(optionsArray)

    let questionsData = {
      ...results,
      optionsData
    }

    CatchHistory({ event: `user with id: ${actor.userId} viewed ${results?.length}  job_questions`, functionName: 'ViewMyQuestionnaire', response: `Record Found, Rate Card  contains ${results?.length} record's`, dateStarted: req.date, requestStatus: 200, actor: actor.userId }, req);
    return sendResponse(res, 1, 200, 'Record Found', questionsData)
  }
  return sendResponse(res, 1, 200, 'Sorry no record found', [])
});

exports.UpdateQuestionnaire = asynHandler(async (req, res, next) => {
  const { patch, patchData, questionId } = req.body;
  let actor = req.user.userInfo

  let patchUserPayload = {
    updatedAt: req.date,
    updatedByName: actor.fullName,
    updatedById: actor.userId,
    questionTitle: patchData?.questionTitle,
    minimumValue: patchData?.minimumValue,
    maximumValue: patchData?.maximumValue,
    questionType: patchData?.questionType,
    jobId: patchData?.jobId,
    benchMark: patchData?.benchMark,
  };
  let result = await GlobalModel.Update('job_question', patchUserPayload, 'questionId', questionId);  //update question with questionId
  if (patch && patchData?.optionsData) { // if incoming has options, remove old options and insert new
    let preparedOptions = prePareQuestionOptions(patchData?.optionsData, questionId) // prepare array object for question options
    let removeoptions = await QuestionsModel.delete(questionId); ///delete old questions
    let newoptions = await QuestionsModel.create(preparedOptions); //create new questions
  }

  if (result.affectedRows === 1) {
    CatchHistory({ event: 'Update Questionnaire', functionName: 'UpdateQuestionnaire', response: `Questionnaire record with id ${questionId} was updated by ${actor.userId}`, dateStarted: req.date, state: 1, requestStatus: 200, actor: actor.userId }, req);
    return sendResponse(res, 1, 200, 'Record Updated')

  } else {
    CatchHistory({ event: 'Update Questionnaire', functionName: 'UpdateQuestionnaire', response: `Error Updating Record with id ${questionId}`, dateStarted: req.date, state: 0, requestStatus: 200, actor: actor.userId }, req);
    return sendResponse(res, 0, 200, 'Error Updating Record')
  }

})
exports.DeleteMySingleQuestionnaire = asynHandler(async (req, res, next) => {
  let actor = req.user.userInfo
  let { questionId } = req.body



  // Define your dynamic query parameters
  const tableName = 'job_question';
  const columnsToSelect = ['questionId', 'questionTitle', 'jobId', 'questionType', 'benchMark', 'minimumValue', 'maximumValue', 'createdAt', 'updatedAt', 'createdByName']; // Replace with your desired columns

  // Define an array of conditions (each condition is an object with condition and value

  const conditions = [
    { column: 'createdById', operator: '=', value: actor.userId },
    { column: 'questionId', operator: '=', value: questionId }
    // Add more conditions as needed
  ];


  let results = await GlobalModel.QueryDynamic(tableName, columnsToSelect, conditions);

  if (results && results?.questionType === "yesno" || results?.questionType === "range") {
    let removequestion = await QuestionsModel.deleteQuestion(questionId); ///delete old questions
    if (removequestion.affectedRows > 0) {
      CatchHistory({ event: `user with id: ${actor.userId} viewed ${results?.length}  job_questions`, functionName: 'ViewMyQuestionnaire', response: `Record Found, Rate Card  contains ${results?.length} record's`, dateStarted: req.date, requestStatus: 200, actor: actor.userId }, req);
      return sendResponse(res, 1, 200, 'Record deleted successfully', [])

    }
  }
  if (results && results?.questionType === "multi" || results?.questionType === "single") {
    let removequestion = await QuestionsModel.deleteQuestion(questionId); ///delete old questions

    let removeoptions = await QuestionsModel.delete(questionId); ///delete options
    if (removequestion.affectedRows > 0 && removeoptions.affectedRows > 0) {

      CatchHistory({ event: `user with id: ${actor.userId} viewed ${results?.length}  job_questions`, functionName: 'ViewMyQuestionnaire', response: `Record Found, Rate Card  contains ${results?.length} record's`, dateStarted: req.date, requestStatus: 200, actor: actor.userId }, req);
      return sendResponse(res, 1, 200, 'Record Found', questionsData)
    }
  }
  return sendResponse(res, 1, 200, 'Sorry no record found', [])
});