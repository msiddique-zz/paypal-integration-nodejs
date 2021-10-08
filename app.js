const express = require('express')
const bodyParser = require("body-parser")
const paypal = require('paypal-rest-sdk')
const ejs = require('ejs')
const db = require('./config/db.config');
const payments = db.payments
var url = require('url');
require('./configurations/config')
require('dotenv').config()

const app = express()
app.use(bodyParser.json())
app.set('view engine', 'ejs')

app.get('/', (req, res) => {
    res.render('index')
})

app.post('/', (req, res) => {
    console.log('pay: ', req.body)
})

app.post('/notifications', (req, res) => {
    console.log('====req from paypal=====', req.body)
    if (req.body.event_type === 'PAYMENT.SALE.COMPLETED') {
        // payments.find({ where: { Tid: req.body.resource.billing_agreement_id } })
        //     .on('success', function (payment) {
        //         // Check if record exists in db
        //         if (payment) {
        //             payment.update({
        //                 status: 'Successful'
        //             })
        //                 .success(function () { })
        //         }
        //     })


        payments.findOne({ where: { Tid: req.body.resource.billing_agreement_id } })
            .then(record => {

                if (!record) {
                    throw new Error('No record found')
                }

                console.log(`retrieved record ${JSON.stringify(record, null, 2)}`)

                let values = {
                    status: 'successful'
                }

                record.update(values).then(updatedRecord => {
                    console.log(`updated record ${JSON.stringify(updatedRecord, null, 2)}`)
                    // login into your DB and confirm update
                })

            })
            .catch((error) => {
                // do seomthing with the error
                throw new Error(error)
            })

    }
    res.status(200).send(); //very important step
})

app.post('/pay', (req, res) => {

    var isoDate = new Date();
    isoDate.setSeconds(isoDate.getSeconds() + 59);
    isoDate.toISOString().slice(0, 19) + 'Z';

    var billingPlanAttributes = {
        "description": "Spotify Plan for Regular",
        "merchant_preferences": {
            "auto_bill_amount": "yes",
            "cancel_url": "http://localhost:3000/cancelPlan",
            "initial_fail_amount_action": "continue",
            "max_fail_attempts": "1",
            "return_url": "http://localhost:3000/successPlan",
            "setup_fee": {
                "currency": "USD",
                "value": "25"
            }
        },
        "name": "Spotify subscriptions",
        "payment_definitions": [
            {
                "amount": {
                    "currency": "USD",
                    "value": "50"
                },
                "charge_models": [
                    {
                        "amount": {
                            "currency": "USD",
                            "value": "10.60"
                        },
                        "type": "SHIPPING"
                    },
                    {
                        "amount": {
                            "currency": "USD",
                            "value": "20"
                        },
                        "type": "TAX"
                    }
                ],
                "cycles": "0",
                "frequency": "MONTH",
                "frequency_interval": "1",
                "name": "Regular 1",
                "type": "REGULAR"
            },
            {
                "amount": {
                    "currency": "USD",
                    "value": "20"
                },
                "charge_models": [
                    {
                        "amount": {
                            "currency": "USD",
                            "value": "10.60"
                        },
                        "type": "SHIPPING"
                    },
                    {
                        "amount": {
                            "currency": "USD",
                            "value": "20"
                        },
                        "type": "TAX"
                    }
                ],
                "cycles": "4",
                "frequency": "MONTH",
                "frequency_interval": "1",
                "name": "Trial 1",
                "type": "TRIAL"
            }
        ],
        "type": "INFINITE"
    };

    var billingPlanUpdateAttributes = [
        {
            "op": "replace",
            "path": "/",
            "value": {
                "state": "ACTIVE"
            }
        }
    ];

    var billingAgreementAttributes = {

        "name": "Spotify Monthly subscription",
        "description": "World to Fast Unlimited Music",
        "start_date": isoDate,
        "plan": {
            "id": "P-0NJ10521L3680291SOAQIVTQ"
        },
        "payer": {
            "payment_method": "paypal"
        },
        "shipping_address": {
            "line1": "StayBr111idge Suites",
            "line2": "Cro12ok Street",
            "city": "San Jose",
            "state": "CA",
            "postal_code": "95112",
            "country_code": "US"
        }
    };

    paypal.billingPlan.create(billingPlanAttributes, function (error, billingPlan) {
        if (error) {
            console.log(error);
            throw error;
        } else {

            console.log("Create Billing Plan Response");
            console.log(billingPlan);

            // Activate the plan by changing status to Active
            paypal.billingPlan.update(billingPlan.id, billingPlanUpdateAttributes, function (error, response) {
                if (error) {
                    console.log(error);
                    throw error;
                } else {
                    console.log("Billing Plan state changed to " + billingPlan.state);
                    billingAgreementAttributes.plan.id = billingPlan.id;

                    // Use activated billing plan to create agreement
                    paypal.billingAgreement.create(billingAgreementAttributes, function (error, billingAgreement) {
                        if (error) {
                            console.log(error);
                            throw error;
                        } else {
                            console.log("Create Billing Agreement Response");
                            //console.log(billingAgreement);
                            for (var index = 0; index < billingAgreement.links.length; index++) {
                                if (billingAgreement.links[index].rel === 'approval_url') {
                                    var approval_url = billingAgreement.links[index].href;
                                    console.log("For approving subscription via Paypal, first redirect user to");
                                    console.log(approval_url);

                                    res.redirect(approval_url)


                                    // console.log("Payment token is");
                                    // paymentToken = url.parse(approval_url, true).query.token
                                    // console.log(paymentToken)
                                }
                            }
                        }
                    });
                }
            });

        }
    });
})

app.get('/successPlan', (req, res) => {

    var paymentToken = req.query.token;
    console.log('------token-------', paymentToken)
    // See billing_agreements/execute.js to see example for executing agreement 
    // after you have payment token
    paypal.billingAgreement.execute(paymentToken, {}, async function (error, billingAgreement) {
        if (error) {
            console.log(error);
            throw error;
        } else {
            console.log("Billing Agreement Execute Response");
            const payment = {
                userName: billingAgreement.payer.payer_info.first_name,
                price: 25,
                status: 'pending',
                Tid: billingAgreement.id
            }
            //      console.log('=====================first name',billingAgreement.first_name)
            // payment.userName = billingAgreement.first_name

            await payments.create(payment)
            console.log(JSON.stringify(billingAgreement));
            res.redirect('/successful')
        }
    });
})

app.get('/successful', (req, res) => { res.send('subscription subscribed sucessfully') })

app.post('/pay', (req, res) => {
    const create_payment_json = {
        "intent": "sale",
        "payer": {
            "payment_method": "paypal"
        },
        "redirect_urls": {
            "return_url": process.env.REDIRECT_URL_SUCCESS,
            "cancel_url": process.env.REDIRECT_URL_CANCEL
        },
        "transactions": [{
            "item_list": {
                "items": [{
                    "name": "Iphone 13 Pro Max",
                    "sku": "sgh31261247",
                    "price": "500.00",
                    "currency": "USD",
                    "quantity": 1
                }]
            },
            "amount": {
                "currency": "USD",
                "total": "500.00"
            },
            "description": "You've bought Iphone 13 Pro for $500."
        }]
    };

    paypal.payment.create(create_payment_json, function (error, payment) {
        if (error) {
            throw error;
        } else {

            for (let i = 0; i < payment.links.length; i++) {
                if (payment.links[i].rel === 'approval_url') {

                    res.redirect(payment.links[i].href)
                }
            }
        }
    });
})

app.get('/success', (req, res) => {
    const payer_id = req.query.PayerID
    const paymentId = req.query.paymentId

    var execute_payment_json = {

        "payer_id": payer_id,
        "transactions": [{
            "amount": {
                "currency": "USD",
                "total": "500.00"
            }
        }]
    };

    paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
        if (error) {
            console.log(error.response);
            throw error;
        } else {
            console.log(JSON.stringify(payment.payer));
            res.send(payment.payer)
        }
    });

})

app.get('/cancel', (req, res) => { res.send('cancelled') })

app.listen(3000, () => { console.log('Server is running on port 3000') })