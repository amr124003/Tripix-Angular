import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { trigger, transition, style, animate } from '@angular/animations';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-sell-car',
  imports: [FormsModule, CommonModule,ReactiveFormsModule],
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
  carForm!: FormGroup;


  constructor(private snackBar: MatSnackBar, private fb: FormBuilder) {
    this.carForm = this.fb.group({
      name: ['', Validators.required , Validators.max(15)],
      model: ['', Validators.required , Validators.pattern('^[0-9]+$') ,  Validators.min(1950), Validators.max(2025)],
      condition: ['', Validators.required],
      description: ['', Validators.required],
      type: ['', Validators.required]
    });
  }

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
          this.showAlert(`You can only upload up to ${this.MAX_IMAGES} images.`);
          break;
        }
      }
      this.loading = false;
    }, 1000);
  }

  uploadImages() {
    this.showAlert('Images uploaded successfully!');
  }

  showAlert(message: string) {
    this.snackBar.open(message, 'إغلاق', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: ['custom-snackbar-center']
    });
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
    if (this.carForm.invalid) {
      this.carForm.markAllAsTouched(); // يظهر الأخطاء
      return;
    }
    console.log('Submitted:', this.carForm.value);

  }

  // دالة لحذف الصورة بناءً على الـ index
  deleteImage(index: number) {
    this.images.splice(index, 1);  // حذف الصورة من المصفوفة
  }

  trackByIndex(index: number, item: any) {
    return index;  // تعيين الـ index كـ key لتتبع العنصر بشكل صحيح
  }
}