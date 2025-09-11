const axios = require('axios');
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 60, checkperiod: 120 }); // Cache for 60 seconds

// Function to make GET or POST API call

const fetchFromAPI = (url, method = 'GET', data = {}, params = {}, headers = {}) => {
  return new Promise(async (resolve, reject) => {
    try {

      // Create a cache key based on the URL, method, params, and data for POST requests
      const cacheKey = `${url}_${method}_${JSON.stringify(params)}_${JSON.stringify(data)}`;
      
      // Check if the response is cached
      const cachedResponse = cache.get(cacheKey);
      if (cachedResponse) {
        return resolve(cachedResponse); // Resolve the cached response
      }
      // Configure the API request
      const config = {
        method,
        url,
        params, // For GET request query parameters
        data,   // For POST request body
        headers
      };

      // Make the API call
      const response = await axios(config);
      
      // Check if the response has the `variations` property in `response.data.content`
      if (response.data && response.data.content && response.data.content.hasOwnProperty('variations')) {
        // Cache the response if it has the `variations` property
        cache.set(cacheKey, response.data);
      }

      // Resolve the promise with the response data
      resolve(response.data);
    } catch (error) {
      console.error('API call error:', error);
      // Reject the promise with a more descriptive error message
      reject(new Error(`Failed to fetch data from API: ${error.message}`, url));
    }
  });
};


module.exports = fetchFromAPI ;
