import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
import { ToastController } from 'ionic-angular';
import 'rxjs/add/operator/toPromise';

@Injectable()
export class AppService {
    HOST: String = 'http://localhost:9001';
    token: String;
    typeSpendings: Array<Object>;
    wallets: Array<Object>;

    constructor(private http: Http, public toastCtrl: ToastController){
        // this.token = '5866861fb439a60c787bff3b-5866894cd0b26a265843c378-58668956d0b26a265843c379';
        this.token = '586bb85baa5bdf0644e494da-586bb875aa5bdf0644e494dd-586bbaac0d542f33cc82015c';
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

    handleError(_this, error: any): Promise<any> {
        let err = error._body ? JSON.parse(error._body) : error._body;
        if(typeof err === 'object'){
            if(err.message) err = err.message;
        }
        const toast = _this.toastCtrl.create({
            message: '#Error: ' + err,
            duration: 3000
        });
        toast.present();
        return new Promise((resolve, reject) => {
            reject(error.message || error);
        });
    }
}