const DataModel = (sequelize,DataTypes)=>sequelize.define('data', {
 
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    link: {
        type: DataTypes.STRING,
        allowNull: false
      },
      usernameFK: {
        type: DataTypes.STRING,
        references: {
            model: 'authusers', 
            key: 'username'
        }
    }
  }, {
    // Options 
  });
 
  module.exports = DataModel