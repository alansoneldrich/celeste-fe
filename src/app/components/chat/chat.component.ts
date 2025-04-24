import { Component, ElementRef, ViewChild, AfterViewChecked, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { VoiceRecognitionService } from '../../services/voice-recognition.service';
import { SmartTimestampPipe } from '../../pipes/smart-timestamp.pipe';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, SmartTimestampPipe],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements AfterViewChecked {
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;

  showScrollToBottom = false;
  userInput = '';
  isLoading = false;
  isListening = false;
  messages: { sender: 'you' | 'celeste'; text: string, timestamp: Date }[] = [];
  private timer!: ReturnType<typeof setInterval>;

  constructor(
    private apiService: ApiService,
    public voice: VoiceRecognitionService,
    private cdRef: ChangeDetectorRef,
  ) {
    this.voice.onFinalTranscript.subscribe((finalText) => {
      this.sendMessage(finalText); // ✅ Correctly closed
      this.isListening = false; // ✅ Optional: auto stop on speech end
    });
  }

  ngOnInit(): void {
    this.timer = setInterval(() => {
      this.cdRef.markForCheck();
    }, 30000);
  }
  
  ngOnDestroy(): void {
    clearInterval(this.timer);
  }

  ngAfterViewChecked() {
    this.scrollToBottomIfNearEnd();
  }

  scrollToBottom(force = false): void {
    const el = this.messagesContainer?.nativeElement;
    if (el && (force || this.isNearBottom(el))) {
      el.scrollTop = el.scrollHeight; // ← This will be smooth now!
      this.showScrollToBottom = false;
    }
  }

  scrollToBottomIfNearEnd(): void {
    const el = this.messagesContainer?.nativeElement;
    if (el) {
      this.showScrollToBottom = !this.isNearBottom(el);
    }
  }

  isNearBottom(el: HTMLElement): boolean {
    const threshold = 120; // px from bottom before showing button
    return el.scrollHeight - el.scrollTop - el.clientHeight < threshold;
  }

  onScroll(): void {
    const el = this.messagesContainer?.nativeElement;
    if (el) this.showScrollToBottom = !this.isNearBottom(el);
  }

  onClickScrollToBottom(): void {
    this.scrollToBottom(true);
  }

  sendMessage(text?: string) {
    const message = (text ?? this.userInput).trim();
    if (!message) return;

    this.messages.push({ sender: 'you', text: message, timestamp: new Date() });
    this.isLoading = true;

    this.apiService.reflect(this.userInput).subscribe({
      next: (res) => {
        this.messages.push({ sender: 'celeste', text: res.response, timestamp: new Date() });
        this.userInput = '';
        this.isLoading = false;
      },
      error: () => {
        this.messages.push({
          sender: 'celeste',
          text: '⚠️ Celeste is currently unreachable. Attempting to recalibrate...',
          timestamp: new Date()
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
