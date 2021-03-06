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
  type: string = 'spending';
  type_spending_id: string;
  type_earning_id: string;
  typeSpendings: Array<any>;
  typeEarnings: Array<any>;
  wallets: Array<any> = [];
  walletsGoldSave: Array<any> = [];
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
  oldSub: any;
  suggestion: Array<any>;
  suggestionObject: Array<any> = [];

  constructor(private element: ElementRef, public viewCtrl: ViewController, private appService: AppService, params: NavParams) {
    this.spending = params.get('spending');
    if (this.spending._id) this.oldSub = _.cloneDeep(this.spending);
    else this.oldSub = {
      sign_money: 0,
      wallet_id: undefined,
      walletGS_id: undefined
    };
    this.spending.input_date = this.spending.input_date.toISOString();

    this.searchSuggestion();

    let types = params.get('typeSpendings');
    this.typeEarnings = [];
    this.typeSpendings = [];
    for (let s of types) {
      if (s.type === 0) continue;
      if (s.type > 0) this.typeEarnings.push(s);
      else if (s.type < 0) this.typeSpendings.push(s);
      if (!this.spending.type_spending_id || this.spending.type_spending_id === s._id) {
        if (!this.type_earning_id && s.type > 0) {
          if (this.spending.type_spending_id) this.type = 'earning';
          this.type_earning_id = s._id;
        } else if (!this.type_spending_id && s.type < 0) {
          if (this.spending.type_spending_id) this.type = 'spending';
          this.type_spending_id = s._id;
        }
      }
    }
    const wallets = params.get('wallets') as Array<any>;
    this.wallets = wallets.filter(e => e.type === 1)
    this.walletsGoldSave = wallets.filter(e => e.type === -1)
  }

  searchSuggestion() {
    this.appService.getSuggestion().then((resp) => {
      this.suggestion = resp.map(e => e._id);
      this.suggestionObject = resp;
    });
  }

  pickSuggestion() {
    const name = this.spending.des;
    if (!name || name.length === 0) return;
    const pick = this.suggestionObject.find(e => e._id === name);
    if (pick) {
      if (pick.spendings.type < 0) {
        this.type = 'spending';
        this.type_spending_id = pick.spendings.type_spending_id;
      } else if (pick.spendings.type > 0) {
        this.type = 'earning';
        this.type_earning_id = pick.spendings.type_spending_id;
      }
      this.spending.wallet_id = pick.spendings.wallet_id;
      this.spending.walletGS_id = pick.spendings.walletGS_id;
    }
  }

  focusMoney(isAdd1000) {
    this.moneyInput.setFocus();
  }

  changeTabType() {

  }

  save() {
    let typeSpending;
    if (this.type === 'spending') {
      this.spending.type_spending_id = this.type_spending_id;
      typeSpending = this.typeSpendings.find(e => e._id === this.spending.type_spending_id);
    } else {
      this.spending.type_spending_id = this.type_earning_id;
      typeSpending = this.typeEarnings.find(e => e._id === this.spending.type_spending_id);
    }
    this.spending.typeSpending = typeSpending;
    this.spending.type = this.spending.typeSpending.type;
    if (this.spending._id) {
      this.appService.updateSpending(this.spending).then((item) => {
        this.appService.getI18('confirm__update_done').subscribe((msg) => {
          this.appService.toast(msg);
          this.dismiss(this.spending);
          this.searchSuggestion();
        });
      }).catch((err) => {
        this.dismiss(undefined);
      });
    } else {
      this.appService.addSpending(this.spending).then((item) => {
        this.isChangedData = true;
        this.appService.getI18(['confirm__add_done', 'confirm__add_more', 'button__backmenu', 'button__continue']).subscribe((msg) => {
          this.appService.toast(msg['confirm__add_done']);
          this.appService.confirm(msg['confirm__add_done'], msg['confirm__add_more'], [
            {
              text: msg['button__backmenu'],
              handler: () => {
                this.dismiss(this.spending);
              }
            },
            {
              text: msg['button__continue'],
              handler: () => {
                this.wallets = this.wallets.map((e) => {
                  if (this.spending.wallet_id === e._id) {
                    e.money += this.spending.money * this.spending.type;
                  }
                  return e;
                });
                this.walletsGoldSave = this.walletsGoldSave.map((e) => {
                  if (this.spending.walletGS_id === e._id) {
                    e.money += this.spending.money * this.spending.type;
                  }
                  return e;
                });
                this.searchSuggestion();
                delete this.spending.money;
                delete this.spending.des;
              }
            }
          ]);
        });
      }).catch((err) => {
        this.dismiss(undefined);
      });
    }
  }

  submoney() {
    if (this.oldSub.wallet_id !== this.spending.wallet_id)
      return (this.spending.money || 0) * (this.type === 'spending' ? -1 : 1);
    return (this.spending.money || 0) * (this.type === 'spending' ? -1 : 1) - this.oldSub.sign_money;
  }

  subGSmoney() {
    if (this.oldSub.walletGS_id !== this.spending.walletGS_id)
      return (this.spending.money || 0) * (this.type === 'spending' ? -1 : 1);
    return (this.spending.money || 0) * (this.type === 'spending' ? -1 : 1) - this.oldSub.sign_money;
  }

  dismiss(data) {
    if (data) {
      data.money = +data.money || 0;
      data.input_date = moment(data.input_date, 'YYYY-MM-DD').toDate();
      data.wallet = this.wallets.find(t => t._id === data.wallet_id);
    }
    this.viewCtrl.dismiss(data || this.isChangedData);
  }

}
