const pool = require("../config/db");

let jobsdb = {};

jobsdb.FindSimilar = (jobId) => {
    return new Promise((resolve, reject) => {
        pool.query(`
        SELECT * FROM job_info WHERE jobId = ?`, [jobId], (err, results) => {
            if (err) {
                return reject(err);
            }

            return resolve(results);
        });
    });
};
module.exports = jobsdb;
