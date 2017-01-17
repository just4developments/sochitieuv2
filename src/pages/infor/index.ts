import { Component } from '@angular/core';
import { NavController, ToastController, MenuController } from 'ionic-angular';
import { Facebook, FacebookLoginResponse } from 'ionic-native';
import _ from 'lodash';
import * as md5 from 'md5';

import { AppService } from '../../app/app.service';
import { Spending } from '../spending';

@Component({
  selector: 'infor',
  templateUrl: 'index.html'
})
export class Infor {
  confirmPassword: String;
  user: any = {
    more: {}
  };

  constructor(public navCtrl: NavController, private appService: AppService, public toastCtrl: ToastController, private menuCtrl: MenuController) {
    this.appService.getMe().then((user) => {
        this.user = user;
    })
  }

  save(){
			if((this.user.password)){
				if(this.confirmPassword !== this.user.password) {
					const toast = this.toastCtrl.create({
						message: 'Confirm password is not matched',
						duration: 3000
					});
					toast.present();
					return;
				}else if(this.user.old_password === this.user.password){
					delete this.user.password;
					delete this.user.old_password;	
				}
			}else {
				delete this.user.password;
				delete this.user.old_password;
			}
			const vl = _.clone(this.user);
			vl.password = md5(vl.password);
			// vl.old_password = md5(vl.old_password);
			this.appService.updateInfor(vl).then((resp) => {
				const toast = this.toastCtrl.create({
					message: 'Updated successfully',
					duration: 3000
				});
				toast.present();
			})
  }

}
