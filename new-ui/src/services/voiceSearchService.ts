import { Voice } from '../types';
import { VoiceSearchParams } from '../components/ai-assistant/types';
import { api } from '../lib/api';

export class VoiceSearchService {
  private cachedVoices: Voice[] = [];

  public setVoicesCache(voices: Voice[]) {
    this.cachedVoices = voices;
  }

  public async searchVoices(params: VoiceSearchParams): Promise<Voice[]> {
    let list: Voice[] = [];

    if (this.cachedVoices.length > 0) {
      list = [...this.cachedVoices];
    } else {
      try {
        const res = await api.getVoices();
        list = res.voices || [];
        this.cachedVoices = list;
      } catch (err) {
        console.warn('[VoiceSearchService] Could not fetch voices from API, using fallback cache', err);
      }
    }

    // المرحلة الحالية تعرض الأصوات البشرية الحقيقية فقط.
    list = list.filter(v => v.isActive && v.type === 'human');

    // Filter by type: 'human' | 'ai' | 'all'
    if (params.type && params.type !== 'all' && params.type !== 'human') return [];

    // Filter by dialect
    if (params.dialect && params.dialect !== 'all') {
      list = list.filter(v => v.dialect === params.dialect);
    }

    // Filter by gender
    if (params.gender && params.gender !== 'all') {
      list = list.filter(v => v.gender === params.gender);
    }

    // Filter by useCase
    if (params.useCase && params.useCase !== 'all') {
      const qCase = params.useCase.toLowerCase();
      list = list.filter(v =>
        v.useCases.some(uc => uc.toLowerCase().includes(qCase)) ||
        v.style.toLowerCase().includes(qCase) ||
        v.styleLabel.toLowerCase().includes(qCase)
      );
    }

    // General query search (query across name, dialect, style, useCase, country, tone)
    if (params.query && params.query.trim()) {
      const q = params.query.trim().toLowerCase();
      list = list.filter(v => {
        const matchesName = v.name.toLowerCase().includes(q) || (v.nameEn && v.nameEn.toLowerCase().includes(q));
        const matchesDialect = v.dialect.toLowerCase().includes(q) || v.dialectLabel.toLowerCase().includes(q);
        const matchesStyle = v.style.toLowerCase().includes(q) || v.styleLabel.toLowerCase().includes(q);
        const matchesUseCases = v.useCases.some(uc => uc.toLowerCase().includes(q));
        return matchesName || matchesDialect || matchesStyle || matchesUseCases;
      });
    }

    return list.slice(0, 4);
  }

  public async getFeaturedVoices(limit: number = 3): Promise<Voice[]> {
    const all = await this.searchVoices({});
    const featured = all.filter(v => v.isFeatured);
    return featured.length > 0 ? featured.slice(0, limit) : all.slice(0, limit);
  }
}

export const voiceSearchService = new VoiceSearchService();
