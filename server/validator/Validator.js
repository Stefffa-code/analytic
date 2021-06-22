import { IServer } from "../IServer";
var Errors = IServer.Errors;
const validate = require('validator');
export var IValidator;
(function (IValidator) {
    class Validator {
        static isEmail(email) {
            let isValid = validate.isEmail(email);
            if (!isValid)
                throw Errors.invalidEmail();
            return email;
        }
        static isPhone(phone) {
            let isValid = validate.isMobilePhone(phone);
            if (!isValid)
                throw Errors.invalidPhone();
            return phone;
        }
        static toId(n) {
            if (typeof n == 'number' && n > 0) {
                return n;
            }
            if (typeof n == 'string') {
                let valid = validate.toInt(n);
                if (valid > 0)
                    return valid;
            }
            throw Errors.invalidID();
        }
        static toIdOrNull(n) {
            if (!n)
                return null;
            if (typeof n == 'number' && n > 0) {
                return n;
            }
            if (typeof n == 'string') {
                let valid = validate.toInt(n);
                if (valid > 0)
                    return valid;
            }
            throw Errors.invalidID();
        }
        static toIds(nums) {
            return nums.map(n => Validator.toId(n));
        }
        static toNumber(n) {
            if (typeof n == 'number')
                return n;
            if (typeof n == 'string') {
                return validate.toInt(n);
            }
            throw Errors.invalidID();
        }
        static isColor(str_color) {
            if (validate.isHexColor(str_color))
                return str_color;
            throw Errors.ValidationError('Color is not valid');
        }
        static isTitleOrNull(txt) {
            if (!txt)
                return null;
            return txt.toString();
        }
        static isTitle(txt) {
            if (!txt)
                throw Errors.ValidationError();
            return txt.toString();
        }
        static toTitleOrNull(txt) {
            if (!txt)
                return null;
            return txt.toString();
        }
        static toBoolean(str) {
            if (typeof str == 'boolean')
                return str;
            if (typeof str == 'string')
                return validate.toBoolean(str);
            if (typeof str == 'number') {
                return validate.toBoolean(String(str));
            }
            throw Errors.ValidationError("Cannot convert to boolean type");
        }
        static toDayInSec(day_sec) {
            if (!day_sec)
                throw Errors.ValidationError("Date cannot be empty");
            return Math.trunc(new Date(day_sec * 1000).getTime() / 86400000) * 86400;
        }
    }
    IValidator.Validator = Validator;
})(IValidator || (IValidator = {}));
//# sourceMappingURL=Validator.js.map