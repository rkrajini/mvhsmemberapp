const mysql = require("mysql");
const fileUpload = require('express-fileupload');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { promisify } = require('util');

const db = mysql.createConnection({
  host: 'mydatabaseservice.mysql.database.azure.com',
  user: 'ganesha',
  password: 'G@nesh@3154',
  database: 'members'
});

exports.login = async (req, res) => {
  try {
    
    const { email, password } = req.body;
    
    console.log ("inside Login");
    
    if( !email || !password ) {
      return res.status(400).render('login', {
        message: 'Please provide an email and password'
      })
    }

    db.query('SELECT * FROM members WHERE email = ?', [email], async (error, results) => {
      
     console.log("DB Query executed");
      
      if( results.length<=0 || !(await bcrypt.compare(password, results[0].password_digest)) ) {
        res.status(401).render('login', {
          message: 'Email or Password is incorrect'
        })
      } else {
        const id = results[0].id;

        const token = jwt.sign({ id }, 'password', {
          expiresIn: '60d'
        });

        

        const cookieOptions = {
          expires: new Date(
            Date.now() + 60 * 24 * 60 * 60 * 1000
          ),
          httpOnly: true
        }

        res.cookie('jwt', token, cookieOptions );
        res.status(200).redirect("/");
      }

    })

  } catch (error) {
    console.log(error);
  }
}

exports.register = async (req, res) => {
  

  const { title,firstname,lastname, email, alternate_email, password, passwordConfirm,mobile,phone,DOB,membertype,memberno,datejoined,address1,address2,suburb,postcode,state,country,status,preferred_name } = req.body;

  db.query('SELECT email FROM members WHERE email = ?', [email], async (error, results) => {
    if(error) {
      console.log(error);
    }

    if( results.length > 0 ) {
      return res.render('register', {
        message: 'That email is already in use'
      })
    } else if( password !== passwordConfirm ) {
      return res.render('register', {
        message: 'Passwords do not match'
      });
    }

    let hashedPassword = await bcrypt.hash(password, 8);
    

    db.query('INSERT INTO members SET ?', {title:title,firstname: firstname,lastname:lastname, email: email,alternate_email:alternate_email, password_digest: hashedPassword,mobile:mobile,phone:phone,date_of_birth:DOB,membertype:membertype,member_no:memberno,date_joined:datejoined,address1:address1,address2:address2,suburb:suburb,postcode:postcode,state:state,country:country,status:status,preferred_name:preferred_name }, (error, results) => {
      if(error) {
        console.log(error);
      } else {
        
        return res.render('register', {
          message: 'User registered'
        });
      }
    })


  });

}

exports.selectallrows=async(req,res,next)=>{

  db.query("SELECT * FROM members WHERE status != 'removed';", (error, result) => {
    console.log(result[1]);
    req.rows=result;
    return next();});


}

exports.removeUser=async(req,res,next)=>{

  db.query("UPDATE members SET status = 'removed' WHERE id = ?;",[req.params.id], (error, result) => {
    db.query("SELECT * FROM members WHERE status != 'removed';", (error, result) => {
      if (!error) {
        res.render('index', { rows:result, removedUser:true });
      } else {
        console.log(err);
      } });});


}

exports.isLoggedIn = async (req, res, next) => {
  // console.log(req.cookies);
  if( req.cookies.jwt) {
    try {
      //1) verify the token
      const decoded = await promisify(jwt.verify)(req.cookies.jwt,
      'mypassword'
      );

      

      //2) Check if the user still exists
      db.query('SELECT * FROM members WHERE id = ?', [decoded.id], (error, result) => {
        console.log(result);

        if(!result) {
          return next();
        }


        else if (result[0].isAdmin == 1)
        {
          
          req.admin = result[0];
          
          console.log("admin incoming")
          return next();

        }

        else{
          req.user = result[0];
        console.log("user is")
        console.log(req.user);
        return next();

        }

        

      });
    } catch (error) {
      console.log(error);
      return next();
    }
  } else {
    next();
  }
}

exports.logout = async (req, res) => {
  res.cookie('jwt', 'logout', {
    expires: new Date(Date.now() + 2*1000),
    httpOnly: true
  });

  res.status(200).redirect('/');
}

exports.edit = async (req, res) => {

  if( req.cookies.jwt) {
    try {
      //1) verify the token
      const decoded = await promisify(jwt.verify)(req.cookies.jwt,
      'password'
      );
      const id= decoded.id
      const {mobile,email,address1,address2,suburb,postcode,state,country,preferred_name } = req.body;

      let check=true;


      db.query('SELECT * FROM members WHERE id = ?', [id], (error, result) => {
          
  
        if(!result) {
          res.cookie('jwt', 'logout', {
            expires: new Date(Date.now() + 2*1000),
            httpOnly: true
          });
          res.status(200).redirect('/login');
          
          
        }

        else{
          req.user = result[0];

        }

        

      });



      db.query('SELECT * FROM members WHERE email = ?', [email], (error, result) => {
          
  
        if(result) {

          if ((result[0].id != id) || (result.length>1))
          {
            check=false;
            return res.render('profile', {
              user: req.user,
              message: 'email already in use'
            });

          }

          else{
            db.query('UPDATE members SET email = ?, mobile = ?, address1 = ?, address2 = ?, suburb = ?, postcode = ?, state = ?, country = ?, preferred_name = ? WHERE id = ?', [email,  mobile, address1, address2, suburb, postcode, state,country, preferred_name, id], (error, results) => {
      
              db.query('SELECT * FROM members WHERE id = ?', [id], (error, result) => {
                
        
                if(!result) {
                  res.cookie('jwt', 'logout', {
                    expires: new Date(Date.now() + 2*1000),
                    httpOnly: true
                  });
                  res.status(200).redirect('/login');
                  
                  
                }
      
                else{
                  req.user = result[0];
                
                return res.render('profile', {
                  user: req.user,
                  message: 'Information updated'
                });
      
                }
        
                
        
              });
              
              
            
           })

          }

          
        }

        else{
          db.query('UPDATE members SET email = ?, mobile = ?, address1 = ?, address2 = ?, suburb = ?, postcode = ?, state = ?, country = ?, preferred_name = ? WHERE id = ?', [email,  mobile, address1, address2, suburb, postcode, state,country, preferred_name, id], (error, results) => {
      
            db.query('SELECT * FROM members WHERE id = ?', [id], (error, result) => {
              
      
              if(!result) {
                res.cookie('jwt', 'logout', {
                  expires: new Date(Date.now() + 2*1000),
                  httpOnly: true
                });
                res.status(200).redirect('/login');
                
                
              }
    
              else{
                req.user = result[0];
              
              return res.render('profile', {
                user: req.user,
                message: 'Information updated'
              });
    
              }
      
              
      
            });
            
            
          
         })
        }

      });
    
    }

    catch (error) 
    {
      res.status(200).redirect('/');
    }
  }

  else{
    res.status(200).redirect('/');
  }


}

exports.passworde = async (req, res) => {
  
  if( req.cookies.jwt) {
    try {
      const {  password, passwordConfirm } = req.body;

      const decoded = await promisify(jwt.verify)(req.cookies.jwt,
        'password'
        );
      const id= decoded.id


   db.query('SELECT * FROM members WHERE id = ?', [id], async (error, results) => {
    if(error) {
      console.log(error);
    }

    req.user=results[0];
  
  });

    if ( password !== passwordConfirm ) {
      return res.render('password', {
        user: req.user,
        message: 'Passwords do not match'
      });
    }

    let hashedPassword = await bcrypt.hash(password, 8);
    

    db.query('UPDATE members SET password_digest = ? WHERE id = ?', [hashedPassword,id], (error, results) => {
      if(error) {
        console.log(error);
      } else {
        
        return res.render('password', {
          user:req.user,
          message: 'Password changed'
        });
      }
    })


 
  }

  catch(error){
    console.log(error);
      return next();

  }
  }

  else{
    res.status(200).redirect('/login');
  }

  

}


exports.edituser = (req, res) => {
  // User the connection
  db.query('SELECT * FROM members WHERE id = ?', [req.params.id], (err, rows) => {
    if (!err) {
      res.render('edituser', { user : rows[0] });
    } else {
      console.log(err);
    }
    console.log('The data from user table: \n', rows);
  });
}


exports.update = async (req, res) => {
  

  const { title,firstname,lastname, preferred_name , email, alternate_email,mobile,phone,DOB,membertype,memberno,datejoined,address1,address2,suburb,postcode,state,country,status} = req.body;

  

    
  

    
    
    

    db.query('UPDATE members SET ? WHERE id = ?', [{title:title,firstname: firstname,lastname:lastname, email: email,alternate_email:alternate_email, mobile:mobile,phone:phone,date_of_birth:DOB,membertype:membertype,member_no:memberno,date_joined:datejoined,address1:address1,address2:address2,suburb:suburb,postcode:postcode,state:state,country:country,status:status,preferred_name:preferred_name },req.params.id], (error, results) => {
      if(error) {
        console.log(error);
      } else {
        db.query('SELECT * FROM members WHERE id = ?', [req.params.id], async (error, rows) => {
          if(error) {
            console.log(error);
          }
        console.log(results);
        return res.render('edituser', {
          user: rows[0],
          message: 'Member info updated'
        });
      });
      }
    });


  

}


exports.search= (req, res) => {
  let searchTerm = req.body.search;
  let typeTerm= req.body.filtertype;
  let statusTerm= req.body.filterstatus;
  // User the connection
  db.query("SELECT * FROM members WHERE (firstname LIKE ? OR lastname LIKE ? OR member_no LIKE ? OR mobile LIKE ? OR address1 LIKE ? OR address2 LIKE ? ) AND membertype = ? AND status = ?", ['%' + searchTerm + '%', '%' + searchTerm + '%','%' + searchTerm + '%','%' + searchTerm + '%','%' + searchTerm + '%','%' + searchTerm + '%',typeTerm,statusTerm], (err, rows) => {
    if (!err) {
      res.render('index', { rows:rows });
    } else {
      console.log(err);
    }
    console.log('The data from user table: \n', rows);
  });
}

exports.searchnominees= (req, res) => {
  let searchTerm = req.body.search;
  
  // User the connection
  db.query("SELECT * FROM nominees WHERE (Nominatorid LIKE ?)   AND status = 'Active'", ['%' + searchTerm + '%'], (err, rows) => {
    if (!err) {
      res.render('nominationtable', { rows:rows });
    } else {
      console.log(err);
    }
    console.log('The data from user table: \n', rows);
  });
}

exports.uploadmemberfile= (req, res) => {

 

  let memberFile;
  let uploadPath;

  if (!req.files || Object.keys(req.files).length === 0) {
     return res.render('edituser', {
      user: rows[0],
      message: 'No files uploaded'
    });
  }

  
  else{
  memberFile = req.files.memberFile;
  var file_name = new Date().getTime() +'_'+memberFile.name;
  uploadPath = __dirname + '/../upload/' + file_name;

  memberFile.mv(uploadPath, function (err) {
    if (err) return res.status(500).send(err);

      db.query('UPDATE members SET member_file = ? WHERE id =?', [file_name,req.params.id], (err, results) => {
        if (err) {
          console.log(err);
        } 
        else{
          db.query('SELECT * FROM members WHERE id = ?', [req.params.id], async (error, rows) => {
            if(error) {
              console.log(error);
            }
          console.log(req.params.id)
          console.log(results)
          return res.render('edituser', {
            user: rows[0],
            message: 'File uploaded'
          });});
        }
      });
    });
  }
}


exports.download=(req, res) => {

  db.query('SELECT * FROM members WHERE id=?',[req.params.id],(err,results)=>{

  var filePath = __dirname + '/../upload/' + results[0].member_file; // Or format the path using the `id` rest param
  var fileName = req.params.id+".pdf"; // The default name the browser will use

  res.download(filePath, fileName); 

  });
     
}

exports.profilepic= (req, res) => {

 

  let picFile;
  let uploadPath;

  if (!req.files || Object.keys(req.files).length === 0) {
     return res.redirect('/profile');
  }

  
  else{
  picFile = req.files.picFile;
  var file_name = new Date().getTime() +'_'+picFile.name;
  uploadPath = __dirname + '/../upload/' + file_name;

  picFile.mv(uploadPath, function (err) {
    if (err) return res.status(500).send(err);

      db.query('UPDATE members SET profile_image = ? WHERE id =?', [file_name,req.params.id], (err, results) => {
        if (err) {
          console.log(err);
        } 
        else{
          db.query('SELECT * FROM members WHERE id = ?', [req.params.id], async (error, rows) => {
            if(error) {
              console.log(error);
            }
          console.log(req.params.id)
          console.log(results)
          return res.render('profile', {
            user: rows[0],
            message: 'Image uploaded'
          });});
        }
      });
    });
  }
}

exports.nomination= async (req,res)=>{
  console.log('started this at least')
  if (req.user)
  {
    console.log('there is');
    console.log(req.user);
    db.query("SELECT * FROM nominees WHERE Nominatorid=? AND status = 'active'",[req.user.id],(err,results)=>{
      if(err)
      {
        console.log(err);
      }

      else if (results.length>0)
      {
        return res.render('nominated');
      }

      else
      {
        return res.render('nomination',{user:req.user});
      }
    })
  }

  else{
    console.log('went here');
    return res.redirect('/profile');
  }
}

exports.nominateSubmit = async (req, res) => {
  

  const { title,firstname,lastname, email,mobile,DOB,address1,address2,suburb,postcode,state,country,relationship} = req.body;

  let date_ob = new Date();

  let date = ("0" + date_ob.getDate()).slice(-2);


 let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);


 let year = date_ob.getFullYear();

 let dateofnomination= year+"-"+month +"-" + date;

    
  

    
    
    

    db.query('INSERT INTO nominees SET ?', {title:title,firstname: firstname,lastname:lastname, email: email, hp:mobile,date_of_birth:DOB,address1:address1,address2:address2,suburb:suburb,postcode:postcode,state:state,country:country, relationship:relationship,dateofnomination:dateofnomination,Nominatorid:req.params.id }, (error, results) => {
      if(error) {
        console.log(error);
      } else {
        res.redirect('/nomination');
      }
    });


  

}



exports.nomineetable=async(req,res)=>{

  db.query("SELECT * FROM nominees WHERE status = 'Active';", (error, result) => {
    console.log(result[1]);
    return res.render('nominationtable',{rows:result});});


}

exports.nomineetableapp=async(req,res)=>{

  db.query("SELECT * FROM nominees WHERE status = 'Active';", (error, result) => {
    console.log(result[1]);
    return res.render('nominationtable',{rows:result,message:'Nominee approved for membership'});});


}

exports.nomineetablerej=async(req,res)=>{

  db.query("SELECT * FROM nominees WHERE status = 'Active';", (error, result) => {
    console.log(result[1]);
    return res.render('nominationtable',{rows:result,message:'Nominee rejected'});});


}


exports.approvenominee=async(req,res)=>{

  db.query("SELECT * FROM nominees WHERE id = ? ;",[req.params.id], (error, result) => {
    if (!error)
    {
      db.query("UPDATE members SET status = 'Resigned' WHERE id = ?",[result[0].Nominatorid],(error,result1)=>{
        if(error)
        {
          console.log(error);
        }
      });

      db.query("SELECT * FROM members WHERE id = ?",[result[0].Nominatorid],(error,result2)=>{
        if(error)
        {
          console.log(error);
        }

        let date_ob = new Date();

        let date = ("0" + date_ob.getDate()).slice(-2);


        let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);


        let year = date_ob.getFullYear();

        let dateofjoining= year+"-"+month +"-" + date;

        db.query("INSERT INTO members SET ?", {title:result[0].title,firstname: result[0].firstname,lastname:result[0].lastname, email: result[0].email , password_digest: result2[0].password_digest,mobile:result[0].hp,date_of_birth:result[0].date_of_birth,membertype:result2[0].membertype,member_no:result2[0].member_no,date_joined:dateofjoining,address1:result[0].address1,address2:result[0].address2,suburb:result[0].suburb,postcode:result[0].postcode,state:result[0].state,country:result[0].country,status:'Active'},(error,result)=>{
        if(error)
        {
          console.log(error);

        }});
      });

      
    }

  


});

db.query("UPDATE nominees SET status = 'Approved' WHERE id = ?",[req.params.id],(err,rows)=>{
if (err)
{
  console.log(err);
}
else{
  return res.redirect('/nomineetable/approved');
}
});

}


exports.rejectnominee=async(req,res)=>{

  db.query("UPDATE nominees SET status = 'Rejected' WHERE id = ?",[req.params.id],(err,rows)=>{
    if (err)
    {
      console.log(err);
    }
    else{
      return res.redirect('/nomineetable/rejected');
    }
    });
  }



