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

module.exports = jobsdb;
