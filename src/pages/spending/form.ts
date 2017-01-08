import { Component } from '@angular/core';
import { AppService } from '../../app/app.service';
import { NavController, NavParams, ViewController, ToastController } from 'ionic-angular';

@Component({
  selector: 'form-spending',
  templateUrl: 'form.html'
})
export class FormSpending {
  spending: any;
  type: String = 'spending';
  type_spending_id: String;
  type_earning_id: String;
  typeSpendings: Array<any>;
  typeEarnings: Array<any>;
  wallets: Array<any>;
  walletOptions: any = {
    title: 'Wallets',
    subTitle: 'Select your available wallets'
  }
  typeSpendingOptions: any = {
    title: 'Type spending',
    subTitle: 'Select your type spending'
  }

  constructor(public viewCtrl: ViewController, public navCtrl: NavController, private appService: AppService, params: NavParams, public toastCtrl: ToastController) {
      this.spending = params.get('spending');
      this.spending.input_date = this.spending.input_date.toISOString();
      let types = params.get('typeSpendings');
      this.typeEarnings = [];
      this.typeSpendings = [];
      for(let t of types){
        if(t.type > 0) {
          this.typeEarnings.push(t);
          if(!this.type_earning_id) this.type_earning_id = t._id;
          if(this.spending.type_spending_id === t._id) {
            this.type = 'earning';
            this.type_earning_id = t._id;
          }
        }
        else if(t.type < 0) {
          this.typeSpendings.push(t);
          if(!this.type_spending_id) this.type_spending_id = t._id;
          if(this.spending.type_spending_id === t._id) {
            this.type = 'spending';
            this.type_spending_id = t._id;
          }
        }
      }
      this.wallets = params.get('wallets');
  }
  
  changeTabType(){

  }

  save(){
    let typeSpending;
    if(this.type === 'spending'){
      this.spending.type_spending_id = this.type_spending_id;
      typeSpending = this.typeSpendings.find((e) => {
        return e._id === this.spending.type_spending_id;
      });
    }else {
      this.spending.type_spending_id = this.type_earning_id;
      typeSpending = this.typeEarnings.find((e) => {
        return e._id === this.spending.type_spending_id;
      });
    }
    this.spending.typeSpending = typeSpending;
    this.spending.type = this.spending.typeSpending.type;
    console.log(this.spending);
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
    if(data){
      data.money = +data.money || 0;
      data.input_date = moment(data.input_date, 'YYYY-MM-DD').toDate();
      data.wallet = this.wallets.find(t=>t._id === data.wallet_id);
    }
    this.viewCtrl.dismiss(data);
  }

}
