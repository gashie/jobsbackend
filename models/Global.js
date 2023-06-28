const pool = require("../config/db");
const { prepareColumns } = require("../helper/global");
const { logger } = require("../logs/winston");

let jobsdb = {};


jobsdb.Create = (table,payload) => {
    let query = `INSERT INTO ?? SET ?`
    return new Promise((resolve, reject) => {
        pool.query(query, [table,payload], (err, results) => {
                if (err) {
                    logger.error(err);
                    return reject(err);
                }

                return resolve(results);
            });
    });
};




jobsdb.Update = (table,payload,param) => {
    let query = `UPDATE ?? SET ? WHERE ?? = ?`;
    
    return new Promise((resolve, reject) => {
        pool.query(query, [table,payload,param], (err, results) => {
            if (err) {
                logger.error(err);
                return reject(err);
            }

            return resolve(results);
        });
    });
};

module.exports = jobsdb