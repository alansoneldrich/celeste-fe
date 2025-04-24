import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ApiService } from './services/api.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'celeste-fe';
  memory: { sender: string, text: string, timestamp?: string }[] = [];

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.apiService.getMemory().subscribe({
      next: (res) => {
        this.memory = res.messages || [];
      },
      error: () => {
        this.memory = [];
      }
    });
  }
}
