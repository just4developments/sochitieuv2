import { Component } from '@angular/core';
import { AppService } from '../../app/app.service';
import { NavController, NavParams, ViewController, ToastController } from 'ionic-angular';

@Component({
  selector: 'form-spending',
  templateUrl: 'form-spending.html'
})
export class FormSpending {
  spending: any;
  typeSpendings: Array<any>;
  wallets: Array<any>;

  constructor(public viewCtrl: ViewController, public navCtrl: NavController, private appService: AppService, params: NavParams, public toastCtrl: ToastController) {
      this.spending = params.get('spending');
      this.spending.input_date = this.spending.input_date.toISOString();
      this.typeSpendings = params.get('typeSpendings');
      this.wallets = params.get('wallets');
  }

  save(){
    if(this.spending._id){
      this.appService.updateSpending(this.spending).then((item) => {
        const toast = this.toastCtrl.create({
          message: 'Updated successfully',
          duration: 3000
        });
        toast.present();
        this.dismiss(this.spending);
      }).catch((err) => {
        this.dismiss(undefined);
      });
    }else{
      this.appService.addSpending(this.spending).then((item) => {
        const toast = this.toastCtrl.create({
          message: 'Added successfully',
          duration: 3000
        });
        toast.present();
        this.dismiss(this.spending);
      }).catch((err) => {
        this.dismiss(undefined);
      });
    }    
  }

  dismiss(data) {
    this.spending.money = +this.spending.money || 0;
    this.spending.input_date = moment(this.spending.input_date, 'YYYY-MM-DD').toDate();
    this.spending.type_spending = this.typeSpendings.find(t=>t._id === this.spending.type_spending_id);
    this.spending.wallet = this.wallets.find(t=>t._id === this.spending.wallet_id);
    this.viewCtrl.dismiss(data);
  }

}
