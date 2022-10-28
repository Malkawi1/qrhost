const UsersModel = (sequelize,DataTypes)=>sequelize.define('authuser', {
 
    username: {
      type: DataTypes.STRING,
      allowNull: false
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
      },
  }, {
    // Options 
  });
 
  module.exports = UsersModel