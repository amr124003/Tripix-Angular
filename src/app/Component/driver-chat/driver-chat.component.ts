import { CommonModule } from '@angular/common';
import { AfterViewChecked, AfterViewInit, ChangeDetectorRef, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { gsap } from 'gsap';
import { ChatbotService } from '../../Services/chatbot/chatbot.service';
import { ConnectDriverService } from '../../Services/ConnectDriver/connect-driver.service';
import { ChatServicesService } from '../../Services/Chat/chat-services.service';

@Component({
  selector: 'app-driver-chat',
  imports: [CommonModule, FormsModule],
  templateUrl: './driver-chat.component.html',
  styleUrl: './driver-chat.component.css'
})
export class DriverChatComponent implements OnInit, AfterViewInit {
  chatbotFeeling: string = '';
  message: string = '';
  userInput: string = '';
  userMessages: string[] = [];
  chatbotResponses: string[] = [];
  loadingIndex: number | null = null;
  messages: { sender: 'user' | 'driver', text: string }[] = [];
  backgroundLetters: string[] = [];
  @ViewChild('chatContainer', { static: false }) chatContainer!: ElementRef;
  feelings: string[] = ['Happy 😊', 'Excited 🤩', 'Curious 🤔', 'Relaxed 😌', 'Energetic ⚡'];
  @Input() userphonenumber: string = '';

  constructor(private chatservices: ChatServicesService, private cdr: ChangeDetectorRef, private connectdriverservice: ConnectDriverService) { }

  ngOnInit() {
    this.connectdriverservice.startConnection();
    this.setChatbotFeeling();
    this.setGreetingMessage();

    this.connectdriverservice.onNewMessage(async (DriverData: any) => {
      console.log('Received new Driver Message:', DriverData);

      this.messages.push({ sender: 'driver', text: DriverData.message });
      const messageIndex = this.message.length - 1;

      this.scrollToBottom();
      let i = 0;
      const typingSpeed = 50;
    });
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
      this.message = 'Hey, Good Morning! 🌞 You Can Chat With Me Here';
    } else if (hours < 18) {
      this.message = 'Hey, Good Afternoon! ☀️ You Can Chat With Me Here';
    } else {
      this.message = 'Hey, Good Night! 🌙 You Can Chat With Me Here';
    }
  }

  sendMessage() {
    if (!this.userInput.trim()) return;
    this.messages.push({ sender: 'user', text: this.userInput });
    const messageIndex = this.messages.length - 1;

    this.scrollToBottom();

    const userMessage = this.userInput;
    this.userInput = '';

    const UserData = {
      phoneNumber : this.userphonenumber,
      Message : userMessage
    }
    console.log(UserData);
    this.chatservices.DriverSendMSG(UserData).subscribe({
      next: (response) => {},
      error: () => {
        this.loadingIndex = null;
        this.messages[messageIndex].sender = 'user';
        this.messages[messageIndex].text = 'sorry';

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
