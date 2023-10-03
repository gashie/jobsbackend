const uuidV4 = require('uuid');
const dotenv = require("dotenv");
dotenv.config({ path: "./config/config.env" });
const asynHandler = require("../../middleware/async");
const GlobalModel = require("../../models/Global");
const Invoice = require("../../models/Invoice");
const { sendResponse, CatchHistory } = require("../../helper/utilfunc");
const { prePareLocations, invoiceCalc } = require('../../helper/func');
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