import { Component } from '@angular/core';
import { NavController, ToastController, MenuController } from 'ionic-angular';
import { Facebook, FacebookLoginResponse } from 'ionic-native';

import { AppService } from '../../app/app.service';
import { Spending } from '../spending';

@Component({
  selector: 'login',
  templateUrl: 'index.html'
})
export class Login {
  user: any = {
    username: 'thanh',
    password: '123'
  };

  constructor(public navCtrl: NavController, private appService: AppService, public toastCtrl: ToastController, private menuCtrl: MenuController) {
    
  }

  login(user:any, app?:String){
    return this.appService.login(user, app).then((isNew) => {
      if(isNew) {
        this.appService.merge(user.username, !!isNew).then(() => {
          this.loginDone();
        });
      }else {
        this.loginDone();
      }
    });
  }

  loginDone(){
    this.menuCtrl.enable(true, 'leftMenu');
    this.navCtrl.setRoot(Spending);
  }

  loginDefault(){
    this.login(this.user);
  }

  loginFacebook(){
    Facebook.login(['email']).then((resp:FacebookLoginResponse) => {
      if(resp.status === 'connected'){
        console.log(resp);
        // this.login({
        //   username: resp.authResponse.userID
        // }, 'facebook');
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

  }

}
