const path = require("path");
const fs = require('fs').promises;
const uuidV4 = require('uuid');
const asynHandler = require("../../middleware/async");
const GlobalModel = require("../../models/Global");
const { sendResponse, CatchHistory, removeFile } = require("../../helper/utilfunc");
const { logger } = require("../../logs/winston");

exports.ViewCourseSchedule = asynHandler(async (req, res, next) => {
    let { viewAction } = req.body
    let actor = req.user.userInfo

    let results = await GlobalModel.ViewWithAction('course_schedule', viewAction);
    if (results.length == 0) {
        CatchHistory({ event: `user with id: ${actor.userId} viewed ${results.length} course_schedule`, functionName: 'ViewCourseSchedule', response: `No Record Found For Course partners`, dateStarted: req.date, requestStatus: 200, actor: actor.userId }, req);
        return sendResponse(res, 0, 200, 'No Record Found')
    }
    CatchHistory({ event: `user with id: ${actor.userId} viewed ${results.length} course_schedule`, functionName: 'ViewCourseSchedule', response: `Record Found, Course partners contains ${results.length} record's`, dateStarted: req.date, requestStatus: 200, actor: actor.userId }, req);

    return sendResponse(res, 1, 200, 'Record Found', results)

});





exports.CreateCourseSchedule = asynHandler(async (req, res, next) => {
    let payload = req.body;
    let actor = req.user.userInfo
    let scheduleId = uuidV4.v4()


    payload.scheduleId = scheduleId
    payload.createdById = actor.userId

    let results = await GlobalModel.Create('course_schedule', payload);
    if (results.affectedRows === 1) {
        CatchHistory({ event: `user with id: ${actor.userId} added new course schedule `, functionName: 'CreateCourseSchedule', dateStarted: req.date, sql_action: "INSERT", actor: actor.userId }, req)
        return sendResponse(res, 1, 200, "Record saved", [])
    } else {
        CatchHistory({ event: `Sorry, error saving record for course  with name :${payload.courseTitle}`, functionName: 'CreateCourseSchedule', dateStarted: req.date, sql_action: "INSERT", actor: actor.userId }, req)
        return sendResponse(res, 0, 200, "Sorry, error saving record", [])
    }

})

exports.UpdateCourseSchedule = asynHandler(async (req, res, next) => {
    const { patch, patchData, deleterecord, restore, scheduleId } = req.body;
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

    let result = await GlobalModel.Update('course_schedule', switchActionPayload, 'scheduleId', scheduleId);

    if (result.affectedRows === 1) {
        CatchHistory({ event: 'Update course_schedule', functionName: 'UpdateCourseSchedule', response: `course_schedule record with id ${scheduleId} was updated by ${actor.userId}`, dateStarted: req.date, state: 1, requestStatus: 200, actor: actor.userId }, req);
        return sendResponse(res, 1, 200, 'Record Updated')

    } else {
        CatchHistory({ event: 'Update course_content', functionName: 'UpdateCourseSchedule', response: `Error Updating Record with id ${scheduleId}`, dateStarted: req.date, state: 0, requestStatus: 200, actor: actor.userId }, req);
        return sendResponse(res, 0, 200, 'Error Updating Record')
    }

})

