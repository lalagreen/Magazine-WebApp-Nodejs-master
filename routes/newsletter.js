const express = require('express');
const router = express();
router.set(express.urlencoded({extended: false}));
router.set(express.json());

const NewsletterEmail = require('../models/index.js').newsletterEmail;
const Newsletter = require('../models/index.js').newsletter;
const Verifier = require("email-verifier");
router.post('/newsletter', (req, res)=>{
    
    (async ()=>{
        try {
            
            let message= await Newsletter.find({}).limit(1);
            
            let verifier = new Verifier("at_nX8MTE5TTHSoqvrW0uJBwq4x2ISbk");
                verifier.verify(req.body.email, (err, data) => {
                    if (err) {
                        res.status(201).json({success: false, message: 'Email address is not valid or available'});
                       
                    }
                    else {
                        if(data.formatCheck === 'true' && data.smtpCheck === 'true' && data.dnsCheck === 'true'){
                            (async ()=>{
                                await NewsletterEmail.create({email: req.body.email});
                                res.status(201).json({success: true, message: message[0].after});
                            })()
                        }
                        else {
                            res.status(201).json({success: false, message: 'Email address is not valid or available'});
                        }
                    }
                });

        }
        catch(error){
            res.status(201).json({success: false, message: 'Email address is not valid or available'});
            console.log(error);
        }
    })()
    
})


module.exports = router;
