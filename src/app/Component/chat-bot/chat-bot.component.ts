import { CommonModule } from '@angular/common';
import { AfterViewChecked, AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { gsap } from 'gsap';
import { ChatbotService } from '../../Services/chatbot/chatbot.service';

@Component({
  selector: 'app-chat-bot',
  imports: [FormsModule, CommonModule],
  templateUrl: './chat-bot.component.html',
  styleUrl: './chat-bot.component.css'
})
export class ChatBotComponent implements OnInit, AfterViewInit  {
  chatbotFeeling: string = '';
  message: string = '';
  userInput: string = '';
  userMessages: string[] = [];
  chatbotResponses: string[] = [];
  loadingIndex: number | null = null;
  chatHistory: { user: string; bot: string | null }[] = [];
  backgroundLetters: string[] = [];
  @ViewChild('chatContainer', { static: false }) chatContainer!: ElementRef;
  feelings: string[] = ['Happy 😊', 'Excited 🤩', 'Curious 🤔', 'Relaxed 😌', 'Energetic ⚡'];

  constructor(private chatservices: ChatbotService , private cdr : ChangeDetectorRef) {}

  ngOnInit() {
    this.setChatbotFeeling();
    this.setGreetingMessage();
    this.generateBackgroundLetters();
  }

  ngAfterViewInit() {
    this.animateBackground();
    this.animateChatbotEntry();
    this.scrollToBottom();
  }

  setChatbotFeeling() {
    const randomIndex = Math.floor(Math.random() * this.feelings.length);
    this.chatbotFeeling = this.feelings[randomIndex];
  }

  setGreetingMessage() {
    const hours = new Date().getHours();
    if (hours < 12) {
      this.message = 'Hey, Good Morning! 🌞 How can I assist you today?';
    } else if (hours < 18) {
      this.message = 'Hey, Good Afternoon! ☀️ How can I assist you today?';
    } else {
      this.message = 'Hey, Good Night! 🌙 How can I assist you today?';
    }
  }

  sendMessage() {
    if (!this.userInput.trim()) return;

    this.chatHistory.push({ user: this.userInput, bot: null });
    const messageIndex = this.chatHistory.length - 1;

    this.scrollToBottom();

    this.loadingIndex = messageIndex;
    const userMessage = this.userInput;
    this.userInput = '';

    this.chatservices.sendMessage(userMessage).subscribe({
        next: (response) => {
            this.loadingIndex = null;
            this.chatHistory[messageIndex].bot = ''; 

            const fullText = response.reply;
            let i = 0;
            const typingSpeed = 50;

            const typingInterval = setInterval(() => {
                if (i < fullText.length) {
                    this.chatHistory[messageIndex].bot += fullText.charAt(i);
                    i++;
                    this.cdr.detectChanges();
                    this.scrollToBottom();
                } else {
                    clearInterval(typingInterval);
                    setTimeout(() => this.scrollToBottom(), 100);
                }
            }, typingSpeed);
        },
        error: () => {
            this.loadingIndex = null;
            this.chatHistory[messageIndex].bot = 'Sorry, I couldn\'t process that.';
            this.scrollToBottom();
        }
    });
}

scrollToBottom() {
    setTimeout(() => {
        if (this.chatContainer && this.chatContainer.nativeElement) {
            console.log("Scrolling to bottom..."); // لفحص التمرير في الكونسول
            requestAnimationFrame(() => {
                this.chatContainer.nativeElement.scrollTop = this.chatContainer.nativeElement.scrollHeight;
            });
        } else {
            console.warn("chatContainer not found!");
        }
    }, 100);
}

  generateBackgroundLetters() {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (let i = 0; i < 5000; i++) {
      const randomLetter = letters[Math.floor(Math.random() * letters.length)];
      this.backgroundLetters.push(randomLetter);
    }
  }

  animateBackground() {
    const letters = document.querySelectorAll('.background-letters span');
    letters.forEach(letter => {
      gsap.set(letter, {
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        fontSize: `${Math.random() * 15 + 5}px`,
        opacity: Math.random() * 0.6 + 0.2,
        color: '#f5f5f5',
        rotation: Math.random() * 360
      });

      const tl = gsap.timeline({ repeat: -1, yoyo: true });

      tl.to(letter, {
        x: `+=${Math.random() * 500 - 250}`,
        y: `+=${Math.random() * 500 - 250}`,
        rotation: `+=${Math.random() * 360 - 180}`,
        scale: Math.random() * 0.7 + 0.5,
        opacity: `random(0.3, 0.9)`,
        duration: Math.random() * 6 + 3,
        ease: 'sine.inOut'
      });

      tl.to(letter, {
        x: `+=${Math.random() * 600 - 300}`,
        y: `+=${Math.random() * 600 - 300}`,
        rotation: `+=${Math.random() * 360 - 180}`,
        scale: Math.random() * 0.7 + 0.5,
        opacity: `random(0.3, 0.9)`,
        duration: Math.random() * 6 + 3,
        ease: 'sine.inOut'
      });
    });
  }

  animateChatbotEntry() {
    gsap.from('.chatbot-avatar img', {
      y: -50,
      opacity: 0,
      duration: 1,
      ease: 'bounce.out'
    });

    gsap.from('.chatbot-message-container', {
      x: -50,
      opacity: 0,
      duration: 1,
      delay: 0.5,
      ease: 'power3.out'
    });

    gsap.from('.chatbot-input-container', {
      y: 50,
      opacity: 0,
      duration: 1,
      delay: 1,
      ease: 'power3.out'
    });
  }
}
