import crm_db from "./db/utils/crm_db";
import temp_db from "./db/utils/temp_db";
const path = require('path')
const helmet = require("helmet");
const cors = require('cors')
const compression = require('compression')
const session = require('express-session')
const csrf = require('csurf')
const fs = require('fs')
const passport = require('passport')
const http = require('http');
const SequelizeStore = require("connect-session-sequelize")(session.Store);
import { MainRouter } from './server/MainRouter'
import Config from "./enviroment/index";
import {Dashboard} from "./server/Dashboard";

const express = require('express')
const app = express()

const log4js = require('log4js');
log4js.configure('./utils/logs/log4js.json');
const log = require('log4js').getLogger('app');
app.use(log4js.connectLogger(log4js.getLogger("http"), { level: 'error' }));


app.use(passport.initialize())
require('./middleware/passport')(passport)


app.use(require('morgan')('dev'))
app.use(express.json());
// app.use(csrf())
app.use(helmet())
app.use(cors())
app.use(compression())


Dashboard.init().then(r => console.log('Dashboard init!'))

const router = new MainRouter(app)
router.apiRoutesInit()

const UNIX_SOCKET = '/tmp/bizpult.pro.sock'
if (process.env.NODE_ENV === 'production') {
    productionMode()
} else {
   developmentMode()
}

function productionMode(){
    app.use('/', express.static(path.join(__dirname, 'client', 'dist')))
  app.get('*', (req: any, res: { sendFile: (arg0: any) => void; }) => {
    res.sendFile(path.resolve(__dirname, 'client', 'dist', 'index.html'))
  })

    fs.stat(UNIX_SOCKET, function(err: any) {
        if (!err) { fs.unlinkSync(UNIX_SOCKET); }

        http.createServer(app).listen(UNIX_SOCKET, function(){
            fs.chmodSync(UNIX_SOCKET, '777');
            console.log('Express server listening on ' + UNIX_SOCKET);
        });
    });
}

async function developmentMode(){
    const PORT = Config.env.SERVER_PORT || 5000
    try {
        await crm_db.sync()
        app.listen(PORT, () => console.log(`App has been started on port ${PORT}...`))
    } catch (e) {
        console.log('Server Error', e.message)
        log.error("Server Error " + e.stack)
        process.kill(process.pid, 'SIGTERM')
    }
}





