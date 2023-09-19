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
const tableName = 'your_table_name';
const columnsToSelect = ['column1', 'column2', 'column3'];

// Define an array of conditions (each condition is an object with condition and value)
const conditions = [
  { column: 'feedId', value: '357a6524-e872-4de8-8f2a-8c40aab94a61' },
  { column: 'status', value: 'approved' },
  // Add more conditions as needed
];

// Build the dynamic SQL query with the dynamic conditions
const placeholders = conditions.map(() => '?').join(', ');
const whereClause = conditions.map((conditionObj) => `${conditionObj.column} = ?`).join(' AND ');

const query = `SELECT ${columnsToSelect.join(', ')} FROM ${tableName} WHERE ${whereClause}`;
// Extract condition values from the conditions array
const conditionValues = conditions.map((conditionObj) => conditionObj.value);

console.log(query);
console.log(conditionValues);