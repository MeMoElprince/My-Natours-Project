const dotenv = require('dotenv');
const catchAsync = require('./utils/catchAsync');

dotenv.config({ path: './config.env' });

process.on('uncaughtException', err => {
  console.log('UNHANDLED REJECTION');
  console.log(err.name, err.message);
    process.exit(1);

});
  
const mongoose = require('mongoose');

const db = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD).replace('<DBNAME>', process.env.DATABASE_NAME).replace('<USERNAME>', process.env.DATABASE_USERNAME);

(async () => {
  try{
    console.log('Trying to connect to the DB.....');
    await mongoose.connect(db);
    console.log('DB connection successful!');
  } catch(err)
  {
    console.log(err.name, err.message);
  }
})();

const app = require('./app');

const port = process.env.PORT || 1500;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

process.on('unhandledRejection', err => {
  console.log('UNHANDLED REJECTION');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

