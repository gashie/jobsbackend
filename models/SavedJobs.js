const pool = require("../config/db");

let jobsdb = {};



jobsdb.FindMySavedJobs = (userId) => {
    return new Promise((resolve, reject) => {
        const sql = `
    SELECT
        saved.savedJobsId,
        jobs.jobId,
        jobs.jobTitle,
        jobs.createdAt,
        company.companyName
FROM
          job_info jobs
          INNER JOIN company company ON company.companyId  = jobs.companyId
          INNER JOIN saved_jobs saved ON saved.jobId = jobs.jobId
          where saved.userId = ?
          AND saved.deletedAt IS NULL
          `;
        pool.query(sql, [userId], function (error, results, fields) {
            if (error) {
                return reject(error);
            }
            return resolve(results);
        });
    });
};
module.exports = jobsdb;
