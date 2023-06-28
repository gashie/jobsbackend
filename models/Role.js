const pool = require("../config/db");

let jobsdb = {};

jobsdb.all = () => {
  return new Promise((resolve, reject) => {
    const sql = "SELECT * FROM role WHERE status = 1 AND deletedAt IS NULL";
    pool.query(sql, function (error, results, fields) {
      if (error) {
        return reject(error);
      }
      return resolve(results);
    });
  });
};

jobsdb.allshow = () => {
  return new Promise((resolve, reject) => {
    const sql = "SELECT * FROM role";
    pool.query(sql, function (error, results, fields) {
      if (error) {
        return reject(error);
      }
      return resolve(results);
    });
  });
};
//create role
jobsdb.create = (postData) => {
  return new Promise((resolve, reject) => {
    pool.query("INSERT INTO role SET ?", [postData], (err, results) => {
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
      "UPDATE role SET ? WHERE id = ?",
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
jobsdb.FindRole = (name) => {
  return new Promise((resolve, reject) => {
    const sql =
      "SELECT * FROM role WHERE title = ?";
    pool.query(sql, [name], function (error, results, fields) {
      if (error) {
        return reject(error);
      }
      return resolve(results[0]);
    });
  });
};
jobsdb.FindRoleID = (id) => {
    return new Promise((resolve, reject) => {
      const sql =
        "SELECT * FROM role WHERE id = ?";
      pool.query(sql, [id], function (error, results, fields) {
        if (error) {
          return reject(error);
        }
        return resolve(results[0]);
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

jobsdb.FindMenu = (id) => {
  return new Promise((resolve, reject) => {
    const sql =
      "SELECT * FROM menu WHERE id = ? AND status  = ?  AND deletedAt IS NULL";
    pool.query(sql, [id, "1"], function (error, results, fields) {
      if (error) {
        return reject(error);
      }
      return resolve(results[0]);
    });
  });
};

jobsdb.FindRoutes = () => {
  return new Promise((resolve, reject) => {
    const sql = "SELECT * FROM routes";
    pool.query(sql, function (error, results, fields) {
      if (error) {
        return reject(error);
      }
      return resolve(results[0]);
    });
  });
};

jobsdb.Delete = id => {
  return new Promise((resolve, reject) => {
    pool.query(
      "DELETE FROM role WHERE id = ?",
      [id],
      (err, results) => {
        if (err) {
          return reject(err);
        }
        return resolve(results);
      }
    );
  });
};
module.exports = jobsdb;
