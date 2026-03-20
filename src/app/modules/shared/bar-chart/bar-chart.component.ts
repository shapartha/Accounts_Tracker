import { Component, ViewChild, ElementRef, AfterViewInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { UtilService } from 'app/services/util.service';
import { ChartOptions } from 'chart.js';

@Component({
  selector: 'app-bar-chart',
  templateUrl: './bar-chart.component.html',
  styleUrls: ['./bar-chart.component.scss'],
  standalone: true
})
export class BarChartComponent implements AfterViewInit, OnDestroy {
  @ViewChild('canvas', { static: true }) canvas!: ElementRef<HTMLCanvasElement>;

  @Input() labels: string[] = [];
  @Input() data: number[] = [];
  @Input() chartTitle?: string;
  @Output() barClick = new EventEmitter<{ index: number; label?: string; value?: number }>();

  constructor(private utilService: UtilService) { }

  private chart?: any;

  async ngAfterViewInit(): Promise<void> {
    const ctx = this.canvas.nativeElement.getContext('2d')!;
    const mod = await import('chart.js');
    const { Chart, BarController, CategoryScale, LinearScale, BarElement, Tooltip, Legend } = mod;
    Chart.register(BarController, CategoryScale, LinearScale, BarElement, Tooltip, Legend);

    this.chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: this.labels,
        datasets: [{
          data: this.data,
          backgroundColor: this.utilService.generateColors(this.data.length)
        }]
      },
      options: this.getOptions()
    });

    this.canvas.nativeElement.addEventListener('mousemove', this.hoverHandler);
    this.canvas.nativeElement.addEventListener('mouseleave', this.leaveHandler);
  }

  update(values: number[], labels?: string[], colors?: string[]) {
    if (!this.chart) return;
    if (labels) this.chart.data.labels = labels;
    const bg = colors ?? this.utilService.generateColors(values.length);
    this.chart.data.datasets[0].backgroundColor = bg;
    this.chart.data.datasets[0].data = values;
    this.chart.update();
  }

  ngOnDestroy(): void {
    this.canvas.nativeElement.removeEventListener('mousemove', this.hoverHandler);
    this.canvas.nativeElement.removeEventListener('mouseleave', this.leaveHandler);
    this.chart?.destroy();

    const existing = this.canvas.nativeElement.parentElement?.querySelector('.chartjs-tooltip');
    existing && existing.remove();
  }

  private getOptions(): ChartOptions<'bar'> {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { enabled: true } // use built-in tooltip
      },
      scales: {
        x: { stacked: false },
        y: { beginAtZero: true }
      }
    } as any;
  }

  private hoverHandler = (evt: MouseEvent) => {
    if (!this.chart) return;
    const elems = this.chart.getElementsAtEventForMode(evt as any, 'nearest', { intersect: true }, true);
    if (!elems || elems.length === 0) {
      this.hideGoBtn();
      return;
    }

    const elInfo = elems[0];
    const meta = this.chart.getDatasetMeta(elInfo.datasetIndex);
    const element = meta.data[elInfo.index];
    if (!element) {
      this.hideGoBtn();
      return;
    }

    const left = element.x;
    const top = element.y;

    this.showGoBtnAt(left, top, elInfo.index, elInfo.datasetIndex);
  };

  private leaveHandler = (evt?: MouseEvent) => {
    const related = evt?.relatedTarget as HTMLElement | null;
    // if pointer moved into the button or anywhere inside the chart container, keep the button
    if (related && this.canvas.nativeElement.parentElement?.contains(related)) return;
    this.hideGoBtn();
  };

  private showGoBtnAt(pageX: number, pageY: number, index: number, datasetIndex: number) {
    let btn = this.canvas.nativeElement.parentElement!.querySelector('.chart-go-btn') as HTMLElement | null;
    if (!btn) {
      btn = document.createElement('button');
      btn.className = 'chart-go-btn';
      btn.textContent = 'View';
      btn.style.position = 'absolute';
      btn.style.zIndex = '1001';
      btn.style.pointerEvents = 'auto';
      this.canvas.nativeElement.parentElement!.appendChild(btn);

      btn.onclick = () => {
        const lbl = (this.chart.data.labels ?? [])[index];
        const val = (this.chart.data.datasets[datasetIndex].data ?? [])[index];
        this.barClick.emit({ index, label: lbl, value: val });
      };

      // keep visible while hovering the button
      btn.onmouseenter = () => { /* no-op: prevents hide via relatedTarget check */ };
      btn.onmouseleave = (e) => {
        const related = (e as MouseEvent).relatedTarget as HTMLElement | null;
        if (related && this.canvas.nativeElement.parentElement?.contains(related)) {
          // moved back into chart area — leave visible
          return;
        }
        this.hideGoBtn();
      };
    }

    btn.style.left = `${pageX - 8}px`;
    btn.style.top = `${pageY}px`;
    btn.style.opacity = '1';
    btn.style.display = 'block';
  }

  private hideGoBtn() {
    const btn = this.canvas.nativeElement.parentElement!.querySelector('.chart-go-btn') as HTMLElement | null;
    if (btn) {
      btn.style.display = 'none';
    }
  }
}