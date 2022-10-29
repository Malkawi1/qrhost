const UsersModel = (sequelize,DataTypes)=>sequelize.define('authusers', {
 
    username: {
      type: DataTypes.STRING,
      primaryKey: true,
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