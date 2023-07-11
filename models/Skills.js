const pool = require("../config/db");

let jobsdb = {};

jobsdb.all = (viewAction) => {
    return new Promise((resolve, reject) => {
        let noDelsql = `SELECT m.fullName,c.*  FROM users m INNER JOIN skills c ON c.id = m.roleid AND m.deletedAt IS  NULL`
        let Delsql = `SELECT m.fullName,c.*  FROM users m INNER JOIN skills c ON c.id = m.roleid AND m.deletedAt IS NOT NULL`
        let allsql = `SELECT m.fullName,c.*  FROM users m INNER JOIN skills c ON c.id = m.roleid`

        pool.query(viewAction === 'notdeleted' ? noDelsql : viewAction === 'deleted' ? Delsql : allsql, (err, results) => {
            if (err) {
                return reject(err);
            }
            var rec = JSON.parse(JSON.stringify(results));

            return resolve(results);
        });
    });
};



module.exports = jobsdb;
