/**
 * Feature switches. Hidden features keep all their code; flip the flag to bring them back.
 *
 * AI_VOICES_ENABLED: the "أصوات AI" product (library tab, home section, header link, home switcher tab).
 * Hidden on 2026-10-28 until launch. Code kept in: src/components/AIVoicesSection.tsx,
 * the AI tab in src/components/VoiceLibraryView.tsx, src/data/aiVoicesCatalog.ts.
 * The TTS studio (أستوديو TTS) is a separate product and stays visible.
 */
export const AI_VOICES_ENABLED = false;
