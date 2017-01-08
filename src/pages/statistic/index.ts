import { Component } from '@angular/core';
import { NavController, PopoverController, ViewController, LoadingController, Loading } from 'ionic-angular';
import _ from "lodash";

import { AppService } from '../../app/app.service';
import { ChartDetailInMonth } from './detail-month';
import { Spending } from '../spending';
import { SearchByDatePopover } from './index-search.popover';

@Component({
  selector: 'statistic',
  templateUrl: 'index.html'
})
export class Statistic {
    type: String = 'spending';
    chartType: String = 'byMoney';
    chartDataByMonth: any = {
        table: undefined,
        chart: undefined
    };
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
    filter:any = {
      startDate: undefined,
      endDate: undefined
    };

    constructor(public navCtrl: NavController, private appService: AppService, public popoverCtrl: PopoverController, public loadingCtrl: LoadingController){
        this.filter.startDate = new Date();
        this.filter.startDate.setDate(1);
        this.filter.startDate.setMonth(0);
        this.filter.startDate.setHours(0);
        this.filter.startDate.setMinutes(0);
        this.filter.startDate.setSeconds(0);
        this.filter.startDate.setMilliseconds(0);
        this.filter.startDate = this.filter.startDate.toISOString();
        
        this.filter.endDate = new Date();
        this.filter.endDate.setMonth(12);
        this.filter.endDate.setDate(0);
        this.filter.endDate.setHours(23);
        this.filter.endDate.setMinutes(59);
        this.filter.endDate.setSeconds(59);
        this.filter.endDate.setMilliseconds(999);
        this.filter.endDate = this.filter.endDate.toISOString();
    }

    ngOnInit() {
        this.loadData();
    }

    loadData(){
        if(this.chartType === 'byMoney'){
            this.loadChartByMoney();
        }else {
            this.loadChartByTypeSpending();
        }
    }

    changeChartType(){
        this.loadData();
    }

    loadChartByTypeSpending(){
        if(this.chartDataByType.chart.spending && this.type === 'spending') return;
        if(this.chartDataByType.chart.earning && this.type === 'earning') return;
        this.appService.getTypeSpendings().then((typeSpendings) => {
            this.appService.getStatisticByTypeSpending(this.type === 'spending' ? -1 : 1, this.toDate(this.filter.startDate), this.toDate(this.filter.endDate)).then((data) => {
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
                    let e = data[i];
                    let name = typeSpendings.find((e0) => {
                        return e0._id === e._id;
                    });
                    name = name ? name.name : e._id;
                    data[i].name = name;
                    tmp.labels.push(name);
                    tmp.datasets[0].data.push(e.money); 
                };
                let tmpData = _.merge({}, this.type === 'spending' ? {
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
                    this.chartDataByType.chart.spending = tmpData;
                    this.chartDataByType.table.totalSpending = 0;
                    this.chartDataByType.table.spending = data.map((e) => {
                        this.chartDataByType.table.totalSpending += e.money;
                        return e;
                    });
                }
                else {
                    this.chartDataByType.chart.earning = tmpData;
                    this.chartDataByType.table.totalEarning = 0;
                    this.chartDataByType.table.earning = data.map((e) => {
                        this.chartDataByType.table.totalEarning += e.money;
                        return e;
                    });
                }
            }); 
        });
    }
    loadChartByMoney(){
        if(this.chartDataByMonth.chart) return;
        const loading:Loading = this.loadingCtrl.create({
            content: 'Please wait...'
        });
        loading.present();        
        this.chartDataByMonth.chart = null;
        this.chartDataByMonth.table = null;
        this.appService.getStatisticByMonth(this.filter).then((data) => {
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
            this.chartDataByMonth.chart = chartData;
            this.chartDataByMonth.table = data;
            loading.dismiss();
        });
    }

    pickMonthChart(data){
        const [month, year] = data.label.split(' ');
        data.startDate = new Date(year, month-1, 1);
        data.endDate = new Date(year, month, 1);
        data.endDate.setDate(data.endDate.getDate()-1);
        data.type = data.index === 0 ? 'spending' : 'earning';
        this.navCtrl.push(ChartDetailInMonth, data);
    }

    gotoMonthChart(item){
        let data:any = {};
        data.startDate = new Date(item._id.year, item._id.month, 1);
        data.endDate = new Date(item._id.year, item._id.month+1, 1);
        data.endDate.setDate(data.endDate.getDate()-1);
        this.navCtrl.push(ChartDetailInMonth, data);
    }

    gotoSpendingByType(item){
        let data:any = {};
        data.startDate = new Date(this.filter.startDate);
        data.endDate = new Date(this.filter.endDate);
        data.typeSpendingId= item._id;
        this.navCtrl.push(Spending, data);
    }

    openSearch(myEvent){
        let popover = this.popoverCtrl.create(SearchByDatePopover, {filter: this.filter});
        popover.onDidDismiss(data => {
            if(data) {
                this.chartDataByMonth.table = null;
                this.chartDataByMonth.chart = null;
                this.chartDataByType.chart.earning = null;
                this.chartDataByType.chart.spending = null;                
                this.filter = data;
                this.loadData();
            }
        });
        popover.present({
            ev: myEvent
        });
    }

    toDate(sdate){
        return new Date(sdate);
    }
}