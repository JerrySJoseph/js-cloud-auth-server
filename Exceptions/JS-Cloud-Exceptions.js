function NoAppSignaturesFound(message) {
  const error = new Error(message);
  error.name = "No App registered";
  error.code = 101;
  return error;
}

NoAppSignaturesFound.prototype = Object.create(Error.prototype);

module.exports = { NoAppSignaturesFound };
