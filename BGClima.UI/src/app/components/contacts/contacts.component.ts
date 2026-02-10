import { Component } from '@angular/core';
import { GoogleAnalyticsService } from 'src/app/services/google-analytics.service';

@Component({
  selector: 'app-contacts',
  templateUrl: './contacts.component.html',
  styleUrls: ['./contacts.component.scss']
})
export class ContactsComponent {
  constructor(private analytics: GoogleAnalyticsService) {}

  onPhoneClick(phoneNumber: string): void {
    this.analytics.trackPhoneCallClick(phoneNumber);
    this.analytics.trackAdsPhoneCall();
  }
}
