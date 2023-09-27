const pool = require("../config/db");

let jobsdb = {};



jobsdb.TransactionHistory = (userId) => {
    return new Promise((resolve, reject) => {
        pool.query(`
        SELECT 
        job_application.userId,
        job_application.applicantName,
        job_application.applicantEmail,
        job_application.applicantPhone,
        job_application.applicantResume,
        job_application.appliedAt,
        job_application.applicationId,
         job_info.jobId, 
         job_info.jobTitle, 
         company.companyName,
         company.companyId
         FROM job_info 
         JOIN company ON job_info.companyId = company.companyId 
         JOIN job_application ON job_info.jobId = job_application.jobId
         WHERE job_application.userId = ?
        `, [userId], (err, results) => {
            if (err) {
                return reject(err);
            }

            return resolve(results);
        });
    });
};
module.exports = jobsdb;
