import { NgModule, ErrorHandler } from '@angular/core';
import { HttpModule }    from '@angular/http';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { Storage } from '@ionic/storage';

import { MyApp } from './app.component';
import { TypeSpending } from '../pages/type_spending';
import { FormTypeSpending } from '../pages/type_spending/form';
import { Wallet } from '../pages/wallet';
import { FormWallet } from '../pages/wallet/form';
import { Spending } from '../pages/spending';
import { FormSpending } from '../pages/spending/form';
import { Login } from '../pages/login';
import { AppService } from '../app/app.service';
import { Statistic } from '../pages/statistic';
import { ChartDetailInMonth } from '../pages/statistic/detail-month';
import { ChartPie } from '../pages/statistic/pie.component';
import { ChartLine } from '../pages/statistic/line.component';

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
    Spending,
    FormSpending,
    Statistic,
    Login,
    ChartDetailInMonth,
    ChartPie,
    ChartLine
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
    Spending,
    FormSpending,
    Statistic,
    Login,
    ChartDetailInMonth,
    ChartPie,
    ChartLine
  ],
  providers: [{provide: ErrorHandler, useClass: IonicErrorHandler}, { provide: Storage, useFactory: provideStorage }, AppService]
})
export class AppModule {}
