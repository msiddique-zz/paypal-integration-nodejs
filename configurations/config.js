const paypal = require('paypal-rest-sdk')
require('dotenv').config()

const configuration = paypal.configure({
    'mode': 'sandbox', //sandbox or live
    'client_id': process.env.CLIENT_ID,
    'client_secret': process.env.APP_SECRET,

})
module.exports = configuration