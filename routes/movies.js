const MovieRouter = require('express').Router();
const { getMovies, createMovie, deleteMovie } = require('../controllers/movies');
const { validateCreateMovie, validateDeleteMovie } = require('../middlewares/validation');

MovieRouter.post('', validateCreateMovie, createMovie); // Создание фильма
MovieRouter.get('', getMovies); // Загрузка всех сохраненных фильмов
MovieRouter.delete('/:movieId', validateDeleteMovie, deleteMovie); // Удаление сохраненного фильма

module.exports = MovieRouter;
