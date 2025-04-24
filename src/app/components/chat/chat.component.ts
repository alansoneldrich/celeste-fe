import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent {
  userInput = '';
  isLoading = false;
  messages: { sender: 'you' | 'celeste'; text: string }[] = [];

  constructor(private apiService: ApiService) {}

  sendMessage() {
    if (!this.userInput.trim()) return;

    this.messages.push({ sender: 'you', text: this.userInput });
    this.isLoading = true;

    this.apiService.interact('alan', this.userInput).subscribe({
      next: (res) => {
        this.messages.push({ sender: 'celeste', text: res.response });
        this.userInput = '';
        this.isLoading = false;
      },
      error: () => {
        this.messages.push({
          sender: 'celeste',
          text: '⚠️ Celeste is currently unreachable. Attempting to recalibrate...'
        });
        this.isLoading = false;
      }      
    });
  }
}
