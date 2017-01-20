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
					this.appService.toast('Confirm password is not matched');
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
				this.appService.toast('Updated successfully');
			})
  }

}
