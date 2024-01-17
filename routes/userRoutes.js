const express = require('express');

const userController = require(`../controllers/userController`);
const authController = require('../controllers/authController');

const userRouter = express.Router();

userRouter.route('/signup').post(authController.signup);
userRouter
  .route('/updateMe')
  .patch(authController.protect, userController.updateMe);
userRouter
  .route('/deleteMe')
  .delete(authController.protect, userController.deleteMe);
userRouter
  .route('/updateMyPassword')
  .patch(authController.protect, authController.updatePassword);
userRouter.route('/login').post(authController.login);
userRouter.route('/forgetPassword').post(authController.forgetPassword);
userRouter.route('/resetPassword/:token').patch(authController.resetPassword);
userRouter
  .route('/updatePassword')
  .patch(authController.protect, authController.updatePassword);
userRouter
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);
userRouter
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);
module.exports = userRouter;
