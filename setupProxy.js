const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  app.use(
    "/login", //this is your api
    createProxyMiddleware({
      target: "https://stark-sands-89628.herokuapp.com/login", //this is your whole endpoint link
      changeOrigin: true,
    })
  );
};
