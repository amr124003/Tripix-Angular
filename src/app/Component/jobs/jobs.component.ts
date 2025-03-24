import { Component, OnInit } from '@angular/core';
declare var M: any;


@Component({
  selector: 'app-jobs',
  imports: [],
  templateUrl: './jobs.component.html',
  styleUrl: './jobs.component.css'
})
export class JobsComponent implements OnInit{
  currentYear: number = new Date().getFullYear();

  ngOnInit() {
    setTimeout(() => {
      M.AutoInit(); // لتفعيل الـ Modals, Dropdowns وغيرها
    }, 0);
  }
}
