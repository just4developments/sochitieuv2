import { Component } from '@angular/core';
import { AlertController, ToastController } from 'ionic-angular';

import { AppService } from '../../app/app.service';

@Component({
  selector: 'list-bookmark',
  templateUrl: 'index.html'
})
export class Bookmark {
  spendings: Array<any> = [];
  typeSpendings: Array<any>;

  constructor(private appService: AppService, public alertCtrl: AlertController, public toastCtrl: ToastController) {
      this.appService.getTypeSpendings().then((typeSpendings) => {
        this.typeSpendings = typeSpendings;  
        this.filter();
      });
  }

  filter(){
      this.appService.getBookmark().then((spendings) => {
          this.spendings = spendings.map((e) => {
              e.type_spending = this.typeSpendings.find((t) => {
                  return e.type_spending_id === t._id;
              });
              return e;
          });
      });
  }

  remove(item){
      let confirm = this.alertCtrl.create({
      title: 'Do you agree to remove from bookmark?',
      message: item.des,
      buttons: [
        {
          text: 'Disagree'
        },
        {
          text: 'Agree',
          handler: () => {
            this.appService.unbookmarkSpending(item).then((resp) => {
              const toast = this.toastCtrl.create({
                message: 'Removed from list bookmark successfully',
                duration: 3000
              });
              toast.present();
              // slidingItem.close();
              this.filter();
            }).catch((err) => {});
          }
        }
      ]
    });
    confirm.present();
  }

  delete(item, slidingItem){
    let confirm = this.alertCtrl.create({
      title: 'Do you agree to delete it?',
      message: item.des,
      buttons: [
        {
          text: 'Disagree'
        },
        {
          text: 'Agree',
          handler: () => {
            this.appService.deleteSpending(item).then((resp) => {
              const toast = this.toastCtrl.create({
                message: 'Deleted successfully',
                duration: 3000
              });
              toast.present();
              // slidingItem.close();
              this.filter();
            }).catch((err) => {});
          }
        }
      ]
    });
    confirm.present();
  }

}
