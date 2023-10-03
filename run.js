

// function checkAnswers(questions, userAnswers) {
//   const results = [];

//   for (const userAnswer of userAnswers.answers) {
//     const question = questions.Questions.find(q => q.questionId === userAnswer.questionId);

//     if (!question) {
//       // Handle the case where the question ID is not found in the questions data.
//       results.push({ questionId: userAnswer.questionId, result: 'Question not found' });
//       continue;
//     }

//     let isCorrect = false;

//     if (question.questionType === 'yesno') {
//       // For 'yesno' questions, compare user's answer to the benchmark.
//       isCorrect = userAnswer.ans === question.benchMark;
//     } else if (question.questionType === 'single') {
//       // For 'single' questions, find options with non-empty optionBenchMark and compare user's answer.
//       const correctOption = question.optionsData.find(opt => opt.optionBenchMark === userAnswer.ans);
//       isCorrect = !!correctOption; // Check if a correct option was found.
//     } else if (question.questionType === 'multi') {
//       // For 'multi' questions, compare user's answers to option benchmarks.
//         // For 'multi' questions, compare user's answers to option benchmarks.
//         const userSelectedOptions = userAnswer.ans;
//         const correctOptionBenchmarks = question.optionsData
//           .filter(opt => opt.optionBenchMark !== '')
//           .map(opt => opt.optionBenchMark);

//         isCorrect = userSelectedOptions.length === correctOptionBenchmarks.length &&
//           userSelectedOptions.every(option => correctOptionBenchmarks.includes(option));
//     }

//     results.push({
//       questionId: userAnswer.questionId,
//       result: isCorrect ? 'Correct' : 'Incorrect'
//     });
//   }

//   return results;
// }





//*****working


//mark earch
function checkAnswersBRingsPercentageForEachQuestion(questions, userAnswers) {
  const results = [];

  for (const userAnswer of userAnswers.answers) {
    const question = questions.Questions.find(q => q.questionId === userAnswer.questionId);

    if (!question) {
      // Handle the case where the question ID is not found in the questions data.
      results.push({ questionId: userAnswer.questionId, result: 'Question not found' });
      continue;
    }

    let isCorrect = false;
    let scorePercentage = 0; // Initialize the score percentage.

    if (question.questionType === 'yesno') {
      // For 'yesno' questions, compare user's answer to the benchmark.
      isCorrect = userAnswer.ans === question.benchMark;
      if (isCorrect) {
        scorePercentage = 100; // If correct, score is 100%.
      }
    } else if (question.questionType === 'single') {
      // For 'single' questions, find options with non-empty optionBenchMark and compare user's answer.
      const correctOption = question.optionsData.find(opt => opt.optionBenchMark === userAnswer.ans);
      isCorrect = !!correctOption; // Check if a correct option was found.
      if (isCorrect) {
        scorePercentage = 100; // If correct, score is 100%.
      }
    } else if (question.questionType === 'multi') {
      // For 'multi' questions, compare user's answers to option benchmarks.
      const userSelectedOptions = userAnswer.ans;
      const correctOptionBenchmarks = question.optionsData
        .filter(opt => opt.optionBenchMark !== '')
        .map(opt => opt.optionBenchMark);
      isCorrect = userSelectedOptions.length === correctOptionBenchmarks.length &&
        userSelectedOptions.every(option => correctOptionBenchmarks.includes(option));

      if (isCorrect) {
        // Calculate the score as a percentage of correct answers.
        scorePercentage = (userSelectedOptions.length / correctOptionBenchmarks.length) * 100;
      }
    }

    results.push({
      questionId: userAnswer.questionId,
      result: isCorrect ? 'Correct' : 'Incorrect',
      scorePercentage: scorePercentage
    });
  }

  return results;
}

function checkAnswers(questions, userAnswers) {
  const results = [];

  let totalCorrect = 0; // Initialize the total number of correct answers.
  let totalQuestions = 0; // Initialize the total number of questions.

  for (const userAnswer of userAnswers) {
    const question = questions.find(q => q.questionId === userAnswer.questionId);

    if (!question) {
      // Handle the case where the question ID is not found in the questions data.
      results.push({ questionId: userAnswer.questionId, result: 'Question not found' });
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

    results.push({
      questionId: userAnswer.questionId,
      result: isCorrect ? 'Correct' : 'Incorrect'
    });
  }

  const overallScore = (totalCorrect / totalQuestions) * 100; // Calculate overall score.

  return { results, overallScore };
}
// Example usage:
const questionsData = {
  "Questions": [
    {
      "questionId": "5eb4086c-d598-4b78-b450-122732d041fa",
      "questionTitle": "What is your age now",
      "questionType": "range",
      "benchMark": "42",
      "minimumValue": "30",
      "maximumValue": "45",
      "optionsData": []
    }
    ,
    {
      "questionId": "b796d1cd-5bef-443b-a88c-e3db7c3d163c",
      "questionTitle": "Are you married",
      "questionType": "yesno",
      "benchMark": "yes",
      "minimumValue": null,
      "maximumValue": null,
      "optionsData": []
    },
    {
      "questionId": "706e5955-fe58-4f15-8267-a42020892df0",
      "questionTitle": "Choose one word",
      "questionType": "single",
      "benchMark": null,
      "minimumValue": null,
      "maximumValue": null,
      "optionsData": [
        {
          "questionOptionId": 35,
          "questionId": "706e5955-fe58-4f15-8267-a42020892df0",
          "optionLabel": "Good",
          "optionValue": "Good",
          "optionBenchMark": "1"
        },
        {
          "questionOptionId": 36,
          "questionId": "706e5955-fe58-4f15-8267-a42020892df0",
          "optionLabel": "Better",
          "optionValue": "Better",
          "optionBenchMark": ""
        }
      ]
    },
    {
      "questionId": "80850181-0694-4096-98bb-6a1ab5169c80",
      "questionTitle": "Are you a boy",
      "questionType": "yesno",
      "benchMark": "yes",
      "minimumValue": null,
      "maximumValue": null,
      "optionsData": []
    },
    {
      "questionId": "3547ab23-bce2-4f47-b151-a4b04bb6e62d",
      "questionTitle": "Choose the programming languages you're familiar with please",
      "questionType": "multi",
      "benchMark": null,
      "minimumValue": null,
      "maximumValue": null,
      "optionsData": [
        {
          "questionOptionId": 37,
          "questionId": "3547ab23-bce2-4f47-b151-a4b04bb6e62d",
          "optionLabel": "Java",
          "optionValue": "Java",
          "optionBenchMark": "1"
        },
        {
          "questionOptionId": 38,
          "questionId": "3547ab23-bce2-4f47-b151-a4b04bb6e62d",
          "optionLabel": "Php",
          "optionValue": "Php",
          "optionBenchMark": "2"
        }
      ]
    }
  ]
} /* The array of questions from your JSON data */
const userAnswersData = {
  "answers": [
    {
      "questionId": "b796d1cd-5bef-443b-a88c-e3db7c3d163c",
      "ans": "yes"
    },
    {
      "questionId": "706e5955-fe58-4f15-8267-a42020892df0",
      "ans": "1"
    },
    {
      "questionId": "5eb4086c-d598-4b78-b450-122732d041fa",
      "ans": "42"
    },
    {
      "questionId": "80850181-0694-4096-98bb-6a1ab5169c80",
      "ans": "yes"
    },
    {
      "questionId": "3547ab23-bce2-4f47-b151-a4b04bb6e62d",
      "ans": [
        "1",
        "2"
      ]
    }
  ]
}

const { results, overallScore } = checkAnswers(questionsData.Questions, userAnswersData.answers);
console.log('Results:', results);
console.log('Overall Score:', overallScore);


function calculateGrandTotal(itemsData, discount, tax) {
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

// Example data
const itemsData = [
  {
    itemName: "Rice",
    itemDescription: "Rice",
    itemUnitCost: 100,
    itemQuantity: 2,
    itemAmount: "",
  },
  {
    itemName: "Beans",
    itemDescription: "Beans",
    itemUnitCost: 20,
    itemQuantity: 2,
    itemAmount: "",
  },
];

const discount = 0; // 20% discount
const tax = 0;      // 2% tax

// Calculate grand total
const result = calculateGrandTotal(itemsData, discount, tax);

console.log(result);
