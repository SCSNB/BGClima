import { Injectable } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { environment } from '../../environments/environment';

declare global {
  interface Window {
    gtag: (command: string, ...args: any[]) => void;
  }
}

@Injectable({
  providedIn: 'root'
})
export class GoogleAnalyticsService {
  private readonly adsTrackingId = environment.googleAdsId;
  private readonly conversionLabels = environment.googleAdsConversionLabels;

  constructor(private router: Router) {
    this.trackPageViews();
  }

  private trackPageViews(): void {
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.trackPageView(event.urlAfterRedirects);
    });
  }

  trackPageView(path: string): void {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'page_view', {
        page_path: path
      });
    }
  }

  trackSearch(searchTerm: string): void {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'search', {
        search_term: searchTerm
      });
    }
  }

  trackProductView(product: {
    id: string;
    name: string;
    price?: number;
    category?: string;
  }): void {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'view_item', {
        items: [
          {
            item_id: product.id,
            item_name: product.name,
            price: product.price,
            item_category: product.category
          }
        ]
      });
    }
  }

  trackCompareProducts(productIds: string[]): void {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'select_item', {
        item_list_name: 'compare',
        items: productIds.map((id) => ({ item_id: id }))
      });
    }
  }

  trackFilterProducts(filterCategory: string, filterValue: string): void {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'view_search_results', {
        search_term: `${filterCategory}:${filterValue}`
      });
    }
  }

  trackConversion(conversionLabel: string, value?: number, currency?: string, transactionId?: string): void {
    if (typeof window !== 'undefined' && window.gtag) {
      if (!conversionLabel || conversionLabel.trim() === '') {
        return;
      }

      const conversionData: any = {
        'send_to': `${this.adsTrackingId}/${conversionLabel}`
      };

      if (value !== undefined) {
        conversionData.value = value;
      }

      if (currency) {
        conversionData.currency = currency;
      }

      if (transactionId) {
        conversionData.transaction_id = transactionId;
      }

      window.gtag('event', 'conversion', conversionData);
    }
  }

  trackAdsPhoneCall(value?: number, currency: string = 'BGN'): void {
    this.trackConversion(this.conversionLabels.phoneCall, value, currency);
  }

  trackAdsLead(value?: number, currency: string = 'BGN'): void {
    this.trackConversion(this.conversionLabels.lead, value, currency);
  }

  trackAdsQuoteRequest(value?: number, currency: string = 'BGN'): void {
    this.trackConversion(this.conversionLabels.quoteRequest, value, currency);
  }

  trackContactFormSubmit(formType: string = 'contact'): void {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'generate_lead', {
        form_type: formType
      });
    }
  }

  trackPhoneCallClick(phoneNumber: string): void {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'phone_click', {
        phone_number: phoneNumber,
        engagement_type: 'call'
      });
    }
  }
}
