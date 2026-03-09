import { Component, ViewChild, ElementRef, AfterViewInit, OnDestroy, Input, EventEmitter, Output } from '@angular/core';
import { Chart, ChartOptions } from 'chart.js';

@Component({
  selector: 'app-pie-chart',
  templateUrl: './pie-chart.component.html',
  styleUrls: ['./pie-chart.component.scss'],
  standalone: true
})
export class PieChartComponent implements AfterViewInit, OnDestroy {
  @ViewChild('canvas', { static: true }) canvas!: ElementRef<HTMLCanvasElement>;

  @Input() chartTitle: string = 'Pie Chart';
  @Input() labels: string[] = ['Red', 'Blue', 'Yellow'];
  @Input() data: number[] = [300, 50, 100];
  @Output() sliceClick = new EventEmitter<{ index: number; label?: string; value?: number }>();

  private handleClick = (evt: MouseEvent) => {
    if (!this.chart) return;
    const points = this.chart.getElementsAtEventForMode(evt as any, 'nearest', { intersect: true }, true);
    if (!points || points.length === 0) return;
    const p = points[0];
    const index = p.index;
    const datasetIndex = p.datasetIndex;
    const label = (this.chart.data.labels ?? [])[index] as string | undefined;
    const value = (this.chart.data.datasets[datasetIndex].data as number[])[index];
    this.sliceClick.emit({ index, label, value });
  };

  private chart?: Chart;

  ngAfterViewInit(): void {
    const ctx = this.canvas.nativeElement.getContext('2d')!;
    import('chart.js').then(({ Chart, PieController, ArcElement, Tooltip, Legend }) => {
      Chart.register(PieController, ArcElement, Tooltip, Legend);
      this.chart = new Chart(ctx, {
        type: 'pie',
        data: {
          labels: this.labels,
          datasets: [{
            data: this.data,
            backgroundColor: this.generateColors(this.data.length)
          }]
        },
        options: this.getOptions()
      });
      this.canvas.nativeElement.addEventListener('click', this.handleClick);
    });
  }

  update(values: number[], labels?: string[], colors?: string[]) {
    if (!this.chart) return;
    if (labels) this.chart.data.labels = labels;
    // use provided colors if given, otherwise regenerate based on values length
    const bg = colors ?? this.generateColors(values.length);
    (this.chart.data.datasets[0].backgroundColor as string[]) = bg as any;
    (this.chart.data.datasets[0].data as number[]) = values;
    this.chart.update();
  }

  ngOnDestroy(): void {
    this.canvas.nativeElement.removeEventListener('click', this.handleClick);
    this.chart?.destroy();
  }

  private getOptions(): ChartOptions<'pie'> {
    return {
      responsive: true,
      plugins: { legend: { position: 'bottom' } }
    };
  }

  private generateColors(count: number): string[] {
    const colors: string[] = [];
    for (let i = 0; i < count; i++) {
      const hue = Math.round((i * 360) / Math.max(1, count)); // distribute hues
      colors.push(this.hslToHex(hue, 70, 50));
    }
    return colors;
  }

  private hslToHex(h: number, s: number, l: number): string {
    s /= 100;
    l /= 100;
    const k = (n: number) => (n + h / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    const f = (n: number) => {
      const color = l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
      return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`;
  }
}