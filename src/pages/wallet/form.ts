import { Component } from '@angular/core';
import { AppService } from '../../app/app.service';
import { NavController, NavParams, ViewController, ToastController, ModalController } from 'ionic-angular';

import { IconPicker } from '../type_spending/icon-picker';

@Component({
  selector: 'form-wallet',
  templateUrl: 'form.html'
})
export class FormWallet {
  wallet: any;
  isSaving: boolean;

  constructor(public viewCtrl: ViewController, public navCtrl: NavController, private appService: AppService, params: NavParams, public toastCtrl: ToastController, public modalController: ModalController) {
      this.wallet = params.get('wallet');
      this.isSaving = this.wallet.type === 0;
  }

  changeType(){
    this.wallet.type = this.isSaving ? 0 : 1;
  }

  save(){
    if(this.wallet._id){
      this.appService.updateWallet(this.wallet).then((item) => {
        const toast = this.toastCtrl.create({
          message: 'Updated successfully',
          duration: 3000
        });
        toast.present();
        this.dismiss(this.wallet);
      }).catch((err) => {
        this.dismiss(undefined);
      });
    }else{
      this.appService.addWallet(this.wallet).then((item) => {
        const toast = this.toastCtrl.create({
          message: 'Added successfully',
          duration: 3000
        });
        toast.present();
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
