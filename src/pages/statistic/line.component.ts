import { Component, ElementRef, Renderer, Input, EventEmitter, Output } from '@angular/core';
import { Chart } from 'chart.js';

@Component({
  selector: 'chart-line',
  template: `<canvas style="width: 100vw; height: auto;"></canvas>`,
  host: { style: 'position: absolute; width: 100vw; height: 100vh;' },
})
export class ChartLine {
    @Input() title: String;
    @Input() data: any;
    @Output() onPick: EventEmitter<any> = new EventEmitter<any>();
    opts:any = {
        labels: [],
        datasets: [
            {
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
                pointBorderColor: "rgba(75,192,192,1)",
                pointBackgroundColor: "#fff",
                pointBorderWidth: 1,
                pointHoverRadius: 5,
                pointHoverBackgroundColor: "rgba(75,192,192,1)",
                pointHoverBorderColor: "rgba(220,220,220,1)",
                pointHoverBorderWidth: 2,
                pointRadius: 1,
                pointHitRadius: 10,
                data: [],
                spanGaps: false
            }
        ]
    };

    constructor(private element: ElementRef, private renderer: Renderer){
        
    }

    ngOnChanges(changes: any) {
        this.opts.labels = this.data.labels;
        this.opts.datasets[0].data = this.data.data;
        this.opts.datasets[0].label = this.title;
    }

    ngOnInit() {
        const canvas:any = this.element.nativeElement.querySelector('canvas');        
        const chart:any = new Chart(canvas.getContext("2d"), {
            type: 'line',
            data: this.opts
        });
        this.renderer.listen(canvas, 'click', (evt) => {
            var activePoints = chart.getElementsAtEvent(evt);
            var firstPoint = activePoints[0];
            if (firstPoint !== undefined){
                this.onPick.emit({ label: chart.data.labels[firstPoint._index], value: chart.data.datasets[firstPoint._datasetIndex].data[firstPoint._index]});
            }
        });
    }
}