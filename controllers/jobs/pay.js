const uuidV4 = require('uuid');
const dotenv = require("dotenv");
dotenv.config({ path: "./config/config.env" });
const asynHandler = require("../../middleware/async");
const GlobalModel = require("../../models/Global");
const JobModel = require("../../models/Job");
const { sendResponse, CatchHistory } = require("../../helper/utilfunc");
const { prePareLocations, spreadLocations } = require('../../helper/func');
const { makeApiCall } = require('../../helper/autoCalls');


exports.GeneralPayment = asynHandler(async (req, res, next) => {
    const { courseId, rateId, transactionFor, paymentDescription, jobId } = req.body;
    let actor = req.user.userInfo
    let mainrate = req.mainrate

    /**
    * Check if user has no questions and want to pay now.
    * @param {string} hasQuestions - The API endpoint URL.
    * @param {string} payNow - If user want to pay now.
    */

    const apiHeaders = {
        // Add any other headers as needed
        Authorization: `Bearer ${process.env.public_Secret_Key}`
    };

    // Example JSON request data
    const jsonRequestData = {
        email: actor.email,
        amount: mainrate.ratePrice * 100,
    };

    // Call the function with either JSON or FormData
    const jsonResponseData = await makeApiCall(`${process.env.paystackUrl}transaction/initialize`, 'POST', apiHeaders, jsonRequestData);

    if (jsonResponseData && !jsonResponseData?.status) {
        return sendResponse(res, 0, 200, jsonResponseData?.message, [])
    }

    let paymentPayload = {
        courseId,
        rateId,
        paymentId: uuidV4.v4(),
        transactionFor,
        paymentDescription,
        jobId,
        isManual: false,
        paidById: actor.id,
        reference: jsonResponseData?.data?.reference,
        accessCode: jsonResponseData?.data?.access_code,
        payStackInitialise: JSON.stringify(jsonResponseData?.data),
        rateAmount: mainrate.ratePrice,
        amount: mainrate.ratePrice
    }

    let results = await GlobalModel.Create('payment_transaction', paymentPayload);
    if (results.affectedRows === 1) {
        CatchHistory({ event: 'General payment for transaction', functionName: 'GeneralPayment', response: `Job Info record with id ${jobId} was approved by ${actor.userId}`, dateStarted: req.date, state: 1, requestStatus: 200, actor: actor.userId }, req);
        return sendResponse(res, 1, 200, 'Record Updated',jsonResponseData?.data)

    } else {
        CatchHistory({ event: 'General payment for transaction', functionName: 'GeneralPayment', response: `Error Updating Record with id ${jobId}`, dateStarted: req.date, state: 0, requestStatus: 200, actor: actor.userId }, req);
        return sendResponse(res, 0, 200, 'Error Updating Record')
    }

})
exports.VerifyPayment = asynHandler(async (req, res, next) => {
    const { reference } = req.body;
    let actor = req.user.userInfo

    /**
    * Check if user has no questions and want to pay now.
    * @param {string} reference - reference to fetch transaction details from paystack.
    */

    const apiHeaders = {
        // Add any other headers as needed
        Authorization: `Bearer ${process.env.public_Secret_Key}`
    };



    // Call the function with either JSON or FormData
    const jsonResponseData = await makeApiCall(`${process.env.paystackUrl}transaction/verify/${reference}`, 'GET', apiHeaders, '');

    if (jsonResponseData && !jsonResponseData?.status) {
        return sendResponse(res, 0, 200, jsonResponseData?.message, [])
    }
   res.send(jsonResponseData)
    

    // let paymentPayload = {
    //     courseId,
    //     rateId,
    //     paymentId: uuidV4.v4(),
    //     transactionFor,
    //     paymentDescription,
    //     jobId,
    //     isManual: false,
    //     paidById: actor.id,
    //     reference: jsonResponseData?.data?.reference,
    //     accessCode: jsonResponseData?.data?.access_code,
    //     payStackInitialise: JSON.stringify(jsonResponseData?.data),
    //     rateAmount: mainrate.ratePrice,
    //     amount: mainrate.ratePrice
    // }

    // let results = await GlobalModel.Create('payment_transaction', paymentPayload);
    // if (results.affectedRows === 1) {
    //     CatchHistory({ event: 'General payment for transaction', functionName: 'GeneralPayment', response: `Job Info record with id ${jobId} was approved by ${actor.userId}`, dateStarted: req.date, state: 1, requestStatus: 200, actor: actor.userId }, req);
    //     return sendResponse(res, 1, 200, 'Record Updated',jsonResponseData?.data)

    // } else {
    //     CatchHistory({ event: 'General payment for transaction', functionName: 'GeneralPayment', response: `Error Updating Record with id ${jobId}`, dateStarted: req.date, state: 0, requestStatus: 200, actor: actor.userId }, req);
    //     return sendResponse(res, 0, 200, 'Error Updating Record')
    // }

})