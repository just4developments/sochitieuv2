import { Component } from '@angular/core';
import { AppService } from '../../app/app.service';
import { NavController, NavParams, ViewController, ToastController } from 'ionic-angular';

@Component({
  selector: 'form-typespending',
  templateUrl: 'form.html'
})
export class FormTypeSpending {
  typespending: any;
  parent: any;

  constructor(public viewCtrl: ViewController, public navCtrl: NavController, private appService: AppService, params: NavParams, public toastCtrl: ToastController) {
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

  dismiss(data) {
    this.viewCtrl.dismiss(data);
  }

}
