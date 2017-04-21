import { Component } from '@angular/core';
import { NavParams, NavController } from 'ionic-angular';
import _ from "lodash";

import { Spending } from '../spending';
import { AppService } from '../../app/app.service';

@Component({
  selector: 'statistic',
  templateUrl: 'detail-month.html'
})
export class ChartDetailInMonth {
    item: any;
    type: string;
    data: any;
    chartDataByType: any = {
        chart: {
            spending: undefined,
            chart: undefined
        },
        table: {
            spending: undefined,
            chart: undefined
        }
    };

    constructor(public navCtrl: NavController, public navParams: NavParams, private appService: AppService){
        this.item = this.navParams.data; 
        this.type = this.item.type || 'spending';
        this.loadChart();
    }

    gotoSpendingByType(item){
        let data:any = {};
        data.startDate = this.appService.date.utcToLocal(this.item.startDate);
        data.endDate = this.appService.date.utcToLocal(this.item.endDate);
        data.typeSpendingId= item._id;
        this.navCtrl.push(Spending, data);
    }

    loadChart(){
        this.data = null;
        this.appService.getI18("msg__wait").subscribe((msg) => {
            this.appService.showLoading(msg).then(() => {
                this.appService.getTypeSpendings().then((typeSpendings) => {
                    this.appService.getStatisticByTypeSpending(this.type === 'spending' ? -1 : 1, this.item.startDate, this.item.endDate).then((data) => {
                        let tmp = {
                            labels: [],
                            datasets: [
                                {
                                    label: this.type === 'spending' ? 'Spending' : 'Earning',
                                    data: []
                                }
                            ]
                        };
                        for(let i in data) {
                            let typeSpend = typeSpendings.find((e0) => {
                                return e0._id === data[i]._id;
                            });
                            data[i].name = typeSpend ? typeSpend.name : data[i]._id;
                            data[i].icon = typeSpend.icon;
                            tmp.labels.push(data[i].name);
                            tmp.datasets[0].data.push(data[i].money); 
                        };
                        this.data = _.merge({}, this.type === 'spending' ? {
                            datasets: [
                                {
                                    backgroundColor: [
                                        'rgba(255,99,132,1)',  
                                        'rgba(54, 162, 235, 1)',                                                          
                                        'rgba(255, 206, 86, 1)',
                                        'rgba(75, 192, 192, 1)',
                                        'rgba(153, 102, 255, 1)',
                                        'rgba(255, 159, 64, 1)'
                                    ]
                                }
                            ]
                        } : {
                            datasets: [
                                {
                                    backgroundColor: [
                                        'rgba(75, 192, 192, 1)',  
                                        'rgba(153, 102, 255, 1)',                                
                                        'rgba(54, 162, 235, 1)',                                                          
                                        'rgba(255, 206, 86, 1)',                                                              
                                        'rgba(255,99,132,1)',  
                                        'rgba(255, 159, 64, 1)'
                                    ]
                                }
                            ]
                        }, tmp);
                        if(this.type === 'spending') {
                            this.chartDataByType.table.totalSpending = 0;
                            this.chartDataByType.table.spending = data.map((e) => {
                                this.chartDataByType.table.totalSpending += e.money;
                                return e;
                            });
                        }
                        else {
                            this.chartDataByType.table.totalEarning = 0;
                            this.chartDataByType.table.earning = data.map((e) => {
                                this.chartDataByType.table.totalEarning += e.money;
                                return e;
                            });
                        }
                        this.appService.hideLoading();
                    }); 
                });
            });
        });
    }
}