export var IServer;
(function (IServer) {
    class Response {
        constructor(result) {
            this.result = result;
        }
    }
    IServer.Response = Response;
    class Error {
        constructor(message, code, data = {}) {
            this.error = true;
            this.message = message;
            this.code = code;
            this.data = data;
        }
        toString() {
            return JSON.stringify({ message: this.message, code: this.code, data: this.data });
        }
    }
    IServer.Error = Error;
    class Errors {
        static createError(message, code) {
            return new Error(message, code);
        }
        static innerError(message) {
            return new Error('ERROR:  ' + message, this.innerErrorCode);
        }
        static errorDb(message) {
            return new Error(message, this.errorDbCode);
        }
        static invalidQueryUrl(message) {
            return new Error(message, this.invalidQueryUrlCode);
        }
        static invalidUrlHandler() {
            return new Error('Do not figure out url method handler', this.invalidUrlHandlerCode);
        }
        static invalidPhone() {
            return new Error('Invalid phone data', this.invalidValidationCode);
        }
        static ValidationError(message) {
            return new Error('Input data did not pass validation. ' + message, this.invalidValidationCode);
        }
        static invalidEmail() {
            return new Error('', this.invalidValidationCode);
        }
        static invalidID() {
            return new Error('Invalid id', this.invalidValidationCode);
        }
        static invalidRequest(message) {
            return new Error('Invalid request' + message, this.invalidRequestCode);
        }
        static notFoundForUpdateDB(tableName) {
            return new Error('Not found object for update in table ' + tableName, this.notFoundForUpdateDBCode);
        }
        static notFoundForDeleteDB(tableName) {
            return new Error('Not found object for delete in table ' + tableName, this.notFoundForDeleteDBCode);
        }
        static SaveInDbError(tableName) {
            return new Error('Failed to save changes in the database in table: ' + tableName, this.notSaveInDbCode);
        }
    }
    Errors.innerErrorCode = 900;
    Errors.invalidQueryUrlCode = 1000;
    Errors.invalidUrlHandlerCode = 1001;
    Errors.invalidRequestCode = 1002;
    Errors.errorDbCode = 1201;
    Errors.invalidValidationCode = 1700;
    Errors.notFoundForUpdateDBCode = 1801;
    Errors.notFoundForDeleteDBCode = 1802;
    Errors.notSaveInDbCode = 1803;
    IServer.Errors = Errors;
})(IServer || (IServer = {}));
//# sourceMappingURL=IServer.js.map