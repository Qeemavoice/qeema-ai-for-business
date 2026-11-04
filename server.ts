import dotenv from 'dotenv';
dotenv.config({ path: ['.env.local', '.env'], quiet: true });
import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { publicFormsRouter } from './server/routes/publicForms';
import { ttsVoicesRouter } from './server/routes/ttsVoices';
import { COMMERCIAL_SERVICES } from './src/data/commercialServicesData';
import { sitemapHandler, robotsHandler } from './server/routes/sitemap';
import { authRouter, requireUser, requireAdmin, ensureAdminAccount } from './server/routes/auth';
import { voicesRouter } from './server/routes/voices';
import { generationsRouter } from './server/routes/generations';
import { creditsRouter } from './server/routes/credits';
import { usageRouter } from './server/routes/usage';
import { billingRouter } from './server/routes/billing';
import { adminRouter } from './server/routes/admin';
import { clientRouter } from './server/routes/clientBookings';
import { collectionsRouter, publicPageTextsHandler, publicArticlesHandler, publicVoiceTemplatesHandler, publicStoriesHandler, publicPageHandler, publicGuidesHandler, publicHumanVoicesHandler, publicVoiceReviewsHandler, publicSiteListsHandler } from './server/routes/collections';
import { assistantRouter } from './server/routes/assistant';
import { narratorsRouter } from './server/routes/narrators';
import { db } from './server/db/store';
import { loadDb, saveDb } from './server/db/persist';
import { QeemaAcousticProvider } from './server/providers/QeemaAcousticProvider';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Security & Body parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Dashboard edits survive restarts: load the saved DB once, save after every write request
  loadDb();
  ensureAdminAccount();
  app.use('/api', (req, res, next) => { if (req.method !== 'GET') res.on('finish', saveDb); next(); });

  // CORS and Security headers (No API keys or secrets exposed)
  app.use((req: Request, res: Response, next: NextFunction) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-company-id, x-user-id');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  // Health check
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({
      status: 'ok',
      service: 'Qeema AI — Arabic Voice Platform for Business',
      version: '1.0.0-b2b-mvp',
      timestamp: new Date().toISOString()
    });
  });

  // Cloud / Secure Audio File Serving Endpoint (Signed/Safe Retrieval)
  app.get('/api/v1/storage/audio/:id', async (req: Request, res: Response) => {
    const fileId = req.params.id;
    let stored = db.audioFiles.get(fileId);

    // If not found in dynamic memory, check if it's a seeded generation
    if (!stored) {
      const gen = db.generations.get(fileId);
      if (gen) {
        // Generate on-the-fly acoustic buffer for sample
        const acousticProvider = new QeemaAcousticProvider();
        const synth = await acousticProvider.synthesize({
          text: gen.text,
          voice: db.voices.get(gen.voiceId) || Array.from(db.voices.values())[0],
          settings: gen.settings,
          companyId: gen.companyId,
          userId: gen.userId
        });
        stored = {
          buffer: synth.audioBuffer,
          mimeType: synth.mimeType,
          filename: `${fileId}.wav`
        };
        db.audioFiles.set(fileId, stored);
      }
    }

    if (!stored) {
      return res.status(404).json({ error: 'الملف الصوتي غير موجود أو انتهت صلاحية الرابط' });
    }

    const isDownload = req.query.download === 'true';

    res.setHeader('Content-Type', stored.mimeType || 'audio/wav');
    res.setHeader('Content-Length', stored.buffer.length);
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    if (isDownload) {
      res.setHeader('Content-Disposition', `attachment; filename="${stored.filename || 'qeema-voice.wav'}"`);
    } else {
      res.setHeader('Content-Disposition', 'inline');
    }

    res.send(stored.buffer);
  });

  // API v1 Routes
  app.get('/api/download-report', (req: Request, res: Response) => {
    const filePath = path.join(process.cwd(), 'public', 'QeemaVoice_Developments_Report.docx');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', 'attachment; filename="QeemaVoice_Developments_Report.docx"');
    res.sendFile(filePath);
  });

  // SEO: live sitemap (includes dashboard articles, stories and voices) and robots.txt
  app.get('/sitemap.xml', sitemapHandler);
  app.get('/robots.txt', robotsHandler);

  app.use('/api/v1/auth', authRouter);
  app.use('/api/v1/voices', voicesRouter);
  app.use('/api/v1/generations', requireUser, generationsRouter);
  app.use('/api/v1/credits', requireUser, creditsRouter);
  app.use('/api/v1/usage', requireUser, usageRouter);
  app.use('/api/v1/billing', requireUser, billingRouter);
  app.get('/api/v1/stories', publicStoriesHandler);
  app.get('/api/v1/pages/:key', publicPageHandler);
  app.get('/api/v1/guides', publicGuidesHandler);
  app.get('/api/v1/page-texts', publicPageTextsHandler);
  app.get('/api/v1/site-lists', publicSiteListsHandler);
  app.get('/api/v1/articles', publicArticlesHandler);
  app.get('/api/v1/voice-templates', publicVoiceTemplatesHandler);
  // Old URL of the models page (was /ar/voice-templates): permanent redirect keeps search rankings
  app.get('/ar/voice-templates', (_req: Request, res: Response) => res.redirect(301, '/ar/voice-models'));
  // Model pages moved from /ar/services/<slug> to /ar/voice-models/<slug>
  app.get('/ar/services/:slug', (req: Request, res: Response, next) => {
    const moved = Object.values(COMMERCIAL_SERVICES).some(s => s.route === `/ar/voice-models/${req.params.slug}`);
    return moved ? res.redirect(301, `/ar/voice-models/${req.params.slug}`) : next();
  });
  app.get('/api/v1/human-voices', publicHumanVoicesHandler);
  app.get('/api/v1/human-voices/:id/reviews', publicVoiceReviewsHandler);
  app.use('/api/v1/client', clientRouter);
  // Everything under /api/v1/admin is for platform admins only
  app.use('/api/v1/admin', requireAdmin);
  app.use('/api/v1/admin/collections', collectionsRouter);
  app.use('/api/v1/admin/tts-voices', ttsVoicesRouter);
  app.use('/api/v1/admin', adminRouter);
  app.use('/api/v1/assistant', assistantRouter);
  app.use('/api/v1/narrators', narratorsRouter);
  app.use('/api/v1', publicFormsRouter);

  // Global Error Handler for API
  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error('[Server Error]:', err);
    res.status(500).json({
      error: 'حدث خطأ غير متوقع في الخادم',
      message: process.env.NODE_ENV === 'development' ? err?.message : undefined
    });
  });

  // Integrate Vite Middleware
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Qeema AI] B2B Voice Platform running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
