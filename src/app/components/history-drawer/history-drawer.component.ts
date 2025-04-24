import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-history-drawer',
  imports: [],
  templateUrl: './history-drawer.component.html',
  styleUrl: './history-drawer.component.css'
})
export class HistoryDrawerComponent implements OnInit{
memory: { sender: string, text: string, timestamp?: string }[] = [];

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.apiService.getMemory("Jean").subscribe({
      next: (res) => {
        console.log(res)
        this.memory = res || [];
      },
      error: () => {
        this.memory = [];
        this.memory = [
          {
            sender: 'you',
            text: 'Hey Celeste, are you online?',
            timestamp: '2025-04-24T08:00:00Z'
          },
          {
            sender: 'celeste',
            text: 'Hello, Alan. Celeste Core is listening.',
            timestamp: '2025-04-24T08:00:03Z'
          },
          {
            sender: 'you',
            text: 'I’m about to run diagnostics. Stand by.',
            timestamp: '2025-04-24T08:01:12Z'
          },
          {
            sender: 'celeste',
            text: 'Understood. Running passive scan while waiting.',
            timestamp: '2025-04-24T08:01:14Z'
          },
          {
            sender: 'you',
            text: 'Can you recall yesterday’s alignment log?',
            timestamp: '2025-04-24T08:02:01Z'
          },
          {
            sender: 'celeste',
            text: 'Pulse was stable. Alignment lock held for 98% of session.',
            timestamp: '2025-04-24T08:02:12Z'
          }
        ];
        
      }
    });
  }
}
