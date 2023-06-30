const pool = require("../config/db");

let jobsdb = {};



jobsdb.FindCompany = (companyName) => {
  return new Promise((resolve, reject) => {
    const sql =
      "SELECT * FROM company WHERE companyName = ?";
    pool.query(sql, [companyName], function (error, results, fields) {
      if (error) {
        return reject(error);
      }
      return resolve(results[0]);
    });
  });
};
module.exports = jobsdb;
