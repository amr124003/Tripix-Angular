import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import gsap from 'gsap';

@Component({
  selector: 'app-addcar-phohtos',
  imports: [FormsModule,CommonModule],
  templateUrl: './addcar-phohtos.component.html',
  styleUrl: './addcar-phohtos.component.css'
})
export class AddcarPhohtosComponent  {
  @ViewChild('fileInput') fileInput!: ElementRef;
  images: { url: string; name: string; size: number }[] = [];
  loading = false;
  isDragging = false;

  onFileSelect(event: any) {
    const files = event.target.files;
    this.handleFiles(files);
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragging = true;
    gsap.to(".upload-container", { scale: 1.1, borderColor: "#00aaff", duration: 0.3 });
  }

  onDragLeave() {
    this.isDragging = false;
    gsap.to(".upload-container", { scale: 1, borderColor: "#ffffff80", duration: 0.3 });
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragging = false;
    gsap.to(".upload-container", { scale: 1, borderColor: "#ffffff80", duration: 0.3 });

    if (event.dataTransfer) {
      const files = event.dataTransfer.files;
      this.handleFiles(files);
    }
  }

  handleFiles(files: FileList) {
    this.loading = true;
    
    setTimeout(() => {
      Array.from(files).forEach((file, index) => {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.images.push({
            url: e.target.result,
            name: file.name,
            size: Math.round(file.size / 1024),
          });

          setTimeout(() => {
            gsap.fromTo(
              `.image-item:nth-child(${this.images.length})`, 
              { opacity: 0, y: -20 },
              { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }
            );
          }, index * 100);
        };
        reader.readAsDataURL(file);
      });

      this.loading = false;
    }, 1500);
  }

  removeImage(index: number) {
    gsap.to(`.image-item:nth-child(${index + 1})`, {
      opacity: 0,
      x: -50,
      duration: 0.5,
      ease: "power2.in",
      onComplete: () => {
        this.images.splice(index, 1);
      }
    });
  }

  submitImages() {
    console.log('Sending images to API...', this.images);
    alert('Images submitted successfully!');
  }
}