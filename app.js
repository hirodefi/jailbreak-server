const express = require('express');
const path = require('path');
const cors = require('cors');
const { ErrorBody } = require("./utils");
require("dotenv").config();
const { mongoDBConection, logger } = require('./configs');

require("./events");



const app = express();


// Configure mongo connection
mongoDBConection.connect();


app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: false }));


app.use(express.static(path.join(__dirname, 'public')));


require("./routes")(app);

require("./cronJobs/schedulers");



// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(new ErrorBody(404, "Not Found", []));
});

// error handler
app.use(function (err, req, res, next) {

  logger.warn("Error Start ================>");
  logger.error(`\nError: ${err.message}\nStack: ${err.stack}\n`);
  logger.warn("Error End ==================>");

  // render the error page
  res.status(err.status || 500);
  res.setHeader('Content-Type', 'application/json');
  res.json({ message: err.message || "Internal Server Error", error: true, errors: err.errors || [] });
});

module.exports = app;
