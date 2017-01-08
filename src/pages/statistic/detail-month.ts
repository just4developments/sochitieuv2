import { Component, ElementRef, Renderer } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import _ from "lodash";

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
                for(let e of data) {
                    let name = typeSpendings.find((e0) => {
                        return e0._id === e._id;
                    });
                    name = name ? name.name : e._id;
                    tmp.labels.push(name);
                    tmp.datasets[0].data.push(e.money); 
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
            }); 
        });
    }
}