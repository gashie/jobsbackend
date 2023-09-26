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
jobsdb.OpenJob = (jobId) => {
    return new Promise((resolve, reject) => {
        pool.query(`
        SELECT 
        job_info.jobId, 
        job_info.jobTitle, 
        job_info.jobLocation, 
        job_info.jobDescription, 
        job_info.jobStatus, 
        job_info.jobSkills, 
        company.companyName, 
        company.companyLogo, 
        job_category.jobCategoryName, 
        industry.industryTitle 
        FROM job_info 
        JOIN company ON job_info.companyId = company.companyId 
        JOIN job_category ON job_info.jobCategoryId = job_category.jobCategoryId 
        JOIN industry ON company.industryId = industry.industryId 
        WHERE job_info.jobId = ? 
        AND job_info.jobState = ? 
        AND job_info.goLiveDate >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        `, [jobId, 'approved'], (err, results) => {
            if (err) {
                return reject(err);
            }

            return resolve(results[0]);
        });
    });
};
jobsdb.ViewJobApplicants = (jobId) => {
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
        job_application.sumQuestions,
        job_application.sumAnswers,
        job_application.applicationScore,
        job_application.applicationStatus,
         job_info.jobId, 
         job_info.jobTitle, 
         company.companyName
         FROM job_info 
         JOIN company ON job_info.companyId = company.companyId 
         JOIN job_application ON job_info.jobId = job_application.jobId
        `, [jobId], (err, results) => {
            if (err) {
                return reject(err);
            }

            return resolve(results);
        });
    });
};
jobsdb.EmployerViewJobApplicants = (jobId,companyId) => {
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
        job_application.sumQuestions,
        job_application.sumAnswers,
        job_application.applicationScore,
        job_application.applicationStatus,
         job_info.jobId, 
         job_info.jobTitle, 
         company.companyName,
         company.companyId
         FROM job_info 
         JOIN company ON job_info.companyId = company.companyId 
         JOIN job_application ON job_info.jobId = job_application.jobId
         WHERE job_info.companyId = ?
         AND job_info.jobId = ?
        `, [companyId,jobId], (err, results) => {
            if (err) {
                return reject(err);
            }

            return resolve(results);
        });
    });
};
jobsdb.EmployerViewShortlistedJobApplicants = (jobId,companyId,applicationScore) => {
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
        job_application.sumQuestions,
        job_application.sumAnswers,
        job_application.applicationScore,
        job_application.applicationStatus,
         job_info.jobId, 
         job_info.jobTitle, 
         company.companyName,
         company.companyId
         FROM job_info 
         JOIN company ON job_info.companyId = company.companyId 
         JOIN job_application ON job_info.jobId = job_application.jobId
         WHERE job_info.companyId = ?
         AND job_info.jobId = ?
         AND job_application.applicationScore >= ?
        `, [companyId,jobId,applicationScore], (err, results) => {
            if (err) {
                return reject(err);
            }

            return resolve(results);
        });
    });
};
jobsdb.PublicOpenJob = () => {
    return new Promise((resolve, reject) => {
        pool.query(`
        SELECT 
    job_info.jobId, 
    job_info.jobTitle, 
    job_info.jobLocation, 
    job_info.jobDescription, 
    job_info.jobStatus, 
    job_info.jobSkills, 
    job_info.goLiveDate,
    company.companyName, 
    company.companyLogo, 
    job_category.jobCategoryName, 
    industry.industryTitle 
FROM job_info 
JOIN company ON job_info.companyId = company.companyId 
JOIN job_category ON job_info.jobCategoryId = job_category.jobCategoryId 
JOIN industry ON company.industryId = industry.industryId
WHERE job_info.goLiveDate >= DATE_SUB(NOW(), INTERVAL 30 DAY)
AND job_info.jobState = ?

; 
        `, ['approved'], (err, results) => {
            if (err) {
                return reject(err);
            }

            return resolve(results);
        });
    });
};
module.exports = jobsdb;
