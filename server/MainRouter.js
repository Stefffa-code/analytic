import { DepartmentsRouter } from "./entities/department/DepartmentsRouter";
import { StatusesToDepartmentRouter } from "./entities/dependencies/statusesToDepartment/STDRouter";
import { SegmentsRouter } from "./entities/pipelines/pipelines/SegmentsRouter";
import { StagesRouter } from "./entities/pipelines/statuses/StatusesRouter";
import { UserRouter } from "./entities/user/UserRouter";
import { EmployeesRouter } from "./entities/employees/EmployeesRouter";
import { DepartmentToUsersRouter } from "./entities/dependencies/usersToDepartment/DepartmentUsersRouter";
import { AnalyticRouter } from "./analytic/AnalyticRouter";
import { FrontLogs } from "./frontLogs/FrontLogs";
const passport = require('passport');
export class MainRouter {
    constructor(app) {
        this.app = app;
    }
    apiRoutesInit() {
        this.app.use('/api/logs', FrontLogs.handler);
        this.app.use('/api/analytics', passport.authenticate('jwt', { session: false }), AnalyticRouter.handler);
        this.app.use('/api/entities/user', UserRouter.handler);
        this.app.use('/api/entities/departments', passport.authenticate('jwt', { session: false }), DepartmentsRouter.handler);
        this.app.use('/api/entities/pipelines', passport.authenticate('jwt', { session: false }), SegmentsRouter.handler);
        this.app.use('/api/entities/statuses', passport.authenticate('jwt', { session: false }), StagesRouter.handler);
        this.app.use('/api/entities/employees', passport.authenticate('jwt', { session: false }), EmployeesRouter.handler);
        this.app.use('/api/dependencies/status_to_department', passport.authenticate('jwt', { session: false }), StatusesToDepartmentRouter.handler);
        this.app.use('/api/dependencies/employees_to_department', passport.authenticate('jwt', { session: false }), DepartmentToUsersRouter.handler);
    }
}
//# sourceMappingURL=MainRouter.js.map