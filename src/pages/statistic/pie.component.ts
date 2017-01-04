import { Component, ElementRef, Renderer, Input } from '@angular/core';
import { Chart } from 'chart.js';
import _ from "lodash";

@Component({
  selector: 'chart-pie',
  template: `<canvas style="width: 100vw; height: 100vh"></canvas>`,
  host: { style: 'position: absolute; width: 100vw; height: 100vh;' },
})
export class ChartPie {
    @Input() title: String;
    @Input() data: any;
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
            "#36A2EB"
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
            type: 'polarArea',
            data: this.opts
        });
    }
}