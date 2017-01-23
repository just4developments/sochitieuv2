import { Component, Input, Output, EventEmitter, SimpleChanges, forwardRef } from '@angular/core';
import { NavParams, ViewController, ModalController } from 'ionic-angular';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import _ from 'lodash';

export const CUSTOM_INPUT_CONTROL_VALUE_ACCESSOR: any = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => TypeSpendingSelection),
    multi: true
};

@Component({
  selector: 'select-type-spending-popup',
  templateUrl: 'item-select.html'
})
export class TypeSpendingSelectionPopup {
  typeSpendings: Array < any > ;
  selectedId: String;
  label: String;

  constructor(public viewCtrl: ViewController, params: NavParams) {    
    this.typeSpendings = params.get('typeSpendings');
    this.selectedId = params.get('selectedId');
    this.label = params.get('label');
  }

  pick(item) {
    this.dismiss(item);
  }

  dismiss(data) {
    this.viewCtrl.dismiss(data);
  }

}

@Component({
  selector: 'select-type-spending',
  template: `<ion-label stacked *ngIf="label">{{label}}</ion-label><button ion-item (click)="openPick()" class="">  
        <ion-icon class="icon-logo" item-left [cssBackground]="item.icon" *ngIf="item"></ion-icon>        
        <h2 *ngIf="item">{{item.name}}</h2>        
        <ion-icon class="icon-logo" item-left [cssBackground]="emptyIcon" *ngIf="!item"></ion-icon>
        <h2 *ngIf="!item">{{emptyText}}</h2>        
        <ion-icon name="arrow-dropdown" item-right></ion-icon>
      </button>`,
    providers: [CUSTOM_INPUT_CONTROL_VALUE_ACCESSOR]
})
export class TypeSpendingSelection implements ControlValueAccessor {
  @Input() label;
	@Input() typeSpendings: Array < any > ;
  @Output() change: EventEmitter<any> = new EventEmitter();
  item: any;  
  private onTouchedCallback:any;
  private onChangeCallback:any;  
  @Input() default;

  constructor(public viewCtrl: ViewController, public modalController: ModalController) {
    
  }
  
  ngOnChanges(changes:SimpleChanges){
    if(changes['typeSpendings']) {
      this.typeSpendings = changes['typeSpendings'].currentValue;
      if(this.default) {
        this.default.icon = `-${5 * 53}px -${0 * 64}px`;
        this.default.className = 'no-select';
        this.typeSpendings.splice(0, 0, this.default);

      }
      if(this.item) {
        this.item = this.typeSpendings.find((e) => {
          return e._id === this.item._id;
        });
      }
      // if(!this.item) {
      //   if(this.typeSpendings.length > 0) this.item = this.typeSpendings[0];
      // }else {
      //   this.item = this.typeSpendings.find((e) => {
      //     return e._id === this.item._id;
      //   });
      // }
    }
  }

  openPick() {
    let typeSpendingsSelectionModal = this.modalController.create(TypeSpendingSelectionPopup, { typeSpendings: this.typeSpendings, selectedId: this.item._id, label: this.label});
    typeSpendingsSelectionModal.onDidDismiss(data => { 
      if(data) {
        this.item = data;
        this.change.emit(data);
        this.onChangeCallback(data._id);
      }
    });
    typeSpendingsSelectionModal.present();
  }

  writeValue(value: any) {
      this.item = this.typeSpendings.find((e) => {
        return e._id === value;
      });
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