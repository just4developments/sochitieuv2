import { Component, ElementRef, ViewChild } from '@angular/core';
import { AppService } from '../../app/app.service';
import { NavParams, ViewController } from 'ionic-angular';
import _ from 'lodash';
import * as moment from 'moment';

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
  };
  typeSpendingOptions: any = {
    title: 'Type spending',
    subTitle: 'Select your type spending'
  };
  @ViewChild('moneyInput') moneyInput;
  isChangedData: boolean = false;
  oldSubmoney: number = 0;
  suggestion: Array<any> = [];
  suggestionObject: Array<any> = [];

  constructor(private element: ElementRef, public viewCtrl: ViewController, private appService: AppService, params: NavParams) {
      this.spending = params.get('spending');
      if(this.spending._id) this.oldSubmoney = _.clone(this.spending.money)*this.spending.type;
      this.spending.input_date = this.spending.input_date.toISOString();
      
      this.appService.getSuggestion().then((resp) => {
        this.suggestion = resp.map((e) => {
          return e._id;
        });
        for(let i in resp) {
          this.suggestionObject[resp[i]._id] = resp[i].spendings;
        }
      });

      let types = params.get('typeSpendings');
      this.typeEarnings = [];
      this.typeSpendings = [];      
      for(let s of types){
        if(s.type === 0) continue;
        if(s.type > 0) this.typeEarnings.push(s);
        else if(s.type < 0) this.typeSpendings.push(s);  
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

  pickSuggestion(name){
    const pick = this.suggestionObject[name];
    if(pick){
      if(pick.type < 0) this.type_spending_id = pick.type_spending_id;
      else if(pick.type > 0) this.type_earning_id = pick.type_spending_id;
      this.spending.wallet_id = pick.wallet_id;
    }
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
        this.appService.toast('Updated successfully');
        this.dismiss(this.spending);
      }).catch((err) => {
        this.dismiss(undefined);
      });
    }else{
      this.appService.addSpending(this.spending).then((item) => {
        this.isChangedData = true;
        this.appService.toast('Added successfully');
        this.appService.confirm('Added successfully', 'Do you want to add new one ?', [
            {
              text: 'Back menu',
              handler: () => {
                this.dismiss(this.spending);
              }
            },
            {
              text: 'Add another',
              handler: () => {
                this.wallets = this.wallets.map((e) => {
                  if(this.spending.wallet_id === e._id) {
                    e.money += this.spending.money * this.spending.type;                    
                  }
                  return e;
                });
                delete this.spending.money;
                delete this.spending.des;
                this.spending.is_bookmark = false;
              }
            }
        ]);
      }).catch((err) => {
        this.dismiss(undefined);
      });
    }    
  }

  submoney(){
    return (this.spending.money||0)*(this.type === 'spending' ? -1 : 1) - this.oldSubmoney;
  }

  dismiss(data) {
    if(data){
      data.money = +data.money || 0;
      data.input_date = moment(data.input_date, 'YYYY-MM-DD').toDate();
      data.wallet = this.wallets.find(t=>t._id === data.wallet_id);
    }
    this.viewCtrl.dismiss(data || this.isChangedData);
  }

}
