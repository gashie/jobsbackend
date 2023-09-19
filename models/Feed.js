const pool = require("../config/db");

let jobsdb = {};


jobsdb.FindFeedForApproval = (feedId) => {
    return new Promise((resolve, reject) => {
      const sql =
        "SELECT * FROM generated_feeds WHERE feedId = ?";
      pool.query(sql, [feedId], function (error, results, fields) {
        if (error) {
          return reject(error);
        }
        return resolve(results[0]);
      });
    });
  };
module.exports = jobsdb;
