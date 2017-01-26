import { Component } from '@angular/core';

import { AppService } from '../../app/app.service';

@Component({
  selector: 'list-bookmark',
  templateUrl: 'index.html'
})
export class Bookmark {
  spendings: Array<any>;
  typeSpendings: Array<any>;
  wallets: Array<any>;
  currency: string;

  constructor(private appService: AppService) {
    this.appService.getWallets().then((wallets) => {
      this.wallets = wallets;
      this.appService.getTypeSpendings().then((typeSpendings) => {
        this.typeSpendings = typeSpendings;  
        this.filter();
      });
    });      
  }

  filter(){
    this.appService.getI18("msg__wait").subscribe((msg) => {
      this.appService.showLoading(msg).then(() => {
        this.appService.getBookmark().then((spendings) => {
            this.spendings = spendings.map((e) => {
                e.type_spending = this.typeSpendings.find((t) => {
                    return e.type_spending_id === t._id;
                });
                e.wallet = this.wallets.find((w) => {
                  return e.wallet_id === w._id;
                })
                return e;
            });
            this.appService.hideLoading();
        });
      });      
    });      
  }

  remove(item){
    this.appService.getI18(['confirm__remove_bookmark', 'confirm__remove_bookmark_des', 'button__disagree', 'button__agree']).subscribe((msg) => {
      this.appService.confirm(msg['confirm__remove_bookmark'], msg['confirm__remove_bookmark_des'], [
        {
          text: msg['button__disagree']
        },
        {
          text: msg['button__agree'],
          handler: () => {
            this.appService.unbookmarkSpending(item).then((resp) => {
              this.appService.getI18('confirm__transfer_done').subscribe((msg) => {
                this.appService.toast(msg);
                // slidingItem.close();
                this.filter();
              });              
            }).catch((err) => {});
          }
        }
      ]);
    });    
  }

  delete(item, slidingItem){
    this.appService.getI18(["confirm__delete", "confirm__delete_bookmark_des", "button__agree", "button__disagree", "confirm__delete_done"]).subscribe((msg) => {
      this.appService.confirm(msg["confirm__delete"], msg['confirm__delete_bookmark_des'], [
          {
            text: msg['button__disagree']
          },
          {
            text: msg['button__agree'],
            handler: () => {
              this.appService.deleteSpending(item).then((resp) => {
                this.appService.toast(msg["confirm__delete_done"]);
                // slidingItem.close();
                this.filter();
              }).catch((err) => {});
            }
          }
      ]);
    });
  }

}
