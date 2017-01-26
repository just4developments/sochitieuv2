import { Component, ElementRef, ViewChild } from '@angular/core';
import { AppService } from '../../app/app.service';
import { NavParams, ViewController } from 'ionic-angular';

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
  des: string;
  @ViewChild('moneyInput') moneyInput;

  constructor(private element: ElementRef, public viewCtrl: ViewController, private appService: AppService, params: NavParams) {
      this.wallet = params.get('wallet');
      let w = params.get('wallets');
      this.wallets = w.default.concat(w.saving);
      this.filterWallet(this.wallet);      
  }

  filterWallet(data:any){
    this.wallets1 = this.wallets.filter((e) => {
      return e._id !== data._id;
    });
    if(this.wallets1.length > 0) this.toWalletId = this.wallets1[0]._id;
  }

  transfer(){
    let trans = {
      from: this.wallet._id,
      money: this.money,
      to: this.toWalletId,
      des: this.des
    };
    this.appService.transferWallet(trans).then((item) => {
      this.appService.getI18('confirm__transfer_done').subscribe((msg) => {
        this.appService.toast(msg);
      });
      this.dismiss(this.wallet);
    }).catch((err) => {
      this.dismiss(undefined);
    });  
  }

  dismiss(data) {
    this.viewCtrl.dismiss(data);
  }

  focusMoney(){
    this.moneyInput.setFocus();
  }

}
