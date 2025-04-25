import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-history-drawer',
  imports: [CommonModule, RouterModule],
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
      }
    });
  }
}
