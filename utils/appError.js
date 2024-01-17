class AppError extends Error {
  constructor(message, statusCode) {
    super(message); //in order to call the parent constructer
    this.statusCode = 400;
    statusCode = '' + statusCode;
    this.status = `${statusCode.startsWith('4') ? 'fail' : 'error'}`;
    //beacuse we will handle operational errors with this
    this.isOperational = true;
    //when new error is created and this app error will be called then error constructer will not run in capturestackTrace
    //so we have to pass the current object and the constructer
    // console.log('hello ' + this.statusCode);
    Error.captureStackTrace(this, this.constructor);
  }
}
module.exports = AppError;
