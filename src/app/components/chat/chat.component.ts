import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { VoiceRecognitionService } from '../../services/voice-recognition.service';

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
  isListening = false;
  messages: { sender: 'you' | 'celeste'; text: string }[] = [];

  constructor(
    private apiService: ApiService,
    public voice: VoiceRecognitionService
  ) {
    this.voice.onFinalTranscript.subscribe((finalText) => {
      this.sendMessage(finalText); // ✅ Correctly closed
      this.isListening = false; // ✅ Optional: auto stop on speech end
    });
  }

  sendMessage(text?: string) {
    const message = (text ?? this.userInput).trim();
    if (!message) return;

    this.messages.push({ sender: 'you', text: message });
    this.isLoading = true;

    this.apiService.reflect(this.userInput).subscribe({
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

  startListening() {
    this.voice.start();
    this.isListening = true; 
  }

  stopListening() {
    this.voice.stop(); // The transcript will be sent from the EventEmitter
    this.isListening = false;
  }
}
