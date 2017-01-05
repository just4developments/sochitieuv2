import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { Http, Headers, Response } from '@angular/http';
import { ToastController } from 'ionic-angular';
import 'rxjs/add/operator/toPromise';

@Injectable()
export class AppService {
    HOST: String = 'http://localhost:9001';
    AUTH: String = 'http://localhost:9000'; 
    // DEFAULT_PJ: String = '586bb85baa5bdf0644e494da';
    // DEFAULT_ROLES: Array<String> = ['586bb85baa5bdf0644e494db'];
    DEFAULT_PJ: String = '586b55c48a1b181fa80d39a5';
    DEFAULT_ROLES: Array<String> = ['586b55c48a1b181fa80d39a6'];    
    
    token: String;
    typeSpendings: Array<Object>;
    wallets: Array<Object>;

    constructor(private http: Http, public toastCtrl: ToastController, private storage: Storage){
        
    }

    init(){
        return this.storage.get('token').then((token) => {
            this.token = token;
            return Promise.resolve(token);
        });
    }

    login(item:any, app?:String){
        let headers:any = {
            pj: this.DEFAULT_PJ
        };
        if(app) headers.app = 'facebook';
        item.status = 1;
        item.roles = this.DEFAULT_ROLES;
        return this.http.post(`${this.AUTH}/Login`, item, {headers: 
            new Headers(headers)
        }).toPromise()
        .then((resp: Response) => {
            this.token = resp.headers.get('token');
            this.storage.set('token', this.token);            
            return Promise.resolve(this.token);
        })
        .catch((error) => {
            return this.handleError(this, error);
        });
    }

    logout(){
        this.storage.clear();
        return Promise.resolve();
    }

    getStatisticByMonth(){        
        return this.http.get(`${this.HOST}/StatisticByMonth`, {headers: 
            new Headers({token: this.token})
        }).toPromise()
        .then(response => response.json())
        .catch((error) => {
            return this.handleError(this, error);
        });
    }

    getStatisticByTypeSpending(type:Number, month?: Number, year?: Number){
        let where = [];
        if(type !== undefined) {
            where.push(`type=${type}`);
        }
        if(month !== undefined) {
            where.push(`month=${month}`);
        }
        if(year !== undefined) {
            where.push(`year=${year}`);
        }
        let query = '';
        if(where.length > 0) query = '?'+ where.join('&');
        return this.http.get(`${this.HOST}/StatisticByTypeSpending${query}`, {headers: 
            new Headers({token: this.token})
        }).toPromise()
        .then(response => response.json())
        .catch((error) => {
            return this.handleError(this, error);
        });
    }

    addSpending(item){
        return this.http.post(`${this.HOST}/Spendings`, item, {headers: 
            new Headers({token: this.token})
        }).toPromise()
        .then(response => response.json())
        .catch((error) => {
            return this.handleError(this, error);
        });
    }

    updateSpending(item){
        return this.http.put(`${this.HOST}/Spendings/${item._id}`, item, {headers: 
            new Headers({token: this.token})
        }).toPromise()
        .then(response => response.json())
        .catch((error) => {
            return this.handleError(this, error);
        });
    }

    deleteSpending(item){
        return this.http.delete(`${this.HOST}/Spendings/${item._id}`, {headers: 
            new Headers({token: this.token})
        }).toPromise()
        .then(response => response.json())
        .catch((error) => {
            return this.handleError(this, error);
        });
    }

    addWallet(item){
        return this.http.post(`${this.HOST}/Wallet`, item, {headers: 
            new Headers({token: this.token})
        }).toPromise()
        .then(response => response.json())
        .catch((error) => {
            return this.handleError(this, error);
        });
    }

    updateWallet(item){
        return this.http.put(`${this.HOST}/Wallet/${item._id}`, item, {headers: 
            new Headers({token: this.token})
        }).toPromise()
        .then(response => response.json())
        .catch((error) => {
            return this.handleError(this, error);
        });
    }

    deleteWallet(item){
        return this.http.delete(`${this.HOST}/Wallet/${item._id}`, {headers: 
            new Headers({token: this.token})
        }).toPromise()
        .then(response => response.json())
        .catch((error) => {
            return this.handleError(this, error);
        });
    }

    addTypeSpending(item){
        return this.http.post(`${this.HOST}/TypeSpendings`, item, {headers: 
            new Headers({token: this.token})
        }).toPromise()
        .then(response => response.json())
        .catch((error) => {
            return this.handleError(this, error);
        });
    }

    updateTypeSpending(item){
        return this.http.put(`${this.HOST}/TypeSpendings/${item._id}`, item, {headers: 
            new Headers({token: this.token})
        }).toPromise()
        .then(response => response.json())
        .catch((error) => {
            return this.handleError(this, error);
        });
    }

    deleteTypeSpending(item){
        return this.http.delete(`${this.HOST}/TypeSpendings/${item._id}`, {headers: 
            new Headers({token: this.token})
        }).toPromise()
        .then(response => response.json())
        .catch((error) => {
            return this.handleError(this, error);
        });
    }

    getSpendings(walletId, inputDate){ 
        let queries = [];
        if(walletId) queries.push(`walletId=${walletId}`);
        if(inputDate) {
            let date = moment(inputDate, 'YYYY-MM-DD').toDate();
            queries.push(`month=${date.getMonth()}&year=${date.getFullYear()}`);
        }
        let query = '';
        if(queries.length > 0){
            query = '?' + queries.join('&');
        }
        return this.http.get(`${this.HOST}/Spendings${query}`, {headers: 
            new Headers({token: this.token})
        }).toPromise()
        .then(response => response.json())
        .catch((error) => {
            return this.handleError(this, error);
        });
    }

    getTypeSpendings(){
        return this.http.get(`${this.HOST}/TypeSpendings`, {headers: 
            new Headers({token: this.token})
        }).toPromise()
        .then(response => response.json())
        .catch((error) => {
            return this.handleError(this, error);
        });
    }

    getWallets() {
        return this.http.get(`${this.HOST}/Wallet`, {headers: 
            new Headers({token: this.token})
        }).toPromise()
        .then(response => response.json())
        .catch((error) => {
            return this.handleError(this, error);
        });
    }

    syncData(){
        this.getTypeSpendings().then((typeSpendings) => {
            this.typeSpendings = typeSpendings;
            this.getWallets().then((wallets) => {
                this.wallets = wallets;
            });
        });
    }

    handleError(_self:AppService, error: any): Promise<any> {
        let err = error._body ? JSON.parse(error._body) : error._body;
        if(typeof err === 'object'){
            if(err.message) err = err.message;
        }
        const toast = _self.toastCtrl.create({
            message: '#Error: ' + err,
            duration: 3000
        });
        toast.present();
        return new Promise((resolve, reject) => {
            reject(error.message || error);
        });
    }
}