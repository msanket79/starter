const dotenv = require('dotenv');
const mongoose = require('mongoose');
const app = require('./app');
//environment variables
dotenv.config({ path: './config.env' });

//this is for uncaught errors(sync print(x))
process.on('uncaughtException', (err) => {
  console.log(err.name, err.message);
  console.log('uncaught exception shutting down');
  //we will not abrupptly close the server but will finsih all the reaminign requests and then close the server then node
  process.exit(1);
});

//connect to mongodb using the moongoose
const DB = process.env.DATABASE.replace(
  '<password>',
  process.env.DATABASE_PASSWORD,
);
mongoose
  .connect(DB, {
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('Database successfully connected');
  });

//start the server
const port = 3000;
const server = app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
//this is for unhandled rejections (exceptions,async)--------------------
//now lets handle the other errors which are not of express or mongo (all the unhandled exceptions)
//we will use event and event listener
process.on('unhandledRejection', (err) => {
  console.log(err.name, err.message);
  console.log('unhandled rejection shutting down');
  //we will not abrupptly close the server but will finsih all the reaminign requests and then close the server then node
  server.close(() => {
    process.exit(1);
  });
});
// //this is for uncaught errors(sync print(x))
// process.on('uncaughtException', (err) => {
//   console.log(err.name, err.message);
//   console.log('uncaught exception shutting down');
//   //we will not abrupptly close the server but will finsih all the reaminign requests and then close the server then node
//   server.close(() => {
//     process.exit(1);
//   });
// });
