const pool = require("../config/db");

let jobsdb = {};



jobsdb.create = (postData) => {
    return new Promise((resolve, reject) => {
        pool.query('INSERT INTO job_location (jobId,locationName) VALUES ?', [postData], (err, results) => {
            if (err) {
                return reject(err);
            }

            return resolve(results);
        });
    });
};
module.exports = jobsdb;
