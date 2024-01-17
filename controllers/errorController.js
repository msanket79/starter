const AppError = require('../utils/appError');
//send errors--------------------------------------------
const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    error: err,
    stack: err.stack,
  });
};
const sendErrorProduction = (err, res) => {
  //operational error,trusted error:send message to client(sent by us appError we created an isOperational)
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }
  // Programming unkown error :dont leak the error details
  else {
    //also log to the console
    console.log(err);
    //send a generaic error message

    res.status(500).json({
      status: 'error',
      message: 'something went very wrong!',
    });
  }
};
//handle errors -----------------------
function handleCastError(error) {
  const message = `Invalid ${error.path}:${error.value}`;
  const err = new AppError(message, 400);
  return err;
}
function handleDuplicateError(error) {
  const message = `Duplicate field value:${error.keyValue.name} Please use another value`;
  return new AppError(message, 400);
}
const handleValidationErrorDB = (error) => {
  const errors = Object.values(error.errors).map((el) => el.message);

  const message = `Invalid Input data ${errors.join('. ')}`;
  return new AppError(message, 400);
};
const handleJWTError = (error) =>
  new AppError('Invalid token Plesae log in again!', 401);

const handleJWTExpiredError = (error) =>
  new AppError('Your token expired Please login again!', 401);
module.exports = (err, req, res, next) => {
  //default status code
  err.statusCode = err.statusCode || 500; //internal server error
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else {
    //we have to handle the 3 types of differnt errors in production
    //so we will create functions and these functions will return new App errors and we will respond to client
    let error = JSON.parse(JSON.stringify(err));
    //1- cast failed (mongo accepts 12byte id) and if we send something gibberish and it connot cast it into OnjectId it will throw cast error
    if (error.name === 'CastError') error = handleCastError(error);
    if (error.code === 11000) error = handleDuplicateError(error);
    if (error.name === 'ValidationError')
      error = handleValidationErrorDB(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError(error);
    if (error.name === 'TokenExpiredError')
      error = handleJWTExpiredError(error);
    sendErrorProduction(error, res);
  }
};
