const uuidV4 = require('uuid');
const dotenv = require("dotenv");
dotenv.config({ path: "./config/config.env" });
const asynHandler = require("../../middleware/async");
const GlobalModel = require("../../models/Global");
const Invoice = require("../../models/Invoice");
const { sendResponse, CatchHistory } = require("../../helper/utilfunc");
const { prePareLocations, invoiceCalc } = require('../../helper/func');
const { generateInvoiceNumber } = require('../../helper/autoFinder');
exports.CreateInvoice = asynHandler(async (req, res, next) => {
    let payload = req.body;
    let actor = req.user.userInfo
    payload.invoiceId = uuidV4.v4()
    let { totalSum, grandTotal, itemsData } = invoiceCalc(payload?.itemsData, payload?.discount, payload?.tax)
    let preparedItems = prePareLocations(itemsData, payload.invoiceId)

    payload.total = totalSum;
    payload.grandTotal = grandTotal
    payload.createdById = actor?.userId
    payload.itemsData = JSON.stringify(itemsData)
    payload.counter = await generateInvoiceNumber();


    let results = await GlobalModel.Create('invoice_data', payload);
    let itemresults = await Invoice.create(preparedItems);

    if (results.affectedRows === 1 && itemresults.affectedRows > 0) {
        CatchHistory({ event: `user with id: ${actor.userId} added new job  `, functionName: 'CreateJobInfo', dateStarted: req.date, sql_action: "INSERT", actor: actor.userId }, req)

        return sendResponse(res, 1, 200, "Record saved", { invoiceId: payload.invoiceId })
    } else {
        CatchHistory({ event: `Sorry, error saving record for job   with name :${payload.jobCategoryName}`, functionName: 'CreateJobInfo', dateStarted: req.date, sql_action: "INSERT", actor: actor.userId }, req)

        return sendResponse(res, 0, 200, "Sorry, error saving record", [])
    }

})

exports.DeletInvoce = asynHandler(async (req, res, next) => {
    let actor = req.user.userInfo
    let { invoiceId } = req.body



    // Define your dynamic query parameters
    const tableName = 'invoice_data';
    const columnsToSelect = ['invoiceId']; // Replace with your desired columns

    // Define an array of conditions (each condition is an object with condition and value

    const conditions = [
        { column: 'invoiceId', operator: '=', value: invoiceId },
        // Add more conditions as needed
    ];


    let results = await GlobalModel.QueryDynamic(tableName, columnsToSelect, conditions);
    let removeinvoice = await Invoice.deleteInvoiceData(invoiceId); ///delete old questions

    let removeoinvoice = await Invoice.deleteInvoiceItem(invoiceId); ///delete optio


    return sendResponse(res, 1, 200, 'Sorry no record found', [])
});

exports.ViewSingleInvoice = asynHandler(async (req, res, next) => {
    let actor = req.user.userInfo
    let { invoiceId } = req.body



    // Define your dynamic query parameters
    const tableName = 'invoice_data';
    const columnsToSelect = []; // Replace with your desired columns

    // Define an array of conditions (each condition is an object with condition and value

    const conditions = [
        { column: 'invoiceId', operator: '=', value: invoiceId }
        // Add more conditions as needed
    ];


    let results = await GlobalModel.QueryDynamic(tableName, columnsToSelect, conditions);
    if (!results) {
        return sendResponse(res, 1, 200, 'Sorry no record found', [])
    }

    let itemsData = []
    const conditionsTwo = [
        { column: 'invoiceId', operator: '=', value: invoiceId },
        // Add more conditions as needed
    ];
    let optionsArray = await GlobalModel.QueryDynamicArray('invoice_items', [], conditionsTwo)
    itemsData.push(optionsArray)

    let questionsData = {
        ...results,
        itemsData
    }

    CatchHistory({ event: `user with id: ${actor.userId} viewed  invoice with id ${invoiceId}`, functionName: 'ViewSingleInvoice', response: `Record Found for invoice`, dateStarted: req.date, requestStatus: 200, actor: actor.userId }, req);
    return sendResponse(res, 1, 200, 'Record Found', questionsData)
});

exports.UpdateInvoice = asynHandler(async (req, res, next) => {
    const { patchData, invoiceId } = req.body;
    let actor = req.user.userInfo

    let { totalSum, grandTotal, itemsData } = invoiceCalc(patchData?.itemsData, patchData?.discount, patchData?.tax)
    let preparedItems = prePareLocations(itemsData, invoiceId)
    patchData.total = totalSum
    patchData.grandTotal = grandTotal
    patchData.itemsData = JSON.stringify(itemsData)

    let patchUserPayload = {
        updatedAt: req.date,
        updatedById: actor.userId,
        ...patchData
    };
    let result = await GlobalModel.Update('invoice_data', patchUserPayload, 'invoiceId', invoiceId);
    await Invoice.deleteInvoiceItem(invoiceId);
    await Invoice.create(preparedItems);
    if (result.affectedRows === 1) {
        CatchHistory({ event: 'Update Invoice', functionName: 'UpdateInvoice', response: `Invoice record with id ${invoiceId} was updated by ${actor.userId}`, dateStarted: req.date, state: 1, requestStatus: 200, actor: actor.userId }, req);
        return sendResponse(res, 1, 200, 'Record Updated')

    } else {
        CatchHistory({ event: 'Update Invoice', functionName: 'UpdateInvoice', response: `Error Updating Record with id ${invoiceId}`, dateStarted: req.date, state: 0, requestStatus: 200, actor: actor.userId }, req);
        return sendResponse(res, 0, 200, 'Error Updating Record')
    }

})
exports.ViewMyUnpaidInvoice = asynHandler(async (req, res, next) => {
    let actor = req.user.userInfo



    // Define your dynamic query parameters
    const tableName = 'invoice_data';
    const columnsToSelect = []; // Replace with your desired columns

    // Define an array of conditions (each condition is an object with condition and value
    const conditions = [
        { column: 'companyId', operator: '=', value:actor?.company?.companyId },
        { column: 'invoiceStatus', operator: '=', value: 'un-paid' }
        // Add more conditions as needed
    ];


    let results = await GlobalModel.QueryDynamicArray(tableName, columnsToSelect, conditions);
    if (results.length == 0) {
        return sendResponse(res, 1, 200, 'Sorry no record found', [])
    }


    CatchHistory({ event: `user with id: ${actor.userId} viewed  invoice unpaid invoice`, functionName: 'ViewMyUnpaidInvoice', response: ` ${results.length} record Found`, dateStarted: req.date, requestStatus: 200, actor: actor.userId }, req);
    return sendResponse(res, 1, 200, 'Record Found', results)
});

exports.AdminViewInvoices = asynHandler(async (req, res, next) => {
    let { viewAction } = req.body
    let actor = req.user.userInfo
  
    let results = await Invoice.AdminViewInvoices('invoice_data');
    if (results.length == 0) {
      CatchHistory({ event: `user with id: ${actor.userId} viewed ${results.length} invoice_data`, functionName: 'AdminViewInvoices', response: `No Record Found For Invoice`, dateStarted: req.date, requestStatus: 200, actor: actor.userId }, req);
      return sendResponse(res, 0, 200, 'No Record Found')
    }
    CatchHistory({ event: `user with id: ${actor.userId} viewed ${results.length} invoice_data`, functionName: 'AdminViewInvoices', response: `Record Found, Invoice contains ${results.length} record's`, dateStarted: req.date, requestStatus: 200, actor: actor.userId }, req);
  
    return sendResponse(res, 1, 200, 'Record Found', results)
  
  });