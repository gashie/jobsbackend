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
 
}