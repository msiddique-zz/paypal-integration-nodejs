const Sequelize = require('sequelize');
require('dotenv').config()


const sequelize = new Sequelize(process.env.DATABASE, process.env.DB_USER, process.env.PASSWORD, {
    host: process.env.HOST,
    dialect: "mysql",
    operatorsAliases: false,

    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.payments = require('../models/payments')(sequelize, Sequelize);


module.exports = db;