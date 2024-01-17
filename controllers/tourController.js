const Tour = require('../models/tourModel');
const APIfeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.topTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = 'price,-ratingsAverage';
  req.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

exports.getAllTours = catchAsync(async (req, res, next) => {
  //look for this in utils folder
  const features = new APIfeatures(Tour.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const tours = await features.query;
  //const tours = await Tour.find().where('duration').equals(5).where(difficulty).equals('easy')
  res.status(200).json({
    status: 'success',
    results: tours.length, //optional can be send to represent amount of data in the data
    data: {
      tours: tours,
    },
  });
});

//we will wrap of function into CatchAsync and do error handling there
exports.createTour = catchAsync(async (req, res, next) => {
  // const newTour=new Tour({})
  // newTour.save()

  const newTour = await Tour.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      tour: newTour,
    },
  });
});
exports.getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.id);
  // //Tour.findOne({_id:req.params.id})
  if (!tour) {
    return next(new AppError('this tour does not exist', '404'));
  }

  res.status(200).json({
    status: 'success',
    data: {
      tour: tour,
    },
  });
});
exports.updateTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true, //now it will return the updated document
    runValidators: true, //it will run the validators again
  });
  if (!tour) {
    return next(new AppError('this tour does not exist', '404'));
  }
  res.status(200).json({
    status: 'success',
    data: {
      tour: tour,
    },
  });
});
exports.deleteTour = catchAsync(async (req, res, next) => {
  //find the object by id and delete
  const tour = await Tour.findByIdAndDelete(req.params.id);
  if (!tour) {
    return next(new AppError('this tour does not exist', '404'));
  }
  res.status(204).json({
    status: 'success',
    data: 'deleted successfully',
  });
});
// mongodb aggregation pipeline
// it is a framework for data aggregation where we can transform the data into aggregated form and it contains stages
//simliar to groupby in stl (average,sum,count,match,sort,group,unwind)
exports.getTourStats = catchAsync(async (req, res) => {
  //array of stages are passed each stage is an object
  const stats = await Tour.aggregate([
    // stage one
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    //stage two
    {
      //this is the group by statement
      //_id is the property by whcih we can group if null then operations will be performed on complete data
      $group: {
        //_id:null  // for not grouping by
        _id: '$difficulty', //group by difficulty
        num: { $sum: 1 }, //for each document add 1
        avgRating: { $avg: '$ratingsAverage' },
        numRatings: { $sum: '$ratingsQuantity' }, //add each document rating quantity
        minPrice: { $min: '$price' },
      },
    },
    //stage 3 //now we sort the created documents(we group easy difficaulty together then medium etc)
    //here we can only use the properties above defined not othets
    {
      $sort: { $avgRating: 1 }, //1 for sorting into ascending
    },
    //we can also repeat stages
    // {
    //   $match: { _id: { $ne: 'EASY' } },
    // },
  ]);
  res.status(200).json({
    status: 'success',
    data: {
      stats: stats,
    },
  });
});

exports.monthly_plan = catchAsync(async (req, res) => {
  const year = req.params.year * 1;
  const stats = await Tour.aggregate([
    //unwind the data(extract the elements from the array and create seperate elemetns)
    {
      $unwind: '$startDates',
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: 'startDates' },
        num: { $sum: 1 },
        tours: { $push: 'name' }, //will push the names of the tours in the array
      },
    },
    {
      $project: {
        //setting to 0 will not not show the field
        _id: 0,
      },
    },
  ]);
  res.status(200).json({
    status: 'success',
    data: {
      stats: stats,
    },
  });
});
