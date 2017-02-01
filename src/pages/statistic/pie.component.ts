import { Component, ElementRef, Renderer, Input } from '@angular/core';
import { Chart } from 'chart.js';
import _ from "lodash";

@Component({
  selector: 'chart-pie',
  template: `<canvas style="width: 100%; height: 400px"></canvas>`,
  host: { style: 'float: left; width: 100%' },
})
export class ChartPie {
    @Input() title: string;
    @Input() data: any;
    chartOpts: any = {};
    opts:any = {
        labels: [],
        datasets: []
    };
    datasetTemp: any = {
        maintainAspectRatio: true,
        responsive: true,
        data: [],
        backgroundColor: [
            "#FF6384",
            "#4BC0C0",
            "#FFCE56",
            "#E7E9ED",
            "#36A2EB",
            "#FFC266",
            "#D284BD",
            "#8784DB",
            "#FF7B65",
            "#CAEEFC",
            "#9ADBAD",
            "#FFF1B2",
            "#FFE0B2",
            "#FFBEB2",
            "#81AFDB"
        ],
        label: ''
    };

    constructor(private element: ElementRef, private renderer: Renderer){
        
    }

    ngOnChanges(changes: any) {
        this.opts.labels = this.data.labels;
        this.opts.datasets = new Array(this.data.datasets.length);
        for(let i in this.data.datasets){
            this.opts.datasets[i] = _.merge(this.opts.datasets[i], this.datasetTemp, this.data.datasets[i]);
        }
    }

    ngOnInit() {
        const canvas:any = this.element.nativeElement.querySelector('canvas');        
        new Chart(canvas.getContext("2d"), {
            type: 'pie',
            data: this.opts,
            options: this.chartOpts
        });
    }
}