
import {ICommonUser} from "./ICommonUser";
import IUser = ICommonUser.IUser;
import IHiddenLogin = ICommonUser.IHiddenLogin;
import { UsersSchema } from "../../../db/models/pragma_users/index";


export class UserExecutor {
    private static _self: UserExecutor

    static get self(): UserExecutor {
        if(UserExecutor._self)
            return UserExecutor._self
        UserExecutor._self = new UserExecutor()
        return UserExecutor._self
    }

    async getPartiallyHiddenLogin(user_id: number): Promise<IHiddenLogin | any>{
        let finded = await this._getUserById(user_id)
        if(!finded){
            return { find: false, message: "Пользователь не найден" };
        }

        return  {
            find: true,
            email: this._partialHideEmail(finded.email),
            phone: this._partialHidePhone(finded.phone)
        }
    }

    _partialHidePhone(phone: string | null): string | null{
        if(!phone) return null;

        let arr = phone.split('')
        arr.splice(arr.length - 4, 3, "***")
        phone = arr.join('')
        return phone
    }

    _partialHideEmail(email: string): string{
        let arr = email.split('@')
        let first = ''
        let addresLetters = arr[0].split("")
        addresLetters.forEach( (item, index) => {
            first += (index < 4) ? item : "*"
        })

        return first + "@" + arr[1]
    }


    private async _getUserById(user_id: number): Promise<User | undefined> {
        let finded = await UsersSchema.findByPk(user_id)
        if(!finded) return;
        return this._createInstance(finded);
    }

    private _createInstance(struct: any):User{
        return new User(struct)
    }
}

class User {
    readonly id: number
    readonly email: string
    readonly phone: string | null
        name: string
        surname?: string
        middle_name?: string
        confirm_email: boolean
        lang: string


    constructor(model: any) {
        this.id = model.id,
        this.name = model.name,
        this.surname = model.surname,
        this.middle_name = model.middle_name,
        this.email = model.email,
        this.confirm_email = model.confirm_email,
        this.phone =  model.phone,
        this.lang = model.lang
    }

    get model(): IUser {
        return {
            id: this.id,
            name: this.name,
            surname: this.surname,
            middle_name: this.middle_name,
            email: this.email,
            confirm_email: this.confirm_email,
            phone: this.phone,
            lang: this.lang
        }
    }
}