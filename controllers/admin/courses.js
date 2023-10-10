const path = require("path");
const fs = require('fs').promises;
const uuidV4 = require('uuid');
const asynHandler = require("../../middleware/async");
const GlobalModel = require("../../models/Global");
const { sendResponse, CatchHistory, removeFile } = require("../../helper/utilfunc");

exports.ViewCourse = asynHandler(async (req, res, next) => {
    let { viewAction } = req.body
    let actor = req.user.userInfo

    let results = await GlobalModel.ViewWithAction('course', viewAction);
    if (results.length == 0) {
        CatchHistory({ event: `user with id: ${actor.userId} viewed ${results.length} course`, functionName: 'ViewCourse', response: `No Record Found For Course`, dateStarted: req.date, requestStatus: 200, actor: actor.userId }, req);
        return sendResponse(res, 0, 200, 'No Record Found')
    }
    CatchHistory({ event: `user with id: ${actor.userId} viewed ${results.length} course`, functionName: 'ViewCourse', response: `Record Found, Course contains ${results.length} record's`, dateStarted: req.date, requestStatus: 200, actor: actor.userId }, req);

    return sendResponse(res, 1, 200, 'Record Found', results)

});


exports.ViewMyCourses = asynHandler(async (req, res, next) => {
    let { viewAction } = req.body
    let actor = req.user.userInfo
    let results = await GlobalModel.ViewWithActionById('course', viewAction, 'createdById', actor.userId);
    if (results.length == 0) {
        CatchHistory({ event: `user with id: ${actor.userId} viewed ${results.length} course`, functionName: 'ViewMyCourses', response: `No Record Found For Course`, dateStarted: req.date, requestStatus: 200, actor: actor.userId }, req);
        return sendResponse(res, 0, 200, 'No Record Found')
    }
    CatchHistory({ event: `user with id: ${actor.userId} viewed ${results.length} course`, functionName: 'ViewMyCourses', response: `Record Found, course contains ${results.length} record's`, dateStarted: req.date, requestStatus: 200, actor: actor.userId }, req);

    return sendResponse(res, 1, 200, 'Record Found', results)

});

exports.ViewMyCoursesByCompanyId = asynHandler(async (req, res, next) => {
    let { viewAction,companyId } = req.body
    let actor = req.user.userInfo
    let results = await GlobalModel.ViewWithActionById('course', viewAction, 'companyId', companyId);
    if (results.length == 0) {
        CatchHistory({ event: `user with id: ${actor.userId} viewed ${results.length} course`, functionName: 'ViewMyCourses', response: `No Record Found For Course`, dateStarted: req.date, requestStatus: 200, actor: actor.userId }, req);
        return sendResponse(res, 0, 200, 'No Record Found')
    }
    CatchHistory({ event: `user with id: ${actor.userId} viewed ${results.length} course`, functionName: 'ViewMyCourses', response: `Record Found, course contains ${results.length} record's`, dateStarted: req.date, requestStatus: 200, actor: actor.userId }, req);

    return sendResponse(res, 1, 200, 'Record Found', results)

});


exports.CreateCourse = asynHandler(async (req, res, next) => {
    let payload = req.body;
    let actor = req.user.userInfo
    let courseId = uuidV4.v4()
    const courseImage = req.files.courseImage;
    const courseVideoAd = req.files.courseVideoAd;
    const courseBrochure = req.files.courseBrochure;
    if (courseImage && !courseImage.mimetype.startsWith("image")) {
        return sendResponse(res, 0, 200, "Please make sure to upload an image", [])

    }

    console.log(courseBrochure);
    if (courseBrochure && !courseBrochure.mimetype.startsWith("application/pdf")) {
        return sendResponse(res, 0, 200, "Please make sure to upload a pdf file", [])

    }

    if (courseVideoAd && !courseVideoAd.mimetype.startsWith("video")) {
        return sendResponse(res, 0, 200, "Please make sure to upload a video file", [])

    }

    //course Image
    courseImage.name = `course_id_${courseId}_md_${courseImage.md5}_${path.parse(courseImage.name).ext}`;
    courseImage.mv(`./uploads/image/course/${courseImage.name}`, async (err) => {
        if (err) {
            console.log(err);
            return sendResponse(res, 0, 200, "Problem with course image file upload", [])
        }
    });

    //course Brochure
    courseBrochure.name = `course_id_${courseId}_md_${courseBrochure.md5}_${path.parse(courseBrochure.name).ext}`;
    courseBrochure.mv(`./uploads/pdf/course/${courseBrochure.name}`, async (err) => {
        if (err) {
            console.log(err);
            return sendResponse(res, 0, 200, "Problem with pdf brochure file upload", [])
        }
    });

    //course Video ad
    courseVideoAd.name = `course_id_${courseId}_md_${courseVideoAd.md5}_${path.parse(courseVideoAd.name).ext}`;
    courseVideoAd.mv(`./uploads/video/course/${courseVideoAd.name}`, async (err) => {
        if (err) {
            console.log(err);
            return sendResponse(res, 0, 200, "Problem with pdf brochure file upload", [])
        }
    });


    payload.courseId = courseId
    payload.createdById = actor.userId
    payload.courseImage = courseImage.name
    payload.courseVideoAd = courseVideoAd.name
    payload.courseBrochure = courseBrochure.name
    payload.companyId = actor?.company?.companyId || req.body.companyId

    let results = await GlobalModel.Create('course', payload);
    if (results.affectedRows === 1) {
        CatchHistory({ event: `user with id: ${actor.userId} added new course `, functionName: 'CreateCourse', dateStarted: req.date, sql_action: "INSERT", actor: actor.userId }, req)

        return sendResponse(res, 1, 200, "Record saved", [])
    } else {
        CatchHistory({ event: `Sorry, error saving record for course  with name :${payload.courseTitle}`, functionName: 'CreateCourse', dateStarted: req.date, sql_action: "INSERT", actor: actor.userId }, req)

        return sendResponse(res, 0, 200, "Sorry, error saving record", [])
    }

})

exports.UpdateCourse = asynHandler(async (req, res, next) => {
    const { patch, patchData, deleterecord, restore, courseId } = req.body;
    let actor = req.user.userInfo
    const courseImage = req.files?.courseImage;
    const courseBrochure = req.files?.courseBrochure;
    const courseVideoAd = req.files?.courseVideoAd;
    let oldrecord = req.course
    if (patch === 'true' && courseImage && !courseImage.mimetype.startsWith("image")) {
        return sendResponse(res, 0, 200, "Please make sure to upload an image", [])

    }
    if (patch === 'true' && courseBrochure && !courseBrochure.mimetype.startsWith("application/pdf")) {
        return sendResponse(res, 0, 200, "Please make sure to upload a pdf file", [])

    }
    if (patch === 'true' && courseVideoAd && !courseVideoAd.mimetype.startsWith("video")) {
        return sendResponse(res, 0, 200, "Please make sure to upload a video", [])

    }
    if (patch === 'true' && courseImage && courseImage.mimetype.startsWith("image")) {

        //change filename
        removeFile('./uploads/video/course/', oldrecord.courseImage)
        //course Image
        courseImage.name = `course_id_${courseId}_md_${courseImage.md5}_${path.parse(courseImage.name).ext}`;
        courseImage.mv(`./uploads/image/course/${courseImage.name}`, async (err) => {
            if (err) {
                console.log(err);
                return sendResponse(res, 0, 200, "Problem with course image file upload", [])
            }
        });

    }
    if (patch === 'true' && courseBrochure && courseBrochure.mimetype.startsWith("application/pdf")) {

        //change filename
        removeFile('./uploads/pdf/course/', oldrecord.courseBrochure)
        //course Brochure
        courseBrochure.name = `course_id_${courseId}_md_${courseBrochure.md5}_${path.parse(courseBrochure.name).ext}`;
        courseBrochure.mv(`./uploads/pdf/course/${courseBrochure.name}`, async (err) => {
            if (err) {
                console.log(err);
                return sendResponse(res, 0, 200, "Problem with pdf brochure file upload", [])
            }
        });

    }
    if (patch === 'true' && courseVideoAd && courseVideoAd.mimetype.startsWith("video")) {

        //change filename
        removeFile('./uploads/video/course/', oldrecord.courseVideoAd)
        //course Video ad
        courseVideoAd.name = `course_id_${courseId}_md_${courseVideoAd.md5}_${path.parse(courseVideoAd.name).ext}`;
        courseVideoAd.mv(`./uploads/video/course/${courseVideoAd.name}`, async (err) => {
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
        courseImage: courseImage?.name,
        courseVideoAd: courseVideoAd?.name,
        courseBrochure: courseBrochure?.name,
        ...JSON.parse(patchData)

    };

    if (patch === 'true') {
        const patchData = {}; // Replace this with your actual patchData object
        Object.assign(patchUserPayload, patchData);
    }
    let switchActionPayload = patch ? patchUserPayload : deletePayload

    let result = await GlobalModel.Update('course', switchActionPayload, 'courseId', courseId);

    if (result.affectedRows === 1) {
        CatchHistory({ event: 'Update course', functionName: 'UpdateCourse', response: `course record with id ${courseId} was updated by ${actor.userId}`, dateStarted: req.date, state: 1, requestStatus: 200, actor: actor.userId }, req);
        return sendResponse(res, 1, 200, 'Record Updated')

    } else {
        CatchHistory({ event: 'Update course', functionName: 'UpdateCourse', response: `Error Updating Record with id ${courseId}`, dateStarted: req.date, state: 0, requestStatus: 200, actor: actor.userId }, req);
        return sendResponse(res, 0, 200, 'Error Updating Record')
    }

})

exports.ApproveCourse = asynHandler(async (req, res, next) => {
    const { status, courseId } = req.body;
    let actor = req.user.userInfo
    //find course with id,and status !approved

    let patchUserPayload = {
        approvedAt: req.date,
        approvedById: actor.userId,
        courseApprovalStatus: status == true ? "approved" : "declined",

    };


    let result = await GlobalModel.Update('course', patchUserPayload, 'courseId', courseId);

    if (result.affectedRows === 1) {
        CatchHistory({ event: 'Approve/Deny course', functionName: 'ApproveCourse', response: `Course record with id ${courseId} was ${status == true ? "approved" : "declined"} by ${actor.userId}`, dateStarted: req.date, state: 1, requestStatus: 200, actor: actor.userId }, req);
        return sendResponse(res, 1, 200, 'Record Updated')

    } else {
        CatchHistory({ event: 'Approve/Deny course', functionName: 'ApproveCourse', response: `Error Updating Record with id ${courseId}`, dateStarted: req.date, state: 0, requestStatus: 200, actor: actor.userId }, req);
        return sendResponse(res, 0, 200, 'Error Updating Record')
    }

})

// exports.ViewCourseDetail = asynHandler(async (req, res, next) => {
//     let { userId } = req.body
//     let actor = req.user.userInfo

//     // Define your dynamic query parameters
//     const tableName = 'course';
//     const tableTwoName = 'course_content';
//     const tableThreeName = 'course_partners';
//     const tableFourName = 'course_schedule';
//     const columnsToSelect = ['id', 'userId', 'fullName', 'username', 'email', 'phone', 'address', 'country', 'maritalStatus', 'gender', 'birthDate']; // Replace with your desired columns
//     const columnsTwoToSelect = ['coverLetterId', 'coverLetterName', 'coverLetterDescription'];
//     const columnsThreeToSelect = ['resumeId', 'fileName']; // Replace with your desired columns
//     const columnsThreeToSelect = ['resumeId', 'fileName']; // Replace with your desired columns

//     // Define an array of conditions (each condition is an object with condition and value

//     const conditions = [
//         { column: 'userId', operator: '=', value: userId }
//         // Add more conditions as needed
//     ];
//     const conditionsTwo = [
//         { column: 'userId', operator: '=', value: userId }
//         // Add more conditions as needed
//     ];
//     const conditionsThree = [
//         { column: 'userId', operator: '=', value: userId }
//         // Add more conditions as needed
//     ];


//     let results = await GlobalModel.QueryDynamic(tableName, columnsToSelect, conditions);
//     if (!results) {
//         CatchHistory({ event: `user with id: ${actor.userId} viewed  profile`, functionName: 'ViewMyProfile', response: `No Record Found For profile`, dateStarted: req.date, requestStatus: 200, actor: actor.userId }, req);
//         return sendResponse(res, 0, 200, 'No Record Found')
//     }
//     let coverletter = await GlobalModel.QueryDynamic(tableTwoName, columnsTwoToSelect, conditionsTwo);
//     let resume = await GlobalModel.QueryDynamic(tableThreeName, columnsThreeToSelect, conditionsThree);

//     let profileData = {
//         userProfile: results,
//         coverletter,
//         resume
//     }
//     CatchHistory({ event: `user with id: ${actor.userId} viewed ${results.length} cover_letters`, functionName: 'ViewMyProfile', response: `Record Found, profile contains ${results.length} record's`, dateStarted: req.date, requestStatus: 200, actor: actor.userId }, req);
//     return sendResponse(res, 1, 200, 'Record Found', profileData)

// });