const UserRouter = require('express').Router();
const { getCurrentUser, updateUserInfo } = require('../controllers/users');
const { validateUpdateUserInfo } = require('../middlewares/validation');

UserRouter.get('/me', getCurrentUser); // Получение информации о текущем пользователе
UserRouter.patch('/me', validateUpdateUserInfo, updateUserInfo); // Обновление информации профиля

module.exports = UserRouter;
