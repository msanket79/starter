//Error handling-----------------------------------
//npm i ndb --> node debugger use it check the package.json for script

// How to handle requests whose route is  not set in api?
//ans--> add a  middleware after all the request handlers finish means they were not able to return a response and the url comes here
//so we return a 404 bad request

// add this line after routers
//all the routes are defined above so any request coming through will pass throh above all middlewares and then to router
//and middlewares inside the tourRouter,userRouter and after than this codes come here but if the code reaches this point means
//the url was handled above and is a wrong route so we pass that url (any kind '*) into middlware and return 404

//urls which are not handled before
// app.all('*', (req, res, next) => {
//   res.status(404).json({
//     status: 'fail',
//     message: `Can't find ${req.originalUrl} on the server`,
//   });
// });

//THere are two types of errors------------->
//1- Operational Errors(Exceptions) --> invalid path accessed,database connection failure,failed to ci=onnect to server,request timeour
//2- Programming Error-->errors in programs caused by human exx--reading undefined varaibles,passing num instaead of object etc

//SO we will need a (central) Global error handling middleware where we can handle all the exceptions and seperate our programming logic and business logic and such that there is no need to handle error everywhere

//Global Error handling-------------------------------
//----------------- NOTE -----------------------------------------
//if we pass anything in the next function then it is considered as error and all the middlewares are skipped and global error handling is executed
//my specifying 4 paramter function in app.use express automatically know it is error handle code
// app.use(globalErrorHandler);

//now at this point we have created a global error handler and our custom error class which we will return in case of errors

//now lets remove the try catch block from all the async function(controllers) and only leave the url handling logic there
// for that we will wrap the contorllers in a function and will do error handling over the outer funtion

//error handling based on type of error in error controller (handlecasterror ,duplicate error)
//now lets handle the other errors which are not of express or mongo (all the unhandled exceptions)
