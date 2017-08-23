import { Component, ViewChild } from '@angular/core';
import { Nav, Platform } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { StatusBar, Splashscreen, AppVersion } from 'ionic-native';
import { AdMob } from 'ionic-native';

import { Login } from '../pages/login';
import { Wallet } from '../pages/wallet';
import { TypeSpending } from '../pages/type_spending';
import { Spending } from '../pages/spending';
import { Statistic } from '../pages/statistic';
import { MenuController } from 'ionic-angular';
import { Bookmark } from '../pages/bookmark';
import { AppService } from '../app/app.service';
import { Infor } from '../pages/infor';
import { Note } from '../pages/note';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;
  me: any;
  version: string = "v1-0.0.1";
  acc: any;
  accs: any[];

  constructor(public platform: Platform, public appService: AppService, private storage: Storage, private menuCtrl: MenuController) {
    this.initializeApp();

    appService.mainEvent.subscribe((data) => {
      let self = this
      if (data.signedIn) {
        self.storage.get('tokens').then(vl => {
          if (!vl) return this.logout(true)
          self.acc = vl.find(e => e.username === data.signedIn.username).token
          self.accs = vl
          self.me = data.signedIn;
        });
      } else if (data.logout) {
        self.appService.logout().then(() => {
          self.menuCtrl.close('leftMenu');
          self.menuCtrl.enable(false, 'leftMenu');
          self.nav.setRoot(Login);
        });
      }
    });

    appService.init(this).then((token) => {
      this.nav.setRoot(token ? Spending : Login);
      this.menuCtrl.enable(!!token, 'leftMenu');
      if (token) {
        this.appService.getMe().then(me => {
          appService.mainEvent.emit({ signedIn: me })
        });
      }
    });
  }

  public backToDashboard() {
    this.nav.setRoot(this.appService.requestOptions ? Spending : Login);
    this.menuCtrl.enable(!!this.appService.requestOptions, 'leftMenu');
    if (this.appService.requestOptions) {
      this.appService.getMe().then((me) => {
        this.me = me;
      });
    }
  }

  ngOnDestroy() {
    this.appService.mainEvent.unsubscribe();
  }

  editInfor() {
    this.nav.setRoot(Infor);
  }

  changeAccount(vl) {
    if (vl === 'addmore') {
      return this.logout()
    }
    this.storage.set('token', vl).then(() => {
      this.appService.removeCached()
      location.reload()
    })
  }

  logout(isClear?) {
    const _self = this
    if (isClear) {
      _self.storage.clear();
      _self.appService.getI18("msg__clear").subscribe((msg) => {
        _self.appService.toast(msg).then(() => {
          _self.appService.mainEvent.emit({ logout: true })
        })
      });
    } else {
      _self.appService.mainEvent.emit({ logout: true })
    }
  }

  initializeApp() {
    this.appService.changeLanguage();
    this.platform.ready().then((readySource) => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      StatusBar.styleDefault();
      Splashscreen.hide();
      if (readySource === 'cordova') {
        this.appService.getAdsense().then(() => {
          AdMob.createBanner({
            adId: this.appService.ADMOB_ID,
            // isTesting: true
          }).then(() => { AdMob.showBanner(AdMob.AD_POSITION.BOTTOM_CENTER); });
        }).catch((err) => {
          console.log('No admod');
        });
        AppVersion.getVersionCode().then((code) => {
          AppVersion.getVersionNumber().then((version) => {
            this.version = `v${code}-${version}`;
          });
        });
      }
    });
  }

  // ionViewDidLoad() {
  //   AdMob.onAdDismiss().subscribe(() => { console.log('User dismissed ad'); });
  // }

  openPage(page) {
    // Reset the content nav to have just this page
    // we wouldn't want the back button to show in this scenario
    let com;
    if (page === 'Spending') {
      com = Spending;
    } else if (page === 'Wallet') {
      com = Wallet;
    } else if (page === 'Type Spending') {
      com = TypeSpending;
    } else if (page === 'Bookmark') {
      com = Bookmark;
    } else if (page === 'Statistic') {
      com = Statistic;
    } else if (page === 'Note') {
      com = Note;
    }
    this.nav.setRoot(com);
  }
}
