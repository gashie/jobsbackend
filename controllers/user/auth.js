const bcyrpt = require("bcrypt");
const crypto = require("crypto");
const asynHandler = require("../../middleware/async");
const GlobalModel = require("../../models/Global")
const { sendResponse, sendCookie, clearResponse, CatchHistory } = require("../../helper/utilfunc");
const { FilterMenu } = require("../../helper/filtermenus");
const systemDate = new Date().toISOString().slice(0, 19).replace("T", " ");

// @desc Login controller
// @route POST /auth
// @access Public
exports.Auth = asynHandler(async (req, res) => {
    const { email, password } = req.body

    //search for user in db
    const foundUser = await GlobalModel.Find('users', 'email', email);
    if (!foundUser) {
        CatchHistory({ payload: JSON.stringify({ email }), api_response: "Unauthorized access-email not in database", function_name: 'Auth', date_started: systemDate, sql_action: "SELECT", event: "User Authentication", actor: email }, req)
        return sendResponse(res, 0, 401, 'Unauthorized access')

    }

    if (foundUser && foundUser?.status == 0) {
        CatchHistory({ payload: JSON.stringify({ email }), api_response: "Unauthorized access-user not activated", function_name: 'Auth', date_started: systemDate, sql_action: "SELECT", event: "User Authentication", actor: email }, req)
        return sendResponse(res, 0, 401, 'Unauthorized access,kindly proceed to activate your account')

    }

    //check for password
    const match = await bcyrpt.compare(password, foundUser.password)

    if (!match) {
        CatchHistory({ payload: JSON.stringify({ email }), api_response: "Unauthorized access-user exist but password does not match", function_name: 'Auth', date_started: systemDate, sql_action: "SELECT", event: "User Authentication", actor: email }, req)
        return sendResponse(res, 0, 401, 'Unauthorized access')
    }
    let UserInfo = {
        id: foundUser.id,
        userId: foundUser.userId,
        fullName: foundUser.fullName,
        email: foundUser.email,
        username: foundUser.username,
        phone: foundUser.phone,
        roleid: foundUser.roleid,
        systemUser: foundUser.systemUser

    }

    if (UserInfo.roleid === 3) {
        const tableName = 'company';
        const columnsToSelect = []; // Replace with your desired columns

        // Define an array of conditions (each condition is an object with condition and value)

        const conditions = [
            { column: 'userId', operator: '=', value: UserInfo.userId },
            // Add more conditions as needed
        ];
        UserInfo.company = await GlobalModel.QueryDynamic(tableName, columnsToSelect, conditions);
    }
    let getUserinfo = await FilterMenu(UserInfo)
    CatchHistory({ payload: JSON.stringify({ email }), api_response: "User logged in", function_name: 'Auth', date_started: systemDate, sql_action: "SELECT", event: "User Authentication", actor: email }, req)
    return sendCookie(getUserinfo, 1, 200, res, req)
})
exports.ResetInAppPassword = asynHandler(async (req, res) => {
    let userData = req.user.userInfo;
    const { password, newPassword } = req.body

    console.log('====================================');
    console.log(userData);
    console.log('====================================');

    //search for user in db
    const foundUser = await GlobalModel.Find('users', 'email', userData.email);
    if (!foundUser) {
        CatchHistory({api_response: "Unauthorized access-email not in database", function_name: 'Auth', date_started: systemDate, sql_action: "SELECT", event: "User Authentication", actor: userData.email }, req)
        return sendResponse(res, 0, 401, 'Unauthorized access')

    }


    //check for password
    const match = await bcyrpt.compare(password, foundUser.password)

    if (!match) {
        CatchHistory({api_response: "Unauthorized access-user exist but password does not match", function_name: 'Auth', date_started: systemDate, sql_action: "SELECT", event: "User Authentication", actor: userData.email }, req)
        return sendResponse(res, 0, 401, 'Unauthorized access')
    }
    const salt = await bcyrpt.genSalt(10);

    let newPayload = {
        password: await bcyrpt.hash(newPassword, salt),
        updatedAt: req.date,
        resetPeriod: null,
        resetToken: null
    }

    let result = await GlobalModel.Update('users', newPayload, 'userId', userData.userId);

    if (result.affectedRows === 1) {
        CatchHistory({ api_response: `Password has been changed successfully for ${userData.email}`, function_name: 'ResetInAppPassword', date_started: req.date, sql_action: "UPDATE", event: "User Account Password Reset", actor: userData.email }, req)
        return sendResponse(res, 1, 200, 'Password has been changed successfully')

    } else {
        CatchHistory({ api_response: `Failed to update record or save new password for  :${userData.email}`, function_name: 'ResetInAppPassword', date_started: req.date, sql_action: "UPDATE", event: "User Account Password Reset", actor: userData.email }, req)
        return sendResponse(res, 0, 200, 'Failed to save new password, please try again later')
    }
})


exports.VerifyUser = asynHandler(async (req, res, next) => {
    let userData = req.user;
    CatchHistory({ api_response: "User is verified", function_name: 'VerifyUser', date_started: systemDate, sql_action: "SELECT", event: "Get User Info", actor: userData.id }, req)

    return sendResponse(res, 1, 200, "Loggedin", userData)
});


exports.Logout = asynHandler(async (req, res, next) => {
    CatchHistory({ api_response: "User is logged out", function_name: 'Logout', date_started: systemDate, sql_action: "SELECT", event: "Logout", actor: req.user.id }, req)
    return clearResponse(req, res)
});