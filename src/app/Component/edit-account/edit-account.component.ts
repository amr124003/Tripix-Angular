import { Component, ViewChild, ElementRef } from '@angular/core';

@Component({
  selector: 'app-edit-account',
  imports: [],
  templateUrl: './edit-account.component.html',
  styleUrl: './edit-account.component.css'
})
export class EditAccountComponent {

  @ViewChild('fileInput') fileInput!: ElementRef;
  imageSrc: string = 'assets/images/Avatar.jpg'; // صورة افتراضية

  triggerFileInput() {
    this.fileInput.nativeElement.click();
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const reader = new FileReader();

      reader.onload = (e: ProgressEvent<FileReader>) => {
        this.imageSrc = e.target?.result as string;
      };

      reader.readAsDataURL(file);
    }
  }
}
