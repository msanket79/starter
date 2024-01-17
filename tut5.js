//environment variables
//they are mainly to types of environment but bigger companies may use some others also
//development and production(by deafult devlopment environment is set in express)
// Enivonment varibles are global varibles (set by express also by nodejs)

//NODE_ENV is a important env_varibale which tells us if our server is in development or product
//we have to set it intially it is not set
// to set it----
//  $env:NODE_ENV="development"; nodemon server.js

// now lets save the env varibales in file create a env file config.env (any name is okay)
//now save vaiables there
//install npm i dotenv
// require in server.js
// dotenv.config({path:'./config.env'}) done
//env variables are on process but not a js file

// Mongo db is a no sql database
//there are collections in monodb which are similar to tables in sql
//there are documents in mongodb which are similar to rows in sql
//Features of mongodb
//document oriented
//scalable
//flexible
//high performance
//Mongodb uses BSON(Binary JSON) format to store data(like json but it also has types like string, int, etc)
//mogobd allows multiple values for a key
//Embedding --> including one document inside another document(denoormalization)
//size for each dodument is 16mb

// Lets connect to mongodb using mongoose
//go to atlas and get the connection string or local mongodb connection string
//install  mongoose using npm install mongoose
//require mongoose
//connect to mongodb using mongoose.connect()

//Mongoose is a object data modeling(oDM) library fir mongodb and nodejs
//Mongoose  schemna--where we model our data by describing structure of the data

//tour schema are creating using mongoose.schema (it is just a blueprint)
// const tourSchema = new mongoose.Schema({
//   //object is passed as parameter we can also set some additional properties on object like required,unique
//   name: {
//     type: String,
//     required: [true, 'A tour must have a name'], //this will throw the string if name is absent
//     unique: true, //it will throw an error if name is not present
//   },
//   rating: {
//     type: Number,
//     default: 4.5, //if the rating is not there default rating will be set to 4.5
//   },
//   price: {
//     type: Number,
//     required: [true, 'A tour must have price'],
//   },
// });

//Now using the created schema we can create the model by passing the model name and schema as parameters
//using convention the model name is always starts with capital letter
// const Tour = moongose.model('Tour', tourSchema);
//
//create a new document using the model tour
// const testTour = new Tour({
//   name: 'The Park Camper',
//   price: 997,
// });
//save this will save the document to database( and will return the promise and returns the document from the database)

// testTour
//   .save()
//   .then((doc) => {
//     console.log(doc);
//   })
//   .catch((err) => {
//     console.log(err);
//   });

// MVC architecture
// MVC--Model View Controller
// Model--data layer (contains the data and the logic to manipulate the data)
// View--presentation layer (contains the templates frontends)
// Controller--business logic layer (contains the logic of the application)(application logic)

//Application logic-->
// code is only concerned about application implementation
//ex showing the data to user,selling the product,etc
//Business logic-->
// code is concerned about the business logic of the application
//ex calculating the profit,creating new tour,validatig user input,ensuring only admin can delete the tour,etc
//Fat models and thin controllers
//fat models--models contain the business logic
//thin controllers--controllers only contain the application logic

//query filtering
// https://api/v1/tours?difficulty=9&rating=3
// difficuty=9&rating=3 is a query string
//express handles the query strings

// exports.getAllTours = async (req, res) => {
//   try {
//     //1- Filtering----------------------------------
//     //simply we can pass the query string in the find function but as we go ahead query string may contain page=3(pagination),sort=true(sorting)
//     //so we have to exclude the special fields from the query string otherwise it will return empty documents
//     //because no document where duration=5&page=2
//     //lets make a hard copy of the query string and remove the special fields
//     const queryobj = { ...req.query }; // ... will destructure the object and {} will recreate the object
//     const excluedFileds = ['page', 'sort', 'limit', 'fields'];
//     excluedFileds.forEach((el) => delete queryobj[el]);

//     //2-- advance filtering---------------------
//     //for gte,lte we use different type of filtering
//     // duration[gte]=5&name=sanket //query string
//     // {duration:{gte:4},name:sanket} //how it is apprears in js
//     let querStr = JSON.stringify(queryobj);
//     // replace gte,gt,lte,lt
//     querStr = querStr.replace(
//       /\b(gte|gt|lt|lte)\b/g,
//       (match) => `$${match}`,
//       // /g ensures all strings are replaced not the first one only //we provided the regular expression
//     );
//     let query = Tour.find(JSON.parse(querStr));

//     //3- sorting karna hai ab
//     //sort=price ,sort=-price ,sort=price,rating,difficulty
//     if (req.query.sort) {
//       let sortBy = req.query.sort; //for single sort value
//       sortBy = sortBy.split(',').join(' '); //becasuse query.sort('price rating') takes a single aggument string space seperated values
//       query = query.sort(sortBy);
//     }
//     //4 -Field limiting
//     //if the bandwith of the client is less he can limit the number of fields he want
//     //selecting certain fields from all the fields is projecting
//     if (req.query.fields) {
//       let fields = req.query.fields;
//       fields = fields.split(',').join(' ');
//       query = query.select(fields);
//     } else {
//       query = query.select('-__v'); //this exclude the field "-price"
//     }
//     //5 -Pagination page=2 with limit=50
//     // ?page=2&limit=50
//     const page = req.query.page * 1 || 1; //get page from query or default 1
//     const limit = req.query.limit * 1 || 100; //get limit from query or default 100
//     const skip = (page - 1) * limit; //
//     query = query.skip(skip).limit(limit); //skip is number of results before start of the required page and limit is no of objects in a page

//     if (req.query.page) {
//       const numOfTours = await Tour.countDocuments();
//       if (skip >= numOfTours) throw new Error('the page does not exist');
//     }
//     const tours = await query;
//     //const tours = await Tour.find().where('duration').equals(5).where(difficulty).equals('easy')
//     res.status(200).json({
//       status: 'success',
//       results: tours.length, //optional can be send to represent amount of data in the data
//       data: {
//         tours: tours,
//       },
//     });
//   } catch (err) {
//     res.status(400).json({
//       status: 'fail',
//       message: err,
//     });
//   }
// };

//Mongodb aggregation pipeline
// mongodb aggregation pipeline
// it is a framework for data aggregation where we can transform the data into aggregated form and it contains stages
//simliar to groupby in stl (average,sum,count,match,sort,group,unwind)
exports.getTourStats = async (req, res) => {
  try {
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
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.monthly_plan = async (req, res) => {
  try {
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
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};

//check tourmodel-----------------------------------------------------------------------
