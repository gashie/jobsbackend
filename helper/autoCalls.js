const axios = require('axios')


const { processResponse } = require('./process');
module.exports = {
  ApiCall: async (url, method, auth, json,) => {

    try {
      const config = {
        method,
        url,
        credentials: 'include',
        data: JSON.stringify(json), //{s:'security',a:'basicdata'}
        headers: {
          'Content-Type': 'application/json', //TODO: Accept application/json
          'Authorization': `Bearer ${auth}`
        }
      };
      const resp = await axios(config);
      const { error, data } = processResponse(resp);
      if (error) return error;
      else return data;
    }
    catch (err) {
      console.log(err?.response)
      return err.code == "ECONNREFUSED" ? "api connection failed"
        : "ERR_BAD_REQUEST" ? err?.response?.data
          : err?.response?.data;
      //if api failed to connect  or any error

    }


  },


}