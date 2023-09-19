const pool = require("../config/db");
const { logger } = require("../logs/winston");

let jobsdb = {};

jobsdb.Create = (table, payload) => {
  let query = `INSERT INTO ?? SET ?`;
  return new Promise((resolve, reject) => {
    pool.query(query, [table, payload], (err, results) => {
      if (err) {
        logger.error(err);
        return reject(err);
      }

      return resolve(results);
    });
  });
};

jobsdb.Update = (table, payload, param, value) => {
  let query = `UPDATE ?? SET ? WHERE ?? = ?`;

  return new Promise((resolve, reject) => {
    pool.query(query, [table, payload, param, value], (err, results) => {
      if (err) {
        logger.error(err);
        return reject(err);
      }

      return resolve(results);
    });
  });
};

jobsdb.Find = (table, param, value) => {
  return new Promise((resolve, reject) => {
    const sql = "SELECT * FROM ?? WHERE ?? = ?";
    pool.query(sql, [table, param, value], function (error, results, fields) {
      if (error) {
        return reject(error);
      }
      return resolve(results[0]);
    });
  });
};
jobsdb.Findall = (table) => {
  return new Promise((resolve, reject) => {
    const sql = "SELECT * FROM ?? ";
    pool.query(sql, [table], function (error, results, fields) {
      if (error) {
        return reject(error);
      }
      return resolve(results[0]);
    });
  });
};
jobsdb.QueryDynamic = (tableName, columnsToSelect, conditions) => {
  return new Promise((resolve, reject) => {
    // Build the dynamic SQL query with the dynamic conditions
 // Build the dynamic SQL query with the dynamic conditions
// Build the dynamic SQL query with the dynamic conditions
const conditionClauses = conditions.map((conditionObj) => conditionObj.condition).join(' AND ');
const conditionValues = conditions.map((conditionObj) => conditionObj.value);

const sql = `SELECT ${columnsToSelect.join(', ')} FROM ${tableName} WHERE (${conditionClauses})`;

    pool.query(sql, [...conditionValues], function (error, results, fields) {
      if (error) {
        return reject(error);
      }
      return resolve(results[0]);
    });
  });
};

jobsdb.ViewWithAction = (table, showDelete) => {
  console.log(showDelete);
  return new Promise((resolve, reject) => {
    const sqlnodelete = "SELECT * FROM ?? WHERE deletedAt IS NULL ";
    const sqldelete = "SELECT * FROM ?? WHERE deletedAt IS NOT NULL";
    pool.query(
      showDelete === "deleted" ? sqldelete : sqlnodelete,
      [table],
      function (error, results, fields) {
        if (error) {
          return reject(error);
        }
        return resolve(results);
      }
    );
  });
};

jobsdb.ViewWithActionById = (table, showDelete, param, value) => {
  return new Promise((resolve, reject) => {
    const sqlnodeletewithid =
      "SELECT * FROM ?? WHERE ?? = ? AND deletedAt IS NULL";
    const sqldeletewithid =
      "SELECT * FROM ?? WHERE ?? = ? AND deletedAt IS NOT NULL";
    pool.query(
      showDelete ? sqldeletewithid : sqlnodeletewithid,
      [table, param, value],
      function (error, results, fields) {
        if (error) {
          return reject(error);
        }
        return resolve(results);
      }
    );
  });
};
module.exports = jobsdb;
