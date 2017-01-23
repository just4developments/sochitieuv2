import { Component } from '@angular/core';
import { NavController, MenuController } from 'ionic-angular';
import { Facebook, FacebookLoginResponse } from 'ionic-native';
import _ from 'lodash';
import * as md5 from 'md5';

import { AppService } from '../../app/app.service';
import { Spending } from '../spending';

const EMAIL_REGEX:any = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

@Component({
  selector: 'login',
  templateUrl: 'index.html'
})
export class Login {
  user: any = { 
    username: 'have.ice@gmail.com',
    password: '123'
  };

  constructor(public navCtrl: NavController, private appService: AppService, private menuCtrl: MenuController) {
    
  }

  login(user:any, app?:String){
    return this.appService.login(user, app).then((isNew) => {
      if(isNew) {
        this.appService.showLoading('Syncing from server...').then(() => {
          this.appService.merge(user.username, !!isNew).then(() => {
            this.appService.hideLoading();
            this.loginDone();
          });
        });
      }else {
        this.loginDone();
      }
    });
  }

  loginDone(){
    this.appService.getMe().then((user) => {
      this.menuCtrl.enable(true, 'leftMenu');
      this.navCtrl.setRoot(Spending);
      this.appService.mainEvent.emit({signedIn: user});
    });    
  }

  loginDefault(){
    let usr:any = {
      more: {}
    };
    if(EMAIL_REGEX.test(this.user.username)){
      usr.more.name = this.user.username.substr(0, this.user.username.indexOf('@'));
      usr.recover_by = this.user.username;
    }else{
      usr.more.name = this.user.username;
    }
    this.login(_.merge(usr, this.user, {password: md5(this.user.password)}));
  }

  loginFacebook(){
    Facebook.login(['email']).then((resp:FacebookLoginResponse) => {
      if(resp.status === 'connected'){
        Facebook.api('/me?fields=id,name,email', ['email']).then((resp) => {
          this.appService.toDataUrl('http://graph.facebook.com/'+resp.id+'/picture').then((avatar) => {
            this.login({
              username: resp.email || resp.id,
              recover_by: resp.email,
              more: {
                email: resp.email,
                name: resp.name,
                avatar: avatar
              }
            }, 'facebook');
          })          
        });                
      }else {
        this.appService.toast('#Error: Can not login facebook');
      }      
    });
  }

  loginGoogle(){
    this.appService.toast('#Error: Not supported google yet');
  }

}
