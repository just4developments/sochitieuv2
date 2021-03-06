import { NgModule, ErrorHandler, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { HttpModule, Http } from '@angular/http';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { Storage } from '@ionic/storage';

import { MyApp } from './app.component';
import { TypeSpending } from '../pages/type_spending';
import { FormTypeSpending } from '../pages/type_spending/form';
import { Wallet } from '../pages/wallet';
import { FormWallet } from '../pages/wallet/form';
import { Spending } from '../pages/spending';
import { FormSpending } from '../pages/spending/form';
import { TransferWallet } from '../pages/wallet/transfer';
import { Login } from '../pages/login';
import { AppService } from '../app/app.service';
import { SuggestionDataDirective, CssBackgroundDirective } from '../app/app.directive';
import { Statistic } from '../pages/statistic';
import { ChartDetailInMonth } from '../pages/statistic/detail-month';
import { ChartPie } from '../pages/statistic/pie.component';
import { ChartLine } from '../pages/statistic/line.component';
import { SearchByDatePopover } from '../pages/statistic/index-search.popover';
import { TextFilterPipe } from './app.pipe';
import { IconPicker } from '../pages/type_spending/icon-picker';
import { WalletSelection, WalletSelectionPopup } from '../pages/wallet/item-select';
import { Log } from '../pages/log';
import { TypeSpendingSelection, TypeSpendingSelectionPopup } from '../pages/type_spending/item-select';
import { Bookmark } from '../pages/bookmark';
import { Infor } from '../pages/infor';
import { TranslateModule, TranslateStaticLoader, TranslateLoader } from 'ng2-translate/ng2-translate';
import { Note } from '../pages/note';

export function provideStorage() {
  return new Storage(['sqlite', 'websql', 'indexeddb'], { name: '__mydb' })// optional config);
};

export function createTranslateLoader(http: Http) {
  return new TranslateStaticLoader(http, 'assets/i18n', '.json');
}

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
    ChartLine,
    SearchByDatePopover,
    TextFilterPipe,
    SuggestionDataDirective,
    CssBackgroundDirective,
    IconPicker,
    WalletSelection,
    WalletSelectionPopup,
    TransferWallet,
    TypeSpendingSelection,
    TypeSpendingSelectionPopup,
    Bookmark,
    Infor,
    Note,
    Log
  ],
  imports: [
    HttpModule,
    IonicModule.forRoot(MyApp),
    TranslateModule.forRoot({
      provide: TranslateLoader,
      useFactory: (createTranslateLoader),
      deps: [Http]
    })
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
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
    ChartLine,
    SearchByDatePopover,
    IconPicker,
    WalletSelection,
    WalletSelectionPopup,
    TransferWallet,
    TypeSpendingSelection,
    TypeSpendingSelectionPopup,
    Bookmark,
    Infor,
    Note,
    Log
  ],
  providers: [{ provide: ErrorHandler, useClass: IonicErrorHandler }, { provide: Storage, useFactory: provideStorage }, AppService]
})
export class AppModule { }
