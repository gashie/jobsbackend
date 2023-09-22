const path = require("path");
const fs = require('fs').promises;
const uuidV4 = require('uuid');
const asynHandler = require("../../middleware/async");
const GlobalModel = require("../../models/Global");
const { sendResponse, CatchHistory, removeFile } = require("../../helper/utilfunc");

exports.ViewRateCards = asynHandler(async (req, res, next) => {
  let { viewAction } = req.body
  let actor = req.user.userInfo

  let results = await GlobalModel.ViewWithAction('rate_card', viewAction);
  if (results.length == 0) {
    CatchHistory({ event: `user with id: ${actor.userId} viewed ${results.length} rate_card`, functionName: 'ViewRateCards', response: `No Record Found For Rate Card `, dateStarted: req.date, requestStatus: 200, actor: actor.userId }, req);
    return sendResponse(res, 0, 200, 'No Record Found')
  }
  CatchHistory({ event: `user with id: ${actor.userId} viewed ${results.length} rate_card`, functionName: 'ViewRateCards', response: `Record Found, Rate Card  contains ${results.length} record's`, dateStarted: req.date, requestStatus: 200, actor: actor.userId }, req);

  return sendResponse(res, 1, 200, 'Record Found', results)

});



exports.CreateRateCard = asynHandler(async (req, res, next) => {
  let payload = req.body;
  let actor = req.user.userInfo
  let rateId = uuidV4.v4()

  payload.rateId = rateId
  payload.createdById = actor.userId

  let results = await GlobalModel.Create('rate_card', payload);
  if (results.affectedRows === 1) {
    CatchHistory({ event: `user with id: ${actor.userId} added rate_card `, functionName: 'CreateRateCard', dateStarted: req.date, sql_action: "INSERT", actor: actor.userId }, req)

    return sendResponse(res, 1, 200, "Record saved", [])
  } else {
    CatchHistory({ event: `Sorry, error saving record for rate_card  with name :${payload.jobCategoryName}`, functionName: 'CreateRateCard', dateStarted: req.date, sql_action: "INSERT", actor: actor.userId }, req)

    return sendResponse(res, 0, 200, "Sorry, error saving record", [])
  }

})

exports.UpdateRateCard = asynHandler(async (req, res, next) => {
  const { patch, patchData, deleterecord, restore, rateId } = req.body;
  let actor = req.user.userInfo


  let deletePayload = {
    updatedAt: req.date,
    deletedById: actor.userId,
    deletedAt: !restore ? req.date : null,
  };
  let patchUserPayload = {
    updatedAt: req.date,
    updatedById: actor.userId,
    ...patchData,

  };

  let switchActionPayload = patch ? patchUserPayload : deletePayload

  let result = await GlobalModel.Update('rate_card', switchActionPayload, 'rateId', rateId);

  if (result.affectedRows === 1) {
    CatchHistory({ event: 'Update rate card', functionName: 'UpdateRateCard', response: `User rate_card record with id ${rateId} was updated by ${actor.userId}`, dateStarted: req.date, state: 1, requestStatus: 200, actor: actor.userId }, req);
    return sendResponse(res, 1, 200, 'Record Updated')

  } else {
    CatchHistory({ event: 'Update rate card', functionName: 'UpdateRateCard', response: `Error Updating Record with id ${rateId}`, dateStarted: req.date, state: 0, requestStatus: 200, actor: actor.userId }, req);
    return sendResponse(res, 0, 200, 'Error Updating Record')
  }

})

exports.ApproveRateCard = asynHandler(async (req, res, next) => {
  const { status, rateId } = req.body;
  let actor = req.user.userInfo
  //find rate card with id,and status !approved

  let patchUserPayload = {
    approvedAt: req.date,
    approvedById: actor.userId,
    rateStatus: status == true ? "approved" : "declined",

  };


  let result = await GlobalModel.Update('rate_card', patchUserPayload, 'rateId', rateId);

  if (result.affectedRows === 1) {
    CatchHistory({ event: 'Approve/Deny feed', functionName: 'ApproveRateCard', response: `rate card record with id ${rateId} was ${status == true ? "approved" : "declined"} by ${actor.userId}`, dateStarted: req.date, state: 1, requestStatus: 200, actor: actor.userId }, req);
    return sendResponse(res, 1, 200, 'Record Updated')

  } else {
    CatchHistory({ event: 'Approve/Deny feed', functionName: 'ApproveRateCard', response: `Error Updating Record with id ${rateId}`, dateStarted: req.date, state: 0, requestStatus: 200, actor: actor.userId }, req);
    return sendResponse(res, 0, 200, 'Error Updating Record')
  }

})

exports.ViewApprovedRateCards = asynHandler(async (req, res, next) => {
  let actor = req.user.userInfo


  // Define your dynamic query parameters
  const tableName = 'rate_card';
  const columnsToSelect = ['rateId','rateTitle','rateDescription','ratePrice']; // Replace with your desired columns

  // Define an array of conditions (each condition is an object with condition and value

  const conditions = [
    { column: 'rateStatus', operator: '=', value: 'approved' },
    // Add more conditions as needed
  ];


  let results = await GlobalModel.QueryDynamic(tableName, columnsToSelect, conditions);
  if (!results) {
    CatchHistory({ event: `user with id: ${actor.userId} viewed ${results.length} approved rate_card`, functionName: 'ViewApprovedRateCards', response: `No Record Found For Rate Card `, dateStarted: req.date, requestStatus: 200, actor: actor.userId }, req);
    return sendResponse(res, 0, 200, 'No Record Found')
  }
  CatchHistory({ event: `user with id: ${actor.userId} viewed ${results.length} approved rate_card`, functionName: 'ViewApprovedRateCards', response: `Record Found, Rate Card  contains ${results.length} record's`, dateStarted: req.date, requestStatus: 200, actor: actor.userId }, req);

  return sendResponse(res, 1, 200, 'Record Found', results)

});