const pool = require("../config/db");

let jobsdb = {};

jobsdb.all = () => {
  return new Promise((resolve, reject) => {
    const sql = "SELECT * FROM menu WHERE  deletedAt IS NULL ORDER BY createdAt ASC";
    pool.query(sql, function (error, results, fields) {
      if (error) {
        return reject(error);
      }
      return resolve(results);
    });
  });
};
//create menu
jobsdb.create = (postData) => {
  return new Promise((resolve, reject) => {
    pool.query("INSERT INTO menu SET ?", [postData], (err, results) => {
      if (err) {
        throw err;
      }
      return resolve(results);
    });
  });
};

jobsdb.update = (postdata, id) => {
  return new Promise((resolve, reject) => {
    pool.query(
      "UPDATE menu SET ? WHERE id = ?",
      [postdata, id],
      (err, results) => {
        if (err) {
          return reject(err);
        }
        return resolve(results);
      }
    );
  });
};
jobsdb.FindMenu = (name) => {
  return new Promise((resolve, reject) => {
    const sql =
      "SELECT * FROM menu WHERE title = ?";
    pool.query(sql, [name], function (error, results, fields) {
      if (error) {
        return reject(error);
      }
      return resolve(results[0]);
    });
  });
};
jobsdb.FindMenuID = (id) => {
    return new Promise((resolve, reject) => {
      const sql =
        "SELECT * FROM menu WHERE id = ?";
      pool.query(sql, [id], function (error, results, fields) {
        if (error) {
          return reject(error);
        }
        return resolve(results[0]);
      });
    });
  };

  jobsdb.CountOrigin = (id) => {
    return new Promise((resolve, reject) => {
      const sql =
        "SELECT count(id) as total FROM menu WHERE originatorBaseId = ?";
      pool.query(sql, [id], function (error, results, fields) {
        if (error) {
          return reject(error);
        }
        return resolve(results[0]);
      });
    });
  };

  jobsdb.FindBaseMenuID = (id) => {
    return new Promise((resolve, reject) => {
      const sql =
        "SELECT * FROM menu WHERE id = ? AND isBaseId = 0";
      pool.query(sql, [id], function (error, results, fields) {
        if (error) {
          return reject(error);
        }
        return resolve(results[0]);
      });
    });
  };

  jobsdb.FindBulkMenuID = (id) => {
    return new Promise((resolve, reject) => {
      const sql =
        "SELECT * FROM menu WHERE id = ?";
      pool.query(sql, [id], function (error, results, fields) {
        if (error) {
          return reject(error);
        }
        return resolve(results);
      });
    });
  };

jobsdb.FindRoleMenu = (id) => {
  return new Promise((resolve, reject) => {
    const sql =
      "SELECT * FROM rolemenu WHERE roleid = ? AND status  = ? AND deletedAt IS NULL";
    pool.query(sql, [id, "1"], function (error, results, fields) {
      if (error) {
        return reject(error);
      }
      return resolve(results);
    });
  });
};

jobsdb.FindUserMenu = (user, access) => {
  return new Promise((resolve, reject) => {
    const sql =
      "SELECT DISTINCT menuid AS menu FROM usermenu WHERE userID = ? AND status  = ? AND accessType = ?  AND deletedAt IS NULL";
    pool.query(sql, [user, "1", access], function (error, results, fields) {
      if (error) {
        return reject(error);
      }
      return resolve(results);
    });
  });
};


module.exports = jobsdb;
