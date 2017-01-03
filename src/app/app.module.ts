import { NgModule, ErrorHandler } from '@angular/core';
import { HttpModule }    from '@angular/http';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { Storage } from '@ionic/storage';

import { MyApp } from './app.component';
import { TypeSpending } from '../pages/type_spending';
import { FormTypeSpending } from '../pages/type_spending/form';
import { Wallet } from '../pages/wallet';
import { FormWallet } from '../pages/wallet/form';
import { ListSpending } from '../pages/spending/list-spending';
import { FormSpending } from '../pages/spending/form-spending';
import { AppService } from '../app/app.service';

let provideStorage = function () {
  return new Storage(['sqlite', 'websql', 'indexeddb'], { name: '__mydb' })// optional config);
};

@NgModule({
  declarations: [
    MyApp,
    TypeSpending,
    FormTypeSpending,
    Wallet,
    FormWallet,
    ListSpending,
    FormSpending    
  ],
  imports: [
    HttpModule,
    IonicModule.forRoot(MyApp)
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    FormTypeSpending,
    TypeSpending,
    Wallet,
    FormWallet,
    ListSpending,
    FormSpending
  ],
  providers: [{provide: ErrorHandler, useClass: IonicErrorHandler}, { provide: Storage, useFactory: provideStorage }, AppService]
})
export class AppModule {}
