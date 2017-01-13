import { Component } from '@angular/core';
import { AppService } from '../../app/app.service';
import { NavController, NavParams, ViewController, ToastController } from 'ionic-angular';

@Component({
  selector: 'icon-picker',
  templateUrl: 'icon-picker.html'
})
export class IconPicker {
	items: Array<any>;

  constructor(public viewCtrl: ViewController, public navCtrl: NavController, private appService: AppService, params: NavParams, public toastCtrl: ToastController) {
     this.items = [];
		 let i = 0;
		 let col= 13;
		 let row= 12;
		 while(i++ < col * row){
			 if(i === 117 || i === 130 || i === 143) continue;
			 this.items.push({icon: `-${(i%col-1)*53}px -${(i%row-1)*64}px`, sicon: ''});
		 }
  }

  pickIcon(icon){
    this.dismiss(icon);
  }

  dismiss(data) {
    this.viewCtrl.dismiss(data);
  }

}
