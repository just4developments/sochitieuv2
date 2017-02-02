import { Injectable, EventEmitter } from '@angular/core';
import { Storage } from '@ionic/storage';
import { Http, Headers, Response } from '@angular/http';
import { Platform, ToastController, LoadingController, Loading, AlertController, Alert } from 'ionic-angular';
import 'rxjs/add/operator/toPromise';
import { Observable } from "rxjs/Observable";
import { TranslateService } from 'ng2-translate/ng2-translate';
import * as moment from 'moment';

import { MyApp } from './app.component';

@Injectable()
export class AppService {
    mainEvent: EventEmitter<any> = new EventEmitter();    
    // Home
    // HOST: string = 'http://localhost:9601';
    // AUTH: string = 'http://localhost:9600'; 
    // DEFAULT_PJ: string = '586bb85baa5bdf0644e494da';
    // DEFAULT_ROLES: Array<string> = ['586bb85baa5bdf0644e494db'];
    
    // Office
    // HOST: string = 'http://localhost:9601';
    // AUTH: string = 'http://localhost:9600'; 
    // DEFAULT_PJ: string = '586b55c48a1b181fa80d39a5';
    // DEFAULT_ROLES: Array<string> = ['586b55c48a1b181fa80d39a6'];

    // Server
    HOST: string = 'http://sct.nanacloset.com';
    AUTH: string = 'http://authv2.nanacloset.com';     
    DEFAULT_PJ: string = '58799ef3d6e7a31c8c6dba82';
    DEFAULT_ROLES: Array<string> = ['58799f33d6e7a31c8c6dba83'];    

    ADMOB_ID: string = 'ca-app-pub-7861623744178820/4354579197';
    
    token: string;
    typeSpendings: Array<any>;
    spendings: any = {};
    wallets: Array<any>;
    cached: any = {
        spendings: {},
        wallets: {},
        typeSpendings: {}
    };
    loading:Loading;
    public language: string = 'vi';
    public currency: string = 'VND';
    alert: Alert;
    me: any;
    myApp: MyApp;

    date:{utcToLocal, toInputDate, toDatestring} = {
        utcToLocal: (sdate: string) => {
            return moment.utc(sdate).toDate();
        },
        toInputDate:()=>{

        },
        toDatestring: (date) => {
            return date.toString();
        }
    };

    constructor(private platform: Platform, private http: Http, public toastCtrl: ToastController, private storage: Storage, private loadingCtrl: LoadingController, private alertCtrl: AlertController, private translateService: TranslateService){
        
    }

    changeLanguage(lang?:string){
        if(lang) {
            this.language = lang;
            this.currency = lang === 'vi' ? 'VND' : 'USD';
        }
        this.translateService.setDefaultLang(this.language);
    }

    getI18(key:any, opts?: any): Observable<any>{
        return this.translateService.get(key, opts);
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

    toDataUrl(src: string, outputFormat?: any) {
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

    init(myApp: MyApp){
        this.myApp = myApp;
        return this.storage.get('token').then((token) => {
            if(token) { 
                this.token = token;
                return this.ping();
            }
        });
    }

    setLocalStorage(key, value): Promise<any>{
        return this.storage.set(key, value);
    }

    getLocalStorage(key): Promise<any>{
        return this.storage.get(key);
    }

    ping() {
        return this.http.head(`${this.AUTH}/Ping`, {headers: 
            new Headers({token: this.token})
        }).toPromise()
        .then((resp: Response) => {
            return Promise.resolve(this.token);
        })
        .catch((error) => {
            return this.handleError(this, error);
        });
    }

    login(item:any, app?:string){
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

    merge(email:string, isnew   : boolean){
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
            where.push(`startDate=${this.date.toDatestring(startDate)}`);
        }
        if(endDate !== undefined) {
            where.push(`endDate=${this.date.toDatestring(endDate)}`);
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

    getSuggestion(){
        return this.http.get(`${this.HOST}/Spendings/Suggestion`, {headers: 
            new Headers({token: this.token})
        }).toPromise()
        .then(response => response.json())
        .catch((error) => {
            return this.handleError(this, error);
        });
    }

    getSpendings(walletId: string, startDate: Date, endDate: Date, typeSpendingId?: string){ 
        let queries = [];
        if(walletId) queries.push(`walletId=${walletId}`);
        if(typeSpendingId) queries.push(`typeSpendingId=${typeSpendingId}`);
        if(startDate !== undefined) {
            queries.push(`startDate=${this.date.toDatestring(startDate)}`);
        }
        if(endDate !== undefined) {
            queries.push(`endDate=${this.date.toDatestring(endDate)}`);
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
        this.loading.dismissAll();
    }

    toast(txt, time:number=3000){
        const toast = this.toastCtrl.create({
            message: txt,
            duration: time
        });
        toast.present();
    }

    confirm(title: string, mes: string, buttons: Array<any>){
        if(this.alert) return this.alert;
        this.alert = this.alertCtrl.create({
            title: title,
            message: mes,
            buttons: buttons
        });
        this.alert.present();
        this.alert.onDidDismiss((params) => {
           this.alert = null; 
        });
        return this.alert;
    }

    handleError(_self:AppService, error: any): Promise<any> {
        return new Promise((resolve, reject) => { 
            if(_self.loading) _self.loading.dismissAll();      
            if(error.status === 0){
                _self.getI18(["error__no_network", "error__no_network_des", "button__try_again", "button__quit"]).subscribe((msg) => {
                   _self.confirm(msg["error__no_network"], msg["error__no_network_des"], [
                        {
                            text: msg['button__quit'],
                            handler: () => {
                                _self.platform.exitApp();
                            }
                        },
                        {
                        text: msg['button__try_again'],
                            handler: () => {
                                this.alert.dismiss().then((params) => {                                    
                                    this.myApp.backToDashboard();    
                                });                                
                            }
                        }
                   ]);
                });    
                return;
            }else if([403, 401].indexOf(error.status) !== -1) { 
                _self.getI18("error__session_expired").subscribe((msg) => {
                   _self.toast(msg);
                });                
            }else {
                let err = error._body ? JSON.parse(error._body) : error._body;
                if(typeof err === 'object'){
                    if(err.message) err = err.message;
                }
                _self.getI18("error__common", {msg: err}).subscribe((msg) => {
                   _self.toast(msg);
                });                
            }
            if(error.status !== 400) _self.mainEvent.emit({logout: true});
        });
    }
}