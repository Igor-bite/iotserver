const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const indexRouter = require('./routes/index');
const api = require('./routes/api');

const app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/api', api);

app.get('/hello', (req, res) => {
  res.send('Hello, Matthew!');
});

const { spawn } = require('child_process');

app.get('/email_me', (req, res) => {
  const sendEmail = spawn('python3', ['send_email.py']);
  res.send('Done');
});

app.get('/polina', (req, res) => {
  res.send('Hello, Polina!');
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

let port = 5555;
app.listen(port, () => console.log('Running on PORT: http://localhost:' + port));


