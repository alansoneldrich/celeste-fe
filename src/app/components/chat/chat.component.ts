import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewChecked,
  ChangeDetectorRef,
  NgZone
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { VoiceRecognitionService } from '../../services/voice-recognition.service';
import { SmartTimestampPipe } from '../../pipes/smart-timestamp.pipe';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, SmartTimestampPipe],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements AfterViewChecked {
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;
  @ViewChild('fileInput') fileInputRef!: ElementRef<HTMLInputElement>;
  @ViewChild('videoElement') videoElement!: ElementRef<HTMLVideoElement>;

  cameraOpen = false;
  mediaRecorder!: MediaRecorder;
  recordedChunks: Blob[] = [];
  isRecording = false; 
  showScrollToBottom = false;
  userInput = '';
  isLoading = false;
  isListening = false;

  messages: {
    sender: 'you' | 'celeste';
    text: string;
    timestamp: Date;
    attachment?: { type: 'photo' | 'video' | 'file'; data: string; fileName?: string } | null;
  }[] = [];

  attachment: { type: 'photo' | 'video' | 'file'; data: string; fileName?: string } | null = null;

  threadId: string;

  private timer!: ReturnType<typeof setInterval>;

  constructor(
    private apiService: ApiService,
    public voice: VoiceRecognitionService,
    private cdRef: ChangeDetectorRef,
    private route: ActivatedRoute
  ) {
    this.voice.onFinalTranscript.subscribe((finalText) => {
      this.sendMessage(finalText);
      this.isListening = false;
    });

    this.threadId = this.route.snapshot.paramMap.get('threadId') || '';
  }

  ngOnInit(): void {
    this.route.paramMap
      .subscribe(params => {
        this.threadId = params.get('threadId') || '';
        this.recallConversationThread();
        this.isListening = false;
      });
  
    // If you had any one-time setup (e.g. your change-detector timer), keep it here:
    this.timer = setInterval(() => this.cdRef.markForCheck(), 30_000);
  }

  ngOnDestroy(): void {
    clearInterval(this.timer);
  }

  ngAfterViewChecked(): void {
    this.scrollToBottomIfNearEnd();
  }

  recallConversationThread(): void {

    // Temporary codes
    console.log(this.threadId, "asdfasdfasfafasdfasdfasdfasdfsadfasf")
    let userId = 'Jean';

    this.apiService.getConversationThread(userId, this.threadId).subscribe({
      next: (res) => {
        console.log(res)
        this.messages = res || [];
        this.scrollToBottom(true); // Scroll to bottom after loading messages
      },
      error: () => {
        this.messages = [];        
      }
    });
  }


  sendMessage(text?: string): void {
    const message = (text ?? this.userInput).trim();
    if (!message && !this.attachment) return;
  
    // Push user message immediately before upload
    this.messages.push({
      sender: 'you',
      text: message,
      timestamp: new Date(),
      attachment: this.attachment ? { ...this.attachment } : null
    });
  
    this.isLoading = true;
  
    const formData = new FormData();
  
    if (this.attachment?.type === 'photo' && this.attachment.data) {
      const base64 = this.attachment.data.split(',')[1];
      const blob = this.base64ToBlob(base64, 'image/png');
      formData.append('photo', blob, 'photo.png');
    } else if (this.attachment?.type === 'video' && this.attachment.data) {
      const base64 = this.attachment.data.split(',')[1];
      const blob = this.base64ToBlob(base64, 'video/mp4');
      formData.append('video', blob, 'video.mp4');
    } else if (this.attachment?.type === 'file' && this.attachment.data) {
      const base64 = this.attachment.data.split(',')[1];
      const blob = this.base64ToBlob(base64, 'application/octet-stream');
      formData.append('file', blob, this.attachment.fileName || 'file');
    }
  
    this.removeAttachment();
    formData.append('message', message);
  
    this.apiService.uploadFile(formData).subscribe({
      next: (res) => {
        const lastMessage = this.messages[this.messages.length - 1];
        if (res.url) {
          lastMessage.text = `<a href="${res.url}" target="_blank">${res.fileName || 'View Attachment'}</a>`;
          if (lastMessage.attachment) {
            lastMessage.attachment.data = res.url;
          }
        }
        this.userInput = '';
        this.isLoading = false;
      },
      error: () => {
        this.messages.push({
          sender: 'celeste',
          text: '⚠️ Failed to send the message or attachment.',
          timestamp: new Date()
        });
        this.isLoading = false;
      }
    });
  }
  

  // Scroll Logic
  scrollToBottom(force = false): void {
    const el = this.messagesContainer?.nativeElement;
    if (el && (force || this.isNearBottom(el))) {
      el.scrollTop = el.scrollHeight;
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
    return el.scrollHeight - el.scrollTop - el.clientHeight < 120;
  }

  onScroll(): void {
    const el = this.messagesContainer?.nativeElement;
    if (el) this.showScrollToBottom = !this.isNearBottom(el);
  }

  onClickScrollToBottom(): void {
    this.scrollToBottom(true);
  }

  // Voice
  startListening(): void {
    this.voice.start();
    this.isListening = true;
  }

  stopListening(): void {
    this.voice.stop();
    this.isListening = false;
  }

  // File Upload
  triggerFileUpload(): void {
    this.fileInputRef.nativeElement.click();
  }

  onFileSelected(event: Event): void {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    if (!file) return;
  
    const reader = new FileReader();
    reader.onload = () => {
      const fileData = reader.result as string;
  
      // Determine the file type and set the attachment
      if (file.type.startsWith('image/')) {
        this.attachment = { type: 'photo', data: fileData, fileName: file.name };
      } else if (file.type.startsWith('video/')) {
        this.attachment = { type: 'video', data: fileData, fileName: file.name };
      } else {
        this.attachment = { type: 'file', data: fileData, fileName: file.name };
      }
    };
  
    reader.readAsDataURL(file); // Read the file as a data URL for preview
  }

  // Open the camera
  openCamera(): void {
    this.cameraOpen = true;
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((stream) => {
        const video = this.videoElement.nativeElement;
        video.srcObject = stream;
        video.play();
      })
      .catch((err) => {
        console.error('Error accessing camera:', err);
        this.cameraOpen = false;
      });
  }

  // Close the camera
  closeCamera(): void {
    this.cameraOpen = false;
    this.isRecording = false; // Reset recording state
    const video = this.videoElement.nativeElement;
    const stream = video.srcObject as MediaStream;
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    video.srcObject = null;
  }

  capturePhoto(): void {
    const video = this.videoElement.nativeElement;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    if (context) {
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const photo = canvas.toDataURL('image/png');
      this.attachment = { type: 'photo', data: photo };
      this.closeCamera();
    } else {
      console.error('Failed to get 2D context from canvas');
    }
  }

  removeAttachment(): void {
    this.attachment = null;
  }

  base64ToBlob(base64: string, mimeType: string): Blob {
    try {
      // Validate and clean the Base64 string
      const cleanedBase64 = base64.replace(/^data:[a-zA-Z0-9/+.-]+;base64,/, ''); // Remove data URL prefix
      const byteCharacters = atob(cleanedBase64); // Decode Base64 string
      const byteNumbers = Array.from(byteCharacters, (char) => char.charCodeAt(0));
      const byteArray = new Uint8Array(byteNumbers);
      return new Blob([byteArray], { type: mimeType });
    } catch (error) {
      console.error('Error decoding Base64 string:', error);
      throw new Error('Invalid Base64 string');
    }
  }

  // Start video recording
  startRecording(): void {
    const stream = this.videoElement.nativeElement.srcObject as MediaStream;
    if (!stream) return;

    this.recordedChunks = [];
    this.mediaRecorder = new MediaRecorder(stream);

    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        this.recordedChunks.push(event.data);
      }
    };

    this.mediaRecorder.onstop = () => {
      const videoBlob = new Blob(this.recordedChunks, { type: 'video/mp4' });
      const videoUrl = URL.createObjectURL(videoBlob);
      this.attachment = { type: 'video', data: videoUrl };
      this.closeCamera();
    };

    this.isRecording = true; // Set recording state to true
    this.mediaRecorder.start();
  }

  // Stop video recording
  stopRecording(): void {
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
    }
    this.isRecording = false; // Set recording state to false
  }
}