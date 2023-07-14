const asynHandler = require("../../middleware/async");
const GlobalModel = require("../../models/Global");
const { sendResponse, CatchHistory } = require("../../helper/utilfunc");

exports.ViewIndustry = asynHandler(async (req, res, next) => {
  let { viewAction } = req.body
  let actor = req.user.userInfo

  let results = await GlobalModel.ViewWithAction('industry', viewAction);
  if (results.length == 0) {
    CatchHistory({ event: `user with id: ${actor.userId} viewed ${results.length} industry`, functionName: 'ViewJobCategory', response: `No Record Found For Industry`, dateStarted: req.date, requestStatus: 200, actor: actor.userId }, req);
    return sendResponse(res, 0, 200, 'No Record Found')
  }
  CatchHistory({ event: `user with id: ${actor.userId} viewed ${results.length} industry`, functionName: 'ViewJobCategory', response: `Record Found, Industry contains ${results.length} record's`, dateStarted: req.date, requestStatus: 200, actor: actor.userId }, req);
  return sendResponse(res, 1, 200, 'Record Found', results)

});



exports.CreateIndustry = asynHandler(async (req, res, next) => {
  let payload = req.body;
  let actor = req.user.userInfo
  payload.createdById = actor.userId
  let results = await GlobalModel.Create('industry', payload);
  if (results.affectedRows === 1) {
    CatchHistory({ event: `user with id: ${actor.userId} added new industry `, functionName: 'CreateIndustry', dateStarted: req.date, sql_action: "INSERT", actor: actor.userId }, req)

    return sendResponse(res, 1, 200, "Record saved", [])
  } else {
    CatchHistory({ event: `Sorry, error saving record for industry  with name :${payload.jobCategoryName}`, functionName: 'CreateIndustry', dateStarted: req.date, sql_action: "INSERT", actor: actor.userId }, req)

    return sendResponse(res, 0, 200, "Sorry, error saving record", [])
  }

})

exports.UpdateIndustry = asynHandler(async (req, res, next) => {
  const { patch, patchData, deleterecord, restore,industryId } = req.body;
  let actor = req.user.userInfo

  let deletePayload = {
    updatedAt: req.date,
    deletedById: actor.userId,
    deletedAt: !restore ? req.date : null,
  };
  let patchUserPayload = {
    updatedAt: req.date,
    updatedById: actor.userId,
    industryTitle: patchData.industryTitle,
    industryDescription: patchData.industryDescription,
  };

  let switchActionPayload = patch ? patchUserPayload :deletePayload

  let result = await GlobalModel.Update('industry', switchActionPayload, 'industryId', industryId);

  if (result.affectedRows === 1) {
    CatchHistory({ event: 'Update Industry', functionName: 'UpdateIndustry', response: `Industry record with id ${industryId} was updated by ${actor.userId}`, dateStarted: req.date, state: 1, requestStatus: 200, actor: actor.userId }, req);
    return sendResponse(res, 1, 200, 'Record Updated')

  } else {
    CatchHistory({ event: 'Update Industry', functionName: 'UpdateIndustry', response: `Error Updating Record with id ${industryId}`, dateStarted: req.date, state: 0, requestStatus: 200, actor: actor.userId }, req);
    return sendResponse(res, 0, 200, 'Error Updating Record')
  }

})