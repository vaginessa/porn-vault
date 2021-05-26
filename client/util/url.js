module.exports = {
  getUrl(route, isServer) {
    return isServer ? `http://localhost:3000${route}` : route;
  },
};
