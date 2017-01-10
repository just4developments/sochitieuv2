import { Component } from '@angular/core';
import { NavController, ModalController, AlertController, ToastController, LoadingController, Loading } from 'ionic-angular';

import { AppService } from '../../app/app.service';
import { FormWallet } from './form';

@Component({
  selector: 'wallet-list',
  templateUrl: 'index.html'
})
export class Wallet {
  wallets: any = {
    default: [],
    saving: []
  };

  constructor(public navCtrl: NavController, private appService: AppService, public modalController: ModalController, public alertCtrl: AlertController, public toastCtrl: ToastController, public loadingCtrl: LoadingController) {
    this.loadData();
  }

  loadData(){
    const loading:Loading = this.loadingCtrl.create({
      content: 'Please wait...'
    });
    loading.present();
    this.wallets.default = [];
    this.wallets.saving = [];
    this.appService.getWallets().then((wallets) => {
      for(var w of wallets){
        if(w.type > 0) this.wallets.default.push(w);
        else if(w.type === 0) this.wallets.saving.push(w);
      }
      loading.dismiss();
    });
  }

  add(){
    let item: any = {
      money: 0,
      name: '',
      type: 1,
      icon: ''
    };
    let addModal = this.modalController.create(FormWallet, { wallet: item });
    addModal.onDidDismiss(data => { 
      if(data) this.loadData();
    });
    addModal.present();
  }

  edit(item, slidingItem){
    let editModal = this.modalController.create(FormWallet, { wallet: item});
    editModal.onDidDismiss(data => {
      if(data) this.loadData();
    });
    editModal.present();
    // slidingItem.close();
  }

  delete(item, slidingItem){
    let confirm = this.alertCtrl.create({
      title: 'Do you agree to delete it?',
      message: item.name,
      buttons: [
        {
          text: 'Disagree'
        },
        {
          text: 'Agree',
          handler: () => {
            this.appService.deleteWallet(item).then((resp) => {
              const toast = this.toastCtrl.create({
                message: 'Deleted successfully',
                duration: 3000
              });              
              toast.present();
              // slidingItem.close();
              this.loadData();
            }).catch((err) => {});
          }
        }
      ]
    });
    confirm.present();
  }

}
