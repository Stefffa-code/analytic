// const config = require('config')
// const envConf = require('./enviroment/index')
// import Config from './enviroment'


module.exports = {
  dbOptions: {
    database: "pragma_metrics", //config.db_name,
    username: 'root', //envConf.db_user, 
    password:  'root',// envConf.db_pass,
    dialect: 'mysql',
    host: 16770, // Config.env.host,
    // port: 3306,
    logging: false
  },
  options: {
    type: "js",
    dir: "db/models/pragma_metrics",
    // fileNameCamelCase: true,
 }
}