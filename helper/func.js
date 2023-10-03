const Crypto = require("crypto");
const dotenv = require("dotenv");
const uuidV4 = require('uuid');
dotenv.config({ path: "./config/config.env" });
module.exports = {

  Token: (size) => {
    return Crypto.randomBytes(size).toString("base64").slice(0, size);
  },

  list_to_tree: (list) => {
    var map = {},
      node,
      roots = [],
      i;

    for (i = 0; i < list.length; i += 1) {
      map[list[i].id] = i; // initialize the map
      list[i].children = []; // initialize the children
    }

    for (i = 0; i < list.length; i += 1) {
      node = list[i];
      if (node.baseId !== "0") {
        // if you have dangling branches check that map[node.baseId] exists
        list[map[node.baseId]]?.children.push(node);
      } else {
        roots.push(node);
      }
    }
    return roots;
  },
  getUniqueListBy(arr, key) {
    return [...new Map(arr.map((item) => [item[key], item])).values()];
  },
  prePareQuestionOptions(qOption, questionId) {
    let arrayqOptionObj = qOption.map(item => {
      return { questionId, ...item };
    });

    let sqlOptionValues = arrayqOptionObj.map(obj => Object.values(obj));
    return sqlOptionValues
  },
  prePareLocations(jobLocation, jobId) {
    let arrayObj = jobLocation.map(item => {
      return { jobId, ...item };
    });
    let sqlValues = arrayObj.map(obj => Object.values(obj));
    return sqlValues
  },
  prePareInvoiceItems(ItemsData, invoiceId) {
    let arrayObj = ItemsData.map(item => {
      return { invoiceId, ...item };
    });
    let sqlValues = arrayObj.map(obj => Object.values(obj));
    return sqlValues
  },
  spreadLocations(jobLocation) {
    return jobLocation.map((item) => { return item.locationName }).join(',')
  },
  scoring(questions, userAnswers) {
    {
      const Scoreresults = [];

      let totalCorrect = 0; // Initialize the total number of correct answers.
      let totalQuestions = 0; // Initialize the total number of questions.

      for (const userAnswer of userAnswers) {
        const question = questions.find(q => q.questionId === userAnswer.questionId);

        if (!question) {
          // Handle the case where the question ID is not found in the questions data.
          Scoreresults.push({ questionId: userAnswer.questionId, result: 'Question not found' });
          continue;
        }

        let isCorrect = false;

        if (question.questionType === 'yesno') {
          // For 'yesno' questions, compare user's answer to the benchmark.
          isCorrect = userAnswer.ans === question.benchMark;
        } else if (question.questionType === 'single') {
          // For 'single' questions, find options with non-empty optionBenchMark and compare user's answer.
          const correctOption = question.optionsData.find(opt => opt.optionBenchMark === userAnswer.ans);
          isCorrect = !!correctOption; // Check if a correct option was found.
        } else if (question.questionType === 'multi') {
          // For 'multi' questions, compare user's answers to option benchmarks.
          const userSelectedOptions = userAnswer.ans;
          const correctOptionBenchmarks = question.optionsData
            .filter(opt => opt.optionBenchMark !== '')
            .map(opt => opt.optionBenchMark);
          isCorrect = userSelectedOptions.length === correctOptionBenchmarks.length &&
            userSelectedOptions.every(option => correctOptionBenchmarks.includes(option));
        } else if (question.questionType === 'range') {
          // For 'range' questions, check if the user's answer is within the specified range and matches the benchmark.
          // For 'range' questions, compare the values as strings.
          const userAge = Number(userAnswer.ans);
          const minAge = Number(question.minimumValue);
          const maxAge = Number(question.maximumValue);
          isCorrect = userAge >= minAge && userAge <= maxAge || userAge === question.benchMark;

        }

        if (isCorrect) {
          totalCorrect++; // Increment the total correct count.
        }
        totalQuestions++; // Increment the total questions count.

        Scoreresults.push({
          questionId: userAnswer.questionId,
          result: isCorrect ? 'Correct' : 'Incorrect'
        });
      }

      const overallScore = (totalCorrect / totalQuestions) * 100; // Calculate overall score.

      return { Scoreresults, overallScore };
    }
  },
  invoiceCalc(itemsData, discount, tax) {
    let totalSum = 0;

    // Calculate itemAmount for each item and accumulate the total sum
    for (const item of itemsData) {
      item.itemAmount = item.itemUnitCost * item.itemQuantity;
      totalSum += item.itemAmount;
    }

    // Apply discount and tax
    const discountedTotal = totalSum - (totalSum * (discount / 100));
    const grandTotal = discountedTotal + (discountedTotal * (tax / 100));

    return {
      itemsData,
      totalSum,
      discount,
      tax,
      grandTotal,
    };
  }


};
