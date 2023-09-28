const pool = require("../config/db");

let jobsdb = {};



jobsdb.TransactionHistory = (transactionFor) => {
    return new Promise((resolve, reject) => {
        pool.query(`
        SELECT 
        users.userId,
        users.fullName,
        users.email,
        job_info.jobId, 
        job_info.jobTitle, 
        company.companyName,
        company.companyId,
        rate_card.rateTitle,
        rate_card.ratePrice,
        rate_card.rateLimit,
        payment_transaction.paymentId,
        payment_transaction.paidById,
        payment_transaction.paidOnBehalfOfById,
        payment_transaction.isManual,
        payment_transaction.metaData,
        payment_transaction.domain,
        payment_transaction.ipAddress,
        payment_transaction.currency,
        payment_transaction.channel,
        payment_transaction.gatewayResponse,
        payment_transaction.paymentDescription,
        payment_transaction.reference,
        payment_transaction.paystackStatus,
        payment_transaction.amount,
        payment_transaction.receivedAt,
        payment_transaction.transactionFor,
        payment_transaction.rateId,
        payment_transaction.rateAmount,
        payment_transaction.createdAt
        FROM job_info 
        JOIN company ON job_info.companyId = company.companyId 
        JOIN payment_transaction ON job_info.jobId = payment_transaction.jobId
        JOIN rate_card ON rate_card.rateId = payment_transaction.rateId
        JOIN users ON users.userId = payment_transaction.paidById
        WHERE payment_transaction.transactionFor =  ?
        `, [transactionFor], (err, results) => {
            if (err) {
                return reject(err);
            }

            return resolve(results);
        });
    });
};
jobsdb.EmployerTransactionHistory = (transactionFor,companyId) => {
    return new Promise((resolve, reject) => {
        pool.query(`
        SELECT 
        users.userId,
        users.fullName,
        users.email,
        job_info.jobId, 
        job_info.jobTitle, 
        company.companyName,
        company.companyId,
        rate_card.rateTitle,
        rate_card.ratePrice,
        rate_card.rateLimit,
        payment_transaction.paymentId,
        payment_transaction.paidById,
        payment_transaction.paidOnBehalfOfById,
        payment_transaction.isManual,
        payment_transaction.metaData,
        payment_transaction.domain,
        payment_transaction.ipAddress,
        payment_transaction.currency,
        payment_transaction.channel,
        payment_transaction.gatewayResponse,
        payment_transaction.paymentDescription,
        payment_transaction.reference,
        payment_transaction.paystackStatus,
        payment_transaction.amount,
        payment_transaction.receivedAt,
        payment_transaction.transactionFor,
        payment_transaction.rateId,
        payment_transaction.rateAmount,
        payment_transaction.createdAt
        FROM job_info 
        JOIN company ON job_info.companyId = company.companyId 
        JOIN payment_transaction ON job_info.jobId = payment_transaction.jobId
        JOIN rate_card ON rate_card.rateId = payment_transaction.rateId
        JOIN users ON users.userId = payment_transaction.paidById
        WHERE payment_transaction.transactionFor =  ?
        AND job_info.companyId = ?
        `, [transactionFor,companyId], (err, results) => {
            if (err) {
                return reject(err);
            }

            return resolve(results);
        });
    });
};

module.exports = jobsdb;
