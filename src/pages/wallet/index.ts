import { Component } from '@angular/core';
import { NavController, ModalController, AlertController, ToastController } from 'ionic-angular';

import { AppService } from '../../app/app.service';
import { FormWallet } from './form';

@Component({
  selector: 'wallet',
  templateUrl: 'index.html'
})
export class Wallet {
  wallets: Array<any>;

  constructor(public navCtrl: NavController, private appService: AppService, public modalController: ModalController, public alertCtrl: AlertController, public toastCtrl: ToastController) {
    appService.getWallets().then((wallets) => {
      this.wallets = wallets;
    });
  }

  add(){
    let item: any = {
      money: 0,
      name: ''
    };
    let addModal = this.modalController.create(FormWallet, { wallet: item });
    addModal.onDidDismiss(data => { 
      
    });
    addModal.present();
  }

  edit(item, slidingItem){
    let editModal = this.modalController.create(FormWallet, { wallet: item});
    editModal.onDidDismiss(data => {
      
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

}
