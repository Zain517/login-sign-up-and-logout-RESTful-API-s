const express=require('express');
const mongoose= require('mongoose');
// const bodyparser=require('body-parser');
const cookieParser=require('cookie-parser');
const User=require('./models/user');
const {auth} =require('./middlewares/auth');
const db=require('./config/config').get(process.env.NODE_ENV);


const app=express();
// app use
// app.use(bodyparser.urlencoded({extended : false}));
app.use(express.json());
app.use(cookieParser());

// database connection
mongoose.Promise=global.Promise;
mongoose.connect(db.DATABASE,{ useNewUrlParser: true,useUnifiedTopology:true },function(err){
    if(err) console.log(err);
    console.log("database is connected");
});



// adding new user (sign-up route)
app.post('/api/register',function(req,res){
    // taking a user
    const newuser=new User(req.body);
    console.log(newuser);
 
    // if(newuser.password!=newuser.password2)return res.status(400).json({message: "password not match"});
    
    User.findOne({email:newuser.email},function(err,user){
        if(user) return res.status(400).json({ status: "400", auth : false, message :"email exits"});
 
        newuser.save((err,doc)=>{
            if(err) {console.log(err);
                return res.status(400).json({ success : false});}
            res.status(200).json({
                status: "200",
                succes:true,
                user : doc
            });
        });
    });
 });
 
 
 // login user
 app.post('/api/login', function(req,res){
     let token=req.cookies.auth;
     User.findByToken(token,(err,user)=>{
         if(err) return  res(err);
         if(user) return res.status(400).json({
             status: "400",
             error :true,
             message:"You are already logged in"
         });
     
         else{
             User.findOne({'email':req.body.email},function(err,user){
                 if(!user) return res.status(400).json({status: "400", isAuth : false, message : ' Auth failed ,email not found'});
         
                 user.comparepassword(req.body.password,(err,isMatch)=>{
                     if(!isMatch) return res.status(400).json({ status: "400", isAuth : false,message : "password doesn't match"});
         
                 user.generateToken((err,user)=>{
                     if(err) return res.status(400).send(err);
                     res.cookie('auth',user.token).json({
                         status: "200",
                         isAuth : true,
                         id : user._id
                         ,email : user.email
                     });
                 });    
             });
           });
         }
     });
 });
 
 //logout user
  app.get('/api/logout',auth,function(req,res){
         req.user.deleteToken(req.token,(err,user)=>{
             if(err) return res.status(400).send(err);
             res.sendStatus(200);
         });
 
     }); 
 
 // get logged in user
 app.get('/api/profile',auth,function(req,res){
         res.json({
             status: "200",
             isAuth: true,
             id: req.user._id,
             email: req.user.email,
             name: req.user.firstname + req.user.lastname
             
         })
 });
 
 // Deleting User from DB
app.post('/api/delete',function(req,res){
   
    const newuser=new User(req.body);
     
    User.findOne({email:newuser.email},function(err,user){
        if(!user) return res.status(400).json({ status: "400", auth : false, message :"User not exits"});
 
        User.deleteOne({ email: { $eq: newuser.email } }).then(function(){ 
            res.status(200).json({
                status: "200",
                succes:true,
            }); // Success 
        }).catch(function(error){ 
            console.log(error); 
            return res.status(400).json({  status: "400", success : false}); // Failure 
        }); 
    });
 });



app.get('/',function(req,res){
    res.status(200).send(`Welcome to login , sign-up api`);
});

// listening port
const PORT=process.env.PORT||5000;
app.listen(PORT,()=>{
    console.log(`app is live at ${PORT}`);
});