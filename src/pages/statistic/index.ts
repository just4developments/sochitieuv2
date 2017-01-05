import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

import { AppService } from '../../app/app.service';
import { ChartDetailInMonth } from './detail-month';

@Component({
  selector: 'statistic',
  templateUrl: 'index.html'
})
export class Statistic {
    allMonthData:any;
    allMonthChartData: any;
    constructor(public navCtrl: NavController, private appService: AppService){
        
    }

    ngOnInit() {
        this.appService.getStatisticByMonth().then((data) => {
            let chartData = {
                labels: [],
                datasets: [
                    {
                        label: 'Spending',
                        data: [],
                        backgroundColor: 'rgba(255, 99, 132, 0.2)',
                        borderColor: 'rgba(255,99,132,1)',
                    },
                    {
                        label: 'Earning',
                        data: [],
                        backgroundColor: 'rgba(75,192,192,0.4)',
                        borderColor: 'rgba(75,192,192,1)',
                    }
                ]
            };
            for(let r of data){
                chartData.labels.push(moment(new Date(r._id.year, r._id.month, 1)).format('MM YYYY'));
                chartData.datasets[0].data.push(r.smoney); 
                chartData.datasets[1].data.push(r.emoney); 
            }            
            this.allMonthChartData = chartData;
            this.allMonthData = data;
        });
    }

    pickMonthChart(data){
        const [month, year] = data.label.split(' ');
        data.date = new Date(year, month-1, 1);
        data.type = data.index === 0 ? 'spending' : 'earning';
        this.navCtrl.push(ChartDetailInMonth, data);
    }

    gotoMonthChart(item){
        this.navCtrl.push(ChartDetailInMonth, {date: new Date(item._id.year, item._id.month, 1), value: 0});
    }
}