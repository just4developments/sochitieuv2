import { Component, ElementRef, Renderer } from '@angular/core';
import { NavController, ModalController, AlertController, ToastController, NavParams } from 'ionic-angular';
import { Chart } from 'chart.js';

import { AppService } from '../../app/app.service';

@Component({
  selector: 'statistic',
  templateUrl: 'detail-month.html'
})
export class ChartDetailInMonth {
    item: any;
    type: String;
    data: any;
    
    constructor(public navCtrl: NavController, public navParams: NavParams, private element: ElementRef, private renderer: Renderer, private appService: AppService){
        this.item = this.navParams.data; 
        this.type = this.item.type || 'spending';
        this.loadChart();
    }

    loadChart(){
        this.data = null;
        this.appService.getTypeSpendings().then((typeSpendings) => {
            this.appService.getStatisticByTypeSpending(this.type === 'spending' ? -1 : 1, this.item.date.getMonth(), this.item.date.getFullYear()).then((data) => {
                let tmp = {
                    labels: [],
                    datasets: [
                        {
                            label: this.type === 'spending' ? 'Spending' : 'Earning',
                            data: []
                        }
                    ]
                };
                for(let e of data) {
                    let name = typeSpendings.find((e0) => {
                        return e0._id === e._id;
                    });
                    name = name ? name.name : e._id;
                    tmp.labels.push(name);
                    tmp.datasets[0].data.push(e.money); 
                };
                this.data = tmp;
            }); 
        });
    }
}