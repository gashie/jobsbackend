const path = require("path");
const fs = require('fs').promises;
const uuidV4 = require('uuid');
const asynHandler = require("../../middleware/async");
const GlobalModel = require("../../models/Global");
const { sendResponse, CatchHistory, removeFile } = require("../../helper/utilfunc");
const { logger } = require("../../logs/winston");

exports.ViewCoursePartners = asynHandler(async (req, res, next) => {
    let { viewAction } = req.body
    let actor = req.user.userInfo

    let results = await GlobalModel.ViewWithAction('course_partners', viewAction);
    if (results.length == 0) {
        CatchHistory({ event: `user with id: ${actor.userId} viewed ${results.length} course_partners`, functionName: 'ViewCoursePartners', response: `No Record Found For Course partners`, dateStarted: req.date, requestStatus: 200, actor: actor.userId }, req);
        return sendResponse(res, 0, 200, 'No Record Found')
    }
    CatchHistory({ event: `user with id: ${actor.userId} viewed ${results.length} course_partners`, functionName: 'ViewCoursePartners', response: `Record Found, Course partners contains ${results.length} record's`, dateStarted: req.date, requestStatus: 200, actor: actor.userId }, req);

    return sendResponse(res, 1, 200, 'Record Found', results)

});





exports.CreateCoursePartners = asynHandler(async (req, res, next) => {
    let payload = req.body;
    let actor = req.user.userInfo
    let partnerId = uuidV4.v4()
    const institutionLogo = req.files.institutionLogo;
    if (institutionLogo && !institutionLogo.mimetype.startsWith("image") ) {
        return sendResponse(res, 0, 200, "Please make sure to upload a file for this partnership", [])

    }


    //course Image
    institutionLogo.name = `course_partnership_id_${partnerId}_md_${institutionLogo.md5}_${path.parse(institutionLogo.name).ext}`;
    institutionLogo.mv(`./uploads/mixed/course/partnership/${institutionLogo.name}`, async (err) => {
        if (err) {
            logger.error(err)
            return sendResponse(res, 0, 200, "Problem with course partnership file upload", [])
        }
    });



    payload.partnerId = partnerId
    payload.createdById = actor.userId
    payload.institutionLogo = institutionLogo.name

    let results = await GlobalModel.Create('course_partners', payload);
    if (results.affectedRows === 1) {
        CatchHistory({ event: `user with id: ${actor.userId} added new course content `, functionName: 'CreateCoursePartners', dateStarted: req.date, sql_action: "INSERT", actor: actor.userId }, req)
        return sendResponse(res, 1, 200, "Record saved", [])
    } else {
        CatchHistory({ event: `Sorry, error saving record for course  with name :${payload.courseTitle}`, functionName: 'CreateCoursePartners', dateStarted: req.date, sql_action: "INSERT", actor: actor.userId }, req)
        return sendResponse(res, 0, 200, "Sorry, error saving record", [])
    }

})

exports.UpdateCoursePartners = asynHandler(async (req, res, next) => {
    const { patch, patchData, deleterecord, restore, partnerId } = req.body;
    let actor = req.user.userInfo
    const institutionLogo = req.files.institutionLogo;
    let oldpartnership = req.partnership
    console.log('====================================');
    console.log(institutionLogo);
    console.log('====================================');
    if (patch &&  !institutionLogo.mimetype.startsWith("image")) {
        return sendResponse(res, 0, 200, "Please make sure to upload an image", [])

    }


    if (patch && institutionLogo && institutionLogo.mimetype.startsWith("image")) {

        //change filename
        removeFile('./uploads/mixed/course/partnership/', oldpartnership.institutionLogo)
        //course Video ad
        institutionLogo.name = `course_content_id_${partnerId}_md_${institutionLogo.md5}_${path.parse(institutionLogo.name).ext}`;
        institutionLogo.mv(`./uploads/mixed/course/partnership/${institutionLogo.name}`, async (err) => {
            if (err) {
                console.log(err);
                return sendResponse(res, 0, 200, "Problem with  file upload", [])
            }
        });

    }

    let deletePayload = {
        updatedAt: req.date,
        deletedById: actor.userId,
        deletedAt: !restore ? req.date : null,
    };
    let patchUserPayload = {
        updatedAt: req.date,
        updatedById: actor.userId,
        institutionLogo: institutionLogo.name,
        ...JSON.parse(patchData),

    };

    let switchActionPayload = patch ? patchUserPayload : deletePayload

    let result = await GlobalModel.Update('course_partners', switchActionPayload, 'partnerId', partnerId);

    if (result.affectedRows === 1) {
        CatchHistory({ event: 'Update course_partners', functionName: 'UpdateCourseContent', response: `course_partners record with id ${partnerId} was updated by ${actor.userId}`, dateStarted: req.date, state: 1, requestStatus: 200, actor: actor.userId }, req);
        return sendResponse(res, 1, 200, 'Record Updated')

    } else {
        CatchHistory({ event: 'Update course_content', functionName: 'UpdateCourseContent', response: `Error Updating Record with id ${partnerId}`, dateStarted: req.date, state: 0, requestStatus: 200, actor: actor.userId }, req);
        return sendResponse(res, 0, 200, 'Error Updating Record')
    }

})

