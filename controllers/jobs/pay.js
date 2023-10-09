const uuidV4 = require('uuid');
const dotenv = require("dotenv");
dotenv.config({ path: "./config/config.env" });
const asynHandler = require("../../middleware/async");
const GlobalModel = require("../../models/Global");
const { sendResponse, CatchHistory } = require("../../helper/utilfunc");
const { makeApiCall } = require('../../helper/autoCalls');
const { TransactionHistory, EmployerTransactionHistory } = require('../../models/Payment');


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
        return sendResponse(res, 1, 200, 'Record Updated', jsonResponseData?.data)

    } else {
        CatchHistory({ event: 'General payment for transaction', functionName: 'GeneralPayment', response: `Error Updating Record with id ${jobId}`, dateStarted: req.date, state: 0, requestStatus: 200, actor: actor.userId }, req);
        return sendResponse(res, 0, 200, 'Error Updating Record')
    }

})
exports.InvoicePayment = asynHandler(async (req, res, next) => {
    const { invoiceId } = req.body;
    let actor = req.user.userInfo
    let invoice = req.invoice

    /**
    * Check if user has no questions and want to pay now.
    * @param {string} invoiceId - The API endpoint URL.
    */

    const apiHeaders = {
        // Add any other headers as needed
        Authorization: `Bearer ${process.env.public_Secret_Key}`
    };

    // Example JSON request data
    const jsonRequestData = {
        email: actor.email,
        amount: invoice?.grandTotal * 100,
    };

    // Call the function with either JSON or FormData
    const jsonResponseData = await makeApiCall(`${process.env.paystackUrl}transaction/initialize`, 'POST', apiHeaders, jsonRequestData);

    if (jsonResponseData && !jsonResponseData?.status) {
        return sendResponse(res, 0, 200, jsonResponseData?.message, [])
    }

    let paymentPayload = {
        invoiceId,
        courseId: invoice?.courseId,
        invoiceCounter: invoice?.counter,
        paymentId: uuidV4.v4(),
        transactionFor: invoice?.invoiceFor,
        paymentDescription: invoice?.otherInformation,
        jobId: invoice?.jobId,
        isInvoice: true,
        paidById: actor.userId,
        reference: jsonResponseData?.data?.reference,
        accessCode: jsonResponseData?.data?.access_code,
        payStackInitialise: JSON.stringify(jsonResponseData?.data),
        amount: invoice?.grandTotal
    }

    let results = await GlobalModel.Create('payment_transaction', paymentPayload);
    if (results.affectedRows === 1) {
        CatchHistory({ event: 'General payment for transaction', functionName: 'GeneralPayment', response: `Invoice with id ${invoiceId} was paid by ${actor.userId}`, dateStarted: req.date, state: 1, requestStatus: 200, actor: actor.userId }, req);
        return sendResponse(res, 1, 200, 'Record Updated', jsonResponseData?.data)

    } else {
        CatchHistory({ event: 'General payment for transaction', functionName: 'GeneralPayment', response: `Error making payment for invoice with id ${invoiceId}`, dateStarted: req.date, state: 0, requestStatus: 200, actor: actor.userId }, req);
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

    //find payment instructions
    let findreference = await GlobalModel.Find('payment_transaction', 'reference', reference);
    if (findreference && findreference.updatedAt !== null) {
        res.send(jsonResponseData)
    }

    // res.send(jsonResponseData)


    let paymentPayload = {
        paystackStatus:jsonResponseData?.data?.status,
        updatedAt:req.date,
        updatedBy:actor.userId,
        paymentStatus:jsonResponseData?.data?.status === 'success' ? 'paid':'unpaid',
        paystackResponse:JSON.stringify(jsonResponseData?.data),
        currency:jsonResponseData?.data?.currency,
        channel:jsonResponseData?.data?.channel,
        ipAddress:jsonResponseData?.data?.ip_address,
        domain:jsonResponseData?.data?.domain,
        gatewayResponse:jsonResponseData?.data?.gateway_response,
        receivedAt:jsonResponseData?.data?.paid_at,
    }


    if (findreference?.transactionFor === 'job') { //update payment and update invoice, and update job
      await GlobalModel.Update('payment_transaction', paymentPayload, 'reference', reference);
      await GlobalModel.Update('job_info', {paidStatus:paymentPayload.paymentStatus}, 'jobId', findreference?.jobId);
      res.send(jsonResponseData)
    }
    if (findreference?.transactionFor === 'course') { //update payment and update invoice, and update job
        await GlobalModel.Update('payment_transaction', paymentPayload, 'reference', reference);
        await GlobalModel.Update('course', {paidStatus:paymentPayload.paymentStatus}, 'courseId', findreference?.courseId);
        res.send(jsonResponseData)
    }

    res.send(jsonResponseData)



})


exports.PaystackViewTransactionTotal = asynHandler(async (req, res, next) => {
    let { from, to } = req.body
    let withDate = `${process.env.paystackUrl}transaction/totals?from=${from}&to=${to}`
    let withNoDate = `${process.env.paystackUrl}transaction/totals`
    let actor = req.user.userInfo

    /**
    * Check if user has no questions and want to pay now.
    * @param {string} from - The API endpoint URL.
    * @param {string} to - If user want to pay now.
    */

    const apiHeaders = {
        // Add any other headers as needed
        Authorization: `Bearer ${process.env.public_Secret_Key}`
    };

    // Example JSON request data
    const jsonRequestData = {

    };

    // Call the function with either JSON or FormData
    const jsonResponseData = await makeApiCall(from && from !== "" && to && to !== "" ? withDate : withNoDate, 'GET', apiHeaders, jsonRequestData);

    if (jsonResponseData && !jsonResponseData?.status) {
        return sendResponse(res, 0, 200, jsonResponseData?.message, [])
    }

    CatchHistory({ event: 'View PayStack transaction total', functionName: 'PaystackViewTransactionTotal', response: `USER with id ${actor.userId} viewed paystack transaction total`, dateStarted: req.date, state: 1, requestStatus: 200, actor: actor.userId }, req);
    return sendResponse(res, 1, 200, 'Record Updated', jsonResponseData?.data)

})
exports.ViewTransactionTotal = asynHandler(async (req, res, next) => {
    let { transactionFor } = req.body
    let actor = req.user.userInfo

    let results = await TransactionHistory(transactionFor);
    if (results.length == 0) {
        CatchHistory({ event: `user with id: ${actor.userId} viewed ${results.length} transaction history for ${transactionFor}`, functionName: 'ViewTransactionTotal', response: `No Record Found transaction history`, dateStarted: req.date, requestStatus: 200, actor: actor.userId }, req);
        return sendResponse(res, 0, 200, 'No Record Found')
    }
    CatchHistory({ event: `user with id: ${actor.userId} viewed ${results.length} transaction history for ${transactionFor}`, functionName: 'ViewTransactionTotal', response: `Record Found, Transaction history contains ${results.length} record's`, dateStarted: req.date, requestStatus: 200, actor: actor.userId }, req);

    return sendResponse(res, 1, 200, 'Record Found', results)
})

exports.ViewEmployerTransactionTotal = asynHandler(async (req, res, next) => {
    let { transactionFor } = req.body
    let actor = req.user.userInfo

    let results = await EmployerTransactionHistory(transactionFor, actor?.company?.companyId);
    if (results.length == 0) {
        CatchHistory({ event: `user with id: ${actor.userId} viewed ${results.length} transaction history for ${transactionFor}`, functionName: 'ViewEmployerTransactionTotal', response: `No Record Found transaction history`, dateStarted: req.date, requestStatus: 200, actor: actor.userId }, req);
        return sendResponse(res, 0, 200, 'No Record Found')
    }
    CatchHistory({ event: `user with id: ${actor.userId} viewed ${results.length} transaction history for ${transactionFor}`, functionName: 'ViewEmployerTransactionTotal', response: `Record Found, Transaction history contains ${results.length} record's`, dateStarted: req.date, requestStatus: 200, actor: actor.userId }, req);

    return sendResponse(res, 1, 200, 'Record Found', results)
})