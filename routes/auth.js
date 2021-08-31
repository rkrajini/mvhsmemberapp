const express = require('express');
const authController = require('../controllers/auth');

const router = express.Router();
          
router.post('/register', authController.register );

router.post('/login', authController.login );

router.post('/edituser/:id', authController.update);

router.get('/logout', authController.logout );



router.post('/edit', authController.edit );

router.post('/passworde', authController.passworde );

router.post('/search', authController.search);

router.post('/memberfile/:id', authController.uploadmemberfile);

router.post('/profilepic/:id', authController.profilepic);

router.post('/nomination/:id',authController.nominateSubmit);

router.post('/searchnominees',authController.searchnominees);


module.exports = router;