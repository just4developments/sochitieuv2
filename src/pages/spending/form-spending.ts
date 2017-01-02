import { Component } from '@angular/core';
import { AppService } from '../../app/app.service';
import { NavController, NavParams, ViewController } from 'ionic-angular';

@Component({
  selector: 'form-spending',
  templateUrl: 'form-spending.html'
})
export class FormSpending {
  spending: any;
  typeSpendings: Array<any>;
  wallets: Array<any>;

  constructor(public viewCtrl: ViewController, public navCtrl: NavController, private appService: AppService, params: NavParams) {
      this.spending = params.get('spending');
      this.spending.input_date = this.spending.input_date.toISOString();
      this.typeSpendings = params.get('typeSpendings');
      this.wallets = params.get('wallets');
  }

  save(){
    this.dismiss(this.spending);
  }

  dismiss(data) {
    this.spending.money = +this.spending.money || 0;
    this.spending.input_date = moment(this.spending.input_date, 'YYYY-MM-DD').toDate();
    this.spending.type_spending = this.typeSpendings.find(t=>t._id === this.spending.type_spending_id);
    this.spending.wallet = this.wallets.find(t=>t._id === this.spending.wallet_id);
    this.viewCtrl.dismiss(data);
  }

}
