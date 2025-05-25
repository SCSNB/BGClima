import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'BGClima';
  
  // Mock products data
  products = [
    {
      id: 1,
      name: 'Соларен панел NIPPON 300W',
      price: 1200,
      description: 'Висококачествен соларен панел с ефективност 22%',
      image: 'assets/solar-panel-placeholder.jpg',
      freeInstallation: true
    },
    {
      id: 2,
      name: 'Соларен панел NIPPON 400W',
      price: 1450,
      description: 'Висококачествен соларен панел с ефективност 24%',
      image: 'assets/solar-panel-placeholder.jpg',
      freeInstallation: true
    },
    {
      id: 3,
      name: 'Соларен панел NIPPON 500W',
      price: 1800,
      description: 'Висококачествен соларен панел с ефективност 26%',
      image: 'assets/solar-panel-placeholder.jpg',
      freeInstallation: true
    },
    {
      id: 4,
      name: 'Соларен панел NIPPON 600W',
      price: 2100,
      description: 'Висококачествен соларен панел с ефективност 28%',
      image: 'assets/solar-panel-placeholder.jpg',
      freeInstallation: false
    },
    {
      id: 5,
      name: 'Соларен панел NIPPON 700W',
      price: 2500,
      description: 'Висококачествен соларен панел с ефективност 30%',
      image: 'assets/solar-panel-placeholder.jpg',
      freeInstallation: false
    },
    {
      id: 6,
      name: 'Соларен панел NIPPON 800W',
      price: 2900,
      description: 'Висококачествен соларен панел с ефективност 32%',
      image: 'assets/solar-panel-placeholder.jpg',
      freeInstallation: false
    }
  ];
}
