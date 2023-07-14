const asynHandler = require("../../middleware/async");
const uuidV4 = require('uuid');
const GlobalModel = require("../../models/Global");
const { sendResponse, CatchHistory } = require("../../helper/utilfunc");
const { prePareQuestionOptions } = require("../../helper/func");
const { autoSaveWithOptions, autoSaveNoOptions } = require("../../helper/autoSavers");

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
    questionTitle: payload.questionTitle,
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