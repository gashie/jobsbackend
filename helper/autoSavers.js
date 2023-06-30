const uuidV4 = require('uuid');
const GlobalModel = require("../models/Global");
const { sendResponse, CatchHistory } = require('./utilfunc');
module.exports = {
  autoSaveCompany: async (payload, req, res) => {
    let comapanyId = uuidV4.v4()
    let { location, website,companyName,userType,roleid, username,companySize, companyProfile, companyLogo, userId, fullName, email, phone, password, address, country, birthDate, maritalStatus, gender, highestEducation } = payload
    let companyPayload = {
      comapanyId,
      companyName,
      userId,
      createdByName: fullName,
      location,
      companyProfile,
      website,
      companySize,
    };
    let userPayload = {
      userId,
      email,
      username,
      fullName,
      password,
      phone,
      address,
      country,
      birthDate,
      maritalStatus,
      gender,
      highestEducation,
      userType,
      roleid,
    }
    let saveuserresult = await GlobalModel.Create('users',userPayload);
    if (saveuserresult.affectedRows === 1) {
      CatchHistory({ api_response: `New user signup with id :${userId}`, function_name: 'CreateUser', date_started: req.date, sql_action: "INSERT", event: "User Signup", actor: userId }, req)
      let results = await GlobalModel.Create('company',companyPayload);
      if (results.affectedRows === 1) {
        CatchHistory({ api_response: `User with id :${userId} created new company `, function_name: 'autoSave', date_started: req.date, sql_action: "INSERT", event: "Company Signup", actor: userId }, req)
        return sendResponse(res, 1, 200, "Record saved", [])
      } else {
        CatchHistory({ api_response: `Sorry, error saving record,User with id :${id} created new company `, function_name: 'autoSave', date_started: req.date, sql_action: "INSERT", event: "Company Signup", actor: userId }, req)
        return sendResponse(res, 0, 200, "Sorry, error saving record", [])
      }

    }


  },
  autoSaveUser: async (payload, req, res) => {
    let results = await GlobalModel.Create('users',payload);
    if (results.affectedRows === 1) {
      CatchHistory({ api_response: `New user signup with id :${payload.userId}`, function_name: 'CreateUser', date_started: req.date, sql_action: "INSERT", event: "User Signup", actor: payload.userId }, req)
      return sendResponse(res, 1, 200, "User Signup Record Saved", [])
    } else {
      CatchHistory({ api_response: `Sorry, error saving record for user  with id :${id}`, function_name: 'CreateUser', date_started: req.date, sql_action: "INSERT", event: "User Signup", actor: payload.userId }, req)
      return sendResponse(res, 0, 200, "Sorry, error saving record", [])
    }


  },

}