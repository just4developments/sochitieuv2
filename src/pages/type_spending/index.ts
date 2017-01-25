import { Component } from '@angular/core';
import { NavController, ModalController } from 'ionic-angular';
import _ from 'lodash';

import { AppService } from '../../app/app.service';
import { FormTypeSpending } from './form';

@Component({
  selector: 'typespending-list',
  templateUrl: 'index.html'
})
export class TypeSpending {
  type: String = 'spending';
  types: any;

  constructor(public navCtrl: NavController, private appService: AppService, public modalController: ModalController) {
    
  }

  ngOnInit(){
    this.loadData();
  }

  loadData(){
    this.appService.getI18("msg__wait").subscribe((msg) => {
      this.appService.showLoading(msg).then(() => {
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
          this.appService.hideLoading();
        });
      });
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
    let editModal = this.modalController.create(FormTypeSpending, { parent: _.cloneDeep(parent), typespending: item});
    editModal.onDidDismiss(data => {
      if(data) this.loadData();
    });
    editModal.present();
    // slidingItem.close();
  }

  delete(item, slidingItem){
    this.appService.getI18(["confirm__delete", "button__agree", "button__disagree", "confirm__delete_done"]).subscribe((msg) => {
      this.appService.confirm(msg["confirm__delete"], item.name, [
        {
          text: msg['button__disagree']
        },
        {
          text: msg['button__agree'],
          handler: () => {
            this.appService.deleteTypeSpending(item).then((resp) => {
              this.appService.toast(msg["confirm__delete_done"]);
              // slidingItem.close();
              this.loadData();
            }).catch((error) => {});
          }
        }
      ]);
    });
  }

}
