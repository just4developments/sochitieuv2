import { Injectable, EventEmitter } from '@angular/core';
import { Storage } from '@ionic/storage';
import { Http, Headers, Response } from '@angular/http';
import { ToastController, LoadingController, Loading, AlertController } from 'ionic-angular';
import 'rxjs/add/operator/toPromise';

@Injectable()
export class AppService {
    mainEvent: EventEmitter<any> = new EventEmitter();
    // HOST: String = 'http://localhost:9601';
    // AUTH: String = 'http://localhost:9600'; 
    // Home
    // DEFAULT_PJ: String = '586bb85baa5bdf0644e494da';
    // DEFAULT_ROLES: Array<String> = ['586bb85baa5bdf0644e494db'];
    
    // Office
    // DEFAULT_PJ: String = '586b55c48a1b181fa80d39a5';
    // DEFAULT_ROLES: Array<String> = ['586b55c48a1b181fa80d39a6'];

    // Server
    HOST: String = 'http://sct.nanacloset.com';
    AUTH: String = 'http://authv2.nanacloset.com';     
    DEFAULT_PJ: String = '58799ef3d6e7a31c8c6dba82';
    DEFAULT_ROLES: Array<String> = ['58799f33d6e7a31c8c6dba83'];    
    
    token: String;
    typeSpendings: Array<any>;
    spendings: any = {};
    wallets: Array<any>;
    cached: any = {
        spendings: {},
        wallets: {},
        typeSpendings: {}
    };
    loading:Loading;

    me: any;

    constructor(private http: Http, public toastCtrl: ToastController, private storage: Storage, private loadingCtrl: LoadingController, private alertCtrl: AlertController){
        
    }

    setCached(type:string, key:string, value:any){
        this.cached[type][key] = value;
    }

    getCached(type:string, key:string){
        return this.cached[type][key];
    }

    removeCached(type?:string, key?:string){
        if(!type && !key) {
            this.cached.spendings = {};
            this.cached.wallets = {};
            this.cached.typeSpendings = {};
        }
        if(key) return delete this.cached[type][key];
        this.cached[type] = {};
    }

    toDataUrl(src: String, outputFormat?: any) {
        return new Promise((resolve, reject) => {
           var img: any = new Image();
            img.crossOrigin = 'Anonymous';
            img.onload = () => {
                var canvas:any = window.document.createElement('CANVAS');
                var ctx = canvas.getContext('2d');
                var dataURL;
                canvas.height = img.height;
                canvas.width = img.width;
                ctx.drawImage(img, 0, 0);
                dataURL = canvas.toDataURL(outputFormat);
                resolve(dataURL);
            };
            img.onerror = reject;
            img.src = src; 
        });
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
            return Promise.resolve(resp.headers.get('isnew'));
        })
        .catch((error) => {
            return this.handleError(this, error);
        });
    }

    logout(){
        this.storage.clear();
        this.removeCached();
        return Promise.resolve();
    }

    merge(email:String, isnew   : boolean){
        return this.http.put(`${this.HOST}/Sync/${email}`, {
            isnew
        }, {headers: 
            new Headers({token: this.token})
        }).toPromise()
        .then(response => response)
        .catch((error) => {
            return this.handleError(this, error);
        });
    }

    getMe(){
        if(this.me) return Promise.resolve(this.me);
        return this.http.get(`${this.AUTH}/Me`, {headers: 
            new Headers({token: this.token})
        }).toPromise()
        .then(response => response.json())
        .catch((error) => {
            return this.handleError(this, error);
        });
    }

    updateInfor(user){
        return this.http.put(`${this.AUTH}/Me`, user, {headers: 
            new Headers({token: this.token})
        }).toPromise()
        .then(response => {
            this.me = response.json(); 
            return this.me;
        }).catch((error) => {
            return this.handleError(this, error);
        });
    }

    getStatisticByMonth(filter?: any){
        let where:any = [];
        if(filter){
            if(filter.startDate){
                where.push('startDate=' + filter.startDate);
            }
            if(filter.endDate){
                where.push('endDate=' + filter.endDate);
            }
        }
        where = where.join('&');
        if(where.length > 0) where = '?' + where;
        return this.http.get(`${this.HOST}/StatisticByMonth${where}`, {headers: 
            new Headers({token: this.token})
        }).toPromise()
        .then(response => response.json())
        .catch((error) => {
            return this.handleError(this, error);
        });
    }

    getStatisticByTypeSpending(type:Number, startDate?: Date, endDate?: Date){
        let where = [];
        if(type !== undefined) {
            where.push(`type=${type}`);
        }
        if(startDate !== undefined) {
            where.push(`startDate=${startDate.toISOString()}`);
        }
        if(endDate !== undefined) {
            where.push(`endDate=${endDate.toISOString()}`);
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
        .then(response => {
            this.removeCached('wallets');
            return response.json();            
        })
        .catch((error) => {
            return this.handleError(this, error);
        });
    }

    updateSpending(item){
        return this.http.put(`${this.HOST}/Spendings/${item._id}`, item, {headers: 
            new Headers({token: this.token})
        }).toPromise()
        .then(response => {
            this.removeCached('wallets');
            return response.json();            
        })
        .catch((error) => {
            return this.handleError(this, error);
        });
    }

    unbookmarkSpending(item){
        return this.http.delete(`${this.HOST}/Spendings/Bookmark/${item._id}`, {headers: 
            new Headers({token: this.token})
        }).toPromise()
        .then(response => {
            this.removeCached('wallets');
            return response.json();            
        })
        .catch((error) => {
            return this.handleError(this, error);
        });
    }

    deleteSpending(item){
        return this.http.delete(`${this.HOST}/Spendings/${item._id}`, {headers: 
            new Headers({token: this.token})
        }).toPromise()
        .then(response => {
            this.removeCached('wallets');
            return response.json();            
        })
        .catch((error) => {
            return this.handleError(this, error);
        });
    }

    transferWallet(trans){
        trans.input_date = new Date();
        return this.http.put(`${this.HOST}/Wallet/Transfer`, trans, {headers: 
            new Headers({token: this.token})
        }).toPromise()
        .then(response => {
            this.removeCached('wallets');
            return response.json();
        })
        .catch((error) => {
            return this.handleError(this, error);
        });
    }

    addWallet(item){
        item.input_date = new Date();
        return this.http.post(`${this.HOST}/Wallet`, item, {headers: 
            new Headers({token: this.token})
        }).toPromise()
        .then(response => {
            this.removeCached('wallets', 'type');
            this.removeCached('wallets', 'type'+item.type);
            return response.json();
        })
        .catch((error) => {
            return this.handleError(this, error);
        });
    }

    updateWallet(item){        
        item.input_date = new Date();
        return this.http.put(`${this.HOST}/Wallet/${item._id}`, item, {headers: 
            new Headers({token: this.token})
        }).toPromise()
        .then(response => {
            this.removeCached('wallets', 'type');
            this.removeCached('wallets', 'type'+item.type);
            return response.json();
        })
        .catch((error) => {
            return this.handleError(this, error);
        });
    }

    deleteWallet(item){        
        return this.http.delete(`${this.HOST}/Wallet/${item._id}`, {headers: 
            new Headers({token: this.token})
        }).toPromise()
        .then(response => {
            this.removeCached('wallets', 'type');
            this.removeCached('wallets', 'type'+item.type);
            return response.json();
        })
        .catch((error) => {
            return this.handleError(this, error);
        });
    }

    addTypeSpending(item){
        return this.http.post(`${this.HOST}/TypeSpendings`, item, {headers: 
            new Headers({token: this.token})
        }).toPromise()
        .then(response => {
            this.removeCached('typeSpendings', 'type');
            this.removeCached('typeSpendings', 'type'+item.type);
            return response.json();
        })
        .catch((error) => {
            return this.handleError(this, error);
        });
    }

    updateTypeSpending(item){
        return this.http.put(`${this.HOST}/TypeSpendings/${item._id}`, item, {headers: 
            new Headers({token: this.token})
        }).toPromise()
        .then(response => {
            this.removeCached('typeSpendings', 'type');
            this.removeCached('typeSpendings', 'type'+item.type);
            return response.json();
        })
        .catch((error) => {
            return this.handleError(this, error);
        });
    }

    deleteTypeSpending(item){
        return this.http.delete(`${this.HOST}/TypeSpendings/${item._id}`, {headers: 
            new Headers({token: this.token})
        }).toPromise()
        .then(response => {
            this.removeCached('typeSpendings', 'type');
            this.removeCached('typeSpendings', 'type'+item.type);
            return response.json();
        })
        .catch((error) => {
            return this.handleError(this, error);
        });
    }

    getBookmark(){ 
        return this.http.get(`${this.HOST}/Spendings/Bookmark`, {headers: 
            new Headers({token: this.token})
        }).toPromise()
        .then(response => response.json())
        .catch((error) => {
            return this.handleError(this, error);
        });
    }

    getSpendings(walletId: String, startDate: Date, endDate: Date, typeSpendingId?: String){ 
        let queries = [];
        if(walletId) queries.push(`walletId=${walletId}`);
        if(typeSpendingId) queries.push(`typeSpendingId=${typeSpendingId}`);
        if(startDate !== undefined) {
            queries.push(`startDate=${startDate.toISOString()}`);
        }
        if(endDate !== undefined) {
            queries.push(`endDate=${endDate.toISOString()}`);
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

    private sortTypeSpending(typeSpendings){
        let root = [];
        let childs = [];
        let rs = [];
        for(let t of typeSpendings){
            if(!t.parent_id) root.push(t);
            else childs.push(t);
        }
        for(let r of root) {
            rs = rs.concat(r, childs.filter((e) => {
                return e.parent_id === r._id;
            }));
        }
        return rs;
    }

    getTypeSpendings(type?: number){
        if(type !== undefined){
            const vl = this.getCached('typeSpendings', 'type'+type);
            if(vl) return Promise.resolve(vl);            
        }else {
            const vl = this.getCached('typeSpendings', 'type');
            if(vl) return Promise.resolve(vl);            
        }        

        let where = '';
        if(type !== undefined) where = `?type=${type}`
        return this.http.get(`${this.HOST}/TypeSpendings${where}`, {headers: 
            new Headers({token: this.token})
        }).toPromise()
        .then(response => {
            console.log('new type spending');
            const vl = this.sortTypeSpending(response.json());
            if(type !== undefined) {                
                this.setCached('typeSpendings', 'type'+type, vl.filter((e:any) => {
                    return e.type === type;
                }));
            }else {
                this.setCached('typeSpendings', 'type', vl);
            }
            return vl;
        })
        .catch((error) => {
            return this.handleError(this, error);
        });
    }

    getWallets(type?:number) {    
        if(type !== undefined){
            const vl = this.getCached('wallets', 'type'+type);
            if(vl) return Promise.resolve(vl);            
        }else {
            const vl = this.getCached('wallets', 'type');
            if(vl) return Promise.resolve(vl);            
        }     
        let where = '';
        if(type !== undefined) where = `?type=${type}`
        return this.http.get(`${this.HOST}/Wallet${where}`, {headers: 
            new Headers({token: this.token})
        }).toPromise()
        .then(response => {
            console.log('new wallet');
            const vl = response.json();
            if(type !== undefined) {                
                this.setCached('wallets', 'type'+type, vl.filter((e:any) => {
                    return e.type === type;
                }));
            }else {
                this.setCached('wallets', 'type', vl);
            }
            return vl;
        })
        .catch((error) => {
            return this.handleError(this, error);
        });
    }

    showLoading(text): Promise<any>{
        this.loading = this.loadingCtrl.create({
            content: text
        });
        return this.loading.present();
    }

    hideLoading(){
        this.loading.dismiss();
    }

    toast(txt, time:number=3000){
        const toast = this.toastCtrl.create({
            message: txt,
            duration: time
        });
        toast.present();
    }

    confirm(title: string, mes: string, buttons: Array<any>){
        this.alertCtrl.create({
            title: title,
            message: mes,
            buttons: buttons
        }).present();
    }

    handleError(_self:AppService, error: any): Promise<any> {
        return new Promise((resolve, reject) => {      
            if(this.loading) this.loading.dismissAll();      
            if([403, 401].indexOf(error.status) !== -1) {                
                this.toast('Session is expired');
            }else {
                let err = error._body ? JSON.parse(error._body) : error._body;
                if(typeof err === 'object'){
                    if(err.message) err = err.message;
                }
                this.toast('#Error: ' + err);
            }
            this.mainEvent.emit({logout: true});
        });
    }
}