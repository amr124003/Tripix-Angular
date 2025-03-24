import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Router } from "@angular/router";
import Tesseract from 'tesseract.js';

@Component({
  selector: 'app-car-license',
  imports: [FormsModule,CommonModule],
  templateUrl: './car-license.component.html',
  styleUrl: './car-license.component.css'
})
export class CarLicenseComponent {
selectedFile: File | null = null;
  previewUrl1: string | ArrayBuffer | null = "";
  previewUrl2: string | ArrayBuffer | null = "";
  isDragging1 = false;
  isDragging2 = false;
  extractedData1: string = '';
  extractedData2: string = '';
  isProcessing1: boolean = false;
  isProcessing2: boolean = false;

  constructor(private router : Router)
  {

  }

  onFileDropped1(event: DragEvent) {
    event.preventDefault();
    this.isDragging1 = false;
    if (event.dataTransfer && event.dataTransfer.files.length > 0) {
      this.processFile1(event.dataTransfer.files[0]);
    }
  }

  onFileDropped2(event: DragEvent) {
    event.preventDefault();
    this.isDragging2 = false;
    if (event.dataTransfer && event.dataTransfer.files.length > 0) {
      this.processFile2(event.dataTransfer.files[0]);
    }
  }

  onDragOver1(event: DragEvent) {
    event.preventDefault();
    this.isDragging1 = true;
  }

  onDragOver2(event: DragEvent) {
    event.preventDefault();
    this.isDragging2 = true;
  }

  onDragLeave1() {
    this.isDragging1 = false;
  }

  onDragLeave2() {
    this.isDragging2 = false;
  }

  onFileSelected1(event: any) {
    if (event.target.files.length > 0) {
      this.processFile1(event.target.files[0]);
    }
  }

  onFileSelected2(event: any) {
    if (event.target.files.length > 0) {
      this.processFile2(event.target.files[0]);
    }
  }

  processFile1(file: File) {
    if (!file.type.startsWith("image/")) {
      console.error("❌ الملف ليس صورة!");
      return;
    }
  
    this.selectedFile = file;
    const reader = new FileReader();
  
    reader.onload = (event) => {
      this.previewUrl1 = event.target?.result as string;
      console.log("✅ Preview URL:", this.previewUrl1);
    };
  
    reader.onerror = (error) => {
      console.error("❌ Error reading file:", error);
    };
  
    reader.readAsDataURL(file); // قراءة الصورة وتحويلها إلى Base64
    this.extractText1(file);
  }

  processFile2(file: File) {
    if (!file.type.startsWith("image/")) {
      console.error("❌ الملف ليس صورة!");
      return;
    }
  
    this.selectedFile = file;
    const reader = new FileReader();
  
    reader.onload = (event) => {
      this.previewUrl2 = event.target?.result as string;
      console.log("✅ Preview URL:", this.previewUrl2);
    };
  
    reader.onerror = (error) => {
      console.error("❌ Error reading file:", error);
    };
  
    reader.readAsDataURL(file); // قراءة الصورة وتحويلها إلى Base64
    this.extractText2(file);
  }

  extractText1(file: File) {
    this.isProcessing1 = true;
    Tesseract.recognize(
      file,
      'eng+ara', // دعم اللغتين الإنجليزية والعربية
      {
        logger: (m) => console.log(m) // لعرض تقدم التحليل في الكونسول
      }
    ).then(({ data: { text } }) => {
      this.extractedData1 = text;
      this.isProcessing1 = false;
    }).catch(error => {
      console.error('Error during OCR processing:', error);
      this.isProcessing1 = false;
    });
  }

  extractText2(file: File) {
    this.isProcessing2 = true;
    Tesseract.recognize(
      file,
      'eng+ara', // دعم اللغتين الإنجليزية والعربية
      {
        logger: (m) => console.log(m) // لعرض تقدم التحليل في الكونسول
      }
    ).then(({ data: { text } }) => {
      this.extractedData2 = text;
      this.isProcessing2 = false;
    }).catch(error => {
      console.error('Error during OCR processing:', error);
      this.isProcessing2 = false;
    });
  }
  confirm()
  {
    this.router.navigateByUrl('/DriverPage');
  }
}

