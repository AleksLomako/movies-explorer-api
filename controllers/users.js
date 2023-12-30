const { mongoose } = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const NotFoundError = require('../errors/NotFoundError');
const BadRequestError = require('../errors/BadRequestError');
const ConflictError = require('../errors/ConflictError');

const { NODE_ENV, JWT_SECRET } = process.env;

// Регистрация пользователя
const createUser = (req, res, next) => {
  const { name, email, password } = req.body;
  bcrypt.hash(password, 10)
    .then((hash) => User.create({
      name,
      email,
      password: hash,
    }))
    .then((user) => {
      res.status(201).send({
        name: user.name,
        email: user.email,
      });
    })
    .catch((error) => {
      if (error.code === 11000) {
        return next(new ConflictError('Пользователь с таким email уже существует'));
      }
      if (error instanceof mongoose.Error.CastError) {
        return next(new BadRequestError('При регистрации пользователя произошла ошибка'));
      }
      return next(error);
    });
};

// Аутентификация пользователя
const loginUser = (req, res, next) => {
  const { email, password } = req.body;
  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret', { expiresIn: '7d' });
      res.send({ token });
    })
    .catch(next);
};

// Получение информации о текущем пользователе
const getCurrentUser = (req, res, next) => {
  User.findById(req.user._id)
    .orFail()
    .then((user) => res.status(200).send({ user }))
    .catch((error) => {
      if (error instanceof mongoose.Error.DocumentNotFoundError) {
        return next(new NotFoundError('Не найден пользователь с таким id'));
      }
      return next(error);
    });
};

// Обновление информации профиля
const updateUserInfo = (req, res, next) => {
  const { name, email } = req.body;
  User.findByIdAndUpdate(req.user._id, { name, email }, { new: true, runValidators: true })
    .orFail()
    .then((user) => res.send(user))
    .catch((error) => {
      if (error instanceof mongoose.Error.DocumentNotFoundError) {
        return next(new NotFoundError('Не найден пользователь с таким id'));
      }
      if (error instanceof mongoose.Error.CastError) {
        return next(new BadRequestError('При обновлении пользователя произошла ошибка'));
      }
      if (error.code === 11000) {
        return next(new ConflictError('Пользователь с таким email уже существует'));
      }
      return next(error);
    });
};

module.exports = {
  createUser,
  loginUser,
  getCurrentUser,
  updateUserInfo,
};
