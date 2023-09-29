const pool = require("../config/db");
const { logger } = require("../logs/winston");

let jobsdb = {};


jobsdb.JobApplicationUtilities = (start, end) => {
  return new Promise((resolve, reject) => {
    const sql = `
    SELECT count(id) AS total_job_application
    FROM job_application
    WHERE appliedAt >= ? AND appliedAt < ?
    `;
    pool.query(sql,[start, end], function (error, results, fields) {
      if (error) {
        return reject(error);
      }
      return resolve(results[0]);
    }
    );
  });
};

jobsdb.JobSeekerUtilities = (start, end,roleid) => {
    return new Promise((resolve, reject) => {
      const sql = `
      SELECT count(id) AS total_${roleid == 1 ? 'admin':roleid == 2 ?'jobseekers':'employers'}
      FROM users
      WHERE createdAt >= ? AND createdAt < ? AND roleid = ?
      `;
      pool.query(sql,[start, end,roleid], function (error, results, fields) {
        if (error) {
          return reject(error);
        }
        return resolve(results[0]);
      }
      );
    });
  };
  jobsdb.ActiveJobsUtilities = (start, end) => {
    return new Promise((resolve, reject) => {
      const sql = `
      SELECT count(jobId) AS total_active_jobs
      FROM job_info
      WHERE createdAt >= ? AND createdAt < ? AND goLiveDate >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      `;
      pool.query(sql,[start, end], function (error, results, fields) {
        if (error) {
          return reject(error);
        }
        return resolve(results[0]);
      }
      );
    });
  };
  jobsdb.NewJobsUtilities = (start, end) => {
    return new Promise((resolve, reject) => {
      const sql = `
      SELECT count(jobId) AS total_new_jobs
      FROM job_info
      WHERE createdAt >= ? AND createdAt < ? AND goLiveDate >= DATE_SUB(NOW(), INTERVAL 30 DAY) AND (jobState = "approved")
      `;
      pool.query(sql,[start, end], function (error, results, fields) {
        if (error) {
          return reject(error);
        }
        return resolve(results[0]);
      }
      );
    });
  };
  jobsdb.PaymentCountUtilities = (start, end) => {
    return new Promise((resolve, reject) => {
      const sql = `
      SELECT count(id) AS total_payment
      FROM payment_transaction
      WHERE createdAt >= ? AND createdAt < ?
      `;
      pool.query(sql,[start, end], function (error, results, fields) {
        if (error) {
          return reject(error);
        }
        return resolve(results[0]);
      }
      );
    });
  };
  jobsdb.PaymentSumUtilities = (start, end) => {
    return new Promise((resolve, reject) => {
      const sql = `
      SELECT sum(amount) AS total_amount_paid
      FROM payment_transaction
      WHERE createdAt >= ? AND createdAt < ?
      `;
      pool.query(sql,[start, end], function (error, results, fields) {
        if (error) {
          return reject(error);
        }
        return resolve(results[0]);
      }
      );
    });
  };

module.exports = jobsdb;
