import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ApiService } from './services/api.service';
import { HistoryDrawerComponent } from "./components/history-drawer/history-drawer.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HistoryDrawerComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'celeste-fe';
  memory: { sender: string, text: string, timestamp?: string }[] = [];

  constructor(private apiService: ApiService) {}
  
  ngOnInit(): void {
    throw new Error('Method not implemented.');
  }
  
}
