# DATABASE PLAN — مخطط وتصميم قواعد البيانات لمنصة قيمة فويس للذكاء الصوتي (Qeema AI)
**تاريخ الاعتماد:** 2026-09-08  
**المحرك المعتمد:** PostgreSQL 15+ / MySQL 8.0+ (متوافق مع محركات ORM الحديثة)  
**المبدأ الأساسي:** تمديد الجداول الحالية بجداول معزولة ومترابطة بمفاتيح خارجية (Foreign Keys) تضمن عدم حدوث أي قفل (Lock) أو كسر لجداول السوق البشري القديم.

---

## 1. المخطط العلائقي للبيانات (Entity Relationship Diagram)

```text
  ┌──────────────┐         1:1          ┌───────────────────┐
  │    users     ├─────────────────────►│   credit_wallets  │
  └───────┬──────┘                      └─────────┬─────────┘
          │ 1:N                                   │ 1:N
          ▼                                       ▼
  ┌──────────────┐                      ┌───────────────────┐
  │ ai_projects  │                      │credit_transactions│
  └───────┬──────┘                      └─────────┬─────────┘
          │ 1:N                                   │ References
          ▼                                       ▼
  ┌──────────────┐                      ┌───────────────────┐
  │  ai_scenes   │                      │   usage_records   │
  └───────┬──────┘                      └─────────▲─────────┘
          │ N:1                                   │ Logs
          ▼                                       │
  ┌──────────────┐         1:N          ┌─────────┴─────────┐
  │   ai_voices  ├─────────────────────►│  ai_voice_samples │
  └───────▲──────┘                      └───────────────────┘
          │ 0/1:1
          ▼
  ┌──────────────┐         1:1          ┌───────────────────┐
  │ voice_clones ├─────────────────────►│voice_consent_rec  │
  └──────────────┘                      └───────────────────┘
```

---

## 2. هياكل الجداول الجديدة بالتفصيل (Detailed Table Schemas)

### 2.1 منظومة الرصيد والمحفظة (Credit Wallet & Billing)

#### جدول محفظة المستخدم `credit_wallets`:
```sql
CREATE TABLE credit_wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id BIGINT NOT NULL UNIQUE, -- Foreign key referencing existing users(id)
    balance_credits BIGINT NOT NULL DEFAULT 1000, -- Free tier balance
    lifetime_purchased_credits BIGINT NOT NULL DEFAULT 0,
    lifetime_used_credits BIGINT NOT NULL DEFAULT 0,
    is_frozen BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_wallet_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_wallets_user_id ON credit_wallets(user_id);
```

#### جدول حركات الرصيد `credit_transactions`:
```sql
CREATE TABLE credit_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_id UUID NOT NULL,
    user_id BIGINT NOT NULL,
    amount_credits BIGINT NOT NULL, -- Positive for deposits/purchases, negative for usage
    balance_after BIGINT NOT NULL,
    transaction_type VARCHAR(50) NOT NULL, -- 'signup_bonus', 'purchase', 'tts_generation', 'stt_transcription', 'clone_fee', 'refund'
    reference_id VARCHAR(100), -- ID of project, order, or gateway invoice
    description VARCHAR(255) NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_tx_wallet FOREIGN KEY (wallet_id) REFERENCES credit_wallets(id) ON DELETE CASCADE,
    CONSTRAINT fk_tx_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_tx_wallet_created ON credit_transactions(wallet_id, created_at DESC);
CREATE INDEX idx_tx_user ON credit_transactions(user_id);
```

#### جدول سجلات الاستهلاك الدقيق `usage_records`:
```sql
CREATE TABLE usage_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id BIGINT NOT NULL,
    feature_type VARCHAR(50) NOT NULL, -- 'tts', 'stt', 'clone', 'dubbing', 'agent'
    provider_name VARCHAR(50) NOT NULL, -- 'elevenlabs', 'google_vertex', 'whisper', 'internal_qeema'
    model_name VARCHAR(100) NOT NULL,
    input_unit_type VARCHAR(30) NOT NULL, -- 'characters', 'audio_seconds', 'tokens'
    input_unit_count INTEGER NOT NULL,
    output_audio_duration_seconds NUMERIC(8, 2),
    credits_consumed BIGINT NOT NULL,
    estimated_provider_cost_usd NUMERIC(10, 6) DEFAULT 0,
    latency_ms INTEGER,
    status VARCHAR(30) NOT NULL, -- 'success', 'failed', 'refunded'
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_usage_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_usage_user_feature ON usage_records(user_id, feature_type, created_at DESC);
CREATE INDEX idx_usage_provider ON usage_records(provider_name, created_at);
```

---

### 2.2 منظومة أصوات الذكاء الاصطناعي (AI Voice Catalog & Cloning)

#### جدول أصوات الذكاء الاصطناعي `ai_voices`:
```sql
CREATE TABLE ai_voices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    human_talent_id BIGINT NULL, -- Optional link to human voice talent in legacy voice_talents table
    name_ar VARCHAR(100) NOT NULL,
    name_en VARCHAR(100),
    slug VARCHAR(100) NOT NULL UNIQUE,
    voice_type VARCHAR(30) NOT NULL DEFAULT 'standard', -- 'standard_ai', 'verified_human_twin', 'custom_clone', 'branded_exclusive'
    gender VARCHAR(20) NOT NULL, -- 'male', 'female'
    dialect_code VARCHAR(30) NOT NULL, -- 'gulf_saudi', 'levantine_syrian', 'egyptian', 'maghrebi', 'fusha_standard'
    age_bracket VARCHAR(30) NOT NULL DEFAULT 'middle_aged', -- 'child', 'youth', 'middle_aged', 'elder'
    primary_style VARCHAR(50) NOT NULL DEFAULT 'conversational', -- 'authoritative', 'friendly', 'commercial', 'dramatic', 'news'
    use_cases TEXT[] DEFAULT '{}', -- e.g. ['ivr', 'ads', 'audiobooks', 'explainer']
    avatar_url VARCHAR(500),
    preview_audio_url VARCHAR(500),
    provider_internal_id VARCHAR(150), -- Mapping to external provider's voice ID
    provider_name VARCHAR(50) NOT NULL,
    credit_cost_multiplier NUMERIC(4, 2) DEFAULT 1.0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_featured BOOLEAN NOT NULL DEFAULT FALSE,
    is_public BOOLEAN NOT NULL DEFAULT TRUE,
    owner_user_id BIGINT NULL, -- For privately cloned voices
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_ai_voices_dialect ON ai_voices(dialect_code, gender, is_active);
CREATE INDEX idx_ai_voices_type ON ai_voices(voice_type, is_public);
```

#### جدول التوثيق والموافقة القانونية للاستنساخ `voice_consent_records`:
```sql
CREATE TABLE voice_consent_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    voice_id UUID NOT NULL UNIQUE,
    talent_or_owner_id BIGINT NOT NULL,
    legal_full_name VARCHAR(255) NOT NULL,
    national_id_or_passport VARCHAR(100),
    consent_statement_text TEXT NOT NULL,
    verification_audio_url VARCHAR(500) NOT NULL,
    voice_print_hash VARCHAR(255) NOT NULL,
    license_tier VARCHAR(50) NOT NULL, -- 'exclusive_brand', 'public_marketplace', 'personal_use'
    allowed_commercial_usage BOOLEAN NOT NULL DEFAULT TRUE,
    consent_ip_address VARCHAR(45) NOT NULL,
    verified_by_admin_id BIGINT NULL,
    verified_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(30) NOT NULL DEFAULT 'pending_verification', -- 'pending_verification', 'approved', 'revoked'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_consent_voice FOREIGN KEY (voice_id) REFERENCES ai_voices(id) ON DELETE CASCADE
);
```

---

### 2.3 منظومة المشاريع والاستوديو `ai_projects` & `ai_scenes`

#### جدول مشاريع الاستوديو `ai_projects`:
```sql
CREATE TABLE ai_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id BIGINT NOT NULL,
    title VARCHAR(200) NOT NULL,
    project_type VARCHAR(50) NOT NULL DEFAULT 'single_tts', -- 'single_tts', 'multi_scene_podcast', 'video_dubbing'
    master_audio_url VARCHAR(500),
    total_duration_seconds NUMERIC(8, 2) DEFAULT 0,
    status VARCHAR(30) NOT NULL DEFAULT 'draft', -- 'draft', 'processing', 'completed', 'failed'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_project_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_projects_user ON ai_projects(user_id, updated_at DESC);
```

#### جدول المشاهد والفقرات داخل المشروع `ai_scenes`:
```sql
CREATE TABLE ai_scenes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL,
    scene_order INTEGER NOT NULL DEFAULT 1,
    voice_id UUID NOT NULL,
    script_text TEXT NOT NULL,
    script_diacritized TEXT,
    speed NUMERIC(4, 2) NOT NULL DEFAULT 1.0,
    pitch NUMERIC(4, 2) NOT NULL DEFAULT 0.0,
    scene_audio_url VARCHAR(500),
    duration_seconds NUMERIC(8, 2) DEFAULT 0,
    status VARCHAR(30) NOT NULL DEFAULT 'pending', -- 'pending', 'rendering', 'ready', 'failed'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_scene_project FOREIGN KEY (project_id) REFERENCES ai_projects(id) ON DELETE CASCADE,
    CONSTRAINT fk_scene_voice FOREIGN KEY (voice_id) REFERENCES ai_voices(id)
);

CREATE INDEX idx_scenes_project_order ON ai_scenes(project_id, scene_order ASC);
```

---

### 2.4 لوحة التحكم بالموفرين والتكاليف (Admin Configurable Providers & Models)

```sql
CREATE TABLE ai_providers (
    id VARCHAR(50) PRIMARY KEY, -- 'elevenlabs', 'google_vertex', 'whisper_internal', 'local_qeema'
    name VARCHAR(100) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    priority_order INTEGER NOT NULL DEFAULT 1,
    base_endpoint_url VARCHAR(255),
    health_status VARCHAR(30) NOT NULL DEFAULT 'healthy',
    last_health_check TIMESTAMP WITH TIME ZONE,
    config JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE ai_models (
    id VARCHAR(100) PRIMARY KEY, -- 'eleven_multilingual_v2', 'gemini-2.5-flash', 'whisper-large-v3'
    provider_id VARCHAR(50) NOT NULL,
    supported_feature VARCHAR(50) NOT NULL, -- 'tts', 'stt', 'clone'
    cost_per_1k_units_credits INTEGER NOT NULL DEFAULT 10,
    cost_per_1k_units_usd NUMERIC(8, 5) NOT NULL DEFAULT 0.015,
    is_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT fk_model_provider FOREIGN KEY (provider_id) REFERENCES ai_providers(id)
);
```

---

## 3. خطة الترحيل وعدم المساس بالسوق القديم (Zero-Breakage Migration Strategy)

1. **إجراء الهجرة التراكمية (Additive-Only Migrations):**
   * لا يتم حذف أي حقل أو تعديل أي نوع بيانات في الجداول القديمة (`users`, `voice_talents`, `orders`, `transactions`).
2. **الربط الآمن بمعرف المستخدم (Loose Coupling via user_id):**
   * يتم ربط `credit_wallets` عبر `user_id`. عند أول تسجيل دخول لأي مستخدم حالي، يُنشئ النظام محفظة رصيد تلقائياً بقيمة 1,000 نقطة تجريبية عبر Lazy Creation دون الحاجة لتعديل بياناته السابقة.
3. **الربط الاختياري للمعلقين (`human_talent_id`):**
   * الحقل `human_talent_id` في جدول `ai_voices` هو حقل اختياري (Nullable)، مما يتيح إضافة أصوات ذكاء اصطناعي جديدة كلياً أو ربطها بالمعلق البشري عند موافقته وتوثيقه.
