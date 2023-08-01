const Crypto = require("crypto");
const dotenv = require("dotenv");
const uuidV4 = require('uuid');
dotenv.config({ path: "./config/config.env" });
module.exports = {

  Token: (size) => {
    return Crypto.randomBytes(size).toString("base64").slice(0, size);
  },

  list_to_tree: (list) => {
    var map = {},
      node,
      roots = [],
      i;

    for (i = 0; i < list.length; i += 1) {
      map[list[i].id] = i; // initialize the map
      list[i].children = []; // initialize the children
    }

    for (i = 0; i < list.length; i += 1) {
      node = list[i];
      if (node.baseId !== "0") {
        // if you have dangling branches check that map[node.baseId] exists
        list[map[node.baseId]]?.children.push(node);
      } else {
        roots.push(node);
      }
    }
    return roots;
  },
  getUniqueListBy(arr, key) {
    return [...new Map(arr.map((item) => [item[key], item])).values()];
  },
  prePareQuestionOptions(qOption, questionId) {
    let arrayqOptionObj = qOption.map(item => {
      return { questionId, ...item };
    });

    let sqlOptionValues = arrayqOptionObj.map(obj => Object.values(obj));
    return sqlOptionValues
  },
  prePareLocations(jobLocation, jobId) {
    let arrayObj = jobLocation.map(item => {
      return { jobId, ...item };
    });
    let sqlValues = arrayObj.map(obj => Object.values(obj));
    return sqlValues
  },
  spreadLocations(jobLocation){
    return jobLocation.map((item) => { return item.locationName }).join(',')
  }
  

};
