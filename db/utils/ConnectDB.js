import Config from "../../enviroment/index";
const Sequelize = require('sequelize');
export class DB {
    static connect(db_name) {
        return new Sequelize(db_name, Config.env.db_user, Config.env.db_pass, {
            host: Config.env.HOST,
            dialect: 'mysql',
            define: {
                timestamps: false
            }
        });
    }
    static temp() {
        return DB.connect(DB.name_temp);
    }
    static kpi() {
        return DB.connect(DB.name_kpi);
    }
    static crm() {
        return DB.connect(DB.name_crm);
    }
    static users() {
        return DB.connect(DB.name_users);
    }
    static modules() {
        return DB.connect(DB.name_modules);
    }
    static interface() {
        return DB.connect(DB.name_interface);
    }
    static dashboard() {
        return DB.connect(DB.name_dashboard);
    }
    static metrics() {
        return DB.connect(DB.name_metrics);
    }
}
DB.name_kpi = Config.env.db_name_kpi;
DB.name_crm = Config.env.db_name_crm;
DB.name_modules = Config.env.db_name_modules;
DB.name_dashboard = Config.env.db_name_dachboard;
DB.name_temp = Config.env.db_name_temp;
DB.name_users = Config.env.db_name_users;
DB.name_interface = Config.env.db_name_interface;
DB.name_metrics = Config.env.db_name_metrics;
const kpi_db = DB.kpi();
const temp_db = DB.temp();
const crm_db = DB.crm();
const users_db = DB.users();
const modules_db = DB.modules();
const interface_db = DB.interface();
const dashboard_db = DB.dashboard();
const metrics_db = DB.metrics();
export { kpi_db, temp_db, crm_db, users_db, modules_db, interface_db, dashboard_db, metrics_db };
//# sourceMappingURL=ConnectDB.js.map