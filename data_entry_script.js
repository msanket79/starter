const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Tour = require('./models/tourModel');

dotenv.config({ path: './config.env' });

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

const TourData = JSON.parse(
  fs.readFileSync('./dev-data/data/tours-simple.json'),
);
async function importData() {
  try {
    await Tour.create(TourData);
    console.log('data added');
    process.exit();
  } catch (err) {
    console.log(err);
  }
}
async function deleteData() {
  try {
    await Tour.deleteMany();
    console.log('delete all tours');
    process.exit();
  } catch (err) {
    console.log(err);
  }
}
if (process.argv[2] === '--import') {
  importData();
}
if (process.argv[2] === '--delete') {
  deleteData();
}
console.log(process.argv);
