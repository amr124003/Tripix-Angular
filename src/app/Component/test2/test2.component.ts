import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { FormsModule } from "@angular/forms";
import Tesseract from 'tesseract.js';


@Component({
  selector: 'app-test2',
  imports: [FormsModule,CommonModule],
  templateUrl: './test2.component.html',
  styleUrl: './test2.component.css'
})
export class Test2Component  {
   selectedFile: File | null = null;
  previewUrl: string | ArrayBuffer | null = null;
  isDragging = false;
  extractedData: string = '';
  isProcessing: boolean = false;

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
    }
  }

  processFile(file: File) {
    if (file.type.startsWith('image/')) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = (e) => this.previewUrl = reader.result;
      reader.readAsDataURL(file);
      this.extractText(file);
    }
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
}
