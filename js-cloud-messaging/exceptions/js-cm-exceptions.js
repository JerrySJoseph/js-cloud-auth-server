function NotificationBuilderError(message) {
  const error = new Error(message);
  error.name = "Notification Builder Error";
  error.code = 103;
  return error;
}

NotificationBuilderError.prototype = Object.create(Error.prototype);

module.exports = { NotificationBuilderError };
