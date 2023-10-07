const uuidV4 = require('uuid');
const dotenv = require("dotenv");
dotenv.config({ path: "./config/config.env" });
const asynHandler = require("../../middleware/async");
const GlobalModel = require("../../models/Global");
const { sendResponse, CatchHistory } = require("../../helper/utilfunc");
const { makeApiCall } = require('../../helper/autoCalls');
const { TransactionHistory, EmployerTransactionHistory } = require('../../models/Payment');


exports.Webhook = asynHandler(async (req, res, next) => {
    const event = req.body;
    // 
    let reference = event?.data?.reference
    //find reference

    //if found, update records

    console.log('====================================');
    console.log(event);
    console.log('====================================');

  res.send('ok')

})


