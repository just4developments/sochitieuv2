import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
import 'rxjs/add/operator/toPromise';

@Injectable()
export class AppService {
    HOST: String = 'http://localhost:9001';
    token: String;
    typeSpendings: Array<Object>;
    wallets: Array<Object>;

    constructor(private http: Http){
        // this.token = '5866861fb439a60c787bff3b-5866894cd0b26a265843c378-58668956d0b26a265843c379';
        this.token = '586b55c48a1b181fa80d39a5-586b56038a1b181fa80d39a8-586b7d170512d433b807456e';
    }

    addSpending(item){
        return this.http.post(`${this.HOST}/Spendings`, item, {headers: 
            new Headers({token: this.token})
        }).toPromise()
        .then(response => response.json())
        .catch(this.handleError);
    }

    updateSpending(item){
        return this.http.put(`${this.HOST}/Spendings/${item._id}`, item, {headers: 
            new Headers({token: this.token})
        }).toPromise()
        .then(response => response.json())
        .catch(this.handleError);
    }

    deleteSpending(item){
        return this.http.delete(`${this.HOST}/Wallet/${item._id}`, {headers: 
            new Headers({token: this.token})
        }).toPromise()
        .then(response => response.json())
        .catch(this.handleError);
    }

    addWallet(item){
        return this.http.post(`${this.HOST}/Wallet`, item, {headers: 
            new Headers({token: this.token})
        }).toPromise()
        .then(response => response.json())
        .catch(this.handleError);
    }

    updateWallet(item){
        return this.http.put(`${this.HOST}/Wallet/${item._id}`, item, {headers: 
            new Headers({token: this.token})
        }).toPromise()
        .then(response => response.json())
        .catch(this.handleError);
    }

    deleteWallet(item){
        return this.http.delete(`${this.HOST}/Wallet/${item._id}`, {headers: 
            new Headers({token: this.token})
        }).toPromise()
        .then(response => response.json())
        .catch(this.handleError);
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
        .catch(this.handleError);
    }

    getTypeSpendings(){
        return this.http.get(`${this.HOST}/TypeSpendings`, {headers: 
            new Headers({token: this.token})
        }).toPromise()
        .then(response => response.json())
        .catch(this.handleError);
    }

    getWallets() {
        return this.http.get(`${this.HOST}/Wallet`, {headers: 
            new Headers({token: this.token})
        }).toPromise()
        .then(response => response.json())
        .catch(this.handleError);
    }

    syncData(){
        this.getTypeSpendings().then((typeSpendings) => {
            this.typeSpendings = typeSpendings;
            this.getWallets().then((wallets) => {
                this.wallets = wallets;
            });
        });
    }

    private handleError(error: any): Promise<any> {
        console.error('An error occurred', error); // for demo purposes only
        return Promise.reject(error.message || error);
    }
}