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

jobsdb.create = (postData) => {
    return new Promise((resolve, reject) => {
        pool.query('INSERT INTO job_question_option (questionId,optionLabel,optionValue,optionBenchMark) VALUES ?', [postData], (err, results) => {
            if (err) {
                return reject(err);
            }

            return resolve(results);
        });
    });
};
module.exports = jobsdb;
