import { Component } from '@angular/core';
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

  constructor(private appService: AppService) {
    this.appService.getMe().then((user) => {
        this.user = user;
    })
  }

  save(){
			const user = _.clone(this.user);
			if((user.password)){
				if(this.confirmPassword !== user.password) {
					return this.appService.getI18('account.pass_not_match').subscribe((msg) => {
						this.appService.toast(msg);
					});		
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
				return this.appService.getI18('confirm__update_done').subscribe((msg) => {
					this.appService.toast(msg);
				});
			})
  }

}
