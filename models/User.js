const pool = require("../config/db");

let jobsdb = {};

jobsdb.all = (viewAction) => {
  return new Promise((resolve, reject) => {
    let noDelsql = `SELECT m.userId,m.fullName,m.username,m.email,m.phone,m.address,m.country,m.gender,m.maritalStatus,m.userType,m.status,m.createdAt,m.birthDate,m.highestEducation,c.title as roleTitle FROM users m INNER JOIN role c ON c.id = m.roleid AND m.deletedAt IS  NULL`
    let Delsql = `SELECT m.userId,m.fullName,m.username,m.email,m.phone,m.address,m.country,m.gender,m.maritalStatus,m.userType,m.status,m.createdAt,m.birthDate,m.highestEducation,c.title as roleTitle FROM users m INNER JOIN role c ON c.id = m.roleid AND m.deletedAt IS NOT NULL`
    let allsql = `SELECT m.userId,m.fullName,m.username,m.email,m.phone,m.address,m.country,m.gender,m.maritalStatus,m.userType,m.status,m.createdAt,m.birthDate,m.highestEducation,c.title as roleTitle FROM users m INNER JOIN role c ON c.id = m.roleid`

    pool.query(viewAction === 'notdeleted' ? noDelsql : viewAction === 'deleted' ? Delsql : allsql, (err, results) => {
      if (err) {
        return reject(err);
      }
      return resolve(results);
    });
  });
};



jobsdb.Create = (postData = req.body) => {
  return new Promise((resolve, reject) => {
    pool.query("INSERT INTO users SET ?", [postData], (err, results) => {
      if (err) {
        return reject(err);
      }

      return resolve(results);
    });
  });
};

jobsdb.ActivateUser = (status, email) => {
  return new Promise((resolve, reject) => {
    pool.query(
      "UPDATE users SET  status = ?  WHERE email = ?",
      [status, email],
      (err, results) => {
        if (err) {
          return reject(err);
        }
        return resolve(results);
      }
    );
  });
};

jobsdb.ActivateAccount = (email) => {
  return new Promise((resolve, reject) => {
    const sql = `SELECT userId,resetToken FROM users WHERE email = ? AND status= ? AND NOW() <= DATE_ADD(resetPeriod, INTERVAL 30 MINUTE)`;
    pool.query(sql, [email, 0], function (error, results, fields) {
      if (error) {
        return reject(error);
      }
      return resolve(results[0]);
    });
  });
};

jobsdb.ReActivateAccount = (email, status) => {
  return new Promise((resolve, reject) => {
    const sql = `SELECT userId,resetToken FROM users WHERE email = ? AND status= ?`;
    pool.query(sql, [email, status], function (error, results, fields) {
      if (error) {
        return reject(error);
      }
      return resolve(results[0]);
    });
  });
};

jobsdb.ActivateOrResetAccount = (email, status) => {
  return new Promise((resolve, reject) => {
    const sql = `SELECT userId,resetToken FROM users WHERE email = ? AND status= ? AND NOW() <= DATE_ADD(resetPeriod, INTERVAL 30 MINUTE)`;
    pool.query(sql, [email, status], function (error, results, fields) {
      if (error) {
        return reject(error);
      }
      return resolve(results[0]);
    });
  });
};

jobsdb.Authenticate = (username) => {
  return new Promise((resolve, reject) => {
    const sql =
      "SELECT m.*,c.title AS roleTitle FROM users m INNER JOIN role c ON c.id = m.roleid WHERE m.username = ? AND m.status = 1";
    pool.query(sql, [username], function (error, results, fields) {
      if (error) {
        return reject(error);
      }
      return resolve(results[0]);
    });
  });
};




jobsdb.SingleUser = (email) => {
  return new Promise((resolve, reject) => {
    const sql =
      "SELECT m.*,c.title AS roleTitle FROM users m INNER JOIN role c ON c.id = m.roleid WHERE  m.email = ?";
    pool.query(sql, [email], function (error, results, fields) {
      if (error) {
        return reject(error);
      }
      return resolve(results[0]);
    });
  });
};

jobsdb.UpdateUser = (postdata, id) => {
  return new Promise((resolve, reject) => {
    pool.query(
      "UPDATE users SET ? WHERE id = ?",
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

jobsdb.ViewRoles = () => {
  return new Promise((resolve, reject) => {
    pool.query(
      "SELECT name as label, code as value from sys_user_roles",
      (err, results) => {
        if (err) {
          return reject(err);
        }
        return resolve(results);
      }
    );
  });
};
jobsdb.ViewStatus = () => {
  return new Promise((resolve, reject) => {
    pool.query("SELECT * FROM sys_users_status", (err, results) => {
      if (err) {
        return reject(err);
      }
      return resolve(results);
    });
  });
};

jobsdb.FindRole = (id) => {
  return new Promise((resolve, reject) => {
    const sql =
      "SELECT * FROM role WHERE id = ? AND status  = ? AND deletedAt IS NULL";
    pool.query(sql, [id, "1"], function (error, results, fields) {
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

jobsdb.FindMe = (column, value) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT ?? FROM users WHERE ?? = ? ';
    pool.query(sql, [column, column, value], function (error, results, fields) {
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
      "DELETE FROM users WHERE id = ?",
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
