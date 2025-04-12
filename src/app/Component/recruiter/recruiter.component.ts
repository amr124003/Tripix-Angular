import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Chart, ChartConfiguration, ChartType } from 'chart.js';

@Component({
  selector: 'app-recruiter',
  imports: [],
  templateUrl: './recruiter.component.html',
  styleUrl: './recruiter.component.css'
})
export class RecruiterComponent implements OnInit {
  @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;
  private chartInstance!: Chart;

  constructor() { }

  ngOnInit(): void {
    this.initChart();
  }

  private initChart(): void {
    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    const gradient = ctx.createLinearGradient(0, 0, 0, 450);
    gradient.addColorStop(0, 'rgba(0, 199, 214, 0.32)');
    gradient.addColorStop(0.3, 'rgba(0, 199, 214, 0.1)');
    gradient.addColorStop(1, 'rgba(0, 199, 214, 0)');

    const data = {
      labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
      datasets: [{
        label: 'Applications',
        backgroundColor: gradient,
        pointBackgroundColor: '#00c7d6',
        borderWidth: 1,
        borderColor: '#0e1a2f',
        data: [60, 45, 80, 30, 35, 55, 25, 80, 40, 50, 80, 50]
      }]
    };

    const options: ChartConfiguration['options'] = {
      responsive: true,
      maintainAspectRatio: true,
      animation: {
        easing: 'easeInOutQuad',
        duration: 520
      },
      scales: {
        y: {
          ticks: {
            color: '#5e6a81'
          },
          grid: {
            color: 'rgba(200, 200, 200, 0.08)',
            lineWidth: 1
          }
        },
        x: {
          ticks: {
            color: '#5e6a81'
          }
        }
      },
      elements: {
        line: {
          tension: 0.4
        }
      },
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          titleFont: {
            family: 'Poppins'
          },
          backgroundColor: 'rgba(0,0,0,0.4)',
          titleColor: 'white',
          caretSize: 5,
          cornerRadius: 2,
          padding: {
            x: 10,
            y: 10
          }
        }
      }
    };

    this.chartInstance = new Chart(ctx, {
      type: 'line' as ChartType,
      data: data,
      options: options
    });
  }

  toggleRightPanel(): void {
    const rightPanel = document.querySelector('.app-right');
    rightPanel?.classList.toggle('show');
  }

  toggleLeftPanel(): void {
    const leftPanel = document.querySelector('.app-left');
    leftPanel?.classList.toggle('show');
  }
}