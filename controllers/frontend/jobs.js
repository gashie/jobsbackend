const uuidV4 = require('uuid');
const dotenv = require("dotenv");
dotenv.config({ path: "./config/config.env" });
const asynHandler = require("../../middleware/async");
const GlobalModel = require("../../models/Global");
const JobModel = require("../../models/Job");
const { sendResponse, CatchHistory } = require("../../helper/utilfunc");

exports.FrontendListJobs = asynHandler(async (req, res, next) => {

    let results = await JobModel.PublicOpenJob();
    if (results.length == 0) {
        return sendResponse(res, 0, 200, 'No Record Found', [])
    }
    return sendResponse(res, 1, 200, 'Record Found', results)

})

exports.FrontendFindJob = asynHandler(async (req, res, next) => {
    let { jobId } = req.body
    let results = await JobModel.PublicFindJob(jobId);
    if (!results) {
        return sendResponse(res, 0, 200, 'No Record Found')
    }
    
    let similarjobs = await JobModel.PublicFindJobByCategory(results?.jobCategoryId);
    
    return sendResponse(res, 1, 200, 'Record Found', {...results,similarjobs})

})