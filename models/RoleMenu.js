const pool = require("../config/db");

let jobsdb = {};

jobsdb.all = () => {
  return new Promise((resolve, reject) => {
    const sql = "SELECT DISTINCT * FROM rolemenu WHERE status = 1 AND deletedAt IS NULL GROUP BY roleid";
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
    const sql = "SELECT DISTINCT * FROM rolemenu WHERE deletedAt IS NULL GROUP BY roleid";
    pool.query(sql, function (error, results, fields) {
      if (error) {
        return reject(error);
      }
      return resolve(results);
    });
  });
};

jobsdb.rolemenusnodistinct = (roleid) => {
    return new Promise((resolve, reject) => {
      const sql = "SELECT m.menuid,c.title FROM rolemenu m INNER JOIN menu c ON c.id = m.menuid WHERE m.status = 1 AND m.deletedAt IS NULL AND m.roleid = ?";
      pool.query(sql,[roleid], function (error, results, fields) {
        if (error) {
          return reject(error);
        }
        return resolve(results);
      });
    });
  };

  jobsdb.rolemenusnodistinctshowall = (roleid) => {
    return new Promise((resolve, reject) => {
      const sql = "SELECT m.id AS rolemenuid,m.status AS rolemenustatus, m.menuid,c.title FROM rolemenu m INNER JOIN menu c ON c.id = m.menuid WHERE  m.deletedAt IS NULL AND m.roleid = ?";
      pool.query(sql,[roleid], function (error, results, fields) {
        if (error) {
          return reject(error);
        }
        return resolve(results);
      });
    });
  };
//create rolemenu
jobsdb.create = (postData) => {
  return new Promise((resolve, reject) => {
    pool.query("INSERT INTO rolemenu SET ?", [postData], (err, results) => {
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
      "UPDATE rolemenu SET ? WHERE id = ?",
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

jobsdb.FindRoleID = (id) => {
    return new Promise((resolve, reject) => {
      const sql =
        "SELECT * FROM rolemenu WHERE id = ?";
      pool.query(sql, [id], function (error, results, fields) {
        if (error) {
          return reject(error);
        }
        return resolve(results[0]);
      });
    });
  };

  jobsdb.FindRoleMenuID = (id) => {
    return new Promise((resolve, reject) => {
      const sql =
        "SELECT * FROM rolemenu WHERE roleid = ?";
      pool.query(sql, [id], function (error, results, fields) {
        if (error) {
          return reject(error);
        }
        return resolve(results[0]);
      });
    });
  };

  jobsdb.FindRoleMenu = (roleid,menuid) => {
    return new Promise((resolve, reject) => {
      const sql =
        "SELECT * FROM rolemenu WHERE roleid = ? AND menuid  = ?";
      pool.query(sql, [roleid, menuid], function (error, results, fields) {
        if (error) {
          return reject(error);
        }
        return resolve(results[0]);
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
      "DELETE FROM rolemenu WHERE id = ?",
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
