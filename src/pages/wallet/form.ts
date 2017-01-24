import { Component, ViewChild } from '@angular/core';
import { AppService } from '../../app/app.service';
import { NavParams, ViewController, ModalController } from 'ionic-angular';

import { IconPicker } from '../type_spending/icon-picker';

@Component({
  selector: 'form-wallet',
  templateUrl: 'form.html'
})
export class FormWallet {
  wallet: any;
  isSaving: boolean;
  @ViewChild('moneyInput') moneyInput;

  constructor(public viewCtrl: ViewController, private appService: AppService, params: NavParams, public modalController: ModalController) {
      this.wallet = params.get('wallet');
      if(!this.wallet.oder) this.wallet.oder = 1;
      this.wallet.isApplyToSpending = !!this.wallet.name;
      this.isSaving = this.wallet.type === 0;
  }

  changeType(){
    this.wallet.type = this.isSaving ? 0 : 1;
  }

  focusMoney(){
    this.moneyInput.setFocus();
  }

  save(){
    if(this.wallet._id){
      this.appService.updateWallet(this.wallet).then((item) => {
        this.appService.toast('Updated successfully');
        this.dismiss(this.wallet);
      }).catch((err) => {
        this.dismiss(undefined);
      });
    }else{
      this.appService.addWallet(this.wallet).then((item) => {
        this.appService.toast('Added successfully');
        this.dismiss(this.wallet);
      }).catch((err) => {
        this.dismiss(undefined);
      });
    }    
  }

  changeIcon(){
    let pickModal = this.modalController.create(IconPicker);
    pickModal.onDidDismiss(data => {
      if(data) {
        this.wallet.icon = data.icon;
        this.wallet.sicon = data.sicon;
      }
    });
    pickModal.present();
  }

  dismiss(data) {
    if(data){
      data.money = +data.money || 0;    
    }
    this.viewCtrl.dismiss(data);
  }

}
