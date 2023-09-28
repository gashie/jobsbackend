const path = require("path");
const fs = require('fs').promises;
const uuidV4 = require('uuid');
const asynHandler = require("../../middleware/async");
const GlobalModel = require("../../models/Global");
const { sendResponse, CatchHistory, removeFile } = require("../../helper/utilfunc");
const { logger } = require("../../logs/winston");

exports.ViewServiceEnquiry = asynHandler(async (req, res, next) => {
    let { viewAction } = req.body
    let actor = req.user.userInfo

    let results = await GlobalModel.ViewWithAction('services_info', viewAction);
    if (results.length == 0) {
        CatchHistory({ event: `user with id: ${actor.userId} viewed ${results.length} services_info`, functionName: 'ViewServiceEnquiry', response: `No Record Found For Course partners`, dateStarted: req.date, requestStatus: 200, actor: actor.userId }, req);
        return sendResponse(res, 0, 200, 'No Record Found')
    }
    CatchHistory({ event: `user with id: ${actor.userId} viewed ${results.length} services_info`, functionName: 'ViewServiceEnquiry', response: `Record Found, Course partners contains ${results.length} record's`, dateStarted: req.date, requestStatus: 200, actor: actor.userId }, req);

    return sendResponse(res, 1, 200, 'Record Found', results)

});





exports.CreateServiceEnquiry = asynHandler(async (req, res, next) => {
    let payload = req.body;

    let results = await GlobalModel.Create('services_info', payload);
    if (results.affectedRows === 1) {
        CatchHistory({ event: `${payload.fullName} sent a message requesting for ${payload.purpose}`, functionName: 'CreateServiceEnquiry', dateStarted: req.date, sql_action: "INSERT", actor: payload?.email }, req)
        return sendResponse(res, 1, 200, "Your enquiry has been submitted successfully", [])
    } else {
        CatchHistory({ event: `Sorry, error saving record for course  with name :${payload.courseTitle}`, functionName: 'CreateServiceEnquiry', dateStarted: req.date, sql_action: "INSERT", actor: payload?.email }, req)
        return sendResponse(res, 0, 200, "Sorry,failed to submit enquiry", [])
    }

})



