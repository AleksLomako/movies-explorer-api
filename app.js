require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const cors = require('cors');
const { errors } = require('celebrate');
const handleError = require('./middlewares/handleError');
const limiter = require('./middlewares/rateLimiter');

const { PORT = 3000, DB_URL = 'mongodb://127.0.0.1:27017/bitfilmsdb' } = process.env;
const app = express();

app.use(cors());
app.use(helmet());
app.use(limiter);
app.use(express.json());

mongoose.connect(DB_URL, {
  //
});

app.use('/', require('./routes/index'));

app.use((errors()));
app.use(handleError);

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
