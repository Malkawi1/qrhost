/* eslint-disable */
const { Sequelize , DataTypes} = require('sequelize');

const Users = require('./users.model')

var config

if (process.env.DATABASE_URL) {
  config = {
    logging: false,
    ssl: true,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  }
} else {
  config = {
    logging: false
  }
}

const db = new Sequelize(
    process.env.DATABASE_URL ||
    'postgres://postgres:1234@127.0.0.1:5432/postgres',
    config 
  )

  const UsersDB = Users(db, DataTypes);


module.exports ={
    db : db,
    UsersDB
   
}