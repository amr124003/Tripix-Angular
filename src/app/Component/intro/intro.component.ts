import { Component, HostListener, OnInit } from '@angular/core';
import { QuestionComponent } from '../question/question.component';

@Component({
  selector: 'app-intro',
  imports: [QuestionComponent],
  templateUrl: './intro.component.html',
  styleUrl: './intro.component.css'
})
export class IntroComponent  {
  
}
