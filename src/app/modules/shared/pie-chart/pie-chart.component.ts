import { Component, ViewChild, ElementRef, AfterViewInit, OnDestroy, Input, EventEmitter, Output } from '@angular/core';
import { UtilService } from 'app/services/util.service';
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

  constructor(private utilService: UtilService) { }

  private chart?: Chart;

  async ngAfterViewInit(): Promise<void> {
    const ctx = this.canvas.nativeElement.getContext('2d')!;
    const mod = await import('chart.js');
    const { Chart, PieController, CategoryScale, LinearScale, ArcElement, Tooltip, Legend } = mod;
    Chart.register(PieController, CategoryScale, LinearScale, ArcElement, Tooltip, Legend);

    this.chart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: this.labels,
        datasets: [{
          data: this.data,
          backgroundColor: this.utilService.generateColors(this.data.length)
        }]
      },
      options: this.getOptions()
    });

    this.canvas.nativeElement.addEventListener('click', this.hoverHandler);
    this.canvas.nativeElement.addEventListener('mouseleave', this.leaveHandler);
  }

  update(values: number[], labels?: string[], colors?: string[]) {
    if (!this.chart) return;
    if (labels) this.chart.data.labels = labels;
    // use provided colors if given, otherwise regenerate based on values length
    const bg = colors ?? this.utilService.generateColors(values.length);
    (this.chart.data.datasets[0].backgroundColor as string[]) = bg as any;
    (this.chart.data.datasets[0].data as number[]) = values;
    this.chart.update();
  }

  ngOnDestroy(): void {
    this.canvas.nativeElement.removeEventListener('click', this.hoverHandler);
    this.canvas.nativeElement.removeEventListener('mouseleave', this.leaveHandler);
    this.chart?.destroy();

    this.removeGoBtn();

    const existing = this.canvas.nativeElement.parentElement?.querySelector('.chartjs-tooltip');
    existing && existing.remove();
  }

  private getOptions(): ChartOptions<'pie'> {
    return {
      responsive: true,
      plugins: {
        legend: { position: 'bottom' },
        tooltip: { enabled: true } // use built-in tooltip
      }
    } as any;
  }

  private hoverHandler = (evt: MouseEvent) => {
    if (!this.chart) return;
    const elems = this.chart.getElementsAtEventForMode(evt as any, 'nearest', { intersect: true }, true);
    if (!elems || elems.length === 0) {
      this.removeGoBtn();
      return;
    }

    const elInfo = elems[0];
    const meta = this.chart.getDatasetMeta(elInfo.datasetIndex);
    const element = meta.data[elInfo.index] as any;
    if (!element) {
      this.removeGoBtn();
      return;
    }

    const layerX = evt.layerX;
    const layerY = evt.layerY;

    this.showGoBtnAt(layerX, layerY, elInfo.index, elInfo.datasetIndex);
  };

  private showGoBtnAt(clientX: number, clientY: number, index: number, datasetIndex: number) {
    const container = this.canvas.nativeElement.parentElement!;
    let el = container.querySelector('.chart-go-btn') as HTMLElement | null;

    if (!el) {
      el = document.createElement('button');
      el.className = 'chart-go-btn';
      el.textContent = 'View';
      el.style.position = 'absolute';
      el.style.zIndex = '1001';
      el.style.pointerEvents = 'auto';
      container.appendChild(el);

      el.onmouseenter = () => { };
      el.onmouseleave = (e) => {
        const related = (e as MouseEvent).relatedTarget as HTMLElement | null;
        if (related && container.contains(related)) return;
        this.removeGoBtn();
      };
    }

    // remove previous click handler if any, then add a new one bound to current index
    const prev = (el as any)._chartGoHandler as EventListener | undefined;
    if (prev) {
      el.removeEventListener('click', prev);
      delete (el as any)._chartGoHandler;
    }

    const onClick = () => {
      if (!this.chart) return;
      const lbl = (this.chart.data.labels ?? [])[index] as string | undefined;
      const val = (this.chart.data.datasets[datasetIndex].data ?? [])[index] as number | undefined;
      this.sliceClick.emit({ index, label: lbl, value: val });
    };

    el.addEventListener('click', onClick);
    (el as any)._chartGoHandler = onClick;

    el.style.left = `${clientX}px`;
    el.style.top = `${clientY}px`;
    el.style.opacity = '1';
    el.style.display = 'block';
  }

  private leaveHandler = (evt?: MouseEvent) => {
    const related = evt?.relatedTarget as HTMLElement | null;
    // if pointer moved into the button or anywhere inside the chart container, keep the button
    if (related && this.canvas.nativeElement.parentElement?.contains(related)) return;
    this.removeGoBtn();
  };

  private removeGoBtn() {
    const btn = this.canvas.nativeElement.parentElement!.querySelector('.chart-go-btn') as HTMLElement | null;
    if (btn) {
      const h = (btn as any)._chartGoHandler as EventListener | undefined;
      if (h) btn.removeEventListener('click', h);
      btn.remove();
    }
  }
}