const pool = require("../config/db");

let jobsdb = {};



jobsdb.create = (postData) => {
    return new Promise((resolve, reject) => {
        pool.query('INSERT INTO invoice_items (invoiceId,itemName,itemDescription,itemUnitCost,itemQuantity,itemAmount) VALUES ?', [postData], (err, results) => {
            if (err) {
                return reject(err);
            }

            return resolve(results);
        });
    });
};
jobsdb.deleteInvoiceData = (postData) => {
    return new Promise((resolve, reject) => {
        pool.query('DELETE FROM invoice_data WHERE invoiceId = ?', [postData], (err, results) => {
            if (err) {
                return reject(err);
            }

            return resolve(results);
        });
    });
};
jobsdb.countInvoice = (postData) => {
    return new Promise((resolve, reject) => {
        pool.query('SELECT COUNT(id) AS counter FROM invoice_data', [postData], (err, results) => {
            if (err) {
                return reject(err);
            }

            return resolve(results[0]);
        });
    });
};
jobsdb.deleteInvoiceItem = (postData) => {
    return new Promise((resolve, reject) => {
        pool.query('DELETE FROM invoice_items WHERE invoiceId = ?', [postData], (err, results) => {
            if (err) {
                return reject(err);
            }

            return resolve(results);
        });
    });
};
jobsdb.AdminViewInvoices = () => {
    return new Promise((resolve, reject) => {
        pool.query(`
        SELECT 
        company.*,
        invoice_data.*
         FROM invoice_data 
         JOIN company ON invoice_data.companyId = company.companyId
        `, [], (err, results) => {
            if (err) {
                return reject(err);
            }

            return resolve(results);
        });
    });
};

module.exports = jobsdb;
