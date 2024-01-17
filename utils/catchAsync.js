//we will pass a function as a parameter to this function and this func will return return another function which call the passed function fn and we will also do the catching of errors

// eslint-disable-next-line arrow-body-style
const CatchAsyncError = (fn) => {
  return (req, res, next) => {
    //now this fn will be an async function which will return a promise so we can catch the errors here in the function
    fn(req, res, next).catch((err) => next(err)); //in case of errors an err object will be returned and we will pass that error object to next
  };
};
module.exports = CatchAsyncError;
