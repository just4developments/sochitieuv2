import { NgModule, ErrorHandler } from '@angular/core';
import { HttpModule }    from '@angular/http';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { Storage } from '@ionic/storage';

import { MyApp } from './app.component';
import { Page1 } from '../pages/page1/page1';
import { Page2 } from '../pages/page2/page2';
import { ListSpending } from '../pages/spending/list-spending';
import { FormSpending } from '../pages/spending/form-spending';
import { AppService } from '../app/app.service';

let provideStorage = function () {
  return new Storage(['sqlite', 'websql', 'indexeddb'], { name: '__mydb' })// optional config);
};

@NgModule({
  declarations: [
    MyApp,
    Page1,
    Page2,
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
    Page1,
    Page2,
    ListSpending,
    FormSpending
  ],
  providers: [{provide: ErrorHandler, useClass: IonicErrorHandler}, { provide: Storage, useFactory: provideStorage }, AppService]
})
export class AppModule {}
