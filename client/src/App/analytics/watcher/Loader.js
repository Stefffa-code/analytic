export class Loader {
    constructor() {
        this._baseUrl = '/api/analytics';
        // async loadAllMetrics(account_id: number){
        //   let res = await axios.getLong(this.urlAll, {account_id}, 240000)
        // }
        //
        // async loadSlice(account_id: number, start_date: number){
        //   let res = await axios.getLong(this.urlFrom, {account_id, start_date}, 240000)
        // }
        //
        // async loadIndicators(account_id: number){
        //   let res = await axios.get (this.urlFrom, {account_id})
        // }
    }
    static get self() {
        if (Loader._self)
            return Loader._self;
        Loader._self = new Loader();
        return Loader._self;
    }
    get baseUrl() {
        return this._baseUrl;
    }
    get urlAll() {
        return this._baseUrl + '/all';
    }
    get urlFrom() {
        return this._baseUrl + '/from';
    }
    get urlIndicators() {
        return this._baseUrl + '/indicators';
    }
}
//# sourceMappingURL=Loader.js.map