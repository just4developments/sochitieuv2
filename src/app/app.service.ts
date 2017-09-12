import { Injectable, EventEmitter } from '@angular/core';
import { Storage } from '@ionic/storage';
import { Http, Headers, Response, RequestOptions } from '@angular/http';
import { Platform, ToastController, LoadingController, Loading, AlertController, Alert } from 'ionic-angular';
import 'rxjs/add/operator/toPromise';
import { Observable } from "rxjs/Observable";
import { TranslateService } from 'ng2-translate/ng2-translate';
//import * as moment from 'moment';

import { MyApp } from './app.component';

@Injectable()
export class AppService {
    mainEvent: EventEmitter<any> = new EventEmitter();
    // Home
    HOST: string = '';
    AUTH: string = '';
    FILE: string = '';
    LOG: string = '';
    DEFAULT_PJ: string = '597d7ded1c07314f60df9dcc';
    DEFAULT_ROLE: string = '597d7ded1c07314f60df9dce';

    // Office
    // HOST: string = 'http://localhost:9601';
    // AUTH: string = 'http://localhost:9600'; 
    // DEFAULT_PJ: string = '58f6da4b9c53b12570637c06';
    // DEFAULT_ROLES: Array<string> = ['58f6da4b9c53b12570637c07'];



    ADMOB_ID: string = 'ca-app-pub-7861623744178820/4354579197';

    requestOptions: RequestOptions;
    typeSpendings: Array<any>;
    spendings: any = {};
    wallets: Array<any>;
    cached: any = {
        spendings: {},
        wallets: {},
        typeSpendings: {}
    };
    loading: Loading;
    public language: string = 'vi';
    public currency: string = 'VND';
    alert: Alert;
    me: any;
    myApp: MyApp;

    date: { utcToLocal, toInputDate, toDatestring } = {
        utcToLocal: (sdate: string, type?: string) => {
            // let date = moment.utc(sdate).toDate();
            const date = new Date(sdate)
            if (type === 'start') {
                date.setHours(0, 0, 0, 0);
            } else if (type === 'end') {
                date.setHours(23, 59, 59, 999);
            }
            return date;
        },
        toInputDate: () => {

        },
        toDatestring: (date: Date | string, type: string) => {
            if (date && typeof date === 'string') date = new Date(date)
            if (type === 'start') {
                (<Date>date).setHours(0, 0, 0, 0);
            } else if (type === 'end') {
                (<Date>date).setHours(23, 59, 59, 999);
            }
            return date.toString();
        }
    };

    constructor(private platform: Platform, private http: Http, public toastCtrl: ToastController, private storage: Storage, private loadingCtrl: LoadingController, private alertCtrl: AlertController, private translateService: TranslateService) {

    }

    changeLanguage(lang?: string) {
        if (lang) {
            this.language = lang;
            this.currency = lang === 'vi' ? 'VND' : 'USD';
        }
        this.translateService.setDefaultLang(this.language);
    }

    getI18(key: any, opts?: any): Observable<any> {
        return this.translateService.get(key, opts);
    }

    setCached(type: string, key: string, value: any) {
        this.cached[type][key] = value;
    }

    getCached(type: string, key: string) {
        return this.cached[type][key];
    }

    removeCached(type?: string, key?: string) {
        if (!type && !key) {
            this.cached.spendings = {};
            this.cached.wallets = {};
            this.cached.typeSpendings = {};
        }
        if (key) return delete this.cached[type][key];
        this.cached[type] = {};
    }

    toDataUrl(src: string, outputFormat?: any) {
        return new Promise((resolve, reject) => {
            var img: any = new Image();
            img.crossOrigin = 'Anonymous';
            img.onload = () => {
                var canvas: any = window.document.createElement('CANVAS');
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

    getRequestOptions(header) {
        return new RequestOptions({ headers: new Headers(header) });
    }

    init(myApp: MyApp) {
        this.myApp = myApp;
        return this.storage.get('token').then((token) => {
            if (token) {
                this.requestOptions = this.getRequestOptions({ token });
                this.storage.get('tokens').then(tokens => {
                    tokens.forEach(e => {
                        if (e.token !== token) this.ping(this.getRequestOptions({ token: e.token }));
                    })
                })
                return this.ping();
            }
        });
    }

    setLocalStorage(key, value): Promise<any> {
        return this.storage.set(key, value);
    }

    getLocalStorage(key): Promise<any> {
        return this.storage.get(key);
    }

    getAdsense() {
        return this.http.head(`${this.HOST}/adsense`, this.requestOptions).toPromise();
    }

    ping(requestOptions?) {
        return this.http.head(`${this.AUTH}/ping`, requestOptions || this.requestOptions).toPromise()
            .then((resp: Response) => {
                return Promise.resolve(requestOptions || this.requestOptions);
            })
            .catch((error) => {
                return this.handleError(this, error);
            });
    }

    add(user, requestOptions) {
        return this.http.post(`${this.AUTH}/register`, user, requestOptions).toPromise()
            .then((resp: Response) => {
                return this.login(user, user.app).then(token => {
                    this.requestOptions = this.getRequestOptions({ token });
                    return resp.json();
                })
            })
            .catch((error) => {
                return this.handleError(this, error);
            });
    }

    login(item: any, app?: string) {
        let headers: any = {
            pj: this.DEFAULT_PJ
        };
        if (app) item.app = app
        return this.http.post(`${this.AUTH}/login`, item, this.getRequestOptions(headers)).toPromise()
            .then((resp: Response) => {
                this.requestOptions = this.getRequestOptions({ token: resp.headers.get('token') });
                this.storage.get('tokens').then(vl => {
                    if (!vl) vl = []
                    const existed = vl.findIndex(e => e.username === item.username)
                    if (existed === -1) {
                        vl.splice(0, 0, { username: item.username, token: resp.headers.get('token') })
                        this.storage.set('tokens', vl);
                    }
                })
                this.storage.set('token', resp.headers.get('token'));
                return resp.headers.get('token')
            })
            .catch((error) => {
                if ([404].indexOf(error.status) !== -1) {
                    headers.role = this.DEFAULT_ROLE
                    item.recover_by = item.username
                    return this.add(item, this.getRequestOptions(headers));
                } else {
                    return this.handleError(this, error);
                }
            });
    }

    logout() {
        this.removeCached();
        return this.storage.remove('token').then(() => {
            return this.storage.remove('tokens')
        })
    }

    merge(email: string, isnew: boolean) {
        return this.http.put(`${this.HOST}/Sync/${email}`, {
            isnew
        }, this.requestOptions).toPromise()
            .then(response => response)
            .catch((error) => {
                return this.handleError(this, error);
            });
    }

    uploadAvatar(inputValue) {
        var formData = new FormData();
        formData.append("files", inputValue.files[0]);
        return this.http.post(`${this.FILE}/upload/599ba93bec111f12bd56cd13`, formData, this.requestOptions).toPromise()
            .then(response => response.text())
            .catch((error) => {
                return this.handleError(this, error);
            });
    }

    storeFile(newFiles, oldFiles) {
        return this.http.put(`${this.FILE}/store`, {
            oldFiles,
            files: newFiles
        }, this.requestOptions).toPromise()
            .then(response => response)
            .catch((error) => {
                return this.handleError(this, error);
            });
    }

    getMe() {
        if (this.me) return Promise.resolve(this.me);
        return this.http.get(`${this.AUTH}/me`, this.requestOptions).toPromise()
            .then(response => response.json())
            .catch((error) => {
                return this.handleError(this, error);
            });
    }

    updateInfor(user) {
        return this.http.put(`${this.AUTH}/me`, user, this.requestOptions).toPromise()
            .then(response => {
                this.me = response.json();
                return this.me;
            }).catch((error) => {
                return this.handleError(this, error);
            });
    }

    getStatisticByMonth(filter?: any) {
        let where: any = [];
        if (filter) {
            if (filter.startDate) {
                where.push('startDate=' + filter.startDate);
            }
            if (filter.endDate) {
                where.push('endDate=' + filter.endDate);
            }
        }
        where = where.join('&');
        if (where.length > 0) where = '?' + where;
        return this.http.get(`${this.HOST}/StatisticByMonth${where}`, this.requestOptions).toPromise()
            .then(response => response.json())
            .catch((error) => {
                return this.handleError(this, error);
            });
    }

    getStatisticByTypeSpending(type: Number, startDate?: Date, endDate?: Date) {
        let where = [];
        if (type !== undefined) {
            where.push(`type=${type}`);
        }
        if (startDate !== undefined) {
            where.push(`startDate=${this.date.toDatestring(startDate, 'start')}`);
        }
        if (endDate !== undefined) {
            where.push(`endDate=${this.date.toDatestring(endDate, 'end')}`);
        }
        let query = '';
        if (where.length > 0) query = '?' + where.join('&');
        return this.http.get(`${this.HOST}/StatisticByTypeSpending${query}`, this.requestOptions).toPromise()
            .then(response => response.json())
            .catch((error) => {
                return this.handleError(this, error);
            });
    }

    addSpending(item) {
        return this.http.post(`${this.HOST}/Spendings`, item, this.requestOptions).toPromise()
            .then(response => {
                this.removeCached('wallets');
                return response.json();
            })
            .catch((error) => {
                return this.handleError(this, error);
            });
    }

    updateSpending(item) {
        return this.http.put(`${this.HOST}/Spendings/${item._id}`, item, this.requestOptions).toPromise()
            .then(response => {
                this.removeCached('wallets');
                return response.json();
            })
            .catch((error) => {
                return this.handleError(this, error);
            });
    }

    unbookmarkSpending(item) {
        return this.http.delete(`${this.HOST}/Spendings/Bookmark/${item._id}`, this.requestOptions).toPromise()
            .then(response => {
                this.removeCached('wallets');
                return response.json();
            })
            .catch((error) => {
                return this.handleError(this, error);
            });
    }

    deleteSpending(item) {
        return this.http.delete(`${this.HOST}/Spendings/${item._id}`, this.requestOptions).toPromise()
            .then(response => {
                this.removeCached('wallets');
                return response.json();
            })
            .catch((error) => {
                return this.handleError(this, error);
            });
    }

    transferWallet(trans) {
        trans.input_date = new Date();
        return this.http.put(`${this.HOST}/Wallet/Transfer`, trans, this.requestOptions).toPromise()
            .then(response => {
                this.removeCached('wallets');
                return response.json();
            })
            .catch((error) => {
                return this.handleError(this, error);
            });
    }

    addWallet(item) {
        item.input_date = new Date();
        return this.http.post(`${this.HOST}/Wallet`, item, this.requestOptions).toPromise()
            .then(response => {
                this.removeCached('wallets', 'type');
                this.removeCached('wallets', 'type' + item.type);
                return response.json();
            })
            .catch((error) => {
                return this.handleError(this, error);
            });
    }

    updateWallet(item) {
        item.input_date = new Date();
        return this.http.put(`${this.HOST}/Wallet/${item._id}`, item, this.requestOptions).toPromise()
            .then(response => {
                this.removeCached('wallets', 'type');
                this.removeCached('wallets', 'type' + item.type);
                return response.json();
            })
            .catch((error) => {
                return this.handleError(this, error);
            });
    }

    deleteWallet(item) {
        return this.http.delete(`${this.HOST}/Wallet/${item._id}`, this.requestOptions).toPromise()
            .then(response => {
                this.removeCached('wallets', 'type');
                this.removeCached('wallets', 'type' + item.type);
                return response.json();
            })
            .catch((error) => {
                return this.handleError(this, error);
            });
    }

    addTypeSpending(item) {
        return this.http.post(`${this.HOST}/TypeSpendings`, item, this.requestOptions).toPromise()
            .then(response => {
                this.removeCached('typeSpendings', 'type');
                this.removeCached('typeSpendings', 'type' + item.type);
                return response.json();
            })
            .catch((error) => {
                return this.handleError(this, error);
            });
    }

    updateTypeSpending(item) {
        return this.http.put(`${this.HOST}/TypeSpendings/${item._id}`, item, this.requestOptions).toPromise()
            .then(response => {
                this.removeCached('typeSpendings', 'type');
                this.removeCached('typeSpendings', 'type' + item.type);
                return response.json();
            })
            .catch((error) => {
                return this.handleError(this, error);
            });
    }

    deleteTypeSpending(item) {
        return this.http.delete(`${this.HOST}/TypeSpendings/${item._id}`, this.requestOptions).toPromise()
            .then(response => {
                this.removeCached('typeSpendings', 'type');
                this.removeCached('typeSpendings', 'type' + item.type);
                return response.json();
            })
            .catch((error) => {
                return this.handleError(this, error);
            });
    }

    getBookmark() {
        return this.http.get(`${this.HOST}/Spendings/Bookmark`, this.requestOptions).toPromise()
            .then(response => response.json())
            .catch((error) => {
                return this.handleError(this, error);
            });
    }

    getLog() {
        return this.http.get(`${this.LOG}?mine=true`, this.requestOptions).toPromise()
            .then(response => response.json())
            .catch((error) => {
                return this.handleError(this, error);
            });
    }

    getSuggestion() {
        return this.http.get(`${this.HOST}/Spendings/Suggestion`, this.requestOptions).toPromise()
            .then(response => response.json())
            .catch((error) => {
                return this.handleError(this, error);
            });
    }

    getSpendings(walletId: string, startDate: Date, endDate: Date, typeSpendingId?: string) {
        let queries = [];
        if (walletId) queries.push(`walletId=${walletId}`);
        if (typeSpendingId) queries.push(`typeSpendingId=${typeSpendingId}`);
        if (startDate !== undefined) {
            queries.push(`startDate=${this.date.toDatestring(startDate, 'start')}`);
        }
        if (endDate !== undefined) {
            queries.push(`endDate=${this.date.toDatestring(endDate, 'end')}`);
        }
        let query = '';
        if (queries.length > 0) {
            query = '?' + queries.join('&');
        }
        return this.http.get(`${this.HOST}/Spendings${query}`, this.requestOptions).toPromise()
            .then(response => response.json())
            .catch((error) => {
                return this.handleError(this, error);
            });
    }

    private sortTypeSpending(typeSpendings) {
        let root = [];
        let childs = [];
        let rs = [];
        for (let t of typeSpendings) {
            if (!t.parent_id) root.push(t);
            else childs.push(t);
        }
        for (let r of root) {
            rs = rs.concat(r, childs.filter((e) => {
                return e.parent_id === r._id;
            }));
        }
        return rs;
    }

    getTypeSpendings(type?: number) {
        if (type !== undefined) {
            const vl = this.getCached('typeSpendings', 'type' + type);
            if (vl) return Promise.resolve(vl);
        } else {
            const vl = this.getCached('typeSpendings', 'type');
            if (vl) return Promise.resolve(vl);
        }

        let where = '';
        if (type !== undefined) where = `?type=${type}`
        return this.http.get(`${this.HOST}/TypeSpendings${where}`, this.requestOptions).toPromise()
            .then(response => {
                const vl = this.sortTypeSpending(response.json());
                if (type !== undefined) {
                    this.setCached('typeSpendings', 'type' + type, vl.filter((e: any) => {
                        return e.type === type;
                    }));
                } else {
                    this.setCached('typeSpendings', 'type', vl);
                }
                return vl;
            })
            .catch((error) => {
                return this.handleError(this, error);
            });
    }

    getWallets(type?: number) {
        if (type !== undefined) {
            const vl = this.getCached('wallets', 'type' + type);
            if (vl) return Promise.resolve(vl);
        } else {
            const vl = this.getCached('wallets', 'type');
            if (vl) return Promise.resolve(vl);
        }
        let where = '';
        if (type !== undefined) where = `?type=${type}`
        return this.http.get(`${this.HOST}/Wallet${where}`, this.requestOptions).toPromise()
            .then(response => {
                const vl = response.json();
                if (type !== undefined) {
                    this.setCached('wallets', 'type' + type, vl.filter((e: any) => {
                        return e.type === type;
                    }));
                } else {
                    this.setCached('wallets', 'type', vl);
                }
                return vl;
            })
            .catch((error) => {
                return this.handleError(this, error);
            });
    }

    showLoading(text): Promise<any> {
        this.loading = this.loadingCtrl.create({
            content: text
        });
        return this.loading.present();
    }

    hideLoading() {
        this.loading.dismissAll();
    }

    toast(txt, time: number = 3000) {
        const toast = this.toastCtrl.create({
            message: txt,
            duration: time
        });
        return toast.present();
    }

    confirm(title: string, mes: string, buttons: Array<any>) {
        if (this.alert) return this.alert;
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

    handleError(_self: AppService, error: any): Promise<any> {
        return new Promise((resolve, reject) => {
            if (_self.loading) _self.loading.dismissAll();
            if (error.status === 0) {
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
            } else if ([403, 401].indexOf(error.status) !== -1) {
                _self.getI18("error__session_expired").subscribe((msg) => {
                    _self.toast(msg);
                });
            } else if ([423].indexOf(error.status) !== -1) {
                _self.getI18("error__account_locked").subscribe((msg) => {
                    _self.toast(msg);
                });
            } else {
                let err = error._body; // ? JSON.parse(error._body) : error._body;
                if (typeof err === 'object') {
                    if (err.message) err = err.message;
                }
                _self.getI18("error__common", { msg: err }).subscribe((msg) => {
                    _self.toast(msg);
                });
            }
            if ([403, 401, 440].indexOf(error.status) !== -1) _self.mainEvent.emit({ logout: true });
        });
    }
}