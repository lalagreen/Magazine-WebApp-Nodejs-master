const express = require('express');
const router = express();
router.set(express.urlencoded({extended: false}));
router.set(express.json());
router.use(express.static('public'));
const path = require('path');
const pug = require('pug');
router.set("view engine", "pug");
router.set('views', path.join(__dirname, '..', '../views/admin'));
router.set('view options', { pretty: true });
let pathDir = path.join(__dirname, '..', '../models/index.js');
const Contact = require(pathDir).contact;
let checkAuthenticated = require('./authenticate.js').checkAuthenticated;
const passport = require('passport');
const flash = require('express-flash');
const session = require('express-session');
 
const MongoStore = require('connect-mongo')(session);

router.use(flash());
router.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: false,
    store: new MongoStore({
        url: process.env.MONGODB_URI,
    })
}));

router.use(passport.initialize());
router.use(passport.session());
router.get('/contacts', checkAuthenticated, (req, res)=>{

    (async ()=>{
        try {
            let contacts = await Contact.find({}).sort({_id: -1});
            // admin name
            let user = await req.user;
            await Contact.updateMany({seen: false}, {seen: true});
            let contactsCount = await Contact.find({seen: false}).countDocuments();
            res.render('contact', {contacts, user, contactsCount});
        }
        catch(error) {
            console.log(error)
        }
        
    })();
   
});


router.get('/contacts/delete/:id', checkAuthenticated, (req, res)=>{

    (async ()=>{
        try {
            let id = req.params.id;
            let deleteOne = await Contact.deleteOne({_id: id});
            let contacts = await Contact.find({}).sort({_id: -1});
            // admin name
            let user = await req.user;
            let contactsCount = await Contact.find({seen: false}).countDocuments();
            res.render('contact', {contacts, user, contactsCount});
        }
        catch(error) {
            console.log(error)
        }
        
    })();
   
});




module.exports = router;
