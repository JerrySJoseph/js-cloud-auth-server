const userStore = require("../data-access/profile/user-store");
const tokenStore = require("../data-access/token/token-store");

function revokeAccessByID(id) {
  return tokenStore.singOut(id);
}

module.exports = { revokeAccessByID };
