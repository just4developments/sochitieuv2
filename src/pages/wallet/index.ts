import { Component } from '@angular/core';
import { ModalController } from 'ionic-angular';
import _ from 'lodash';

import { AppService } from '../../app/app.service';
import { FormWallet } from './form';
import { TransferWallet } from './transfer';

@Component({
  selector: 'wallet-list',
  templateUrl: 'index.html'
})
export class Wallet {
  wallets: any = {
    default: [],
    saving: []
  };

  constructor(private appService: AppService, public modalController: ModalController) {
    this.loadData();
  }

  loadData(){
    this.appService.showLoading('Please wait...').then(() => {
      this.wallets.default = [];
      this.wallets.saving = [];
      this.appService.getWallets().then((wallets) => {
        for(var w of wallets){
          if(w.type > 0) this.wallets.default.push(w);
          else if(w.type === 0) this.wallets.saving.push(w);
        }
        this.appService.hideLoading();
      });
    });
  }

  add(){
    let item: any = {
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
    let editModal = this.modalController.create(FormWallet, { wallet: _.cloneDeep(item)});
    editModal.onDidDismiss(data => {
      if(data) this.loadData();
    });
    editModal.present();
    // slidingItem.close();
  }

  transfer(item, slidingItem){
    let transferModal = this.modalController.create(TransferWallet, { wallet: _.cloneDeep(item), wallets: this.wallets});
    transferModal.onDidDismiss(data => {
      if(data) this.loadData();
    });
    transferModal.present();
    // slidingItem.close();
  }

  delete(item, slidingItem){
    this.appService.confirm('Do you agree to delete it?', item.name, [
        {
          text: 'Disagree'
        },
        {
          text: 'Agree',
          handler: () => {
            this.appService.deleteWallet(item).then((resp) => {
              this.appService.toast('Deleted successfully');
              // slidingItem.close();
              this.loadData();
            }).catch((err) => {});
          }
        }
    ]);
  }

}
