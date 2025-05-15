import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {NavComponent} from './nav/navbar.component';

@Component({
  selector: 'app-root',
  standalone: true,   // ❗ GANZ WICHTIG
  imports: [RouterOutlet, NavComponent],  // ❗ GANZ WICHTIG
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {}
