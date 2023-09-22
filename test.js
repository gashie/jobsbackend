// const RssFeedEmitter = require('rss-feed-emitter');
// const feeder = new RssFeedEmitter();

// // feeder.add({
// //     url: 'https://www.hcamag.com/ca/rss',
// //     refresh: 2000,
// //     eventName: 'nintendo'
// //   });
  
//   feeder.on('nintendo', function(item) {
//     console.log(item);
//   });

// Define your dynamic query parameters
// const tableName = 'your_table_name';
// const columnsToSelect = ['column1', 'column2', 'column3']; // Replace with your desired columns
// const condition1 = 'column1 = ?'; // Replace with your first condition
// const conditionValue1 = 'value1'; // Replace with your first condition value
// const condition2 = 'column2 > ?'; // Replace with your second condition
// const conditionValue2 = 42; // Replace with your second condition value

// // Build the dynamic SQL query with two conditions
// const query = `SELECT ${columnsToSelect.join(', ')} FROM ${tableName} WHERE ${condition1} AND ${condition2}`;

// Define your dynamic query parameters
//***
// const tableName = 'your_table_name';
// const columnsToSelect = ['column1', 'column2', 'column3'];

// // Define an array of conditions (each condition is an object with condition and value)
// const conditions = [
//   { column: 'feedId', value: '357a6524-e872-4de8-8f2a-8c40aab94a61' },
//   { column: 'status', value: 'approved' },
//   // Add more conditions as needed
// ];

// // Build the dynamic SQL query with the dynamic conditions
// const placeholders = conditions.map(() => '?').join(', ');
// const whereClause = conditions.map((conditionObj) => `${conditionObj.column} = ?`).join(' AND ');

// const query = `SELECT ${columnsToSelect.join(', ')} FROM ${tableName} WHERE ${whereClause}`;
// // Extract condition values from the conditions array
// const conditionValues = conditions.map((conditionObj) => conditionObj.value);

// console.log(query);
// console.log(conditionValues);
//** */

//////////////////////////////////////
// Define your dynamic query parameters
const tableName = 'rate_card';
const columnsToSelect = ['rateId', 'rateStatus']; // An array of column names to select (empty for "select all")
const conditions = [
  { column: 'rateId', operator: '=', value: 'aa2bc56a-246f-4214-85a5-4bcc50b79fdf' },
  { column: 'rateStatus', operator: '=', value: 'approved' },
  // Add more conditions as needed
];

console.log('Columns to Select:', columnsToSelect);
console.log('Conditions:', conditions);

// Build the dynamic SQL query with the dynamic conditions
const conditionClauses = conditions.map((conditionObj) => `${conditionObj.column} ${conditionObj.operator} ?`);
const conditionValues = conditions.map((conditionObj) => conditionObj.value);

console.log('Condition Clauses:', conditionClauses);
console.log('Condition Values:', conditionValues);

// Construct the SELECT clause based on whether columnsToSelect is empty
const selectClause = columnsToSelect.length > 0 ? columnsToSelect.join(', ') : '*';

console.log('Select Clause:', selectClause);

const whereClause = conditionClauses.length > 0 ? `WHERE ${conditionClauses.join(' AND ')}` : '';

console.log('Where Clause:', whereClause);

const query = `SELECT ${selectClause} FROM ${tableName} ${whereClause}`;

console.log('Final Query:', query);



(async () => {
  try {
    const tableName = 'your_table_name'; // Replace with your table name
    const columnsToSelect = ['questionId', 'questionTitle', 'jobId', 'questionType', 'benchMark', 'minimumValue', 'maximumValue', 'createdAt', 'updatedAt', 'createdByName'];
    const conditions = [
      { column: 'deletedAt', operator: 'IS', value: 'NOT NULL' }, // Check if deletedAt is NOT NULL
    ];

    // Filter out conditions with undefined values
    const validConditions = conditions.filter((condition) => condition.value !== undefined);

    const conditionClauses = validConditions.map((conditionObj) => `${conditionObj.column} ${conditionObj.operator} ${conditionObj.value}`);

    const whereClause = conditionClauses.length > 0 ? `WHERE ${conditionClauses.join(' AND ')}` : '';

    const query = `SELECT ${columnsToSelect.join(', ')} FROM ${tableName} ${whereClause}`;

    console.log(query);
    // const result = await createSelectQuery(tableName, columnsToSelect, conditions);
    // console.log('Query result:', result);
  } catch (error) {
    console.error('Error:', error);
  }
})();