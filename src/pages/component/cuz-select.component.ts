import { Component, ElementRef, Renderer, Input, EventEmitter, Output } from '@angular/core';
import { AlertController } from 'ionic-angular';
import _ from "lodash";

@Component({
  selector: 'cuz-select',
  template: `<div (tap)="open()">aaaaaaa  </div>`,
})
export class CuzSelect {

    constructor(private element: ElementRef, private renderer: Renderer, public alertCtrl: AlertController){
        
    }

    ngOnChanges(changes: any) {
        
    }

    ngOnInit() {
        
    }

    open(){
        let alert = this.alertCtrl.create();
        alert.setTitle('Lightsaber color');

        alert.addInput({
        type: 'radio',
        label: 'Blue',
        value: 'blue',
        checked: true
        });

        alert.addButton('Cancel');
        alert.addButton({
        text: 'OK',
        handler: data => {
            
        }
        });
        alert.present();
    }
}