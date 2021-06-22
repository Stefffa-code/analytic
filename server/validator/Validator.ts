import {IServer} from "../IServer";
import Errors = IServer.Errors;

const validate = require('validator')


export namespace IValidator {

    export class Validator {
        static isEmail(email: any) {
            let isValid = validate.isEmail(email)
            if (!isValid) throw Errors.invalidEmail();
            return email
        }

        static isPhone(phone: any) {
            let isValid = validate.isMobilePhone(phone)
            if (!isValid) throw Errors.invalidPhone();
            return phone
        }

        static toId(n: any): number {
            if(typeof  n == 'number' && n > 0){
                return n
            }
            if(typeof  n == 'string' ){
                let valid = validate.toInt(n)
                if(valid > 0) return valid;
            }

            throw Errors.invalidID();
        }

        static toIdOrNull(n: any): number | null {
            if(!n) return null;

            if(typeof  n == 'number' && n > 0){
                return n
            }

            if(typeof  n == 'string' ){
                let valid = validate.toInt(n)
                if(valid > 0) return valid;
            }

            throw Errors.invalidID();
        }

        static toIds(nums: any[]): number[] {
            return nums.map( n => Validator.toId(n))
        }

        static toNumber(n: any): number {
            if(typeof  n == 'number')  return n;

            if(typeof  n == 'string' ){
                return  validate.toInt(n);
            }
            throw Errors.invalidID();
        }

        static isColor(str_color: string): string{
            if(validate.isHexColor(str_color))
                return str_color;
            throw  Errors.ValidationError('Color is not valid')
        }

        static isTitleOrNull(txt: any): string | null{
            if(!txt) return null;
            return txt.toString()
        }

        static isTitle(txt: any): string{
            if(!txt) throw Errors.ValidationError()
            return txt.toString()
        }

        static toTitleOrNull(txt: any): string | null{
            if(!txt) return null;
            return txt.toString()
        }

        static toBoolean(str: any): boolean{
            if(typeof str == 'boolean')
                return str;
            if(typeof str == 'string')
                return validate.toBoolean(str)
            if(typeof str == 'number'){
                return validate.toBoolean( String(str))
            }
            throw Errors.ValidationError("Cannot convert to boolean type")
        }

        static toDayInSec(day_sec: number): number{
            if(!day_sec)
                throw Errors.ValidationError("Date cannot be empty")
            return Math.trunc(new Date(day_sec*1000).getTime() / 86400000) * 86400
        }

    }

}