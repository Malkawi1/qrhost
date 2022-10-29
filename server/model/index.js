/* eslint-disable */
const { Sequelize , DataTypes} = require('sequelize');

const Users = require('./users.model')
const data = require('./data.model')

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
  const DataDB = data(db, DataTypes);


  UsersDB.hasMany(DataDB);
  DataDB.belongsTo(UsersDB);


module.exports ={
    db : db,
    UsersDB,
    DataDB
   
}