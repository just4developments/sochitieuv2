import { Component, ViewChild } from '@angular/core';
import { Nav, Platform } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { StatusBar, Splashscreen } from 'ionic-native';

import { Login } from '../pages/login';
import { Wallet } from '../pages/wallet';
import { TypeSpending } from '../pages/type_spending';
import { Spending } from '../pages/spending';
import { Statistic } from '../pages/statistic';
import { MenuController } from 'ionic-angular';
import { Bookmark } from '../pages/bookmark';
import { AppService } from '../app/app.service';
import { Infor } from '../pages/infor';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;

  pages: Array<{title: string, component: any, icon: string}>;
  me: any;

  constructor(public platform: Platform, public appService: AppService, private storage: Storage, private menuCtrl: MenuController) {
    this.initializeApp();
    
    appService.init().then((token) => {
      this.nav.setRoot(token ? Spending : Login);
      this.menuCtrl.enable(!!token, 'leftMenu');
      if(token){
        this.appService.getMe().then((me) => {
          this.me = me;
        });
      }
    });

    appService.mainEvent.subscribe((data) => {
      if(data.signedIn) this.me = data.signedIn;
    });

    this.pages = [
      { title: 'Spending', component: Spending, icon: 'help-circle' },
      { title: 'Wallet', component: Wallet, icon: 'cash' },
      { title: 'Type Spending', component: TypeSpending, icon: 'archive' },
      { title: 'Bookmark', component: Bookmark, icon: 'bookmarks' },
      { title: 'Statistic', component: Statistic, icon: 'stats' }
    ];
  }

  ngOnDestroy(){
    this.appService.mainEvent.unsubscribe();
  }

  editInfor(){
    this.nav.setRoot(Infor);
  }

  logout(){
    this.appService.logout().then(() => {
      this.nav.setRoot(Login);
      this.menuCtrl.enable(false, 'leftMenu');
    });    
  }

  initializeApp() {
    this.platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      StatusBar.styleDefault();
      Splashscreen.hide();
    });
  }

  openPage(page) {
    // Reset the content nav to have just this page
    // we wouldn't want the back button to show in this scenario
    this.nav.setRoot(page.component);
  }
}
