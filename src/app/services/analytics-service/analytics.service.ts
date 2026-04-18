import { Injectable } from '@angular/core';

interface GtagEventParams {
  event_category?: string;
  event_label?: string;
  value?: string;
  [key: string]: unknown;
}

type GtagCommand = (command: 'event', eventName: string, params: GtagEventParams) => void;

declare var gtag: GtagCommand;

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {

  constructor() { }

  trackEvent(eventName: string, eventDetails: string, eventCategory: string) {
    if (typeof gtag === 'undefined') return;
    gtag('event', eventName, {
    // event Type - example: 'SCROLL_TO_TOP_CLICKED'
    'event_category': eventCategory,
    // the label that will show up in the dashboard as the events name
    'event_label': eventName,
    // a short description of what happened
    'value': eventDetails
    })
  }
}
