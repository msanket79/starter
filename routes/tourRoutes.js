const express = require('express');
const tourController = require('../controllers/tourController');
const authController = require('../controllers/authController');

const tourRouter = express.Router();
//reading the tours datas
///we can also write param middleware which will only run if a param is present
// tourRouter.param('id', tourController.checkId);
//creat a check body parameter if body does not cotinas name and price return 404
//send bad 400
//add it to post handler stack
// const middleware = (req, res, next) => {
//   if (!req.body.name || !req.body.price) {
//     return res.status(400).json({
//       status: 'fail',
//       message: 'price and name is absent',
//     });
//   }
//   next();
// };

//api aliasing -- alias api end points for popular page access
//like tours/top-5-cheap     is used for tours?limit=5&sort=price,ratingsAverage
//we will make a middleware for this route and will manipulate the query string of this route
tourRouter
  .route('/top-5-cheap')
  .get(tourController.topTours, tourController.getAllTours);

tourRouter.route('/tour-stats').get(tourController.getTourStats);
tourRouter.route('/monthly-plan/:year').get(tourController.monthly_plan);
tourRouter
  .route('/')
  .get(authController.protect, tourController.getAllTours)
  .post(tourController.createTour);
tourRouter
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.deleteTour,
  );

module.exports = tourRouter;
