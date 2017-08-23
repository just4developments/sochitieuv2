import { Component } from '@angular/core';
import { NavController, MenuController } from 'ionic-angular';
import { Facebook, FacebookLoginResponse, GooglePlus } from 'ionic-native';
import _ from 'lodash';
import * as md5 from 'md5';

import { AppService } from '../../app/app.service';
import { Spending } from '../spending';

const EMAIL_REGEX: any = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

@Component({
  selector: 'login',
  templateUrl: 'index.html'
})
export class Login {
  language: string;
  user: any = {
    username: '',
    password: ''
  };

  constructor(public navCtrl: NavController, private appService: AppService, private menuCtrl: MenuController) {
    this.language = this.appService.language;
  }

  login(user: any, app?: string) {
    this.appService.getI18(['login__logging_msg', 'login__sync_msg']).subscribe((msg) => {
      this.appService.showLoading(msg['login__logging_msg']).then(() => {
        this.appService.login(user, app).then((isNew) => {
          if (isNew) {
            this.appService.showLoading(msg['login__sync_msg']).then(() => {
              this.appService.merge(user.username, !!isNew).then(() => {
                this.appService.hideLoading();
                this.loginDone();
              });
            });
          } else {
            this.loginDone();
          }
        });
      });
    });
  }

  changeLanguage() {
    this.appService.changeLanguage(this.language);
  }

  loginDone() {
    this.appService.getMe().then((user) => {
      this.menuCtrl.enable(true, 'leftMenu');
      this.navCtrl.setRoot(Spending);
      this.appService.mainEvent.emit({ signedIn: user });
    });
  }

  loginDefault() {
    let usr: any = {
      more: {}
    };
    if (this.user.username) this.user.username = this.user.username.toLowerCase()
    if (EMAIL_REGEX.test(this.user.username)) {
      usr.more.name = this.user.username.substr(0, this.user.username.indexOf('@'));
      usr.recover_by = this.user.username;
    } else {
      usr.more.name = this.user.username;
    }
    this.login(_.merge(usr, this.user, { password: md5(this.user.password) }));
  }

  loginFacebook() {
    Facebook.login(['email']).then((respToken: FacebookLoginResponse) => {
      if (respToken.status === 'connected') {
        Facebook.api('/me?fields=id,name,email', ['email']).then((resp) => {
          this.appService.toDataUrl('http://graph.facebook.com/' + resp.id + '/picture').then((avatar) => {
            this.login({
              token: respToken.authResponse.accessToken,
              recover_by: resp.email,
              more: {
                email: resp.email,
                name: resp.name,
                avatar: avatar
              }
            }, 'facebook');
          })
        });
      } else {
        this.appService.getI18('login__fb_failed_msg').subscribe((msg) => {
          this.appService.toast(msg);
        });
      }
    });
  }

  loginGoogle() {
    GooglePlus.login()
      .then(res => console.log(res))
      .catch(err => console.error(err));
  }

}
