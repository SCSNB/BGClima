import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-ventilation-design',
  templateUrl: './ventilation-design.component.html',
  styleUrls: ['./ventilation-design.component.scss']
})
export class VentilationDesignComponent implements OnInit {
  constructor() { }

  ngOnInit(): void {
    window.scrollTo(0, 0);
  }
}
