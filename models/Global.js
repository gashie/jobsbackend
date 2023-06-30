const pool = require("../config/db");
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




jobsdb.Update = (table,payload,param,value) => {
    let query = `UPDATE ?? SET ? WHERE ?? = ?`;
    
    return new Promise((resolve, reject) => {
        pool.query(query, [table,payload,param,value], (err, results) => {
            if (err) {
                logger.error(err);
                return reject(err);
            }

            return resolve(results);
        });
    });
};


jobsdb.Find = (table,param,value) => {
    return new Promise((resolve, reject) => {
      const sql =
        "SELECT * FROM ?? WHERE ?? = ?";
      pool.query(sql, [table,param,value], function (error, results, fields) {
        if (error) {
          return reject(error);
        }
        return resolve(results[0]);
      });
    });
  };
module.exports = jobsdb