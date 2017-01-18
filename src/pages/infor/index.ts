import { Component } from '@angular/core';
import { ToastController } from 'ionic-angular';
import _ from 'lodash';
import * as md5 from 'md5';

import { AppService } from '../../app/app.service';

@Component({
  selector: 'infor',
  templateUrl: 'index.html'
})
export class Infor {
  confirmPassword: String;
	type: String = 'infor';
  user: any = {
    more: {}
  };

  constructor(private appService: AppService, public toastCtrl: ToastController) {
    this.appService.getMe().then((user) => {
        this.user = user;
    })
  }

  save(){
			const user = _.clone(this.user);
			if((user.password)){
				if(this.confirmPassword !== user.password) {
					const toast = this.toastCtrl.create({
						message: 'Confirm password is not matched',
						duration: 3000
					});
					toast.present();
					return;
				}else if(user.old_password === user.password){
					delete user.password;
					delete user.old_password;	
				}else {
					user.password = md5(user.password);
					user.old_password = md5(user.old_password);
				}
			}else {
				delete user.password;
				delete user.old_password;
			}									
			this.appService.updateInfor(user).then((resp) => {
				this.confirmPassword = null;
				delete this.user.password;
				delete this.user.old_password;
				const toast = this.toastCtrl.create({
					message: 'Updated successfully',
					duration: 3000
				});
				toast.present();
			})
  }

}
