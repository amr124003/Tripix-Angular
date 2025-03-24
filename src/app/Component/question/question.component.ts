import { Component, ElementRef, ViewChild } from '@angular/core';
import { VariabletransferService } from '../../Services/VariableTransfer/variabletransfer.service';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-question',
  imports: [FormsModule,CommonModule,ReactiveFormsModule,RouterLinkActive,RouterLink],
  templateUrl: './question.component.html',
  styleUrl: './question.component.css'
})
export class QuestionComponent {
  inputValue : string = '';

  userForm: FormGroup;
  driverForm: FormGroup;

  get name() {
    return this.userForm.get('name');
  }

  get firstname() {
    return this.driverForm.get('firstname');
  }

  get lastname() {
    return this.driverForm.get('lastname');
  }
  constructor(private variabletransfer : VariabletransferService ,private router : Router)
  {
    this.userForm = new FormGroup({
      name: new FormControl('', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(10),
        Validators.pattern(/^[A-Za-z\s]+$/) // يسمح بالحروف الإنجليزية فقط مع المسافات
      ]),
    });


    this.driverForm = new FormGroup({
      firstname: new FormControl('', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(10),
        Validators.pattern(/^[A-Za-z\s]+$/) // يسمح بالحروف الإنجليزية فقط مع المسافات
      ]),
      lastname: new FormControl('', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(10),
        Validators.pattern(/^[A-Za-z\s]+$/) // يسمح بالحروف الإنجليزية فقط مع المسافات
      ]),
    });
  }
  checkeditem : boolean = false
  checkValue(event: any) {
    this.checkeditem = event.target.checked;
    console.log(this.checkeditem);
  }

  disableuserLabelClick(event: Event) {
    if (!this.checkeditem) {
      event.preventDefault(); // يمنع تفعيل الـ checkbox عند الضغط على الـ label
      console.log("Label click is disabled!");
    }
  }

  disablestaffLabelClick(event: Event) {
    if (this.checkeditem) {
      event.preventDefault(); // يمنع تفعيل الـ checkbox عند الضغط على الـ label
      console.log("Label click is disabled!");
    }
  }

  onNameChange(event: Event) {
    this.inputValue = (event.target as HTMLInputElement).value;
    this.variabletransfer.updateName(this.inputValue); 
  }

  Navigatetopage(){
    this.router.navigateByUrl('/Home');
  }
}
