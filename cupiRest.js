// If using Self-Signed CERT on Endpoints do this...
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
const axios = require("axios");

let source = axios.CancelToken.source();
setTimeout(() => {
  source.cancel();
  // Timeout Logic
}, 180000);

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
      url: url,
      cancelToken: source.token,
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
