import { AssistantAnalyticsEventName } from '../components/ai-assistant/types';

export interface AnalyticsPayload {
  eventName: AssistantAnalyticsEventName;
  timestamp: string;
  properties?: Record<string, any>;
}

type AnalyticsListener = (payload: AnalyticsPayload) => void;

class AnalyticsService {
  private listeners: AnalyticsListener[] = [];

  public track(eventName: AssistantAnalyticsEventName, properties?: Record<string, any>) {
    const payload: AnalyticsPayload = {
      eventName,
      timestamp: new Date().toISOString(),
      properties
    };

    if (import.meta.env.DEV) {
      console.log(`[Qeema AI Analytics]: ${eventName}`, properties || '');
    }

    this.listeners.forEach(fn => {
      try {
        fn(payload);
      } catch (err) {
        console.error('[Analytics error]:', err);
      }
    });

    // Optional dispatch to window event
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('qeema_assistant_analytics', { detail: payload }));
    }
  }

  public subscribe(listener: AnalyticsListener): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }
}

export const analytics = new AnalyticsService();
