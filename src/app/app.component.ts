import { Component, ViewChild } from '@angular/core';
import { Nav, Platform } from 'ionic-angular';
import { StatusBar, Splashscreen } from 'ionic-native';

import { Wallet } from '../pages/wallet';
import { TypeSpending } from '../pages/type_spending';
import { ListSpending } from '../pages/spending/list-spending';

import { AppService } from '../app/app.service';


@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;

  rootPage: any = Wallet;

  pages: Array<{title: string, component: any}>;

  constructor(public platform: Platform, private appService: AppService) {
    this.initializeApp();
    appService.syncData();

    // used for an example of ngFor and navigation
    this.pages = [
      { title: 'Spending', component: ListSpending },
      { title: 'Wallet', component: Wallet },
      { title: 'Type Spending', component: TypeSpending }
    ];

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
