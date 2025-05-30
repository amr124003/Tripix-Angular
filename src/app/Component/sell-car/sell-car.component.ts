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

  // تعيين الحد الأقصى للصور
  readonly MAX_IMAGES = 6;

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

    // التحقق من عدد الصور الحالي
    const availableSpace = this.MAX_IMAGES - this.images.length;

    setTimeout(() => {
      for (let file of Array.from(files)) {
        if (this.images.length < this.MAX_IMAGES) {
          this.images.push({
            url: URL.createObjectURL(file),
            name: file.name,
            size: Math.round(file.size / 1024)
          });
        } else {
          alert(`You can only upload up to ${this.MAX_IMAGES} images.`);
          break;
        }
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

  // دالة لحذف الصورة بناءً على الـ index
  deleteImage(index: number) {
    this.images.splice(index, 1);  // حذف الصورة من المصفوفة
  }

  trackByIndex(index: number, item: any) {
    return index;  // تعيين الـ index كـ key لتتبع العنصر بشكل صحيح
  }
}