import { Component } from '@angular/core';
import { NavController, ModalController, AlertController, ToastController, MenuController } from 'ionic-angular';
import { Facebook } from 'ionic-native';

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

  constructor(public navCtrl: NavController, private appService: AppService, public modalController: ModalController, public alertCtrl: AlertController, public toastCtrl: ToastController, private menuCtrl: MenuController) {
    
  }

  login(user:any, app?:String){
    this.appService.login(user, app).then((token) => {
      this.menuCtrl.enable(true, 'leftMenu');
      this.navCtrl.setRoot(Spending);
    });
  }

  loginDefault(){
    this.login(this.user);
  }

  loginFacebook(){
    this.login({
      username: 'have.ice@gmail.com'
    }, 'facebook');
    // Facebook.login(['email']).then((resp) => {
    //   if(resp.status === 'connected'){
    //     this.login({
    //       username: resp.authResponse.userID
    //     }, 'facebook');
    //   }else {
        
    //   }      
    // });
  }

  loginGoogle(){

  }

}
