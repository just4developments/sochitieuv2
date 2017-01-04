import { Component } from '@angular/core';
import { NavController, ModalController, AlertController, ToastController } from 'ionic-angular';
import { Chart } from 'chart.js';

import { AppService } from '../../app/app.service';
import { ChartDetailInMonth } from './detail-month';

@Component({
  selector: 'statistic',
  templateUrl: 'index.html'
})
export class Statistic {
    allMonthData:any;
    
    constructor(public navCtrl: NavController, private appService: AppService){
        
    }

    ngOnInit() {
        this.appService.getStatisticByMonth().then((data) => {
            let chartData = {
                labels: [],
                data: []
            };
            for(let r of data){
                chartData.labels.push(r._id.month + '/' + r._id.year);
                chartData.data.push(r.money);
            }
            this.allMonthData = chartData;
        });
    }

    pickMonthChart(data){
        this.navCtrl.push(ChartDetailInMonth, data);
    }
}