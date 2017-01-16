import { Component, Input, Output, EventEmitter, SimpleChange, forwardRef } from '@angular/core';
import { AppService } from '../../app/app.service';
import { NavParams, ViewController, ToastController, ModalController } from 'ionic-angular';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import _ from 'lodash';

export const CUSTOM_INPUT_CONTROL_VALUE_ACCESSOR: any = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => WalletSelection),
    multi: true
};

@Component({
  selector: 'select-wallet-popup',
  templateUrl: 'item-select.html'
})
export class WalletSelectionPopup {
  wallets: Array < any > ;
  selectedId: String;

  constructor(public viewCtrl: ViewController, private appService: AppService, params: NavParams, public toastCtrl: ToastController, public modalController: ModalController) {
    this.wallets = params.get('wallets');
    this.selectedId = params.get('selectedId');
  }

  pick(item) {
    this.dismiss(item);
  }

  dismiss(data) {
    this.viewCtrl.dismiss(data);
  }

}

@Component({
  selector: 'select-wallet',
  template: `<ion-label stacked *ngIf="label">{{label}}</ion-label><button ion-item (click)="openPick()" class="">  
        <ion-icon class="icon-logo" item-left [cssBackground]="item.icon" *ngIf="item"></ion-icon>        
        <h2 *ngIf="item">{{item.name}}</h2>        
        <ion-icon class="icon-logo" item-left [cssBackground]="emptyIcon" *ngIf="!item"></ion-icon>
        <h2 *ngIf="!item">{{emptyText}}</h2>        
        <ion-icon name="arrow-dropdown" item-right></ion-icon>        
      </button>
      <div align="right" class="sub-label"><strong *ngIf="item" [ngClass]="(item.money + submoney) < 0 ? 'spending' : 'earning'">{{((item.money + submoney) || 0) | currency:'VND':true}}</strong></div>`,
    providers: [CUSTOM_INPUT_CONTROL_VALUE_ACCESSOR]
})
export class WalletSelection implements ControlValueAccessor {
  @Input() label;
	@Input() wallets: Array < any > ;
  _wallets: Array<any>;
  @Output() change: EventEmitter<any> = new EventEmitter();
  item: any;  
  private onTouchedCallback:any;
  private onChangeCallback:any;  
  @Input() submoney:number;
  @Input() default;

  constructor(public viewCtrl: ViewController, private appService: AppService, public modalController: ModalController) {
    
  }
  
  ngOnInit(){
    
  }

  ngOnChanges(changes:SimpleChange){
    this._wallets = _.cloneDeep(this.wallets);
    if(this.default) {
      this.default.icon = `-${5 * 53}px -${0 * 64}px`;
      this.default.className = 'no-select';
      this._wallets.splice(0, 0, this.default);
    }
    if(this.item) {
      this.item = this._wallets.find((e) => {
        return e._id === this.item._id;
      });
    }
    if(!this.item) {
      if(this._wallets.length > 0) this.item = this._wallets[0];
    }    
  }

  openPick() {
    let walletSelectionModal = this.modalController.create(WalletSelectionPopup, { wallets: this._wallets, selectedId: this.item._id });
    walletSelectionModal.onDidDismiss(data => { 
      if(data) {
        this.item = data;
        this.change.emit(data);
        this.onChangeCallback(data._id);
      }
    });
    walletSelectionModal.present();
  }

  writeValue(value: any) {
      
  }

  //From ControlValueAccessor interface
  registerOnChange(fn: any) {
      this.onChangeCallback = fn;
      if(this.item){
        this.onChangeCallback(this.item._id);
      }
  }

  //From ControlValueAccessor interface
  registerOnTouched(fn: any) {
      this.onTouchedCallback = fn;
  }

  dismiss(data) {
    this.viewCtrl.dismiss(data);
  }

}