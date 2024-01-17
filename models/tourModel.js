const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      maxlength: [40, 'tour name must be less than = to40'],
      minlength: [10, 'tour name must be more than = to 10'],
      // validate: [validator.isAlpha,'contain other than alphabets'],
      trim: true, //it will trim the string before saving
    },
    duration: {
      type: Number,
      required: [true, 'a tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'a tour must have max gorup size'],
    },
    difficulty: {
      type: String,
      required: [true, 'it should have a difficulty rating'],
      enum: {
        values: ['easy', 'medium', 'difficulty'],
        message: 'difficulty is easy, medium or difficult',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'rating must be above 1'],
      max: [5, 'rating must be below 5'],
    },
    slug: String,
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A tour must have price'],
    },
    discount: {
      type: Number,
      // // val is entered value of the discount and we have to return true or false(this is the document)
      validate: {
        //validation function to check is discount is less than price
        validator: function (val) {
          //this only points to current doc on NEW document creation
          return val < this.price;
        },
        message: 'discount not be below price',
      },
    },
    summary: {
      type: String,
      required: [true, 'summary is required'],
      trim: true, //it will trim the string before saving
    },
    description: {
      type: String,
      trim: true,
    },

    imageCover: {
      type: String,
      required: [true, 'a tour must have image cover'],
    },
    images: [String], //array of strings
    createdAt: {
      type: Date,
      default: Date.now(), //returns the current data in miliseconds and then it is coverted to date by mongo
      select: false, //this is not send the createdAt filed
    },
    secretTour: {
      type: String,
      default: false,
    },
    startDates: [Date],
  },
  //we will passs a second object to the schema and we decribe if we ouput data toJSON we need virtuals true(now it will be visible in data)
  {
    toJSON: {
      virtuals: true,
    },
    toObject: {
      virtuals: true,
    },
  },
);

// now let's learn vvirtual properties // for the fields that can be derived from other fields
//we can define functions and these values do not need to be saved in database
//we cannot use virtual properties in queries

//example we have to calculate duration in weeks
tourSchema.virtual('durationWeeks').get(function () {
  //get means whenevre we get data durationWeeks will be calculated and  showed
  //here we used real fucntion and not anonymous function because we have to access this
  return this.duration / 7;
});

//Document middle wares----------------------------------------------
//mongodb have also middle wares which can run after or before events(also called pre and post hooks)
//can be used to made triggers

//will run before save() or create() not after insertmany
tourSchema.pre('save', function (next) {
  // //will print the document before saving the object
  // console.log(this);
  //now we will this mrthod to create a slug for the documents
  this.slug = slugify(this.name, { lower: true });
  next();
});
tourSchema.post('save', function (doc, next) {
  //we do not have this here but finisjed document doc
  console.log('post created');
});

//Query middleware--------------------------------
//only for find not for findOne,findOneAndDelete,etc
//we are using to only show tours which are not secret
// tourSchema.pre('find', function (next) {
//   //we will have access to the query object in this
//   this.find({ secretTour: { $ne: true } });
//   next();
// });
//use regular expression to call this middle ware for all find
tourSchema.pre(/^find/, function (next) {
  //we will have access to the query object in this
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();
  next();
});
//post has access to the objects returned and this
// tourSchema.post(/^find/, function (docs, next) {
//   console.log(`it took ${Date.now() - this.start}`);
//   // console.log(this);
//   next();
// });

//aggreagation middleware--------------------------------------------------------------
//to exclude the secret tours from the aggregation
tourSchema.pre('aggregate', function (next) {
  //this.pipeline() returns the pipeline array created by us in the aggregate method
  this.pipeline().unshift({ $match: { $secretTour: { $ne: true } } }); //this in the start
  next();
});

//abhi karenge validation for that go to schema------------------------

//install validator library it has lot of validators

const Tour = mongoose.model('Tour', tourSchema);
module.exports = Tour;
