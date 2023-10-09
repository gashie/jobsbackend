const asynHandler = require("../../middleware/async");
const GlobalModel = require("../../models/Global");
const { sendResponse, CatchHistory } = require("../../helper/utilfunc");

exports.FrontendListCategories = asynHandler(async (req, res, next) => {

  // Define your dynamic query parameters
  const tableName = 'job_category';
  const columnsToSelect = ['jobCategoryId', 'jobCategoryName']; // Replace with your desired columns

  // Define an array of conditions (each condition is an object with condition and value
  const conditions = [
    { column: 'deletedAt', operator: 'IS', value: null },
    // Add more conditions as needed
  ];


  let results = await GlobalModel.QueryDynamicArray(tableName, columnsToSelect, conditions);
  if (results.length == 0) {
    return sendResponse(res, 0, 200, 'Sorry no record found', [])
  }

  return sendResponse(res, 1, 200, 'Record Found', results)

});



exports.FrontendListLocations = asynHandler(async (req, res, next) => {

  // Define your dynamic query parameters
  const tableName = 'job_location';
  const columnsToSelect = []; // Replace with your desired columns

  // Define an array of conditions (each condition is an object with condition and value
  const conditions = [
    // Add more conditions as needed
  ];


  let results = await GlobalModel.QueryDynamicArray(tableName, columnsToSelect, conditions);
  if (results.length == 0) {
    return sendResponse(res, 0, 200, 'Sorry no record found', [])
  }

  return sendResponse(res, 1, 200, 'Record Found', results)

});

exports.FrontendListIndustries = asynHandler(async (req, res, next) => {

  // Define your dynamic query parameters
  const tableName = 'industry';
  const columnsToSelect = ['industryId', 'industryTitle']; // Replace with your desired columns

  // Define an array of conditions (each condition is an object with condition and value
  const conditions = [
    { column: 'deletedAt', operator: 'IS', value: null },
    // Add more conditions as needed
  ];


  let results = await GlobalModel.QueryDynamicArray(tableName, columnsToSelect, conditions);
  if (results.length == 0) {
    return sendResponse(res, 0, 200, 'Sorry no record found', [])
  }

  return sendResponse(res, 1, 200, 'Record Found', results)

});

exports.FrontendListCourses = asynHandler(async (req, res, next) => {

  // Define your dynamic query parameters
  const tableName = 'course';
  const columnsToSelect = ['courseId', 'courseTitle', 'courseOrganiser', 'courseVenue', 'courseCost', 'courseStartDate', 'courseEndDate']; // Replace with your desired columns

  // Define an array of conditions (each condition is an object with condition and value
  const conditions = [
    { column: 'courseApprovalStatus', operator: '=', value: 'approved' },
    { column: 'courseStatus', operator: '=', value: 'open' },
    // Add more conditions as needed
  ];


  let results = await GlobalModel.QueryDynamicArray(tableName, columnsToSelect, conditions);
  if (results.length == 0) {
    return sendResponse(res, 0, 200, 'Sorry no record found', [])
  }

  return sendResponse(res, 1, 200, 'Record Found', results)

});
exports.FrontendFindCourses = asynHandler(async (req, res, next) => {
  let { courseId } = req.body
  // Define your dynamic query parameters
  const tableName = 'course';
  const columnsToSelect = ['courseId', 'courseTitle', 'courseDescription', 'courseOrganiser', 'courseVenue', 'courseCost', 'courseStartDate', 'courseEndDate', 'courseStudyMode', 'courseDuration', 'courseCategory', 'courseAudience', 'courseGoals', 'courseLink', 'courseImage', 'courseVideoAd', 'courseBrochure', 'courseCertificationNote']; // Replace with your desired columns
  const tableTwoName = 'course_content';
  const columnsTwoToSelect = ['contentId', 'contentTitle', 'contentFile', 'contentDesc', 'contentLink']; // Replace with your desired columns
  const tableThreeName = 'course_partners';
  const columnsThreeToSelect = ['partnerId', 'institutionName', 'institutionLogo']; // Replace with your desired columns
  const tableFourName = 'course_schedule';
  const columnsFourToSelect = ['scheduleId', 'scheduleTitle', 'startTime', 'endTime']; // Replace with your desired columns

  // Define an array of conditions (each condition is an object with condition and value
  const conditions = [
    { column: 'courseApprovalStatus', operator: '=', value: 'approved' },
    { column: 'courseStatus', operator: '=', value: 'open' },
    { column: 'courseId', operator: '=', value: courseId },
    // Add more conditions as needed
  ];

  const conditionsTwo = [
    { column: 'deletedAt', operator: 'IS', value: null },
    // Add more conditions as needed
  ];

  let course = await GlobalModel.QueryDynamicArray(tableName, columnsToSelect, conditions);
  if (course.length == 0) {
    return sendResponse(res, 0, 200, 'Sorry no record found', [])
  }
  let content = await GlobalModel.QueryDynamicArray(tableTwoName, columnsTwoToSelect, conditionsTwo);
  let partners = await GlobalModel.QueryDynamicArray(tableThreeName, columnsThreeToSelect, conditionsTwo);
  let schedule = await GlobalModel.QueryDynamicArray(tableFourName, columnsFourToSelect, conditionsTwo);


  return sendResponse(res, 1, 200, 'Record Found', {course, content, partners, schedule })

});

exports.FrontendHrCareerNews = asynHandler(async (req, res, next) => {
   let {postType} = req.body
  // Define your dynamic query parameters
  const tableName = 'generated_feeds';
  const columnsToSelect = ['feedId', 'title', 'description', 'postImage', 'postType', 'pubdate', 'summary','link','author','comments','isSystem']; // Replace with your desired columns

  // Define an array of conditions (each condition is an object with condition and value
  const conditions = [
    { column: 'status', operator: '=', value: 'approved' },
    { column: 'postType', operator: '=', value: postType },
    { column: 'approvedAt', operator: '>=', value: 'DATE_SUB(NOW(), INTERVAL 120 DAY)', isDateColumn: true }, // Example date column
  // Add more conditions as needed, including different date columns
    // Add more conditions as needed
  ];


  let results = await GlobalModel.QueryDynamicArray(tableName, columnsToSelect, conditions);
  if (results.length == 0) {
    return sendResponse(res, 0, 200, 'Sorry no record found', [])
  }

  return sendResponse(res, 1, 200, 'Record Found', results)

});
exports.FrontendFindCareerNews = asynHandler(async (req, res, next) => {
  let {feedId} = req.body
 // Define your dynamic query parameters
 const tableName = 'generated_feeds';
 const columnsToSelect = ['feedId', 'title', 'description', 'postImage', 'postType', 'pubdate', 'summary','link','author','comments','isSystem']; // Replace with your desired columns

 // Define an array of conditions (each condition is an object with condition and value
 const conditions = [
   { column: 'status', operator: '=', value: 'approved' },
   { column: 'feedId', operator: '=', value: feedId },
   { column: 'approvedAt', operator: '>=', value: 'DATE_SUB(NOW(), INTERVAL 120 DAY)', isDateColumn: true }, // Example date column
 // Add more conditions as needed, including different date columns
   // Add more conditions as needed
 ];


 let results = await GlobalModel.QueryDynamic(tableName, columnsToSelect, conditions);
 if (!results) {
   return sendResponse(res, 0, 200, 'Sorry no record found', [])
 }

 return sendResponse(res, 1, 200, 'Record Found', results)

});

