import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-sell-car',
  imports: [FormsModule,CommonModule],
  templateUrl: './sell-car.component.html',
  styleUrl: './sell-car.component.css'
})
export class SellCarComponent {
  @ViewChild('fileInput') fileInput!: ElementRef;

  step: number = 1;
  isDragging: boolean = false;
  loading: boolean = false;
  images: { url: string, name: string, size: number }[] = [];
  carDetails = { name: '', model: '', condition: '', description: '', type: 'Auto' };

  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent) {
    this.isDragging = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragging = false;
    this.handleFiles(event.dataTransfer?.files ?? null);
  }

  onFileSelect(event: any) {
    this.handleFiles(event.target.files ?? null);
  }

  handleFiles(files: FileList | null) {
    if (!files) return;
    this.loading = true;
    setTimeout(() => {
      for (let file of Array.from(files)) {
        this.images.push({
          url: URL.createObjectURL(file),
          name: file.name,
          size: Math.round(file.size / 1024)
        });
      }
      this.loading = false;
    }, 1000);
  }

  uploadImages() {
    alert('Images uploaded successfully!');
  }

  nextStep() {
    document.querySelector('.upload-step')?.classList.add('fade-out');
    this.step = 2;
  }

  previousStep() {
    document.querySelector('.details-step')?.classList.add('fade-out');
    this.step = 1;
  }

  cancel() {
    this.images = [];
  }

  finish() {
    alert('Form submitted successfully!');
  }
}