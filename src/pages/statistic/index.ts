import { Component } from '@angular/core';
import { NavController, PopoverController } from 'ionic-angular';
import _ from "lodash";
import * as moment from 'moment';

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
    setColors: Array<String> = ["#ff402c", "#278ecf", "#4bd762", "#ffca1f", "#ff9416", "#d42ae8", "#535ad7", "#83bfff", "#ffe366", "#FF6384", "#FFCE56", "#E7E9ED", "#36A2EB", "#ffc266", "#D284BD", "#8784DB", "#FF7B65", "#CAEEFC", "#4BC0C0", "#9ADBAD", "#FFF1B2", "#FFE0B2", "#FFBEB2", "#81AFDB", "#6edb8f"];
    constructor(public navCtrl: NavController, private appService: AppService, public popoverCtrl: PopoverController){
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
        this.appService.getI18("msg__wait").subscribe((msg) => {
            this.appService.showLoading(msg).then(() => {
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
                                    backgroundColor: this.setColors
                                }
                            ]
                        } : {
                            datasets: [
                                {
                                    backgroundColor: this.setColors.reverse()
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
                        this.appService.hideLoading();
                    }); 
                });
            });
        });
    }
    loadChartByMoney(){
        if(this.chartDataByMonth.chart) return;
        this.appService.getI18("msg__wait").subscribe((msg) => {
            this.appService.showLoading(msg).then(() => {
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
                                borderColor: this.setColors[0],
                            },
                            {
                                label: 'Earning',
                                data: [],
                                backgroundColor: 'rgba(75,192,192,0.4)',
                                borderColor: this.setColors[this.setColors.length-1],
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
                    this.appService.hideLoading();
                });
            });
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