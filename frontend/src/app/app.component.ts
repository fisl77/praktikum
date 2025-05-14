import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,   // ❗ GANZ WICHTIG
  imports: [RouterOutlet],  // ❗ GANZ WICHTIG
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {}
