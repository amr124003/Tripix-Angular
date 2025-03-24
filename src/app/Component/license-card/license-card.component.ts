import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Router } from "@angular/router";
import Tesseract from 'tesseract.js';

@Component({
  selector: 'app-license-card',
  imports: [FormsModule,CommonModule],
  templateUrl: './license-card.component.html',
  styleUrl: './license-card.component.css'
})
export class LicenseCardComponent{

  selectedFile: File | null = null;
  previewUrl: string | ArrayBuffer | null = '../../../assets/images/Driver_License_Egypt_V1 (1).png'
  isDragging = false;
  extractedData: string = '';
  isProcessing: boolean = false;

  constructor(private router : Router)
  {

  }

  onFileDropped(event: DragEvent) {
    event.preventDefault();
    this.isDragging = false;
    if (event.dataTransfer && event.dataTransfer.files.length > 0) {
      this.processFile(event.dataTransfer.files[0]);
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragging = true;
  }

  onDragLeave() {
    this.isDragging = false;
  }

  onFileSelected(event: any) {
    if (event.target.files.length > 0) {
      this.processFile(event.target.files[0]);
      this.previewUrl = event.target.value;
    }
  }

  processFile(file: File) {
    if (!file.type.startsWith("image/")) {
      console.error("❌ الملف ليس صورة!");
      return;
    }
  
    this.selectedFile = file;
    const reader = new FileReader();
  
    reader.onload = (event) => {
      this.previewUrl = event.target?.result as string;
      console.log("✅ Preview URL:", this.previewUrl);
    };
  
    reader.onerror = (error) => {
      console.error("❌ Error reading file:", error);
    };
  
    reader.readAsDataURL(file); // قراءة الصورة وتحويلها إلى Base64
    this.extractText(file);
  }

  extractText(file: File) {
    this.isProcessing = true;
    Tesseract.recognize(
      file,
      'eng+ara', // دعم اللغتين الإنجليزية والعربية
      {
        logger: (m) => console.log(m) // لعرض تقدم التحليل في الكونسول
      }
    ).then(({ data: { text } }) => {
      this.extractedData = text;
      this.isProcessing = false;
    }).catch(error => {
      console.error('Error during OCR processing:', error);
      this.isProcessing = false;
    });
  }

  confirm()
  {
    this.router.navigateByUrl('/DriverPage');
  }
}
