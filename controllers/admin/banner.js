const path = require("path");
const fs = require('fs').promises;
const uuidV4 = require('uuid');
const asynHandler = require("../../middleware/async");
const GlobalModel = require("../../models/Global");
const { sendResponse, CatchHistory, removeFile } = require("../../helper/utilfunc");

exports.ViewBanners = asynHandler(async (req, res, next) => {
  let { viewAction } = req.body
  let actor = req.user.userInfo

  let results = await GlobalModel.ViewWithAction('banner', viewAction);
  if (results.length == 0) {
    CatchHistory({ event: `user with id: ${actor.userId} viewed ${results.length} job_category`, functionName: 'ViewBanners', response: `No Record Found For Banners`, dateStarted: req.date, requestStatus: 200, actor: actor.userId }, req);
    return sendResponse(res, 0, 200, 'No Record Found')
  }
  CatchHistory({ event: `user with id: ${actor.userId} viewed ${results.length} job_category`, functionName: 'ViewBanners', response: `Record Found, Banners contains ${results.length} record's`, dateStarted: req.date, requestStatus: 200, actor: actor.userId }, req);

  return sendResponse(res, 1, 200, 'Record Found', results)

});



exports.CreateBanner = asynHandler(async (req, res, next) => {
  let payload = req.body;
  let actor = req.user.userInfo
  let bannerId = uuidV4.v4()
  const bannerImg = req.files.bannerImg;
  if (!bannerImg.mimetype.startsWith("image")) {
    return sendResponse(res, 0, 200, "Please make sure to upload an image", [])

  }

  //change filename
  console.log(bannerImg);
  bannerImg.name = `banner_id_${bannerId}_md_${bannerImg.md5}_${path.parse(bannerImg.name).ext}`;
  bannerImg.mv(`./uploads/banner/${bannerImg.name}`, async (err) => {
    if (err) {
      console.log(err);
      return sendResponse(res, 0, 200, "Problem with file upload", [])
    }
  });
  payload.bannerId = bannerId
  payload.createdById = actor.userId
  payload.bannerImg = bannerImg.name

  let results = await GlobalModel.Create('banner', payload);
  if (results.affectedRows === 1) {
    CatchHistory({ event: `user with id: ${actor.userId} added new banner `, functionName: 'CreateBanner', dateStarted: req.date, sql_action: "INSERT", actor: actor.userId }, req)

    return sendResponse(res, 1, 200, "Record saved", [])
  } else {
    CatchHistory({ event: `Sorry, error saving record for banner  with name :${payload.jobCategoryName}`, functionName: 'CreateBanner', dateStarted: req.date, sql_action: "INSERT", actor: actor.userId }, req)

    return sendResponse(res, 0, 200, "Sorry, error saving record", [])
  }

})

exports.UpdateBanner = asynHandler(async (req, res, next) => {
  const { patch, bannerTitle,bannerStart,bannerEnd, deleterecord, restore, bannerId } = req.body;
  let actor = req.user.userInfo
  const bannerImg = req.files.bannerImg;
  let olbanner = req.banner
  if (patch && bannerImg && !bannerImg.mimetype.startsWith("image")) {
    return sendResponse(res, 0, 200, "Please make sure to upload an image", [])

  }
  if (patch && bannerImg && bannerImg.mimetype.startsWith("image")) {

    //change filename
    console.log(bannerImg);
   let remove =  removeFile('./uploads/banner/',olbanner.bannerImg)
    bannerImg.name = `banner_id_${bannerId}_md_${bannerImg.md5}_${path.parse(bannerImg.name).ext}`;
    bannerImg.mv(`./uploads/banner/${bannerImg.name}`, async (err) => {
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
    bannerTitle: bannerTitle,
    bannerImg: bannerImg.name,
    bannerStart: bannerStart,
    bannerEnd: bannerEnd
  };

  let switchActionPayload = patch ? patchUserPayload : deletePayload

  let result = await GlobalModel.Update('banner', switchActionPayload, 'bannerId', bannerId);

  if (result.affectedRows === 1) {
    CatchHistory({ event: 'Update Banner', functionName: 'UpdateBanner', response: `Site Banner record with id ${bannerId} was updated by ${actor.userId}`, dateStarted: req.date, state: 1, requestStatus: 200, actor: actor.userId }, req);
    return sendResponse(res, 1, 200, 'Record Updated')

  } else {
    CatchHistory({ event: 'Update Banner', functionName: 'UpdateBanner', response: `Error Updating Record with id ${bannerId}`, dateStarted: req.date, state: 0, requestStatus: 200, actor: actor.userId }, req);
    return sendResponse(res, 0, 200, 'Error Updating Record')
  }

})