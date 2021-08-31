const express = require('express');
const authController = require('../controllers/auth');

const router = express.Router();

router.get('/', authController.isLoggedIn,authController.selectallrows, (req, res) => {

  if (req.admin){
    res.render('index',{
      
      rows:req.rows
    });
  }
  else if(req.user){
    res.redirect('/profile');
  }
  else{
  res.redirect('/login');
  }
  
  res.redirect('/login');
});

router.get('/register',authController.isLoggedIn, (req, res) => {
  console.log('harry')
  if (req.admin)
  {

    res.render('register');

  }

  else if (req.user)
  {
    res.redirect('/profile');
  }
  
  else{
    res.redirect('/login');

  }
  
});

router.get('/login', (req, res) => {
  console.log('in login');
  res.render('login');
});

router.get('/profile', authController.isLoggedIn, (req, res) => {
  
  if( req.user ) {
    res.render('profile', {
      user: req.user
    });
  } else {
    res.redirect('/login');
  }
  
})

router.get('/password', authController.isLoggedIn, (req, res) => {
  if (req.user)
  {res.render('password', {
    user: req.user
  });}

  else if (req.admin)
  {
    res.redirect('/');
  }
  else{
    res.redirect('/login');
  }
  
  

});

router.get('/edituser/:id', authController.edituser);

router.get('/delete/:id' , authController.removeUser);

router.get('/download/:id', authController.download);

router.get('/nomination',authController.isLoggedIn,authController.nomination);

router.get('/nomineetable',authController.nomineetable);

router.get('/nomineetable/approved',authController.nomineetableapp);

router.get('/nomineetable/rejected',authController.nomineetablerej);

router.get('/approvenominee/:id' , authController.approvenominee);

router.get('/rejectnominee/:id' , authController.rejectnominee);






module.exports = router;
