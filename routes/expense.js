const express = require('express');
const router = express.Router();
const Expense = require('../models/expense');
const config = require('../config/database');
const jwt = require('jsonwebtoken');

//This Method is written here so that all functions after this will need an Authorization token 
//for requests otherwise function will return err object from json that Authorization token is 
//expired
router.use((req, res, next) => {
    // check header or url parameters or post parameters for token
    const token = req.body.token || req.query.token || req.headers['authorization'];
    if(token) {
        jwt.verify(token, config.secret, function(err, decoded) {
            if(err) {
                res.json({ success: false, message: 'Authentication token expired, please log in again', errcode: 'exp-token'});
            } else {
                req.decoded = decoded;
                next();
            }
        });
    } else {
        res.json({ success: false, message: 'Authenticate token not available', errcode: 'no-token'});
    }
});


router.post('/saveexpense', (req, res, next) => {
    const userid = req.body.userid;
    const expensedate = req.body.expensedate;
    const expensetype = req.body.expensetype;
    const expenseamt = req.body.expenseamt;
    const expensedesc = req.body.expensedesc;
    const expid = req.body.expid;

    if(!userid) {
        res.json({ success: false, message: 'User Id was not provided' });
    } else {
        if(!expensedate) {
            res.json({ success: false, message: 'Expense date was not provided' });
        } else {
            if(!expensetype) {
                res.json({ success: false, message: 'Expense Type was not provided' });
            } else {
                if(!expenseamt) {
                    res.json({ success: false, message: 'Expense Amount was not provided' });
                } else {
                    //Update Expense
                    if(expid) {
                        Expense.findById(expid).exec((err, expense) => {
                            if(err) {
                                res.json({ success: false, message: 'Error processing request' });
                            }
                            if(expense) {
                                expense.expensedate = expensedate;
                                expense.expensetype = expensetype;
                                expense.expenseamt = expenseamt;
                                expense.expensedesc = expensedesc;
                            }
                            expense.save((err) => {
                                if(err) {
                                    res.json({ success: false, message: 'Error processing request' });
                                } else {
                                    res.json({ success: true, message: 'Expense updated successfully' });
                                }
                            });
                        });
                    } else {
                        //Add new expense
                        let newExpense = new Expense({
                            userid: userid,
                            expensedate: expensedate,
                            expensetype: expensetype,
                            expenseamt: expenseamt,
                            expensedesc: expensedesc
                        });

                        newExpense.save((err) => {
                            if(err) {
                                res.json({ success: false, message: 'Error processing request ' + err});
                            } else {
                                res.json({ success: true, message: 'Expense saved successfully' });
                            }
                        });
                    }                    
                }
            }
        }
    }
});

router.delete('/deleteexpense/:id', (req, res) => {
    Expense.remove({ _id: req.params.id }, (err) => {
        if(err) {
            res.json({ success: false, message: 'Error processing request ' + err});
        } else {
            res.json({ success: true, message: 'Expense deleted successfully!!'});
        }
    });
});

router.get('/getexpense/:id', (req, res) => {
    Expense.find({ _id: req.params.id }, (err, expense) => {
        if(err) {
            res.json({ success: false, message: 'Error processing request ' + err});
        } else {
            res.json({ success: true, data: expense });
        }
    });
});

router.post('/expensetotal', (req, res) => {
    const uid = req.params.id || req.params('uname');
    const rptype = req.body.report || req.params('report');
    const from_date = req.body.startdt || req.params('startdt');
    const end_date = req.body.enddt || req.params('enddt');
    const fromdt = new Date(from_date);
    const enddt = new Date(end_date);

    let match = {};

    if(rptype === 'opt1') {
        let odt = new Date();
        let month = odt.getUTCMonth() + 1; // months from 1 to 12
        let year = odt.getUTCFullYear();

        let fdt = new Date(year + "/" + month + "/1");
        let tdt = new Date(year + "/" + month + "/31");

        match = { "$match": { userid: uid, expensedate: { $gte: fdt, $lte: tdt }}  };
    } else if(rptype === 'opt2') {
        match = { "$match": { userid: uid, expensedate: { $gte: fromdt, $lte: enddt }} };
    } else {
        match = { "$match": { userid: uid }};
    }

    Expense.aggregate([
        match,
        {
            "$group": {
                "_id": 1,
                "total": { "$sum": "$expenseamt" }
            }
        }
    ],
    function(err, result) {
        if(err) {
            res.json({ success: false, message: 'Error processing request ' + err });
        } else {
            res.json({ success: true, data: result });
        }
    });
});

router.post('/expensereport', (req, res) => {
    const uid = req.params.id || req.query.uname;
    const rptype = req.body.report || req.query.report;
    const from_dt = req.body.startdt || req.query.startdt;
    const end_dt = req.body.enddt || req.query.enddt;
    const fromdate = new Date(from_dt);
    const enddate = new Date(end_dt);

    let limit = parseInt(req.query.limit);
    let page = parseInt(req.body.page || req.query.page);
    let sortby = req.body.sortby || req.query.sortby;

    let query = {};

    if(!limit || limit < 1) {
        limit = 10;
    }

    if(!page || page < 1) {
        page = 1;
    }

    if(!sortby) {
        sortby = 'expensedate';
    }

    var offset = (page - 1) * limit;

    if(!uid || !rptype) {
        res.json({ success: false, message: 'Posted data is not correct or incomplete' });
    } else if(rptype === 'opt2' && !fromdate && !enddate) {
        res.json({ success: false, message: 'From or To date is missing' });
    } else if(fromdate > todate) {
        res.json({ success: false, message: 'From date cannot be greater than to date' });
    } else {
        if(rptype === 'opt1') {
            // returns record for the current month
            let odt = new Date();
            let month = odt.getUTCMonth() + 1; //months from 1 to 12
            let year = odt.getUTCFullYear();

            let fdt = new Date(year + "/" + month + "/1");
            let tdt = new Date(year + "/" + month + "/31");

            query = { userid: uid, expensedate: { $gte: fdt, $lte: tdt }};

            Expense.count(query, (err, count) => {
                if(count > offset) {
                    offset = 0;
                }
            });
        } else if(rptype === 'opt2') {
            // return records within given date range
            query = { userid: uid, expensedate: { $gte: fromdate, $lte: todate }};

            Expense.count(query, (err, count) => {
                if(count > offset) {
                    offset = 0;
                }
            });
        } else {
            // return all expenses for the user

            query = { userid: uid };

            Expense.count(query, (err, count) => {
                if(count> offset) {
                    offset = 0;
                }
            });
        }

        const options = {
            select: 'expensedate expensetype expenseamt expensedesc',
            sort: sortby,
            offset: offset,
            limit: limit
        }

        Expense.paginate(query, options, (err, result) => {
            if(err) {
                res.json({ success: false, message: 'Error in Pagination' });
            } else {
                res.json({ success: true, data: result  });
            }
        });
    }
}); 

module.exports = router;