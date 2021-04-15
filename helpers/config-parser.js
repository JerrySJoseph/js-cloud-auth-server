const fs = require("fs");

const rawData = fs.readFileSync("config.json");
const config = JSON.parse(rawData);

function getValue(name, defaultValue) {
  return config[name] == null || config[name].length < 1
    ? defaultValue
    : config[name];
}

module.exports = { getValue };
