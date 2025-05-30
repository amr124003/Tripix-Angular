import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-cars-images',
  imports: [CommonModule,FormsModule],
  templateUrl: './cars-images.component.html',
  styleUrl: './cars-images.component.css'
})
export class CarsImagesComponent {
 @ViewChild('fileInput') fileInput!: ElementRef;

  step: number = 1;
  isDragging: boolean = false;
  loading: boolean = false;
  images: { url: string, name: string, size: number }[] = [];
  carDetails = { name: '', model: '', condition: '', description: '', type: 'Auto' };
  Uploadfiles : File[] = [];

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
          this.Uploadfiles.push(file);
        } else {
          alert(`You can only upload up to ${this.MAX_IMAGES} images.`);
          break;
        }
      }
      this.loading = false;
    }, 1000);
  }

  uploadImages() {
    if (this.Uploadfiles.length === 0) {
    alert("No images to upload.");
    return;
  }

  const formData = new FormData();

  for (let file of this.Uploadfiles) {
    formData.append('files', file); // "files" هو اسم البراميتر اللي في الـ API
  }

  // this.http.post('https://your-api.com/api/upload-photos', formData)
  //   .subscribe({
  //     next: res => {
  //       console.log('Upload success:', res);
  //       alert('Images uploaded successfully');
  //       // ممكن تفضي الصور هنا لو حبيت
  //       this.Uploadfiles = [];
  //       this.images = [];
  //     },
  //     error: err => {
  //       console.error('Upload error:', err);
  //       alert('Upload failed');
  //     }
  //   });
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