const uuidV4 = require('uuid');
const GlobalModel = require("../models/Global");
const QuestionModel = require("../models/Questions");
const { sendResponse, CatchHistory } = require('./utilfunc');
module.exports = {

  autoFindLinkage: async (questionPayload) => {

    let linkedResult = await QuestionModel.FindLinkage(questionPayload.jobId, questionPayload.questionId);
    if (!linkedResult) {
      let results = await GlobalModel.Create('job_linked_question', { jobId: questionPayload.jobId, questionId: questionPayload.questionId });
    }


  },
  autoFindQuestionsWithJobId: async (jobId) => {
    let arrObject = []
    // Define your dynamic query parameters
    const tableName = 'job_question';
    const columnsToSelect = ['questionId', 'questionTitle', 'jobId', 'questionType', 'benchMark', 'minimumValue', 'maximumValue']; // Replace with your desired columns

    const conditionsOne = [
      { column: 'deletedAt', operator: 'IS', value: null },
      { column: 'jobId', operator: '=', value: jobId }
      // Add more conditions as needed
    ];


    let adminQuestions = await GlobalModel.QueryDynamicArray(tableName, columnsToSelect, conditionsOne);

    for (const iterator of adminQuestions) {
      const conditionsTwo = [
        { column: 'questionId', operator: '=', value: iterator.questionId },
        // Add more conditions as needed
      ];
      let optionsData = iterator?.questionType === 'multi' || iterator?.questionType === 'single' ? await GlobalModel.QueryDynamicArray('job_question_option', [], conditionsTwo) : [];
      let objectData = {
        questionId:iterator.questionId,
        questionTitle:iterator.questionTitle,
        questionType:iterator.questionType,
        benchMark:iterator.benchMark,
        minimumValue:iterator.minimumValue,
        maximumValue:iterator.maximumValue,
        optionsData

      }
     arrObject.push(objectData)

    }
    return arrObject

  },

}