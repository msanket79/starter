//1--- requiring things-------------------
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const xss = require('xss-clean');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');

//2--------making server socket--------------------------------------
const app = express();

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const globalErrorHandler = require('./controllers/errorController');
//Gloabal MIDDLE WARE--------------------------------------

//for best security practices(including headers)
app.use(helmet);

//rate limiting for same api
const limiter = rateLimit({
  max: 10, //max no of requests in time window
  windowM: 60 * 60 * 1000, //time of window
  message: 'Too many requests for this ip,please try again later in an hour!',
});
app.use('/api', limiter); //adds limiter to all the websites starting with /api

//body parser reading data from req.body
app.use(express.json({ limit: '10kb' }));

//Data Sanitization against Nosql query injection
app.use(mongoSanitize());

//data sanitization against xss attack
app.use(xss());

//prevents query parameter pollution  used when suppose url is sort=diration&sort=price this will create an array conating duration,price
//after using hpp it will only use the last one
app.use(hpp());

app.use(morgan('dev'));

//serving static files
app.use(express.static('./public'));

// app.use((req, res, next) => {
//   console.log(req.headers);
//   next();
// });

//routing---- for the defined routes
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

//all the routes are defined above so any request coming through will pass throh above all middlewares and then to router
//and middlewares inside the tourRouter,userRouter and after than this codes come here but if the code reaches this point means
//the url was handled above and is a wrong route so we pass that url (any kind '*) into middlware and return 404

//urls which are not handled before
app.all('*', (req, res, next) => {
  //   res.status(404).json({
  //     status: 'fail',
  //     message: `Can't find ${req.originalUrl} on the server`,
  //   });
  const err = new Error(`Can't find ${req.originalUrl} on the server`);
  err.status = 'fail';
  err.StatusCode = 404;
  next(err);
});

//Global Error handling-------------------------------
//----------------- NOTE -----------------------------------------
//if we pass anything in the next function then it is considered as error and all the middlewares are skipped and global error handling is executed
//my specifying 4 paramter function in app.use express automatically know it is error handle code
app.use(globalErrorHandler);

module.exports = app;
