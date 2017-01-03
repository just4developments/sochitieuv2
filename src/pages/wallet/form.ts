import { Component } from '@angular/core';
import { AppService } from '../../app/app.service';
import { NavController, NavParams, ViewController, ToastController } from 'ionic-angular';

@Component({
  selector: 'form-wallet',
  templateUrl: 'form.html'
})
export class FormWallet {
  wallet: any;

  constructor(public viewCtrl: ViewController, public navCtrl: NavController, private appService: AppService, params: NavParams, public toastCtrl: ToastController) {
      this.wallet = params.get('wallet');
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
        const toast = this.toastCtrl.create({
          message: '#Error: ' + err.message,
          duration: 3000
        });
        toast.present();
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
        const toast = this.toastCtrl.create({
          message: '#Error: ' + err.message,
          duration: 3000
        });
        toast.present();
        this.dismiss(undefined);
      });
    }    
  }

  dismiss(data) {
    this.wallet.money = +this.wallet.money || 0;    
    this.viewCtrl.dismiss(data);
  }

}
