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
    this.appService.getI18("msg__wait").subscribe((msg) => {
      this.appService.showLoading(msg).then(() => {
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
    this.appService.getI18(["confirm__delete", "button__agree", "button__disagree", "confirm__delete_done"]).subscribe((msg) => {
      this.appService.confirm(msg["confirm__delete"], item.name, [
          {
            text: msg['button__disagree']
          },
          {
            text: msg['button__agree'],
            handler: () => {
              this.appService.deleteWallet(item).then((resp) => {
                this.appService.toast(msg["confirm__delete_done"]);
                // slidingItem.close();
                this.loadData();
              }).catch((err) => {});
            }
          }
      ]);
    });
  }

}
