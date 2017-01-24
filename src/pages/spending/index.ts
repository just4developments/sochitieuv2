import { Component } from '@angular/core';
import { PopoverController, NavParams, NavController, ModalController } from 'ionic-angular';
import _ from 'lodash';
import * as moment from 'moment';

import { AppService } from '../../app/app.service';
import { FormSpending } from './form';
import { SearchByDatePopover } from '../statistic/index-search.popover';
import { Statistic } from '../statistic';
import { WalletSelection } from '../wallet/item-select';

@Component({
  selector: 'list-spending',
  templateUrl: 'index.html'
})
export class Spending {
  isFilter: Boolean = false;
  txtSearch: String = '';
  spendingsRaw: Array<any> = [];
  spendings: Array<any>;
  typeSpendings: Array<any>;
  wallets: Array<any>;
  defaultWalletItem: any;
  total: any = {
    startDate: String,
    endDate: String,
    typeSpendingId: undefined,
    walletId: undefined,
    spendingTypeId: undefined,
    inputDate: new Date().toISOString(),
    spending: 0,
    earning: 0,
    remaining: 0
  };

  constructor(navParams:NavParams, public navCtrl: NavController, public popoverCtrl: PopoverController, private appService: AppService, public modalController: ModalController) {
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
    this.appService.getI18('logout').subscribe((vl) => {
      console.log(vl);
      this.defaultWalletItem = {
        _id: null, 
        name: vl
      };
    });    
  }

  ngOnInit(){
    this.appService.getTypeSpendings().then((typeSpendings) => {
      this.typeSpendings = typeSpendings;  
      this.filter();
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
    let items = _.cloneDeep(this.spendingsRaw);
    this.total.spending = 0;
    this.total.earning = 0;
    this.total.remaining = 0;
    this.spendings = items.filter((item) => {
        item.items = item.items.filter((item0) => {            
            if(this.txtSearch && item0.udes.includes(this.txtSearch)) {
              if(!this.total.walletId && item0.sign_money === 0) return true;
              if(item0.type > 0) this.total.earning += item0.money;
              else if(item0.type < 0) this.total.spending += item0.money;
              return true;
            }
            if(item0.type_spending_uname.includes(this.txtSearch)) {
              if(!this.total.walletId && item0.sign_money === 0) return true;
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

  filterWallet(walletId){
    this.total.walletId = this.total.walletId !== walletId ? walletId : null;    
    this.filter();
  }

  filterSpendingType(typeSpendingId){
    this.total.typeSpendingId = this.total.typeSpendingId !== typeSpendingId ? typeSpendingId : null;    
    this.filter();
  }

  filter(){
    this.appService.showLoading('Please wait...').then(() => {;
      this.spendingsRaw = null;
      this.spendings = null;   
      this.appService.getWallets(1).then((wallets) => {
        this.wallets = wallets;              
        this.appService.getSpendings(this.total.walletId, new Date(this.total.startDate), new Date(this.total.endDate), this.total.typeSpendingId).then((spendings) => {
          let today:any = moment(new Date());
          let yesterday:any = moment(new Date());
          yesterday.add(-1, 'days');
          this.reformatSpending(spendings.map((e) => {
            e.type_spending = this.typeSpendings.find(t=>t._id === e.type_spending_id);
            e.type_spending_uname = e.type_spending.uname;  
            e.wallet = this.wallets.find(t=>t._id === e.wallet_id);
            e.input_date = new Date(e.input_date);
            return e;
          }), today, yesterday);      
          this.filterText();
          this.appService.hideLoading();
        });
      });        
    });
  }

  pickWallet(){
    let walletSelectionModal = this.modalController.create(WalletSelection, { wallets: this.wallets });
    walletSelectionModal.onDidDismiss(data => { 
      if(data) this.filter();
    });
    walletSelectionModal.present();
  }

  add(){
    let item: any = {
      input_date: new Date(),
      wallet_id: this.wallets[0]._id
    };
    let addModal = this.modalController.create(FormSpending, { spending: item, typeSpendings: this.typeSpendings, wallets: this.wallets });
    addModal.onDidDismiss(data => { 
      if(data) this.filter();
    });
    addModal.present();
  }

  edit(item, slidingItem){
    let editModal = this.modalController.create(FormSpending, { spending: _.cloneDeep(item), typeSpendings: this.typeSpendings, wallets: this.wallets });
    editModal.onDidDismiss(data => {
      if(data) {
        this.filter();
      }
    });
    editModal.present();
    // slidingItem.close();
  }

  delete(item, slidingItem){
    this.appService.confirm('Do you agree to delete it?', item.des, [
        {
          text: 'Disagree'
        },
        {
          text: 'Agree',
          handler: () => {
            this.appService.deleteSpending(item).then((resp) => {
              this.appService.toast('Deleted successfully');
              // slidingItem.close();
              this.filter();
            }).catch((err) => {});
          }
        }
    ]);
  }

  toDate(sdate){
    return new Date(sdate);
  }

  reformatSpending(spendings, today, yesterday){
    let tmp;
    let arr;
    let spendingsRaw: any = [];
    for(let s of spendings){
      const m = moment(s.input_date);
      const date = m.format('DD-MM-YYYY');
      if(tmp !== date){
        if(arr && arr.items.length > 0) spendingsRaw.push(arr);        
        arr = {          
          date: m.format('DD'),
          day: m.format('dddd'),
          monthyear: m.format('MMMM YYYY'),
          input_date: s.input_date,
          smoney: 0,
          emoney: 0,
          items: []
        };
        if(today.format('DD-MM-YYYY') === date) arr.today = true;
        else if(yesterday.format('DD-MM-YYYY') === date) arr.yesterday = true;
        tmp = date;
      }
      arr.items.push(s);
      if(!this.total.walletId && s.sign_money === 0) continue;
      if(s.type < 0) arr.smoney += s.money;
      else if(s.type > 0) arr.emoney += s.money;      
    }    
    if(arr && arr.items.length > 0) spendingsRaw.push(arr);
    this.spendingsRaw = spendingsRaw;    
  }

  gotoChart(){
    this.navCtrl.push(Statistic);
  }

  toogleFilter(){
    this.isFilter = !this.isFilter;
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
