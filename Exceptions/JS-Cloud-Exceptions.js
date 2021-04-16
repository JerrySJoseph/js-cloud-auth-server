function NoAppSignaturesFound(message) {
  const error = new Error(message);
  error.name = "No App registered";
  error.code = 101;
  return error;
}

NoAppSignaturesFound.prototype = Object.create(Error.prototype);

function GoogleClientIDNotFound(message) {
  const error = new Error(message);
  error.name = "No Google Client ID found.";
  error.code = 102;
  return error;
}

GoogleClientIDNotFound.prototype = Object.create(Error.prototype);

module.exports = { NoAppSignaturesFound, GoogleClientIDNotFound };
