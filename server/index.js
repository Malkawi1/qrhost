const {start} = require('./server') ;
const {db} = require('./model/index')

const port = process.env.PORT || 5000;



db.sync().then(()=>{
  start()
}).catch(console.error)
