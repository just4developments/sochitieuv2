import { Component } from '@angular/core';
import { Http } from '@angular/http';
import _ from 'lodash';
import * as md5 from 'md5';

import { AppService } from '../../app/app.service';

@Component({
	selector: 'infor',
	templateUrl: 'index.html'
})
export class Infor {
	confirmPassword: string;
	type: string = 'infor';
	user: any = {
		more: {}
	};

	constructor(private appService: AppService, private http: Http) {
		this.appService.getMe().then((user) => {
			this.user = user;
		})
	}

	upload(inputValue: any) {
		this.user.oldAvatar = this.user.more.avatar || null
		this.appService.uploadAvatar(inputValue).then((vl) => {
			this.user.more.avatar = vl
		})
	}

	save(type) {
		const user = _.clone(this.user);
		if (type === 'password') {
			if (this.confirmPassword !== user.password) {
				return this.appService.getI18('account.pass_not_match').subscribe((msg) => {
					this.appService.toast(msg);
				});
			} else if (user.old_password === user.password) {
				delete user.password;
				delete user.old_password;
			} else {
				user.password = md5(user.password);
				user.old_password = md5(user.old_password);
			}
		} else {
			delete user.password;
			delete user.old_password;
		}
		this.appService.updateInfor(user).then((resp) => {
			this.confirmPassword = null;
			delete this.user.password;
			delete this.user.old_password;
			return this.appService.getI18('confirm__update_done').subscribe((msg) => {
				this.appService.toast(msg);
				if (this.user.oldAvatar || this.user.oldAvatar === null) {
					this.appService.storeFile(this.user.more.avatar, this.user.oldAvatar)
				}
			});
		})
	}

}
