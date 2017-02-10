import { Component } from '@angular/core';
import { AppService } from '../../app/app.service';
import { ViewController } from 'ionic-angular';

@Component({
  selector: 'icon-picker',
  templateUrl: 'icon-picker.html'
})
export class IconPicker {
	items: Array<any>;

  constructor(public viewCtrl: ViewController, private appService: AppService) {
     this.items = [];
		 let i = 0;
		 let col= 13;
		 let row= 12;
		 while(i < col * row) {
			 if(i === 129 || i === 142 || i === 155) {
         i++;
         continue;
       }
			 this.items.push({icon: `-${(i%(col))*53}px -${Math.floor(i/col)*64}px`, sicon: ''});
       i++;
		 }
  }

  pickIcon(icon){
    this.dismiss(icon);
  }

  dismiss(data) {
    this.viewCtrl.dismiss(data);
  }

}
