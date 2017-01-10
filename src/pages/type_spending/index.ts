import { Component } from '@angular/core';
import { NavController, ModalController, AlertController, ToastController, LoadingController, Loading } from 'ionic-angular';

import { AppService } from '../../app/app.service';
import { FormTypeSpending } from './form';

@Component({
  selector: 'typespending-list',
  templateUrl: 'index.html'
})
export class TypeSpending {
  type: String = 'spending';
  types: any;

  constructor(public navCtrl: NavController, private appService: AppService, public modalController: ModalController, public alertCtrl: AlertController, public toastCtrl: ToastController, public loadingCtrl: LoadingController) {
    
  }

  ngOnInit(){
    this.loadData();
  }

  loadData(){
    const loading:Loading = this.loadingCtrl.create({
      content: 'Please wait...'
    });
    loading.present();
    let types = {
      spending: [],
      earning: []
    };
    this.appService.getTypeSpendings().then((typependings) => {
      for(var s of typependings){
        if(s.type === 0) continue;
        if(!s.parent_id) { 
          if(s.type > 0) types.earning.push(s);
          else if(s.type < 0) types.spending.push(s);
        }else {
          if(s.type > 0) {
            let parentIndex = types.earning.findIndex((e) => {
              return e._id === s.parent_id;
            });
            types.earning.splice(parentIndex+1, 0, s);
          } else if(s.type < 0) {
            let parentIndex = types.spending.findIndex((e) => {
              return e._id === s.parent_id;
            });
            types.spending.splice(parentIndex+1, 0, s);
          }
        }
      }
      this.types = types;
      loading.dismiss();
    });
  }

  add(parent, slidingItem){
    let item:any = {
      icon: ''
    };
    if(parent) {
      item.parent_id = parent._id;
      item.type = parent.type;
    }else{
      item.type = this.type === 'spending' ? -1 : 1;
    }
    let editModal = this.modalController.create(FormTypeSpending, { parent: parent, typespending: item});
    editModal.onDidDismiss(data => {
      if(data) this.loadData();
    });
    editModal.present();
    // slidingItem.close();
  }

  edit(item, slidingItem){
    let parent;
    if(item.type > 0){
      parent = this.types.earning.find((e) => {
        return e._id === item.parent_id;
      })
    }else if(item.type < 0){
      parent = this.types.spending.find((e) => {
        return e._id === item.parent_id;
      })
    }
    let editModal = this.modalController.create(FormTypeSpending, { parent: parent, typespending: item});
    editModal.onDidDismiss(data => {
      if(data) this.loadData();
    });
    editModal.present();
    // slidingItem.close();
  }

  delete(item, slidingItem){
    let confirm = this.alertCtrl.create({
      title: 'Do you agree to delete it?',
      message: item.name,
      buttons: [
        {
          text: 'Disagree'
        },
        {
          text: 'Agree',
          handler: () => {
            this.appService.deleteTypeSpending(item).then((resp) => {
              const toast = this.toastCtrl.create({
                message: 'Deleted successfully',
                duration: 3000
              });              
              toast.present();
              // slidingItem.close();
              this.loadData();
            }).catch((error) => {});
          }
        }
      ]
    });
    confirm.present();
  }

}
