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


  makeApiCall: async (url, method = 'GET', headers = {}, requestData = null) => {
    const axios = require('axios');
    const FormData = require('form-data');
    /**
     * Dynamic function to make API calls with either JSON or FormData.
     * @param {string} url - The API endpoint URL.
     * @param {string} method - The HTTP method (e.g., 'GET', 'POST').
     * @param {object} headers - HTTP headers as key-value pairs.
     * @param {object|FormData} requestData - Request data, which can be JSON object or FormData.
     * @returns {Promise} - A promise that resolves with the response data or rejects with an error.
     */
    try {
      const config = {
        method,
        url,
        headers: {
          ...headers,
        },
      };

      if (requestData instanceof FormData) {
        // If requestData is FormData, set FormData in the request
        config.headers = {
          ...config.headers,
          ...requestData.getHeaders(),
        };
        config.data = requestData;
      } else {
        // If requestData is a JSON object, set it as the request data
        config.headers['Content-Type'] = 'application/json';
        config.data = JSON.stringify(requestData);
      }

      const response = await axios(config);

      return response.data;
    } catch (error) {
      throw error;
    }
  }






}