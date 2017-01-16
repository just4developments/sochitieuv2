import { Component, ElementRef } from '@angular/core';
import { AppService } from '../../app/app.service';
import { NavParams, ViewController, ToastController } from 'ionic-angular';
import _ from 'lodash';

@Component({
  selector: 'transfer-wallet',
  templateUrl: 'transfer.html'
})
export class TransferWallet {
  wallet: any;
  wallets: Array<any>;
  wallets1: Array<any>;
  toWalletId: any;
  money: number;
  moneyCom: any;

  constructor(private element: ElementRef, public viewCtrl: ViewController, private appService: AppService, params: NavParams, public toastCtrl: ToastController) {
      this.wallet = params.get('wallet');
      let w = params.get('wallets');
      this.wallets = w.default.concat(w.saving);
      this.filterWallet(this.wallet);      
  }

  ngOnInit(){
    this.moneyCom = this.element.nativeElement.querySelector('#money input');
    this.focusMoney();
  }

  filterWallet(data:any){
    let id = _.clone(data._id);
    let self = this;
    self.wallets1 = self.wallets.filter((e) => {
      return e._id !== id;
    });
  }

  transfer(){
    let trans = {
      from: this.wallet._id,
      money: this.money,
      to: this.toWalletId 
    };
    this.appService.transferWallet(trans).then((item) => {
      const toast = this.toastCtrl.create({
        message: 'Transfer successfully',
        duration: 3000
      });
      toast.present();
      this.dismiss(this.wallet);
    }).catch((err) => {
      this.dismiss(undefined);
    });  
  }

  dismiss(data) {
    this.viewCtrl.dismiss(data);
  }

  focusMoney(){
    this.moneyCom.focus();
  }

}
