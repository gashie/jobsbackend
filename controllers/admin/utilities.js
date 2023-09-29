const path = require("path");
const fs = require('fs').promises;
const uuidV4 = require('uuid');
const asynHandler = require("../../middleware/async");
const GlobalModel = require("../../models/Global");
const { sendResponse, CatchHistory, removeFile } = require("../../helper/utilfunc");
const { JobApplicationUtilities, JobSeekerUtilities, NewJobsUtilities, ActiveJobsUtilities, PaymentCountUtilities, PaymentSumUtilities } = require("../../models/Utilities");

exports.Utilities = asynHandler(async (req, res, next) => {
    let { start, end } = req.body
    let actor = req.user.userInfo
    var prePareEnd = new Date(end);
    var datatodays = prePareEnd.setDate(new Date(prePareEnd).getDate() + 1);
    let newEndDate = new Date(datatodays);
    let company = await GlobalModel.Utilities('company', start, newEndDate);
    let appliications = await JobApplicationUtilities(start, newEndDate);
    let admins = await JobSeekerUtilities(start, newEndDate, 1);
    let jobseekers = await JobSeekerUtilities(start, newEndDate, 2);
    let employers = await JobSeekerUtilities(start, newEndDate, 3);
    let newjobs = await NewJobsUtilities(start, newEndDate);
    let activejobs = await ActiveJobsUtilities(start, newEndDate);
    let paymentcount = await PaymentCountUtilities(start, newEndDate);
    let paymentsum = await PaymentSumUtilities(start, newEndDate);


    let utitility = {
        company,
        appliications,
        jobseekers,
        employers,
        admins,
        newjobs,
        activejobs,
        paymentcount,
        paymentsum
    }
      return sendResponse(res, 1, 200, 'Record Found', utitility)

});


