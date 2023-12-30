const { mongoose } = require('mongoose');
const Movie = require('../models/movie');

const NotFoundError = require('../errors/NotFoundError');
const BadRequestError = require('../errors/BadRequestError');
const ForbiddenError = require('../errors/ForbiddenError');

// Создание фильма
const createMovie = (req, res, next) => {
  const {
    country,
    director,
    duration,
    year,
    description,
    image,
    trailerLink,
    thumbnail,
    movieId,
    nameRU,
    nameEN,
  } = req.body;
  const owner = req.user._id;
  Movie.create({
    country,
    director,
    duration,
    year,
    description,
    image,
    trailerLink,
    thumbnail,
    movieId,
    nameRU,
    nameEN,
    owner,
  })
    .then((movie) => res.status(201).send(movie))
    .catch((error) => {
      if (error instanceof mongoose.Error.CastError) {
        return next(new BadRequestError('При создании фильма введены некорректные данные'));
      }
      return next(error);
    });
};

// Загрузка всех сохранённых текущим пользователем фильмов
const getMovies = (req, res, next) => {
  const owner = req.user._id;
  Movie.find({ owner })
    .then((movies) => res.send(movies))
    .catch(next);
};

// Удаление сохранённого фильма по id
const deleteMovie = (req, res, next) => {
  const { movieId } = req.params;
  Movie.findById(movieId)
    .orFail()
    .then((movie) => {
      if (movie.owner.toString() !== req.user._id) {
        throw new ForbiddenError('Не хватает прав для удаления фильма');
      } else {
        Movie.deleteOne(movie)
          .then(() => {
            res.send({ message: 'Фильм успешно удален' });
          })
          .catch(next);
      }
    })
    .catch((error) => {
      if (error instanceof mongoose.Error.DocumentNotFoundError) {
        return next(new NotFoundError('Не найден фильм с таким id'));
      }
      if (error instanceof mongoose.Error.CastError) {
        return next(new BadRequestError('Передан некорректный id'));
      }
      return next(error);
    });
};

module.exports = {
  getMovies, createMovie, deleteMovie,
};
