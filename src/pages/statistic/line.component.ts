import { Component, ElementRef, Renderer, Input, EventEmitter, Output } from '@angular/core';
import { Chart } from 'chart.js';
import _ from "lodash";

@Component({
  selector: 'chart-line',
  template: `<canvas style="width: 100vw; height: auto;"></canvas>`,
  host: { style: 'position: absolute; width: 100vw; height: 100vh;' },
})
export class ChartLine {
    @Input() title: String;
    @Input() data: any;
    @Output() onPick: EventEmitter<any> = new EventEmitter<any>();
    chartOpts: any = {};
    opts:any = {
        labels: [],
        datasets: []
    };
    datasetTemp:any = {
        maintainAspectRatio: true,
        responsive: true,
        label: "",
        fill: false,
        lineTension: 0.1,
        backgroundColor: "rgba(75,192,192,0.4)",
        borderColor: "rgba(75,192,192,1)",
        borderCapStyle: 'butt',
        borderDash: [],
        borderDashOffset: 0.0,
        borderJoinStyle: 'miter',
        pointBorderWidth: 1,
        pointHoverRadius: 5,
        pointHoverBorderWidth: 2,
        pointRadius: 1,
        pointHitRadius: 10,
        data: [],
        borderWidth: 2,
        spanGaps: false ,       
    }

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
        const chart:any = new Chart(canvas.getContext("2d"), {
            type: 'line',
            data: this.opts,
            options: this.chartOpts
        });
        this.renderer.listen(canvas, 'click', (evt) => {
            var activePoints = chart.getElementsAtEvent(evt);
            var firstPoint = activePoints[0];
            if (firstPoint !== undefined){
                this.onPick.emit({ index: firstPoint._datasetIndex, label: chart.data.labels[firstPoint._index], value: chart.data.datasets[firstPoint._datasetIndex].data[firstPoint._index]});
            }
        });
    }
}