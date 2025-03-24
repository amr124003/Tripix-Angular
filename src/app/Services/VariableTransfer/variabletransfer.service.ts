import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VariabletransferService {

  private nameSource = new BehaviorSubject<string>(''); // قيمة افتراضية فاضية
  currentName = this.nameSource.asObservable(); // عشان نقدر نتابع التغييرات

  updateName(name: string) {
    this.nameSource.next(name); // تحديث القيمة وإرسالها لكل المشتركين
  }
}
