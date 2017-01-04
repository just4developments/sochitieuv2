import { Component, ElementRef, Renderer, Input } from '@angular/core';
import { Chart } from 'chart.js';

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
        datasets: [{
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
            label: '' // for legend
        }]
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
        new Chart(canvas.getContext("2d"), {
            type: 'polarArea',
            data: this.opts
        });
    }
}