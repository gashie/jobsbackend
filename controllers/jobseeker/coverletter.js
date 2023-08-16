const asynHandler = require("../../middleware/async");
const uuidV4 = require('uuid');
const GlobalModel = require("../../models/Global");
const { sendResponse, CatchHistory } = require("../../helper/utilfunc");



exports.ViewMyCoverLetter= asynHandler(async (req, res, next) => {
  let { viewAction } = req.body
  let actor = req.user.userInfo
  let results = await GlobalModel.ViewWithActionById('cover_letter', viewAction, 'userId', actor.userId);
  if (results.length == 0) {
    CatchHistory({ event: `user with id: ${actor.userId} viewed ${results.length} cover_letter`, functionName: 'ViewMyCoverLetter', response: `No Record Found For CV`, dateStarted: req.date, requestStatus: 200, actor: actor.userId }, req);
    return sendResponse(res, 0, 200, 'No Record Found')
  }
  CatchHistory({ event: `user with id: ${actor.userId} viewed ${results.length} cover_letters`, functionName: 'ViewMyCoverLetter', response: `Record Found, cv contains ${results.length} record's`, dateStarted: req.date, requestStatus: 200, actor: actor.userId }, req);

  return sendResponse(res, 1, 200, 'Record Found', results)

});

exports.CreateCoverLetter = asynHandler(async (req, res, next) => {
  let payload = req.body;
  let actor = req.user.userInfo
  let coverLetterId = uuidV4.v4()
  payload.userId = actor.userId
  payload.coverLetterId = coverLetterId;
  let results = await GlobalModel.Create('cover_letter', payload);
  if (results.affectedRows === 1) {
    CatchHistory({ event: `user with id: ${actor.userId} added new cover_letter `, functionName: 'CreateCoverLetter', dateStarted: req.date, sql_action: "INSERT", actor: actor.userId }, req)

    return sendResponse(res, 1, 200, "Record saved", [])
  } else {
    CatchHistory({ event: `Sorry, error saving record for user  with id :${actor.userId}`, functionName: 'CreateCoverLetter', dateStarted: req.date, sql_action: "INSERT", actor: actor.userId }, req)

    return sendResponse(res, 0, 200, "Sorry, error saving record", [])
  }

})

exports.UpdateCoverLetter = asynHandler(async (req, res, next) => {
  const { patch, patchData, deleterecord, restore,coverLetterId } = req.body;
  let actor = req.user.userInfo

  let deleteUserPayload = {
    updatedAt: req.date,
    deletedAt: !restore ? req.date : null,
  };
  let patchUserPayload = {
    updatedAt: req.date,
    coverLetterName: patchData.coverLetterName,
    coverLetterDescription: patchData.coverLetterDescription,
  };

  let switchActionPayload = patch ? patchUserPayload :deleteUserPayload

  let result = await GlobalModel.Update('cover_letter', switchActionPayload, 'coverLetterId', coverLetterId);

  if (result.affectedRows === 1) {
    CatchHistory({ event: `Cover letter updated by user with id ${actor.userId}`, functionName: 'UpdateCoverLetter', response: `Record Updated`, dateStarted: req.date, state: 1, requestStatus: 200, actor: actor.userId }, req);
    return sendResponse(res, 1, 200, 'Record Updated')

  } else {
    CatchHistory({ event: `Sorry, error updating record for user  with id :${actor.userId}`, functionName: 'UpdateCoverLetter', response: `Error Updating Record`, dateStarted: req.date, state: 0, requestStatus: 200, actor: actor.userId }, req);
    return sendResponse(res, 0, 200, 'Error Updating Record')
  }

})