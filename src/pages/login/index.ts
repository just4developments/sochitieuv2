import { Component } from '@angular/core';
import { NavController, ToastController, MenuController, LoadingController, Loading } from 'ionic-angular';
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
    username: 'thanh',
    password: '123'
  };

  constructor(public navCtrl: NavController, public loadingCtrl: LoadingController, private appService: AppService, public toastCtrl: ToastController, private menuCtrl: MenuController) {
    
  }

  login(user:any, app?:String){
    return this.appService.login(user, app).then((isNew) => {
      if(isNew) {
        const loading:Loading = this.loadingCtrl.create({
          content: 'Syncing from server...'
        });
        loading.present();
        this.appService.merge(user.username, !!isNew).then(() => {
          loading.dismiss();
          this.loginDone();
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
        const toast = this.toastCtrl.create({
            message: '#Error: Can not login facebook',
            duration: 3000
        });
        toast.present();
      }      
    });
  }

  loginGoogle(){
    const toast = this.toastCtrl.create({
          message: '#Error: Not supported google yet',
          duration: 3000
    });
    toast.present();
  }

}
