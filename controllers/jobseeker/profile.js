const asynHandler = require("../../middleware/async");
const uuidV4 = require('uuid');
const GlobalModel = require("../../models/Global");
const { sendResponse, CatchHistory } = require("../../helper/utilfunc");



exports.ViewMyProfile = asynHandler(async (req, res, next) => {
    let { userId } = req.body
    let actor = req.user.userInfo

    // Define your dynamic query parameters
    const tableName = 'users';
    const tableTwoName = 'cover_letter';
    const tableThreeName = 'resume';
    const columnsToSelect = ['id', 'userId', 'fullName', 'username', 'email', 'phone', 'address', 'country', 'maritalStatus', 'gender', 'birthDate']; // Replace with your desired columns
    const columnsTwoToSelect = ['coverLetterId', 'coverLetterName', 'coverLetterDescription'];
    const columnsThreeToSelect = ['resumeId', 'fileName']; // Replace with your desired columns

    // Define an array of conditions (each condition is an object with condition and value

    const conditions = [
        { column: 'userId', operator: '=', value: userId }
        // Add more conditions as needed
    ];
    const conditionsTwo = [
        { column: 'userId', operator: '=', value: userId }
        // Add more conditions as needed
    ];
    const conditionsThree = [
        { column: 'userId', operator: '=', value: userId }
        // Add more conditions as needed
    ];


    let results = await GlobalModel.QueryDynamic(tableName, columnsToSelect, conditions);
    if (!results) {
        CatchHistory({ event: `user with id: ${actor.userId} viewed  profile`, functionName: 'ViewMyProfile', response: `No Record Found For profile`, dateStarted: req.date, requestStatus: 200, actor: actor.userId }, req);
        return sendResponse(res, 0, 200, 'No Record Found')
    }
    let coverletter = await GlobalModel.QueryDynamic(tableTwoName, columnsTwoToSelect, conditionsTwo);
    let resume = await GlobalModel.QueryDynamic(tableThreeName, columnsThreeToSelect, conditionsThree);

    let profileData = {
        userProfile: results,
        coverletter,
        resume
    }
    CatchHistory({ event: `user with id: ${actor.userId} viewed ${results.length} cover_letters`, functionName: 'ViewMyProfile', response: `Record Found, profile contains ${results.length} record's`, dateStarted: req.date, requestStatus: 200, actor: actor.userId }, req);
    return sendResponse(res, 1, 200, 'Record Found', profileData)

});
