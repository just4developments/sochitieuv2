import { Component } from '@angular/core';
import { AppService } from '../../app/app.service';
import { NavParams, ViewController, ToastController, ModalController } from 'ionic-angular';

import { IconPicker } from './icon-picker';

@Component({
  selector: 'form-typespending',
  templateUrl: 'form.html'
})
export class FormTypeSpending {
  typespending: any;
  parent: any;

  constructor(public viewCtrl: ViewController, private appService: AppService, params: NavParams, public toastCtrl: ToastController, public modalController: ModalController) {
      this.typespending = params.get('typespending');
      this.parent = params.get('parent');
  }

  save(){
    if(this.typespending._id){
      this.appService.updateTypeSpending(this.typespending).then((item) => {
        const toast = this.toastCtrl.create({
          message: 'Updated successfully',
          duration: 3000
        });
        toast.present();
        this.dismiss(this.typespending);
      }).catch((err) => {
        this.dismiss(undefined);
      });
    }else{
      this.appService.addTypeSpending(this.typespending).then((item) => {
        const toast = this.toastCtrl.create({
          message: 'Added successfully',
          duration: 3000
        });
        toast.present();
        this.dismiss(this.typespending);
      }).catch((err) => {
        this.dismiss(undefined);
      });
    }    
  }

  changeIcon(){
    let pickModal = this.modalController.create(IconPicker);
    pickModal.onDidDismiss(data => {
      if(data) {
        this.typespending.icon = data.icon;
        this.typespending.sicon = data.sicon;
      }
    });
    pickModal.present();
  }

  dismiss(data) {
    this.viewCtrl.dismiss(data);
  }

}
