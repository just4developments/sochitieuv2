import { Component, ElementRef, ViewChild } from '@angular/core';
import { AppService } from '../../app/app.service';
import { NavParams, ViewController, ToastController, AlertController } from 'ionic-angular';

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
  @ViewChild('moneyInput') moneyInput;

  constructor(private element: ElementRef, public viewCtrl: ViewController, private appService: AppService, params: NavParams, public toastCtrl: ToastController, private alertCtrl: AlertController) {
      this.spending = params.get('spending');
      this.spending.input_date = this.spending.input_date.toISOString();
      let types = params.get('typeSpendings');
      this.typeEarnings = [];
      this.typeSpendings = [];
      for(let s of types){
        if(s.type === 0) continue;
        if(!s.parent_id) { 
          if(s.type > 0) this.typeEarnings.push(s);
          else if(s.type < 0) this.typeSpendings.push(s);
        }else {
          if(s.type > 0) {
            let parentIndex = this.typeEarnings.findIndex((e) => {
              return e._id === s.parent_id;
            });
            this.typeEarnings.splice(parentIndex+1, 0, s);
          } else if(s.type < 0) {
            let parentIndex = this.typeSpendings.findIndex((e) => {
              return e._id === s.parent_id;
            });
            this.typeSpendings.splice(parentIndex+1, 0, s);
          }
        }        
        if(!this.spending.type_spending_id || this.spending.type_spending_id === s._id) {
          if(!this.type_earning_id && s.type > 0){
            if(this.spending.type_spending_id) this.type =  'earning';
            this.type_earning_id = s._id;
          }else if(!this.type_spending_id){
            if(this.spending.type_spending_id) this.type =  'spending';
            this.type_spending_id = s._id;
          }
        }
      }
      this.wallets = params.get('wallets');
  }

  ngOnInit(){
    this.focusMoney();
  }

  focusMoney(){    
    this.moneyInput.setFocus();
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
        let confirm = this.alertCtrl.create({
          title: 'Added successfully',
          message: 'Do you want to add new one ?',
          buttons: [
            {
              text: 'Back menu',
              handler: () => {
                this.dismiss(this.spending);
              }
            },
            {
              text: 'Add another',
              handler: () => {
                delete this.spending.money;
                delete this.spending.des;
                this.spending.is_bookmark = false;
              }
            }
          ]
        });
        confirm.present();        
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
