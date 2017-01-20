import { Component } from '@angular/core';

import { AppService } from '../../app/app.service';

@Component({
  selector: 'list-bookmark',
  templateUrl: 'index.html'
})
export class Bookmark {
  spendings: Array<any> = [];
  typeSpendings: Array<any>;

  constructor(private appService: AppService) {
      this.appService.getTypeSpendings().then((typeSpendings) => {
        this.typeSpendings = typeSpendings;  
        this.filter();
      });
  }

  filter(){
      this.appService.showLoading('Please wait...').then(() => {
        this.appService.getBookmark().then((spendings) => {
            this.spendings = spendings.map((e) => {
                e.type_spending = this.typeSpendings.find((t) => {
                    return e.type_spending_id === t._id;
                });
                return e;
            });
            this.appService.hideLoading();
        });
      });      
  }

  remove(item){
    this.appService.confirm('Do you agree to remove from bookmark?', item.des, [
        {
          text: 'Disagree'
        },
        {
          text: 'Agree',
          handler: () => {
            this.appService.unbookmarkSpending(item).then((resp) => {
              this.appService.toast('Removed from list bookmark successfully');
              // slidingItem.close();
              this.filter();
            }).catch((err) => {});
          }
        }
      ]);
  }

  delete(item, slidingItem){
    this.appService.confirm('Do you agree to delete it?', item.des, [
        {
          text: 'Disagree'
        },
        {
          text: 'Agree',
          handler: () => {
            this.appService.deleteSpending(item).then((resp) => {
              this.appService.toast('Deleted successfully');
              // slidingItem.close();
              this.filter();
            }).catch((err) => {});
          }
        }
    ]);
  }

}
