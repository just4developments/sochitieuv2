import { Component } from '@angular/core';
import { PopoverController, NavParams, NavController, ModalController, LoadingController, Loading, AlertController, ToastController } from 'ionic-angular';
import _ from 'lodash';

import { AppService } from '../../app/app.service';
import { FormSpending } from './form';
import { SearchByDatePopover } from '../statistic/index-search.popover';
import { Statistic } from '../statistic';

@Component({
  selector: 'list-spending',
  templateUrl: 'index.html'
})
export class Spending {
  txtSearch: String = '';
  spendingsRaw: Array<any> = [];
  spendings: Array<any>;
  typeSpendings: Array<any>;
  wallets: Array<any>;
  total: any = {
    startDate: String,
    endDate: String,
    typeSpendingId: undefined,
    walletId: undefined,
    inputDate: new Date().toISOString(),
    spending: 0,
    earning: 0,
    remaining: 0
  };

  constructor(navParams:NavParams, public navCtrl: NavController, public popoverCtrl: PopoverController, private appService: AppService, public modalController: ModalController, public loadingCtrl: LoadingController, public alertCtrl: AlertController, public toastCtrl: ToastController) {
    this.total.typeSpendingId = navParams.get('typeSpendingId');
    let startDate = navParams.get('startDate');
    let endDate = navParams.get('endDate');
    if(!startDate){
      startDate = new Date();
      startDate.setDate(1);
      startDate.setHours(0);
      startDate.setMinutes(0);
      startDate.setSeconds(0);
      startDate.setMilliseconds(0);      
    }
    if(!endDate){
      endDate = new Date();
      endDate.setMonth(endDate.getMonth()+1);
      endDate.setDate(0);  
      startDate.setHours(23);
      startDate.setMinutes(59);
      startDate.setSeconds(59);
      startDate.setMilliseconds(999); 
    }
    this.total.startDate = startDate.toISOString();
    this.total.endDate = endDate.toISOString();
  }

  ngOnInit(){
    this.appService.getTypeSpendings().then((typeSpendings) => {
      this.typeSpendings = typeSpendings;  
      this.appService.getWallets(1).then((wallets) => {
        this.wallets = wallets;
        this.filter();
      });        
    });
  }

  nextFilter(){
    let startDate = new Date(this.total.startDate);
    startDate.setDate(1);
    startDate.setMonth(startDate.getMonth()+1);
    this.total.startDate = startDate.toISOString();
    
    let endDate = new Date(this.total.endDate);    
    endDate.setMonth(endDate.getMonth()+2);
    endDate.setDate(0);
    this.total.endDate = endDate.toISOString();

    this.filter();
  }

  prevFilter(){
    let startDate = new Date(this.total.startDate);
    startDate.setDate(1);
    startDate.setMonth(startDate.getMonth()-1);
    this.total.startDate = startDate.toISOString();
    
    let endDate = new Date(this.total.endDate);    
    endDate.setMonth(endDate.getMonth());
    endDate.setDate(0);
    this.total.endDate = endDate.toISOString();

    this.filter();
  }

  filterText(){
    const text = this.txtSearch;
    if(text !== this.txtSearch) return;
    let items = _.cloneDeep(this.spendingsRaw);
    this.total.spending = 0;
    this.total.earning = 0;
    this.total.remaining = 0;
    this.spendings = items.filter((item) => {
        item.items = item.items.filter((item0) => {
            if(item0['des'].includes(text)) {
              if(item0.type > 0) this.total.earning += item0.money;
              else if(item0.type < 0) this.total.spending += item0.money;
              return true;
            }
            if(item0['type_spending_name'].includes(text)) {
              if(item0.type > 0) this.total.earning += item0.money;
              else if(item0.type < 0) this.total.spending += item0.money;
              return true;
            }
            return false;
        });
        return item.items.length > 0;
    });
    this.total.remaining = this.total.earning - this.total.spending;
  }

  filter(){
    const loading:Loading = this.loadingCtrl.create({
      content: 'Please wait...'
    });
    loading.present();
    this.spendingsRaw = null;
    this.spendings = null;    
    this.appService.getSpendings(this.total.walletId, new Date(this.total.startDate), new Date(this.total.endDate), this.total.typeSpendingId).then((spendings) => {
      this.reformatSpending(spendings.map((e) => {
        e.type_spending = this.typeSpendings.find(t=>t._id === e.type_spending_id);
        e.type_spending_name = e.type_spending.name;  
        e.wallet = this.wallets.find(t=>t._id === e.wallet_id);
        e.input_date = new Date(e.input_date);                
        return e;
      }));      
      this.filterText();
      loading.dismiss();
    });
  }

  add(){
    let item: any = {
      input_date: new Date(),
      isCal: 1,
      wallet_id: this.wallets[0]._id
    };
    let addModal = this.modalController.create(FormSpending, { spending: item, typeSpendings: this.typeSpendings, wallets: this.wallets });
    addModal.onDidDismiss(data => { 
      if(data) this.filter();
    });
    addModal.present();
  }

  edit(item, slidingItem){
    let editModal = this.modalController.create(FormSpending, { spending: item, typeSpendings: this.typeSpendings, wallets: this.wallets });
    editModal.onDidDismiss(data => {
      if(data) this.filter();
    });
    editModal.present();
    // slidingItem.close();
  }

  delete(item, slidingItem){
    let confirm = this.alertCtrl.create({
      title: 'Do you agree to delete it?',
      message: item.des,
      buttons: [
        {
          text: 'Disagree'
        },
        {
          text: 'Agree',
          handler: () => {
            this.appService.deleteSpending(item).then((resp) => {
              const toast = this.toastCtrl.create({
                message: 'Deleted successfully',
                duration: 3000
              });
              toast.present();
              // slidingItem.close();
              this.filter();
            }).catch((err) => {});
          }
        }
      ]
    });
    confirm.present();
  }

  toDate(sdate){
    return new Date(sdate);
  }

  reformatSpending(spendings){
    let tmp;
    let arr;
    let spendingsRaw: any = [];
    for(let s of spendings){
      const date = s.day + '-' + s.month + '-' + s.year;
      if(tmp !== date){
        if(arr && arr.items.length > 0) spendingsRaw.push(arr);
        const m = moment(s.input_date);
        arr = {
          date: m.format('DD'),
          day: m.format('dddd'),
          monthyear: m.format('MMMM YYYY'),
          input_date: s.input_date,
          smoney: 0,
          emoney: 0,
          items: []
        };
        tmp = date;
      }
      if(s.type < 0) arr.smoney += s.money;
      else if(s.type > 0) arr.emoney += s.money;
      arr.items.push(s);
    }    
    if(arr && arr.items.length > 0) spendingsRaw.push(arr);
    this.spendingsRaw = spendingsRaw;    
  }

  gotoChart(){
    this.navCtrl.push(Statistic);
  }

  openSearch(myEvent){
        let popover = this.popoverCtrl.create(SearchByDatePopover, {filter: this.total});
        popover.onDidDismiss(data => {
            if(data) {
                this.total.startDate = data.startDate;
                this.total.endDate = data.endDate;
                this.filter();
            }
        });
        popover.present({
            ev: myEvent
        });
    }

}
