import { Component, Input } from '@angular/core';
import { NavController, PopoverController, ViewController, NavParams } from 'ionic-angular';

@Component({
  template: `
    <ion-list>
      <ion-list-header>
        Show chart by time
      </ion-list-header>
      <ion-item>
        <ion-label stacked>Start Time</ion-label>
        <ion-datetime displayFormat="DD/MM/YYYY" [max]="filter.endDate" [(ngModel)]="filter.startDate"></ion-datetime>
      </ion-item>
      <ion-item>
        <ion-label stacked>End Time</ion-label>
        <ion-datetime displayFormat="DD/MM/YYYY" [min]="filter.startDate" [(ngModel)]="filter.endDate"></ion-datetime>
      </ion-item>
      <div padding>
        <button ion-button block (click)="apply()">Search</button>
      </div>
    </ion-list>
  `
})
export class SearchByDatePopover {
  filter: any;

  constructor(public viewCtrl: ViewController, public navParams: NavParams) {
    this.filter = navParams.get('filter');
  }

  apply(){
    this.viewCtrl.dismiss(this.filter);
  }

  close() {
    this.viewCtrl.dismiss();
  }
}