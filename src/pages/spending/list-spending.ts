import { Component } from '@angular/core';
import { NavController, ModalController, LoadingController, Loading, AlertController, ToastController } from 'ionic-angular';

import { AppService } from '../../app/app.service';
import { FormSpending } from './form-spending';

@Component({
  selector: 'list-spending',
  templateUrl: 'list-spending.html'
})
export class ListSpending {
  spendings: Array<any> = [];
  typeSpendings: Array<any>;
  wallets: Array<any>;
  total: any = {
    walletId: undefined,
    inputDate: new Date().toISOString(),
    spending: 0,
    earning: 0,
    remaining: 0
  };

  constructor(public navCtrl: NavController, private appService: AppService, public modalController: ModalController, public loadingCtrl: LoadingController, public alertCtrl: AlertController, public toastCtrl: ToastController) {
    this.appService.getTypeSpendings().then((typeSpendings) => {
      this.typeSpendings = typeSpendings;  
      this.appService.getWallets().then((wallets) => {
        this.wallets = wallets;
        this.filter();
      });        
    });
  }

  nextFilter(){
    let date = moment(this.total.inputDate, 'YYYY-MM-DD');
    date.add(1, 'months');
    this.total.inputDate = date.toDate().toISOString();
    this.filter();
  }
  prevFilter(){
    let date = moment(this.total.inputDate, 'YYYY-MM-DD');
    date.subtract(1, 'months');
    this.total.inputDate = date.toDate().toISOString();
    this.filter();
  }
  filter(){
    const loading:Loading = this.loadingCtrl.create({
      content: 'Please wait...'
    });
    loading.present();
    this.spendings = [];
    this.total.spending = 0;
    this.total.earning = 0;
    this.total.remaining = 0;
    this.appService.getSpendings(this.total.walletId, this.total.inputDate).then((spendings) => {
      this.reformatSpending(spendings.map((e) => {
        e.type_spending = this.typeSpendings.find(t=>t._id === e.type_spending_id);
        e.wallet = this.wallets.find(t=>t._id === e.wallet_id);
        e.input_date = new Date(e.input_date);
        if(e.type_spending.type > 0) this.total.earning += e.money;
        else if(e.type_spending.type < 0) this.total.spending += e.money;
        return e;
      }));
      this.total.remaining = this.total.earning - this.total.spending;
      loading.dismiss();
    });
  }

  add(){
    let item: any = {
      input_date: new Date(),
      money: 0,
      isCal: 1,
      type_spending_id: this.typeSpendings[0]._id,
      wallet_id: this.wallets[0]._id
    };
    let addModal = this.modalController.create(FormSpending, { spending: item, typeSpendings: this.typeSpendings, wallets: this.wallets });
    addModal.onDidDismiss(data => { 
      this.filter();
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
            }).catch((err) => {
              const toast = this.toastCtrl.create({
                message: '#Error: ' + err.message,
                duration: 3000
              });
              toast.present();
            });
          }
        }
      ]
    });
    confirm.present();
  }

  reformatSpending(spendings){
    let tmp;
    let arr;
    for(let s of spendings){
      const date = s.day + '-' + s.month + '-' + s.year;
      if(tmp !== date){
        if(arr) this.spendings.push(arr);
        arr = [];
        tmp = date;
      }
      arr.push(s);
    }
    if(arr && arr.length > 0) this.spendings.push(arr);
  }

}
