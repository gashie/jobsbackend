const path = require("path");
const fs = require('fs').promises;
const uuidV4 = require('uuid');
const asynHandler = require("../../middleware/async");
const GlobalModel = require("../../models/Global");
const { sendResponse, CatchHistory, removeFile } = require("../../helper/utilfunc");

exports.ViewUserFeeds = asynHandler(async (req, res, next) => {
  let { viewAction } = req.body
  let actor = req.user.userInfo

  let results = await GlobalModel.ViewWithAction('generated_feeds', viewAction);
  if (results.length == 0) {
    CatchHistory({ event: `user with id: ${actor.userId} viewed ${results.length} generated_feeds`, functionName: 'ViewUserFeeds', response: `No Record Found For Feedss`, dateStarted: req.date, requestStatus: 200, actor: actor.userId }, req);
    return sendResponse(res, 0, 200, 'No Record Found')
  }
  CatchHistory({ event: `user with id: ${actor.userId} viewed ${results.length} generated_feeds`, functionName: 'ViewUserFeeds', response: `Record Found, Feeds contains ${results.length} record's`, dateStarted: req.date, requestStatus: 200, actor: actor.userId }, req);

  return sendResponse(res, 1, 200, 'Record Found', results)

});

exports.ViewMyUserFeeds = asynHandler(async (req, res, next) => {
  let { viewAction } = req.body
  let actor = req.user.userInfo
  let results = await GlobalModel.ViewWithActionById('generated_feeds', viewAction, 'createdById', actor.userId);
  if (results.length == 0) {
      CatchHistory({ event: `user with id: ${actor.userId} viewed ${results.length} generated_feeds`, functionName: 'ViewMyCourses', response: `No Record Found For user feeds`, dateStarted: req.date, requestStatus: 200, actor: actor.userId }, req);
      return sendResponse(res, 0, 200, 'No Record Found')
  }
  CatchHistory({ event: `user with id: ${actor.userId} viewed ${results.length} generated_feeds`, functionName: 'ViewMyCourses', response: `Record Found, user feeds contains ${results.length} record's`, dateStarted: req.date, requestStatus: 200, actor: actor.userId }, req);

  return sendResponse(res, 1, 200, 'Record Found', results)

});


exports.CreateUserFeeds = asynHandler(async (req, res, next) => {
  let payload = req.body;
  let actor = req.user.userInfo
  let feedId = uuidV4.v4()
  const postImage = req.files.postImage;
  if (postImage && !postImage.mimetype.startsWith("image")) {
    return sendResponse(res, 0, 200, "Please make sure to upload an image", [])

  }

  //change filename
  postImage.name = `feed_id_${feedId}_md_${postImage.md5}_${path.parse(postImage.name).ext}`;
  postImage.mv(`./uploads/image/feeds/${postImage.name}`, async (err) => {
    if (err) {
      console.log(err);
      return sendResponse(res, 0, 200, "Problem with file upload", [])
    }
  });
  payload.feedId = feedId
  payload.createdById = actor.userId
  payload.postImage = postImage.name

  let results = await GlobalModel.Create('generated_feeds', payload);
  if (results.affectedRows === 1) {
    CatchHistory({ event: `user with id: ${actor.userId} added new feed `, functionName: 'CreateUserFeeds', dateStarted: req.date, sql_action: "INSERT", actor: actor.userId }, req)

    return sendResponse(res, 1, 200, "Record saved", [])
  } else {
    CatchHistory({ event: `Sorry, error saving record for feed  with name :${payload.jobCategoryName}`, functionName: 'CreateUserFeeds', dateStarted: req.date, sql_action: "INSERT", actor: actor.userId }, req)

    return sendResponse(res, 0, 200, "Sorry, error saving record", [])
  }

})

exports.UpdateUserFeed = asynHandler(async (req, res, next) => {
  const { patch, patchData, deleterecord, restore, feedId } = req.body;
  let actor = req.user.userInfo
  const postImage = req.files?.postImage;

  console.log('====================================');
  console.log(req.body);
  console.log('====================================');
  let oldfeed = req.genfeeds
  if (patch === 'true' && postImage && !postImage.mimetype.startsWith("image")) {
    return sendResponse(res, 0, 200, "Please make sure to upload an image", [])

  }
  if (patch === 'true' && postImage && postImage?.mimetype.startsWith("image")) {

    //change filename
    removeFile('./uploads/feeds/', oldfeed.postImage)
    postImage.name = `feed_id_${feedId}_md_${postImage.md5}_${path.parse(postImage.name).ext}`;
    postImage.mv(`./uploads/image/feeds/${postImage.name}`, async (err) => {
      if (err) {
        console.log(err);
        return sendResponse(res, 0, 200, "Problem with file upload", [])
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
    postImage: postImage?.name,
    ...JSON.parse(patchData),

  };
  if (patch === 'true') {
    const patchData = {}; // Replace this with your actual patchData object
    Object.assign(patchUserPayload, patchData);
}

  
  let switchActionPayload = patch ? patchUserPayload : deletePayload

  let result = await GlobalModel.Update('generated_feeds', switchActionPayload, 'feedId', feedId);

  if (result.affectedRows === 1) {
    CatchHistory({ event: 'Update user feed', functionName: 'UpdateUserFeed', response: `User feed record with id ${feedId} was updated by ${actor.userId}`, dateStarted: req.date, state: 1, requestStatus: 200, actor: actor.userId }, req);
    return sendResponse(res, 1, 200, 'Record Updated')

  } else {
    CatchHistory({ event: 'Update user feed', functionName: 'UpdateUserFeed', response: `Error Updating Record with id ${feedId}`, dateStarted: req.date, state: 0, requestStatus: 200, actor: actor.userId }, req);
    return sendResponse(res, 0, 200, 'Error Updating Record')
  }

})

exports.ApproveUserFeed = asynHandler(async (req, res, next) => {
  const { status, feedId } = req.body;
  let actor = req.user.userInfo
    //find feed with id,and status !approved

  let patchUserPayload = {
    approvedAt: req.date,
    approvedById: actor.userId,
    status: status == true ? "approved":"declined",

  };


  let result = await GlobalModel.Update('generated_feeds', patchUserPayload, 'feedId', feedId);

  if (result.affectedRows === 1) {
    CatchHistory({ event: 'Approve/Deny feed', functionName: 'ApproveUserFeed', response: `User Generated feed record with id ${feedId} was ${status == true ? "approved":"declined"} by ${actor.userId}`, dateStarted: req.date, state: 1, requestStatus: 200, actor: actor.userId }, req);
    return sendResponse(res, 1, 200, 'Record Updated')

  } else {
    CatchHistory({ event: 'Approve/Deny feed', functionName: 'ApproveUserFeed', response: `Error Updating Record with id ${feedId}`, dateStarted: req.date, state: 0, requestStatus: 200, actor: actor.userId }, req);
    return sendResponse(res, 0, 200, 'Error Updating Record')
  }

})