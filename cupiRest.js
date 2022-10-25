require("dotenv").config();
const axios = require("axios");

module.exports = {
  fetchRest: function (server, user, pass, method, contentType, url, data) {
    const token = Buffer.from(`${user}:${pass}`, "utf8").toString("base64");
    const options = {
      baseURL: `https:\\\\${server}`,
      method: method,
      withCredentials: true,
      headers: {
        Accept: "application/json",
        "Content-Type": contentType,
        Authorization: `Basic ${token}`,
      },
      ...(data ? { data: data } : {}),
      url: url
    };

    return new Promise(function (resolve, reject) {
      axios(options)
        .then(function (response) {
          response.data ? resolve(response.data) : resolve(response.status);
        })
        .catch(function (error) {
          reject(error);
        });
    });
  },
};
