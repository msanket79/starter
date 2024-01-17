const jwt = require('jsonwebtoken');
const util = require('util');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/email');
const crypto = require('crypto');

const signToken = function (id) {
  console.log(id);
  return jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};
const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000,
    ),
    // secure: true, //cookie will only be sent on https
    httpOnly: true, //cannot be modified by browser in any way
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
  res.cookie('jwt', token, cookieOptions);
  //remove password from output
  user.password = undefined;
  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};
exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create(req.body);
  //token creation usgin the id and the secret key and expiration time
  createSendToken(newUser, 200, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  //check if and password exist
  if (!email || !password)
    return next(new AppError('please provide email and password!', 400));

  //check if user exist and password is correct
  //we do this select +password because password is hidden in the db
  const user = await User.findOne({ email: email }).select('+password');
  //this will return true or false;
  if (!user || !(await user.correctPassword(password, user.password)))
    return next(new AppError('Incorrect email or password', 401));
  // console.log(user);
  //3 if everything ok send token to client
  createSendToken(user, 200, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  //get the token and if it exists
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    return next(
      new AppError('You are not logged in! Please log in to access!', 401),
    );
  }
  //verification of the token
  const decoded = await util.promisify(jwt.verify)(
    token,
    process.env.JWT_SECRET,
  );

  //check if user still exists
  const user = await User.findById(decoded.id);
  if (!user)
    return next(
      new AppError(
        'The user belonging to this token does not exist anymore!',
        401,
      ),
    );
  //check if user changed password after the token was issued
  if (user.changedPasswordAfter(decoded.iat))
    return next(
      new AppError('User recently changed password! please login again', 401),
    );
  //grant access to protected route(issiko aage ke middlewares use karenge)
  req.user = user;
  next();
});

// ...roles kya karta hai saare arguments ko roles aray me daal deta hai
//waha we cannot pass arguments in middlewares so we will wrap a func outside and return the middleware function from that
exports.restrictTo =
  (...roles) =>
  (req, res, next) => {
    // if the current user role does not exist then do not allow
    if (!roles.includes(req.user.role))
      return next(
        new AppError('You do not have permission to perform this action', 403),
      );
    return next();
  };
exports.forgetPassword = catchAsync(async (req, res, next) => {
  //1 Get user based on email
  const user = await User.findOne({ email: req.body.email });
  if (!user) return next(new AppError('There is no email address', 404));

  //2 Generate Random reset token
  const resetToken = user.createPasswordResetToken();
  //here we updated resettoken in above function adn if we try to save it here we will get validation error please provide email and pass
  //so we turn the validation check of
  await user.save({ validateBeforeSave: false });
  //3 Send it to email
  const resetURL = `${req.protocol}://${req.get(
    'host',
  )}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Forget your pass? submit a patch request with ur new pass and confirm password to:${resetURL} If we didnt request then please ignore this message`;
  //here if error occurs we should not send it to global handling middleware but we have to reset the token
  try {
    await sendEmail({
      email: user.email,
      message: message,
      subject: 'your password reset token valid for 10minutes',
    });
    res.status(200).json({
      status: 'success',
      message: 'Token sent to Email',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(
      new AppError('There was an error sending email Try again later', 500),
    );
  }
});
exports.resetPassword = catchAsync(async (req, res, next) => {
  //1 get the user based on token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  //2 if token has not expired and user exists and token not expired
  if (!user) return next(new AppError('invalid token or it is expired', 400));
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  //3 update the changedPasswordAt field
  //4 log in theuser and send jwt
  createSendToken(user, 200, res);
});
//here findbyidandupdate will not work as intended because validators will not work and also pre save
exports.updatePassword = catchAsync(async (req, res, next) => {
  //1 get the user from the collection
  const user = await User.findById(req.user._id).select('+password');
  //2check if posted current password is correct
  // console.log(user);
  // console.log(req.body);
  if (!(await user.correctPassword(req.body.currentPassword, user.password)))
    return next(new AppError('Please enter a corrected password', 400));

  //3 if so update password
  user.password = req.body.newPassword;
  await user.save();
  //4 log in user and send jwt
  createSendToken(user, 200, res);
});
