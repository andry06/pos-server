const router = require('express').Router();
const authController = require('./controller');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

passport.use(new LocalStrategy({usernameField: 'email'}, authController.localStrategy));   // usernameField utk mengganti username ke email
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.get('/me', authController.me);
// router.get('/profile/:id', authController.show);

module.exports = router;

