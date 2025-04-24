import { Injectable, NgZone, EventEmitter } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class VoiceRecognitionService {
  recognition: any;
  isListening = false;
  transcript = '';
  onFinalTranscript: EventEmitter<string> = new EventEmitter();

  constructor(private zone: NgZone) {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    this.recognition = new SpeechRecognition();
    this.recognition.continuous = false;
    this.recognition.lang = 'en-US';
    this.recognition.interimResults = false;

    this.recognition.onresult = (event: any) => {
      const current = event.resultIndex;
      const transcript = event.results[current][0].transcript;
      this.zone.run(() => {
        this.transcript = transcript;
        this.onFinalTranscript.emit(transcript); // broadcast to component
      });
    };

    this.recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      this.stop();
    };
  }

  start() {
    this.transcript = '';
    this.recognition.start();
    this.isListening = true;
  }

  stop() {
    this.recognition.stop();
    this.isListening = false;
  }
}
