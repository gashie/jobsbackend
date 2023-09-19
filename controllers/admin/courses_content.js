const path = require("path");
const fs = require('fs').promises;
const uuidV4 = require('uuid');
const asynHandler = require("../../middleware/async");
const GlobalModel = require("../../models/Global");
const { sendResponse, CatchHistory, removeFile } = require("../../helper/utilfunc");

exports.ViewCourseContent = asynHandler(async (req, res, next) => {
    let { viewAction } = req.body
    let actor = req.user.userInfo

    let results = await GlobalModel.ViewWithAction('course_content', viewAction);
    if (results.length == 0) {
        CatchHistory({ event: `user with id: ${actor.userId} viewed ${results.length} course_content`, functionName: 'ViewCourseContent', response: `No Record Found For Course content`, dateStarted: req.date, requestStatus: 200, actor: actor.userId }, req);
        return sendResponse(res, 0, 200, 'No Record Found')
    }
    CatchHistory({ event: `user with id: ${actor.userId} viewed ${results.length} course_content`, functionName: 'ViewCourseContent', response: `Record Found, Course contains ${results.length} record's`, dateStarted: req.date, requestStatus: 200, actor: actor.userId }, req);

    return sendResponse(res, 1, 200, 'Record Found', results)

});





exports.CreateCourseContent = asynHandler(async (req, res, next) => {
    let payload = req.body;
    let actor = req.user.userInfo
    let contentId = uuidV4.v4()
    const contentFile = req.files.contentFile;

    if (
        contentFile &&
        !(
            contentFile.mimetype.startsWith("image") ||
            contentFile.mimetype.startsWith("text/plain") ||
            contentFile.mimetype.startsWith("application/pdf") ||
            contentFile.mimetype.startsWith("video")
        )
    ) {
        return sendResponse(res, 0, 200, "Please make sure to upload a file for this content", [])

    }


    //course Image
    contentFile.name = `course_content_id_${contentId}_md_${contentFile.md5}_${path.parse(contentFile.name).ext}`;
    contentFile.mv(`./uploads/mixed/course/content/${contentFile.name}`, async (err) => {
        if (err) {
            console.log(err);
            return sendResponse(res, 0, 200, "Problem with course content file upload", [])
        }
    });



    payload.contentId = contentId
    payload.createdById = actor.userId
    payload.contentFile = contentFile.name

    let results = await GlobalModel.Create('course_content', payload);
    if (results.affectedRows === 1) {
        CatchHistory({ event: `user with id: ${actor.userId} added new course content `, functionName: 'CreateCourseContent', dateStarted: req.date, sql_action: "INSERT", actor: actor.userId }, req)

        return sendResponse(res, 1, 200, "Record saved", [])
    } else {
        CatchHistory({ event: `Sorry, error saving record for course  with name :${payload.courseTitle}`, functionName: 'CreateCourse', dateStarted: req.date, sql_action: "INSERT", actor: actor.userId }, req)

        return sendResponse(res, 0, 200, "Sorry, error saving record", [])
    }

})

exports.UpdateCourseContent = asynHandler(async (req, res, next) => {
    const { patch, patchData, deleterecord, restore, contentId } = req.body;
    let actor = req.user.userInfo
    const contentFile = req.files.contentFile;
    let oldcontent = req.content


    if (
        patch &&
        !(
            contentFile.mimetype.startsWith("image") ||
            contentFile.mimetype.startsWith("text/plain") ||
            contentFile.mimetype.startsWith("application/pdf") ||
            contentFile.mimetype.startsWith("video")
        )
    ) {
        return sendResponse(res, 0, 200, "Please make sure to upload an image", [])

    }


    if (patch && contentFile && contentFile.mimetype.startsWith("image") || contentFile.mimetype.startsWith("text/plain") || contentFile.mimetype.startsWith("application/pdf")) {

        //change filename
        removeFile('./uploads/mixed/course/content/', oldcontent.contentFile)
        //course Video ad
        contentFile.name = `course_content_id_${contentId}_md_${contentFile.md5}_${path.parse(contentFile.name).ext}`;
        contentFile.mv(`./uploads/mixed/course/content/${contentFile.name}`, async (err) => {
            if (err) {
                console.log(err);
                return sendResponse(res, 0, 200, "Problem with pdf brochure file upload", [])
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
        contentFile: contentFile.name,
        ...JSON.parse(patchData),

    };

    let switchActionPayload = patch ? patchUserPayload : deletePayload

    let result = await GlobalModel.Update('course_content', switchActionPayload, 'contentId', contentId);

    if (result.affectedRows === 1) {
        CatchHistory({ event: 'Update course_content', functionName: 'UpdateCourseContent', response: `course_content record with id ${contentId} was updated by ${actor.userId}`, dateStarted: req.date, state: 1, requestStatus: 200, actor: actor.userId }, req);
        return sendResponse(res, 1, 200, 'Record Updated')

    } else {
        CatchHistory({ event: 'Update course_content', functionName: 'UpdateCourseContent', response: `Error Updating Record with id ${contentId}`, dateStarted: req.date, state: 0, requestStatus: 200, actor: actor.userId }, req);
        return sendResponse(res, 0, 200, 'Error Updating Record')
    }

})

