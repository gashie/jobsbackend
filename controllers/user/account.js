const bcyrpt = require("bcrypt");
const asynHandler = require("../middleware/async");
const Model = require("../model/Account")
const uuidV4 = require('uuid');
const { sendResponse, CatchHistory } = require("../helpers/utilfunc");
const systemDate = new Date().toISOString().slice(0, 19).replace("T", " ");

exports.GetUsers = asynHandler(async (req, res, next) => {

    let results = await Model.Fetchall();
    if (results.rows.length == 0) {
        CatchHistory({api_response: "No Record Found", function_name: 'GetUsers', date_started: systemDate, sql_action: "SELECT", event: "Users View", actor: req.user.id }, req)

        return sendResponse(res, 0, 200, "Sorry, No Record Found", [])
    }
    CatchHistory({ api_response: `User with ${req.user.id} viewed ${results.rows.length} users`, function_name: 'GetUsers', date_started: systemDate, sql_action: "SELECT", event: "Users View", actor: req.user.id }, req)

    sendResponse(res, 1, 200, "Record Found",results.rows)
})

exports.CreateUser = asynHandler(async (req, res, next) => {
    let is_active = 1
    payload = req.body
    payload.is_active = is_active
    payload.id = id
    payload.is_verified = true

    const salt = await bcyrpt.genSalt(10);
    payload.password = await bcyrpt.hash(req.body.password, salt);
    let results = await Model.Create(payload);
    if (results.rowCount == 1) {
        CatchHistory({api_response: `New user signup with id :${id}`, function_name: 'CreateUser', date_started: systemDate, sql_action: "INSERT", event: "User Signup", actor: id }, req)

        return sendResponse(res, 1, 200, "Record saved", [])
    } else {
        CatchHistory({ payload: JSON.stringify({firstname:payload.first_name,lastname:payload.last_name}), api_response: `Sorry, error saving record for user  with id :${id}`, function_name: 'CreateUser', date_started: systemDate, sql_action: "INSERT", event: "User Signup", actor: id }, req)

        return sendResponse(res, 0, 200, "Sorry, error saving record", [])
    }

})