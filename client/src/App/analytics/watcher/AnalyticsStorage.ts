import {IDBPDatabase, openDB, deleteDB} from 'idb';
import {IDateRange, IDateRangeSec, IFieldHandler} from "../../types/types";
import {Emitter} from "../../core/Emitter";




 export class AnalyticsStorage    {
  private static inst: AnalyticsStorage
  static get self(): AnalyticsStorage {
    if(AnalyticsStorage.inst) return AnalyticsStorage.inst
    AnalyticsStorage.inst = new AnalyticsStorage()
    return AnalyticsStorage.inst
  }

  private IDB
  private dbVersion: number = 1
   // @ts-ignore
  private  _analytic_db_name: string

   private readonly metricsStore: string = 'Metrics'

   setDbName(account_id: number){
    this._analytic_db_name = 'Analytic_' + account_id
   }

   get dbName(): string{
    return this._analytic_db_name
   }

   async init(account_id: number){
    this.setDbName(account_id)
     // await this.deleteAnalyticDb()
     await this.openDb()
   }

   private async deleteAnalyticDb(){
     await deleteDB(this.dbName,{
       blocked( ) {
         console.log('deleteDB blocked')
       },
     })
   }

   private async openDb(){
      let empty: boolean = false
      this.IDB = await openDB(this.dbName, this.dbVersion, {
          async upgrade(db: IDBPDatabase, oldVersion, newVersion, transaction) {
             if(oldVersion === 0){
               AnalyticsStorage.self.createMetricsStorage(db)
               empty = true
               return db;
             }
            if(oldVersion !== newVersion){
              // todo: update
            }
          },
          blocked() {console.log('blocked')},
          blocking() {console.log('blocking')},
          terminated() {console.log('terminated')},
      })
     if(empty)
       await Emitter.self.emit('empty_web_storage');
   }

   private createMetricsStorage(db: IDBPDatabase){
     if (!db.objectStoreNames.contains(this.metricsStore)) {
       db.createObjectStore(this.metricsStore);
     }
   }

   private async deleteFromStore( storeName:string, key: number | string) {
     const tx = this.IDB.transaction(storeName, 'readwrite');
     const store = tx.objectStore(storeName);

     const result = await store.get(key);
     if (!result)   return;
     await store.delete(key);
   }

   private async putToStore( storeName: string, value: object, key: number | string ) {
     const tx = this.IDB.transaction(storeName, 'readwrite');
     const store = tx.objectStore(storeName);
     await store.put(value, key);
     await tx.done;
   }

   private async getFromStore( storeName: string, key: number | string ) {
     const tx = this.IDB.transaction(storeName, 'readwrite');
     const store = tx.objectStore(storeName);
     return await store.get(key);
   }

   get version(): any{
     return  this.IDB.version
   }

   async getMetrics(): Promise<any>{
     let res = await this.getFromStore(this.metricsStore, 'data')
     return JSON.parse(res.data)
   }

   async saveMetrics(data: any){
     let entity: any = {}
     entity.data = JSON.stringify(data)
     await this.putToStore(this.metricsStore, entity, 'data')
   }

   async getMetricsRange(): Promise<any>{
     return await this.getFromStore(this.metricsStore, 'info')
   }

   async saveMetricsRange(data: IDateRangeSec){
     await this.putToStore(this.metricsStore, data, 'info')
   }

   async getHandlers(): Promise<any>{
     return await this.getFromStore(this.metricsStore, 'handlers')
   }

   async saveHandlers(data: IFieldHandler[]){
     await this.putToStore(this.metricsStore, data, 'handlers')
   }

 }
