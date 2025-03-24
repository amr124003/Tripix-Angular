import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { trigger, state, style, transition, animate } from '@angular/animations';


@Component({
  selector: 'app-faq',
  imports: [CommonModule,FormsModule],
  templateUrl: './faq.component.html',
  styleUrl: './faq.component.css',
  animations: [
    trigger('expandCollapse', [
      state('collapsed', style({ height: '0px', opacity: 0, overflow: 'hidden' })),
      state('expanded', style({ height: '*', opacity: 1 })),
      transition('collapsed <=> expanded', [
        animate('400ms ease-in-out')
      ])
    ])
  ]
})
export class FAQComponent {
  
  faqs = [
    { question: "Why shouldn't we trust atoms?", answer: "They make up everything", isActive: false },
    { question: "What do you call someone with no body and no nose?", answer: "Nobody knows.", isActive: false },
    { question: "What's the object-oriented way to become wealthy?", answer: "Inheritance.", isActive: false },
    { question: "How many tickles does it take to tickle an octopus?", answer: "Ten-tickles!", isActive: false },
    { question: "What is: 1 + 1?", answer: "Depends on who are you asking.", isActive: false }
  ];

  toggleFaq(faq: any) {
    faq.isActive = !faq.isActive;
  }
}
