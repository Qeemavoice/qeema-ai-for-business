/*!
 * مساعد قيمة — شات اختيار الصوت | Qeema Voice
 * التركيب: <script src="/qv-chat/qv-chat.js" defer></script>
 * خيارات اختيارية على نفس الوسم:
 *   data-endpoint="/qv-chat"   مسار الخادم
 *   data-position="right"      right | left
 *   data-mock="true"           وضع تجريبي بدون خادم (للعرض فقط)
 * لفتح الشات من أي زر في الموقع: QeemaChat.open()  أو  QeemaChat.open('نص يُرسل مباشرة')
 */
(function () {
  'use strict';
  if (window.QeemaChat) return;

  var script = document.currentScript || document.querySelector('script[src*="qv-chat.js"]');
  var CFG = {
    endpoint: (script && script.getAttribute('data-endpoint')) || '/qv-chat',
    position: (script && script.getAttribute('data-position')) || 'right',
    mock: script && script.getAttribute('data-mock') === 'true',
    whatsapp: ((script && script.getAttribute('data-whatsapp')) || '').replace(/\D/g, '')
  };

  var STORE_KEY = 'qvChat.v2';
  var TTL = 7 * 24 * 3600 * 1000;

  var DIALECTS = {
    sa_najdi: 'سعودي نجدي', sa_hijazi: 'سعودي حجازي', ae: 'إماراتي', kw: 'كويتي', qa: 'قطري',
    eg: 'مصري', levant: 'شامي', jo_ps: 'أردني فلسطيني', iq: 'عراقي', ma: 'مغربي', msa: 'فصحى'
  };

  var GREETING = {
    role: 'bot',
    text: 'أهلًا بك في قيمة فويس، أنا مساعد قيمة. هل تبحث عن صوت لمشروعك، أم أنت معلق صوتي؟',
    chips: ['أبحث عن صوت لمشروعي', 'أنا معلق صوتي']
  };

  // ───────────────────────── الحالة ─────────────────────────
  var state = load() || {
    deviceId: uid(),
    conversationId: null,
    items: [GREETING],
    handoff: false,
    savedAt: Date.now()
  };
  var busy = false;

  function uid() {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    return 'd' + Date.now().toString(36) + Math.random().toString(36).slice(2, 12);
  }
  function load() {
    try {
      var s = JSON.parse(localStorage.getItem(STORE_KEY) || 'null');
      if (s && Date.now() - s.savedAt < TTL) return s;
      if (s && s.deviceId) return { deviceId: s.deviceId, conversationId: null, items: [GREETING], handoff: false, savedAt: Date.now() };
    } catch (e) {}
    return null;
  }
  function save() {
    try {
      state.savedAt = Date.now();
      // روابط المعاينة مؤقتة؛ لا نحفظها
      var copy = JSON.parse(JSON.stringify(state));
      copy.items = copy.items.map(function (it) { if (it.ui && it.ui.type === 'preview') it.ui.expired = true; return it; }).slice(-60);
      localStorage.setItem(STORE_KEY, JSON.stringify(copy));
    } catch (e) {}
  }

  // ───────────────────────── الأنماط ─────────────────────────
  var CSS = "\
:host{all:initial}\
*{box-sizing:border-box;margin:0;padding:0;font-family:'Cairo','Segoe UI',Tahoma,sans-serif}\
.root{--p:#6500A5;--pd:#2A003F;--o:#F5A623;--od:#E08A00;--l:#B78AD6;--g:#F2F2F2;--ink:#1B0E14;--soft:#5c4c54;--line:#ECE4F2;direction:rtl;color:var(--ink);font-size:14px;line-height:1.7}\
.launcher{position:fixed;bottom:20px;z-index:2147483000;width:60px;height:60px;border-radius:50%;border:none;cursor:pointer;background:linear-gradient(135deg,var(--o),var(--od));box-shadow:0 10px 28px rgba(245,166,35,.45);display:flex;align-items:center;justify-content:center;transition:transform .2s}\
.launcher:hover{transform:scale(1.06)}\
.launcher svg{width:28px;height:28px;fill:var(--pd)}\
.launcher .badge{position:absolute;top:-4px;inset-inline-end:-4px;background:var(--p);color:#fff;font-size:11px;font-weight:800;border-radius:999px;padding:1px 7px;border:2px solid #fff}\
.pos-right .launcher,.pos-right .panel{right:20px}.pos-left .launcher,.pos-left .panel{left:20px}\
.tease{position:fixed;bottom:92px;z-index:2147483000;background:#fff;color:var(--ink);border-radius:14px;padding:10px 14px;font-size:13px;font-weight:700;box-shadow:0 10px 30px rgba(42,0,63,.18);max-width:230px;cursor:pointer}\
.pos-right .tease{right:20px}.pos-left .tease{left:20px}\
.panel{position:fixed;bottom:92px;z-index:2147483001;width:400px;max-width:calc(100vw - 24px);height:640px;max-height:calc(100vh - 120px);background:#fff;border-radius:20px;box-shadow:0 24px 70px rgba(42,0,63,.28);display:flex;flex-direction:column;overflow:hidden;opacity:0;transform:translateY(12px);pointer-events:none;transition:opacity .2s,transform .2s}\
.panel.open{opacity:1;transform:none;pointer-events:auto}\
@media (max-width:520px){.panel{inset:0!important;width:100%;max-width:100%;height:100%;max-height:100%;border-radius:0}.launcher.hide-mobile{display:none}}\
.head{background:linear-gradient(135deg,var(--pd),var(--p));color:#fff;padding:14px 16px;display:flex;align-items:center;gap:10px}\
.avatar{width:38px;height:38px;border-radius:50%;background:var(--o);display:flex;align-items:center;justify-content:center;flex-shrink:0}\
.avatar svg{width:20px;height:20px;fill:var(--pd)}\
.head .t{flex:1;min-width:0}.head b{display:block;font-size:15px;font-weight:800}.head small{font-size:12px;opacity:.85}\
.icon-btn{background:rgba(255,255,255,.12);border:none;color:#fff;width:32px;height:32px;border-radius:10px;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:16px}\
.icon-btn:hover{background:rgba(255,255,255,.22)}\
.btn.wa{background:#25D366;color:#fff;display:flex;align-items:center;justify-content:center;gap:8px;text-decoration:none}\
.btn.wa svg{width:18px;height:18px;fill:#fff}\
.box.wa{border-color:#BDEBCB;background:#F3FCF6}\
.body{flex:1;overflow-y:auto;padding:16px 14px;background:#FBF9FD;scroll-behavior:smooth}\
.msg{display:flex;margin-bottom:10px}\
.bubble{max-width:86%;padding:10px 13px;border-radius:16px;white-space:pre-wrap;word-wrap:break-word;font-size:14px}\
.msg.bot .bubble{background:#fff;border:1px solid var(--line)}\
.msg.user .bubble{background:var(--p);color:#fff}\
.msg.bot{justify-content:flex-start}.msg.user{justify-content:flex-end}\
.msg.bot .bubble{border-top-left-radius:16px;border-top-right-radius:6px}.msg.user .bubble{border-top-right-radius:16px;border-top-left-radius:6px}\
.msg.user .bubble.long{max-height:140px;overflow:hidden;position:relative}\
.msg.user .bubble.long:after{content:'';position:absolute;inset:auto 0 0 0;height:40px;background:linear-gradient(transparent,var(--p))}\
.chips{display:flex;flex-wrap:wrap;gap:6px;margin:2px 0 12px}\
.chip{border:1.5px solid var(--l);background:#fff;color:var(--p);font-weight:700;font-size:12.5px;padding:6px 12px;border-radius:999px;cursor:pointer}\
.chip:hover{background:var(--p);color:#fff;border-color:var(--p)}\
.typing{display:inline-flex;gap:4px;padding:12px 14px;background:#fff;border:1px solid var(--line);border-radius:16px}\
.typing i{width:7px;height:7px;border-radius:50%;background:var(--l);animation:bounce 1.2s infinite}.typing i:nth-child(2){animation-delay:.15s}.typing i:nth-child(3){animation-delay:.3s}\
@keyframes bounce{0%,60%,100%{transform:none;opacity:.5}30%{transform:translateY(-4px);opacity:1}}\
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.35}}\
.cards{display:flex;gap:10px;overflow-x:auto;padding:2px 2px 10px;margin-bottom:6px;scroll-snap-type:x mandatory}\
.card{flex:0 0 250px;scroll-snap-align:start;background:#fff;border:1px solid var(--line);border-radius:16px;padding:12px;display:flex;flex-direction:column;gap:8px}\
.card .top{display:flex;gap:10px;align-items:center}\
.ph{width:44px;height:44px;border-radius:50%;background:linear-gradient(135deg,var(--l),var(--p));color:#fff;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:16px;flex-shrink:0;overflow:hidden}\
.ph img{width:100%;height:100%;object-fit:cover}\
.card .nm{font-weight:800;font-size:14.5px;line-height:1.3}\
.tags{display:flex;flex-wrap:wrap;gap:4px}\
.tag{font-size:11px;font-weight:700;padding:2px 8px;border-radius:999px;background:var(--g);color:var(--soft)}\
.tag.v{background:#F1E8F8;color:var(--p)}.tag.ai{background:#FFF1D8;color:#9A5B00}\
.meta{display:flex;justify-content:space-between;font-size:12px;color:var(--soft)}\
.meta b{color:var(--ink);font-size:13px}\
.btn{border:none;border-radius:10px;padding:9px 10px;font-weight:800;font-size:12.5px;cursor:pointer;width:100%}\
.btn.pri{background:linear-gradient(135deg,var(--o),var(--od));color:var(--pd)}\
.btn.sec{background:var(--p);color:#fff}\
.btn.out{background:#fff;color:var(--p);border:1.5px solid var(--l)}\
.btn:disabled{opacity:.55;cursor:not-allowed}\
.player{display:flex;align-items:center;gap:8px;background:var(--g);border-radius:12px;padding:6px 8px}\
.player button{width:32px;height:32px;border-radius:50%;border:none;background:var(--p);color:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0}\
.player button svg{width:14px;height:14px;fill:#fff}\
.player .bar{flex:1;height:5px;background:#DDD3E6;border-radius:4px;overflow:hidden;direction:ltr}\
.player .bar span{display:block;height:100%;width:0;background:var(--o)}\
.player small{font-size:11px;color:var(--soft);min-width:34px;text-align:center}\
.box{background:#fff;border:1px solid var(--line);border-radius:16px;padding:13px;margin-bottom:12px;display:flex;flex-direction:column;gap:9px}\
.box h4{font-size:14px;font-weight:800;color:var(--pd)}\
.box p{font-size:12.5px;color:var(--soft)}\
.box.preview{border-color:var(--o);box-shadow:0 6px 18px rgba(245,166,35,.15)}\
.box.ok{border-color:#B9E2C2;background:#F4FBF5}.box.wait{border-color:#F5DDA8;background:#FFFBF2}\
.row{display:flex;gap:8px}\
.field{display:flex;flex-direction:column;gap:4px}\
.field label{font-size:12px;font-weight:700;color:var(--soft)}\
.field input,.field select{border:1.5px solid var(--line);border-radius:10px;padding:9px 11px;font-size:14px;background:#fff;color:var(--ink);width:100%}\
.field input:focus,.field select:focus,textarea:focus{outline:none;border-color:var(--p)}\
.phone{display:flex;gap:6px;direction:ltr}.phone select{width:118px;flex-shrink:0;padding-inline:8px}\
.err{color:#B3261E;font-size:12px;font-weight:700}\
.foot{border-top:1px solid var(--line);padding:10px;background:#fff}\
.inbox{display:flex;align-items:flex-end;gap:8px;background:var(--g);border-radius:14px;padding:6px 6px 6px 6px}\
textarea{flex:1;border:none;background:transparent;resize:none;font-size:14px;line-height:1.6;max-height:120px;min-height:24px;padding:6px 8px;color:var(--ink)}\
.send{width:40px;height:40px;border-radius:12px;border:none;background:var(--p);cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0}\
.send svg{width:18px;height:18px;fill:#fff;transform:scaleX(-1)}\
.send:disabled{opacity:.5}\
.note{font-size:11px;color:#9A8FA3;text-align:center;margin-top:6px}\
button:focus-visible,.chip:focus-visible{outline:3px solid var(--o);outline-offset:2px}\
@media (prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}\
";

  // ───────────────────────── أيقونات ─────────────────────────
  var ICON = {
    mic: '<svg viewBox="0 0 24 24"><path d="M12 14a3 3 0 0 0 3-3V5a3 3 0 1 0-6 0v6a3 3 0 0 0 3 3zm5-3a5 5 0 0 1-10 0H5a7 7 0 0 0 6 6.92V21h2v-3.08A7 7 0 0 0 19 11h-2z"/></svg>',
    send: '<svg viewBox="0 0 24 24"><path d="M2 21l21-9L2 3v7l15 2-15 2z"/></svg>',
    play: '<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>',
    pause: '<svg viewBox="0 0 24 24"><path d="M6 5h4v14H6zm8 0h4v14h-4z"/></svg>',
    wa: '<svg viewBox="0 0 24 24"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.3-.4.8-1.4.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 0 0 1.8-1.2 2.2 2.2 0 0 0 .1-1.2c0-.1-.2-.2-.4-.3z"/></svg>'
  };

  // ───────────────────────── البناء ─────────────────────────
  var host = document.createElement('div');
  host.id = 'qv-chat-host';
  var shadow = host.attachShadow ? host.attachShadow({ mode: 'open' }) : host;
  var style = document.createElement('style');
  style.textContent = CSS;
  shadow.appendChild(style);

  if (!document.querySelector('link[href*="family=Cairo"]')) {
    var font = document.createElement('link');
    font.rel = 'stylesheet';
    font.href = 'https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&display=swap';
    document.head.appendChild(font);
  }

  var root = el('div', 'root pos-' + (CFG.position === 'left' ? 'left' : 'right'));
  shadow.appendChild(root);

  var launcher = el('button', 'launcher');
  launcher.setAttribute('aria-label', 'افتح مساعد اختيار الصوت');
  launcher.innerHTML = ICON.mic;
  root.appendChild(launcher);

  var tease = el('div', 'tease', 'لا تعرف أي صوت يناسب مشروعك؟ اسألني ✨');
  tease.style.display = 'none';
  root.appendChild(tease);

  var panel = el('div', 'panel');
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-label', 'مساعد قيمة');
  root.appendChild(panel);

  var head = el('div', 'head');
  var av = el('div', 'avatar'); av.innerHTML = ICON.mic;
  var ht = el('div', 't');
  ht.appendChild(el('b', '', 'مساعد قيمة'));
  ht.appendChild(el('small', '', 'يساعدك في اختيار الصوت المناسب'));
  var resetBtn = el('button', 'icon-btn', '↺'); resetBtn.title = 'محادثة جديدة'; resetBtn.setAttribute('aria-label', 'محادثة جديدة');
  var closeBtn = el('button', 'icon-btn', '✕'); closeBtn.setAttribute('aria-label', 'إغلاق');
  head.appendChild(av); head.appendChild(ht); head.appendChild(resetBtn); head.appendChild(closeBtn);
  panel.appendChild(head);


  var body = el('div', 'body');
  body.setAttribute('aria-live', 'polite');
  panel.appendChild(body);

  var foot = el('div', 'foot');
  var inbox = el('div', 'inbox');
  var input = document.createElement('textarea');
  input.rows = 1;
  input.placeholder = 'اكتب رسالتك أو الصق السيناريو هنا...';
  input.setAttribute('aria-label', 'رسالتك');
  var sendBtn = el('button', 'send'); sendBtn.innerHTML = ICON.send; sendBtn.setAttribute('aria-label', 'إرسال');
  inbox.appendChild(input); inbox.appendChild(sendBtn);
  foot.appendChild(inbox);
  foot.appendChild(el('div', 'note', 'المعاينات بالذكاء الاصطناعي تقريبية، والتسجيل النهائي بصوت المعلق الحقيقي.'));
  panel.appendChild(foot);

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }

  function mount() {
    if (document.body) document.body.appendChild(host);
    else document.addEventListener('DOMContentLoaded', function () { document.body.appendChild(host); });
  }
  mount();

  // ───────────────────────── العرض ─────────────────────────
  function render() {
    body.innerHTML = '';
    // الأزرار السريعة تظهر فقط تحت آخر رسالة في المحادثة
    var last = state.items.length - 1;
    state.items.forEach(function (it, i) { body.appendChild(renderItem(it, i === last && it.role === 'bot')); });
    scrollDown();
  }

  function renderItem(it, showChips) {
    var frag = document.createDocumentFragment();
    if (it.text) {
      var m = el('div', 'msg ' + it.role);
      var b = el('div', 'bubble', it.text);
      if (it.role === 'user' && it.text.length > 400) b.className += ' long';
      m.appendChild(b);
      frag.appendChild(m);
    }
    if (it.ui) frag.appendChild(renderUi(it.ui));
    if (showChips && it.chips && it.chips.length) {
      var c = el('div', 'chips');
      it.chips.forEach(function (ch) {
        var x = el('button', 'chip', ch);
        x.onclick = function () { send(ch); };
        c.appendChild(x);
      });
      frag.appendChild(c);
    }
    return frag;
  }

  function renderUi(ui) {
    switch (ui.type) {
      case 'talents': return talentCards(ui.items || []);
      case 'preview': return previewBox(ui);
      case 'sample': return sampleBox(ui);
      case 'lead_form': return leadForm(ui);
      case 'quota': return quotaBox();
      case 'order': return orderBox(ui);
      case 'whatsapp': return whatsappBox(ui);
      case 'artist_join': return artistJoinBox(ui);
      case 'artist_help': return artistHelpBox(ui);
      case 'ticket': return ticketBox(ui);
      default: return document.createDocumentFragment();
    }
  }

  function talentCards(items) {
    var wrap = el('div', 'cards');
    items.forEach(function (t) {
      var card = el('div', 'card');
      var top = el('div', 'top');
      var ph = el('div', 'ph');
      if (t.photo && /^https?:\/\//.test(t.photo)) { var img = document.createElement('img'); img.src = t.photo; img.alt = ''; ph.appendChild(img); }
      else ph.textContent = (t.name || '؟').trim().charAt(0);
      var info = el('div');
      info.appendChild(el('div', 'nm', t.name));
      var tags = el('div', 'tags');
      if (t.verified_human) tags.appendChild(el('span', 'tag v', 'صوت بشري موثّق'));
      if (t.has_clone) tags.appendChild(el('span', 'tag ai', 'معاينة AI متاحة'));
      info.appendChild(tags);
      top.appendChild(ph); top.appendChild(info);
      card.appendChild(top);

      var dt = el('div', 'tags');
      (t.dialects || []).forEach(function (d) { dt.appendChild(el('span', 'tag', DIALECTS[d] || d)); });
      (t.tones || []).slice(0, 3).forEach(function (d) { dt.appendChild(el('span', 'tag', d)); });
      card.appendChild(dt);

      var meta = el('div', 'meta');
      var p1 = el('span'); p1.appendChild(el('b', '', '$' + num(t.price_per_minute_usd))); p1.appendChild(document.createTextNode(' للدقيقة'));
      var p2 = el('span', '', 'التسليم خلال ' + days(t.turnaround_days));
      meta.appendChild(p1); meta.appendChild(p2);
      card.appendChild(meta);
      if (t.estimate && t.estimate.human_usd) {
        card.appendChild(el('div', 'meta', 'تقدير لمشروعك (' + t.estimate.minutes + ' د): $' + num(t.estimate.human_usd) + (t.estimate.ai_usd ? ' بشري، أو $' + num(t.estimate.ai_usd) + ' نسخة AI' : '')));
      }

      if (t.sample_url) card.appendChild(player(t.sample_url, 'عينة بشرية'));

      if (t.has_clone) {
        var pv = el('button', 'btn pri', 'اسمع عينة آلية من النص');
        pv.onclick = function () { send('أريد معاينة بصوت ' + t.name + ' (' + t.code + ')'); };
        card.appendChild(pv);
      }
      var bk = el('button', 'btn ' + (t.has_clone ? 'out' : 'sec'), 'اطلب هذا المعلق');
      bk.onclick = function () { send('أريد حجز ' + t.name + ' (' + t.code + ')'); };
      card.appendChild(bk);
      wrap.appendChild(card);
    });
    return wrap;
  }

  function previewBox(ui) {
    var box = el('div', 'box preview');
    box.appendChild(el('h4', '', 'معاينة بصوت ' + ui.name));
    if (ui.expired) {
      box.appendChild(el('p', '', 'انتهت صلاحية رابط هذه المعاينة. اطلبها من جديد إذا أردت سماعها.'));
      return box;
    }
    box.appendChild(player(ui.url, 'معاينة', true));
    box.appendChild(el('p', '', (ui.trimmed ? 'المعاينة لأول جزء من نصك فقط. ' : '') + 'المعاينات المتبقية: ' + ui.remaining));
    var row = el('div', 'row');
    var hb = el('button', 'btn sec', 'اطلب المعلق الحقيقي');
    hb.onclick = function () { send('أريد حجز ' + ui.name + ' (' + ui.code + ') بتسجيل بشري'); };
    row.appendChild(hb);
    if (ui.has_ai_price) {
      var ab = el('button', 'btn out', 'اشترِ نسخة AI للنص كاملًا');
      ab.onclick = function () { send('أريد شراء نسخة AI بصوت ' + ui.name + ' (' + ui.code + ') للنص كاملًا'); };
      row.appendChild(ab);
    }
    box.appendChild(row);
    return box;
  }

  function sampleBox(ui) {
    var box = el('div', 'box');
    box.appendChild(el('h4', '', 'العينة البشرية لـ ' + ui.name));
    if (ui.sample_url) box.appendChild(player(ui.sample_url, 'عينة'));
    return box;
  }

  function quotaBox() {
    var box = el('div', 'box wait');
    box.appendChild(el('h4', '', 'انتهت معايناتك المجانية'));
    box.appendChild(el('p', '', 'يمكنك حجز المعلق البشري، أو شراء نسخة AI للنص كاملًا.'));
    return box;
  }

  function orderBox(ui) {
    var box = el('div', 'box ok');
    box.appendChild(el('h4', '', 'تم استلام طلبك ✓'));
    box.appendChild(el('p', '', 'رقم الطلب: ' + ui.reference));
    return box;
  }

  function whatsappBox(ui) {
    var box = el('div', 'box wa');
    box.appendChild(el('h4', '', 'موظف الدعم الفني بانتظارك على الواتساب'));
    box.appendChild(el('p', '', 'رقم الطلب: ' + ui.reference + '. ملخص طلبك مكتوب في الرسالة.'));
    var a = el('a', 'btn wa');
    a.innerHTML = ICON.wa;
    a.appendChild(document.createTextNode('تواصل مع الدعم على الواتساب'));
    if (/^https:\/\/wa\.me\//.test(ui.url || '')) a.href = ui.url;
    a.target = '_blank'; a.rel = 'noopener';
    box.appendChild(a);
    return box;
  }

  function artistJoinBox(ui) {
    var box = el('div', 'box');
    box.appendChild(el('h4', '', 'انضم إلى قيمة فويس كمعلق صوتي'));
    box.appendChild(el('p', '', 'أنشئ حساب معلق، ثم أضف عيناتك الصوتية من حسابك.'));
    var links = [
      ['signup_url', 'أنشئ حساب معلق', 'btn pri'],
      ['guide_url', 'كيف أنضم إلى منصة قيمة فويس؟', 'btn out'],
      ['samples_rules_url', 'شروط قبول العينات الصوتية', 'btn out']
    ];
    links.forEach(function (l) {
      var u = ui[l[0]];
      if (!u || !/^(https?:\/\/|\/)/.test(u)) return;
      var a = el('a', l[2], l[1]);
      a.href = u; a.target = '_blank'; a.rel = 'noopener';
      a.style.textAlign = 'center'; a.style.textDecoration = 'none'; a.style.display = 'block';
      box.appendChild(a);
    });
    return box;
  }

  function linkBtn(url, label, cls) {
    if (!url || !/^(https?:\/\/|\/)/.test(url)) return null;
    var a = el('a', cls, label);
    a.href = url; a.target = '_blank'; a.rel = 'noopener';
    a.style.textAlign = 'center'; a.style.textDecoration = 'none'; a.style.display = 'block';
    return a;
  }

  function artistHelpBox(ui) {
    var box = el('div', 'box');
    box.appendChild(el('h4', '', 'تجد الإجابة بالتفصيل هنا'));
    [[ui.terms_url, 'الشروط وسياسة الاستخدام'], [ui.blog_url, 'مدونة قيمة فويس']].forEach(function (l) {
      var a = linkBtn(l[0], l[1], 'btn out');
      if (a) box.appendChild(a);
    });
    return box;
  }

  function ticketBox(ui) {
    var box = el('div', 'box ok');
    box.appendChild(el('h4', '', 'تم إرسال طلب الدعم ✓'));
    box.appendChild(el('p', '', 'رقم الطلب: ' + ui.reference + '. سنرد عليك خلال 48 ساعة.'));
    return box;
  }

  function leadForm(ui) {
    var box = el('div', 'box');
    var reasons = { preview: 'لإتمام المعاينة', order: 'لإتمام الطلب', artist_support: 'لإتمام طلب الدعم' };
    box.appendChild(el('h4', '', 'أكّد رقم الواتساب ' + (reasons[ui.for] || '')));

    var nameF = field('الاسم', 'text', 'name');
    var phoneWrap = el('div', 'field');
    phoneWrap.appendChild(el('label', '', 'رقم الواتساب'));
    var ph = el('div', 'phone');
    var cc = document.createElement('select');
    [['966', '🇸🇦 +966'], ['971', '🇦🇪 +971'], ['965', '🇰🇼 +965'], ['974', '🇶🇦 +974'], ['973', '🇧🇭 +973'], ['968', '🇴🇲 +968'], ['20', '🇪🇬 +20'], ['962', '🇯🇴 +962'], ['970', '🇵🇸 +970'], ['961', '🇱🇧 +961'], ['964', '🇮🇶 +964'], ['212', '🇲🇦 +212'], ['', 'دولة أخرى']].forEach(function (o) {
      var op = document.createElement('option'); op.value = o[0]; op.textContent = o[1]; cc.appendChild(op);
    });
    var pin = document.createElement('input'); pin.type = 'tel'; pin.inputMode = 'tel'; pin.placeholder = '5xxxxxxxx'; pin.autocomplete = 'tel-national';
    ph.appendChild(cc); ph.appendChild(pin);
    phoneWrap.appendChild(ph);

    var err = el('div', 'err');
    var go = el('button', 'btn pri', 'إرسال رمز التحقق');
    box.appendChild(nameF.wrap); box.appendChild(phoneWrap); box.appendChild(err); box.appendChild(go);

    var codeF = field('رمز التحقق المرسل إلى الواتساب', 'text', 'one-time-code');
    codeF.input.inputMode = 'numeric'; codeF.input.maxLength = 6;
    var verify = el('button', 'btn sec', 'تأكيد');
    codeF.wrap.style.display = 'none'; verify.style.display = 'none';
    box.appendChild(codeF.wrap); box.appendChild(verify);

    var fullPhone = '';
    go.onclick = function () {
      err.textContent = '';
      var local = toLatin(pin.value).replace(/\D/g, '').replace(/^0+/, '');
      if (local.length < 7) { err.textContent = 'اكتب رقم الواتساب بشكل صحيح.'; return; }
      fullPhone = cc.value ? '+' + cc.value + local : '+' + local;
      go.disabled = true;
      api('/lead/start', { conversation_id: state.conversationId, device_id: state.deviceId, phone: fullPhone, name: nameF.input.value.trim() })
        .then(function (r) {
          if (r.status === 'verified') return done();
          if (r.status === 'code_sent') {
            codeF.wrap.style.display = ''; verify.style.display = ''; go.textContent = 'إعادة إرسال الرمز';
            setTimeout(function () { go.disabled = false; }, 30000);
            codeF.input.focus();
          } else { err.textContent = r.message || 'تعذر الإرسال، حاول مرة أخرى.'; go.disabled = false; }
        })
        .catch(function (e) { err.textContent = (e && e.message) || 'تعذر الإرسال، حاول مرة أخرى.'; go.disabled = false; });
    };
    verify.onclick = function () {
      err.textContent = '';
      verify.disabled = true;
      api('/lead/verify', { conversation_id: state.conversationId, device_id: state.deviceId, phone: fullPhone, code: toLatin(codeF.input.value) })
        .then(function (r) { if (r.status === 'verified') done(); else { err.textContent = r.message || 'الرمز غير صحيح.'; verify.disabled = false; } })
        .catch(function (e) { err.textContent = (e && e.message) || 'الرمز غير صحيح.'; verify.disabled = false; });
    };
    function done() {
      box.innerHTML = '';
      box.className = 'box ok';
      box.appendChild(el('h4', '', 'تم تأكيد رقمك ✓'));
      var cont = { preview: 'تم تأكيد رقمي، أكمل المعاينة', order: 'تم تأكيد رقمي، أكمل الطلب', artist_support: 'تم تأكيد رقمي، أرسل طلب الدعم' };
      markLeadDone();
      send(cont[ui.for] || 'تم تأكيد رقمي');
    }
    return box;
  }

  function markLeadDone() {
    for (var i = state.items.length - 1; i >= 0; i--) {
      var u = state.items[i].ui;
      if (u && u.type === 'lead_form') { state.items[i].ui = null; break; }
    }
  }

  function field(label, type, ac) {
    var wrap = el('div', 'field');
    wrap.appendChild(el('label', '', label));
    var i = document.createElement('input'); i.type = type; if (ac) i.autocomplete = ac;
    wrap.appendChild(i);
    return { wrap: wrap, input: i };
  }

  // مشغل صوت بلا زر تحميل
  var current = null;
  function player(src, label, autoplay) {
    var p = el('div', 'player');
    var btn = el('button'); btn.innerHTML = ICON.play; btn.setAttribute('aria-label', 'تشغيل ' + label);
    var bar = el('div', 'bar'); var fill = el('span'); bar.appendChild(fill);
    var t = el('small', '', label);
    p.appendChild(btn); p.appendChild(bar); p.appendChild(t);
    var audio = null;
    btn.onclick = function () {
      if (!audio) {
        audio = new Audio();
        audio.preload = 'none';
        audio.controlsList = 'nodownload';
        audio.src = src;
        audio.ontimeupdate = function () {
          if (audio.duration) fill.style.width = (audio.currentTime / audio.duration * 100) + '%';
          t.textContent = fmt(audio.currentTime);
        };
        audio.onended = function () { btn.innerHTML = ICON.play; fill.style.width = '0'; t.textContent = label; };
        audio.onerror = function () { t.textContent = 'تعذر التشغيل'; btn.innerHTML = ICON.play; };
      }
      if (audio.paused) {
        if (current && current !== audio) current.pause();
        current = audio;
        audio.play().catch(function () {});
        btn.innerHTML = ICON.pause;
        audio.onpause = function () { btn.innerHTML = ICON.play; };
      } else audio.pause();
    };
    p.oncontextmenu = function (e) { e.preventDefault(); };
    if (autoplay) setTimeout(function () { btn.click(); }, 150);
    return p;
  }

  function days(n) { n = Number(n); return n === 1 ? 'يوم واحد' : n === 2 ? 'يومين' : n <= 10 ? n + ' أيام' : n + ' يومًا'; }
  function fmt(s) { s = Math.floor(s || 0); return Math.floor(s / 60) + ':' + ('0' + (s % 60)).slice(-2); }
  function num(n) { n = Number(n); return n % 1 === 0 ? String(n) : n.toFixed(2); }
  function toLatin(s) { return String(s || '').replace(/[٠-٩]/g, function (d) { return d.charCodeAt(0) - 1632; }).replace(/[۰-۹]/g, function (d) { return d.charCodeAt(0) - 1776; }); }

  var typingEl = null;
  function showTyping(on) {
    if (on && !typingEl) {
      typingEl = el('div', 'msg bot');
      var t = el('div', 'typing'); t.innerHTML = '<i></i><i></i><i></i>';
      typingEl.appendChild(t);
      body.appendChild(typingEl);
      scrollDown();
    } else if (!on && typingEl) { typingEl.remove(); typingEl = null; }
  }
  function scrollDown() { requestAnimationFrame(function () { body.scrollTop = body.scrollHeight; }); }

  // ───────────────────────── الإرسال ─────────────────────────
  function send(text) {
    text = String(text || '').trim();
    if (!text || busy) return;
    busy = true;
    sendBtn.disabled = true;
    state.items.push({ role: 'user', text: text });
    render();
    showTyping(true);
    save();

    api('/message', { conversation_id: state.conversationId, device_id: state.deviceId, text: text })
      .then(function (r) {
        if (r.conversation_id) state.conversationId = r.conversation_id;
        var ui = r.ui || [];
        // نص الرد أولًا، ثم البطاقات والنماذج تحته، والأزرار السريعة في الآخر
        var added = [];
        var hasForm = ui.some(function (u) { return u.type === 'lead_form'; });
        if (r.reply && !hasForm) added.push({ role: 'bot', text: r.reply });
        ui.forEach(function (u) {
          added.push({ role: 'bot', ui: u });
        });
        if (!added.length) added.push({ role: 'bot', text: '...' });
        added[added.length - 1].chips = r.quick_replies || [];
        Array.prototype.push.apply(state.items, added);
      })
      .catch(function (e) {
        state.items.push({ role: 'bot', text: (e && e.message) || 'تعذر الاتصال. تحقق من الإنترنت وحاول مرة أخرى.', chips: [text.length < 40 ? text : 'إعادة المحاولة'] });
      })
      .then(function () {
        busy = false;
        sendBtn.disabled = false;
        showTyping(false);
        render();
        save();
      });
  }

  function api(path, payload) {
    if (CFG.mock) return Mock.handle(path, payload);
    return fetch(CFG.endpoint.replace(/\/$/, '') + path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(payload),
      credentials: 'same-origin'
    }).then(function (res) {
      return res.json().catch(function () { return {}; }).then(function (j) {
        if (res.status === 429) throw new Error('أرسلت رسائل كثيرة خلال وقت قصير. انتظر دقيقة ثم حاول.');
        if (!res.ok && !j.reply && !j.message) throw new Error('حدث خلل مؤقت. حاول بعد لحظات.');
        if (!res.ok && j.message && !j.reply) throw new Error(j.message);
        return j;
      });
    });
  }

  // ───────────────────────── التفاعل ─────────────────────────
  function open(text) {
    panel.classList.add('open');
    launcher.classList.add('hide-mobile');
    tease.style.display = 'none';
    try { sessionStorage.setItem('qvChat.teased', '1'); } catch (e) {}
    render();
    setTimeout(function () { input.focus(); }, 200);
    if (text) send(text);
  }
  function close() { panel.classList.remove('open'); launcher.classList.remove('hide-mobile'); }

  launcher.onclick = function () { panel.classList.contains('open') ? close() : open(); };
  tease.onclick = function () { open(); };
  closeBtn.onclick = close;
  resetBtn.onclick = function () {
    if (busy) return;
    state = { deviceId: state.deviceId, conversationId: null, items: [GREETING], handoff: false, savedAt: Date.now() };
    save(); render();
  };
  sendBtn.onclick = function () { var v = input.value; input.value = ''; autosize(); send(v); };
  input.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); sendBtn.onclick(); }
  });
  input.addEventListener('input', autosize);
  function autosize() { input.style.height = 'auto'; input.style.height = Math.min(120, input.scrollHeight) + 'px'; }
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && panel.classList.contains('open')) close(); });

  // تلميح بعد 12 ثانية لزائر جديد
  try {
    if (!sessionStorage.getItem('qvChat.teased') && state.items.length <= 1) {
      setTimeout(function () { if (!panel.classList.contains('open')) tease.style.display = 'block'; }, 12000);
    }
  } catch (e) {}

  window.QeemaChat = { open: open, close: close };

  // ───────────────────────── وضع تجريبي (بدون خادم) ─────────────────────────
  var Mock = {
    verified: false,
    used: 0,
    brief: {},
    shown: [],
    talents: [
      { code: 'QV-0102', name: 'نورة', gender: 'female', photo: '', sample_url: 'BEEP', dialects: ['sa_najdi', 'msa'], tones: ['واثق', 'دافئ'], price_per_minute_usd: 57, ai_price_per_minute_usd: 15, turnaround_days: 1, has_clone: true, verified_human: true, estimate: { minutes: 1, human_usd: 57, ai_usd: 15 } },
      { code: 'QV-0115', name: 'ريم', gender: 'female', photo: '', sample_url: 'BEEP', dialects: ['sa_hijazi', 'msa'], tones: ['ودود', 'حماسي'], price_per_minute_usd: 48, ai_price_per_minute_usd: null, turnaround_days: 2, has_clone: false, verified_human: true, estimate: { minutes: 1, human_usd: 48, ai_usd: null } },
      { code: 'QV-0140', name: 'فيصل', gender: 'male', photo: '', sample_url: 'BEEP', dialects: ['sa_najdi', 'msa'], tones: ['رسمي', 'واثق'], price_per_minute_usd: 65, ai_price_per_minute_usd: 14, turnaround_days: 2, has_clone: true, verified_human: true, estimate: { minutes: 1, human_usd: 65, ai_usd: 14 } },
      { code: 'QV-0101', name: 'سلطان', gender: 'male', photo: '', sample_url: 'BEEP', dialects: ['sa_najdi'], tones: ['فخم', 'واثق'], price_per_minute_usd: 76, ai_price_per_minute_usd: null, turnaround_days: 2, has_clone: false, verified_human: true, estimate: { minutes: 1, human_usd: 76, ai_usd: null } },
      { code: 'QV-0150', name: 'منى', gender: 'female', photo: '', sample_url: 'BEEP', dialects: ['eg'], tones: ['حماسي', 'ودود'], price_per_minute_usd: 40, ai_price_per_minute_usd: 10, turnaround_days: 1, has_clone: true, verified_human: true, estimate: { minutes: 1, human_usd: 40, ai_usd: 10 } },
      { code: 'QV-0151', name: 'كريم', gender: 'male', photo: '', sample_url: 'BEEP', dialects: ['eg'], tones: ['حماسي', 'واثق'], price_per_minute_usd: 42, ai_price_per_minute_usd: null, turnaround_days: 2, has_clone: false, verified_human: true, estimate: { minutes: 1, human_usd: 42, ai_usd: null } },
      { code: 'QV-0160', name: 'مريم', gender: 'female', photo: '', sample_url: 'BEEP', dialects: ['ae', 'msa'], tones: ['رسمي', 'هادئ'], price_per_minute_usd: 60, ai_price_per_minute_usd: 15, turnaround_days: 2, has_clone: true, verified_human: true, estimate: { minutes: 1, human_usd: 60, ai_usd: 15 } },
      { code: 'QV-0133', name: 'عبدالله', gender: 'male', photo: '', sample_url: 'BEEP', dialects: ['sa_najdi'], tones: ['حماسي', 'ودود'], price_per_minute_usd: 45, ai_price_per_minute_usd: 12, turnaround_days: 3, has_clone: true, verified_human: true, estimate: { minutes: 1, human_usd: 45, ai_usd: 12 } }
    ],
    handle: function (path, p) {
      var self = this;
      return new Promise(function (resolve) {
        setTimeout(function () { resolve(self.route(path, p)); }, path === '/message' ? 900 : 500);
      });
    },
    // يستخرج من رسالة العميل كل ما ذكره، كما يفعل الشات الحقيقي
    extract: function (t) {
      var b = this.brief;
      if (/إعلان|اعلان/.test(t)) b.use = /مؤسس|شرك/.test(t) ? 'إعلان مؤسسي' : 'إعلان';
      else if (/مؤسس|تعريفي/.test(t)) b.use = 'فيديو تعريفي';
      else if (/تعليم|دورة|درس/.test(t)) b.use = 'محتوى تعليمي';
      else if (/رد آلي|رد الي|IVR|سنترال/i.test(t)) b.use = 'رد آلي';
      else if (/بودكاست/.test(t)) b.use = 'بودكاست';
      if (/حجاز/.test(t)) b.dialect = 'سعودي حجازي';
      else if (/سعود|نجد/.test(t)) b.dialect = 'سعودي نجدي';
      else if (/إمارات|امارات/.test(t)) b.dialect = 'إماراتي';
      else if (/مصر/.test(t)) b.dialect = 'مصري';
      else if (/فصح/.test(t)) b.dialect = 'فصحى';
      if (/امرأة|امراة|نسائ|بنت|أنثى|انثى|مرأة/.test(t)) b.gender = 'female';
      else if (/رجل|رجال|ذكر|شاب/.test(t)) b.gender = 'male';
      else if (/لا فرق|أي صوت|اي صوت/.test(t)) b.gender = 'any';
      var tones = (t.match(/فخم|واثق|حماسي|رسمي|دافئ|ودود|هادئ/g) || []);
      if (tones.length) b.tones = tones;
      if (!b.tones && b.use) b.tones = { 'إعلان مؤسسي': ['رسمي', 'واثق'], 'فيديو تعريفي': ['رسمي', 'واثق'], 'إعلان': ['حماسي'], 'محتوى تعليمي': ['ودود', 'هادئ'], 'رد آلي': ['رسمي', 'هادئ'], 'بودكاست': ['ودود'] }[b.use];
    },
    route: function (path, p) {
      var cid = p.conversation_id || 'mock-' + Date.now();
      if (path === '/lead/start') return { status: 'code_sent' };
      if (path === '/lead/verify') { this.verified = true; return { status: 'verified' }; }
      var t = p.text;
      var R = function (reply, chips, ui) { return { conversation_id: cid, reply: reply, quick_replies: chips || [], ui: ui || [] }; };
      var code = (t.match(/QV-\d+/) || [])[0];
      var pool = this.shown.length ? this.shown : this.talents;
      var tal = this.talents.filter(function (x) { return x.code === code; })[0]
        || pool.filter(function (x) { return t.indexOf(x.name) > -1; })[0];
      var firstClone = pool.filter(function (x) { return x.has_clone; })[0] || this.talents[0];
      var self = this;
      var wa = function (summary) {
        var who = self.role === 'artist' ? 'معلق صوتي' : 'عميل';
        var url = 'https://wa.me/' + (CFG.whatsapp || '966500000000') + '?text=' + encodeURIComponent('مرحبًا، أنا ' + who + ' وتواصلت من شات قيمة فويس.\nرقم الطلب: QV-S-000017\n' + summary);
        return R('اضغط زر الواتساب أدناه، وسيرد عليك موظف من الدعم الفني للمنصة. ملخص طلبك مكتوب في الرسالة، فلا حاجة لإعادة الشرح.', [], [{ type: 'whatsapp', reference: 'QV-S-000017', url: url }]);
      };

      // تحديد نوع المستخدم — في أي لحظة من المحادثة
      var saysArtist = /معل[ّ]?ق|مؤد[ّ]?ي|أسجل بصوتي|اسجل بصوتي|صوتي للمنصة/.test(t) && !/أبحث عن|ابحث عن|ابي صوت|أبي صوت|أريد صوت|اريد صوت|أحتاج صوت|احتاج صوت/.test(t);
      var saysClient = /أبحث عن صوت|ابحث عن صوت|عميل|ابي|أبي|أريد صوت|اريد صوت|أحتاج|احتاج|إعلان|اعلان|مشروع|تعريفي|تعليم|بودكاست|رد آلي/.test(t);
      if (saysArtist && this.role !== 'artist') {
        this.role = 'artist';
        this.artist = {};
        // إذا ذكر أنه جديد أو يريد الانضمام أو مسجّل، لا نعيد السؤال
        if (!/انضم|الانضمام|جديد|أسجل|التسجيل|اسمي|مسجّل|مسجل|مشكلة|سؤال|أرباح/.test(t)) {
          return R('أهلًا بك. كيف يمكنني مساعدتك؟', ['أريد الانضمام', 'لدي سؤال', 'أواجه مشكلة']);
        }
      }
      if (!this.role) {
        if (!saysClient) return R('هل تبحث عن صوت لمشروعك، أم أنت معلق صوتي؟', ['أبحث عن صوت لمشروعي', 'أنا معلق صوتي']);
        this.role = 'client';
        if (/أبحث عن صوت|ابحث عن صوت|عميل/.test(t) && t.length < 30) return R('يسعدني أن أساعدك. ما نوع المحتوى الذي تحتاج له الصوت؟', ['إعلان', 'فيديو تعريفي', 'تعليم إلكتروني', 'رد آلي', 'بودكاست']);
      } else if (this.role === 'artist' && saysClient && /أبحث عن صوت|ابحث عن صوت|ابي صوت|أبي صوت|أريد صوت|اريد صوت|أحتاج صوت|احتاج صوت/.test(t)) {
        this.role = 'client';
      }

      if (this.role !== 'artist' && /فريق|موظف|شخص/.test(t)) {
        return wa('عميل يطلب التحدث مع موظف بخصوص طلبه.');
      }

      // ───── مسار المعلق ─────
      if (this.role === 'artist') {
        var A = this.artist = this.artist || {};
        var joinCard = { type: 'artist_join', signup_url: 'https://qeemavoice.com/ar', guide_url: 'https://qeemavoice.com/ar/guides', samples_rules_url: 'https://qeemavoice.com/ar/blogs/details/7-%D8%B4%D8%B1%D9%88%D8%B7_%D9%82%D8%A8%D9%88%D9%84_%D8%A7%D9%84%D8%B9%D9%8A%D9%86%D8%A7%D8%AA_%D8%A7%D9%84%D8%B5%D9%88%D8%AA%D9%8A%D8%A9_%D9%81%D9%8A_%D9%85%D9%86%D8%B5%D8%A9_%D9%82%D9%8A%D9%85%D8%A9_%D9%81%D9%88%D9%8A%D8%B3' };
        var helpCard = { type: 'artist_help', terms_url: 'https://qeemavoice.com/ar', blog_url: 'https://qeemavoice.com/ar/guides' };
        // مشكلة: وصف ثم طلب دعم (الرد خلال 48 ساعة)
        var ticket = function () {
          A.awaitingProblem = false;
          return R('وصل طلبك إلى فريق الدعم الفني، وسنرد عليك خلال 48 ساعة. هل لديك سؤال آخر؟', [], [{ type: 'ticket', reference: 'QV-T-000009' }]);
        };
        if (/أرسل طلب الدعم/.test(t)) return ticket();
        if (A.awaitingProblem) {
          if (!self.verified) return R('', [], [{ type: 'lead_form', for: 'artist_support', otp: true }]);
          return ticket();
        }
        if (/مشكلة|لم يصل|لم تصل|ما وصل|لا أستطيع|لا استطيع|خطأ|عطل/.test(t)) {
          A.registered = true;
          A.awaitingProblem = true;
          if (t.length < 25) return R('صف لي المشكلة في سطر واحد، وسأرسلها لفريق الدعم الفني.', []);
          if (!self.verified) return R('', [], [{ type: 'lead_form', for: 'artist_support', otp: true }]);
          return ticket();
        }
        if (/^لدي سؤال$|مسجّل|مسجل/.test(t)) {
          A.registered = true;
          return R('تفضل، ما سؤالك؟', ['كيف يعمل الاستنساخ؟', 'كيف تُحسب أرباحي؟']);
        }
        if (/أرباح|ربح|نسبة|نسبتي|الدفع|عقد|سحب/.test(t)) {
          A.registered = true;
          return R('تفاصيل الأرباح ونسبة المعلق ومواعيد الدفع موضحة في الشروط وسياسة الاستخدام. وإذا كانت لديك مشكلة في أرباح لم تصلك، فأخبرني وسأرسل طلب دعم.', ['أواجه مشكلة'], [helpCard]);
        }
        if (/استنساخ|أعرف أكثر|اعرف اكثر/.test(t)) {
          return R('الاستنساخ اختياري تمامًا، ولا يتم إلا بعقد مكتوب يحدد موافقتك ونطاق الاستخدام والمدة ونسبتك من كل استخدام لصوتك المستنسخ، ولك حق سحب الموافقة في أي وقت.\nفائدته أن العميل يسمع صوتك على نصه فورًا، فتزيد فرص حجزك، وتكسب أيضًا من استخدام نسختك الرقمية. والتفاصيل الكاملة في الشروط وسياسة الاستخدام.', A.registered ? ['كيف تُحسب أرباحي؟'] : [], [helpCard]);
        }
        if (!A.registered && A.shownJoin) {
          return R('شكرًا لك. بياناتك ولهجاتك وعيناتك تُضاف في حسابك عند التسجيل من زر «أنشئ حساب معلق» أعلاه. هل لديك سؤال عن المنصة أو الاستنساخ؟', ['كيف يعمل الاستنساخ؟']);
        }
        if (!A.registered) {
          A.shownJoin = true;
          return R('يسعدنا انضمامك. يتم الانضمام بإنشاء حساب معلق في المنصة، ثم إضافة عيناتك الصوتية من حسابك.\nالخطوات الكاملة في مقال «كيف أنضم إلى منصة قيمة فويس؟» أدناه.', ['كيف يعمل الاستنساخ؟'], [joinCard]);
        }
        return R('إجابة سؤالك تجدها بالتفصيل في الشروط وسياسة الاستخدام أو في مدونة الموقع. وإذا كانت لديك مشكلة فأخبرني وسأرسل طلب دعم.', ['أواجه مشكلة'], [helpCard]);
      }

      if (/حجز|شراء|اشتر|اطلب|أكمل الطلب/.test(t)) {
        tal = tal || this.picked || firstClone;
        if (!this.verified) { this.picked = tal; return R('', [], [{ type: 'lead_form', for: 'order', otp: true }]); }
        var ai = /AI/.test(t);
        return R(ai ? 'وصل طلبك. سيتواصل معك فريقنا عبر الواتساب برابط الدفع خلال ساعات العمل، ثم يصلك الملف الصوتي الكامل بعد الدفع. هل تحتاج شيئًا آخر؟'
                    : 'وصل طلبك إلى ' + tal.name + '، وسيُؤكَّد السعر النهائي وموعد التسليم. بعد ذلك يتواصل معك فريقنا عبر الواتساب برابط الدفع خلال ساعات العمل. هل تحتاج شيئًا آخر؟',
          ['لا، شكرًا', 'لدي مشروع آخر'], [{ type: 'order', reference: 'QV-R-000042', order_type: ai ? 'ai_clone' : 'human', name: tal.name }]);
      }
      if (/معاينة|اسمع|أكمل المعاينة/.test(t)) {
        tal = tal || this.picked || firstClone;
        this.picked = tal;
        if (!tal.has_clone) return R('العينة البشرية الحقيقية لـ' + tal.name + ' ظاهرة في البطاقة، أما المعاينة بصوته على نصك فغير متاحة بعد.', ['معاينة بصوت ' + firstClone.name], [{ type: 'sample', code: tal.code, name: tal.name, sample_url: 'BEEP' }]);
        if (!this.verified) return R('', [], [{ type: 'lead_form', for: 'preview', otp: true }]);
        if (this.used >= 3) return R('انتهت معايناتك المجانية. يمكنك حجز المعلق البشري، أو شراء نسخة AI للنص كاملًا.', ['احجز المعلق', 'اشترِ نسخة AI'], [{ type: 'quota', reason: 'lead_limit' }]);
        this.used++;
        return R('هذه معاينة تقريبية بالذكاء الاصطناعي لأول جزء من نصك، والتسجيل البشري النهائي أغنى في الأداء والإحساس. بقي لك ' + (3 - this.used) + ' من المعاينات المجانية.', ['اطلب المعلق الحقيقي', 'جرّب معلقًا آخر'],
          [{ type: 'preview', code: tal.code, name: tal.name, url: 'BEEP', remaining: 3 - this.used, trimmed: true, has_ai_price: tal.ai_price_per_minute_usd != null }]);
      }

      this.extract(t);
      var b = this.brief;
      // يسأل فقط عن الناقص
      if (!b.use) return R('لأي نوع من المحتوى تحتاج الصوت؟', ['إعلان', 'فيديو تعريفي', 'تعليم إلكتروني', 'رد آلي', 'بودكاست']);
      if (!b.dialect && !b.gender) return R('بأي لهجة تريد التسجيل، وهل تفضّل صوت رجل أم امرأة؟', ['سعودي، رجل', 'سعودي، امرأة', 'إماراتي', 'مصري', 'فصحى']);
      if (!b.dialect) return R('بأي لهجة تريد التسجيل؟', ['سعودي نجدي', 'سعودي حجازي', 'إماراتي', 'مصري', 'فصحى']);
      if (!b.gender) return R('هل تفضّل صوت رجل أم امرأة؟', ['رجل', 'امرأة', 'لا فرق']);

      var g = b.gender;
      var want = b.tones || [];
      var dcode = { 'سعودي نجدي': 'sa_najdi', 'سعودي حجازي': 'sa_hijazi', 'إماراتي': 'ae', 'مصري': 'eg', 'فصحى': 'msa' }[b.dialect];
      var dname = { 'سعودي نجدي': 'باللهجة النجدية', 'سعودي حجازي': 'باللهجة الحجازية', 'إماراتي': 'باللهجة الإماراتية', 'مصري': 'باللهجة المصرية', 'فصحى': 'بالفصحى' }[b.dialect];
      var fit = function (x) { return x.tones.filter(function (tn) { return want.indexOf(tn) > -1; }).length; };
      this.shown = this.talents.filter(function (x) { return (g === 'any' || x.gender === g) && x.dialects.indexOf(dcode) > -1; })
        .sort(function (a, c) { return fit(c) - fit(a); }).slice(0, 3);
      if (!this.shown.length) return R('لا يتوفر حاليًا في هذا العرض التجريبي صوت يطابق طلبك ' + dname + '. هل تجرّب لهجة قريبة؟', ['سعودي نجدي', 'فصحى']);
      var who = g === 'male' ? 'صوت رجل' : g === 'female' ? 'صوت امرأة' : 'صوتًا';
      var clone = this.shown.filter(function (x) { return x.has_clone; })[0];
      var reasons = this.shown.map(function (x) {
        return x.name + ': صوت ' + x.tones.join(' و') + (x.has_clone ? '، والمعاينة على نصك متاحة.' : '، وعينته البشرية في البطاقة.');
      }).join('\n');
      var note = b.dialect === 'سعودي نجدي' && !/نجد/.test(t) ? '\nاخترت النجدي، وإن أردت الحجازي فأخبرني.' : '';
      return R('فهمت أنك تريد ' + who + ' ' + dname + ' ل' + b.use + ' بأسلوب ' + want.join(' و') + '، وهذه أنسب الأصوات:\n' + reasons + note,
        clone ? ['معاينة بصوت ' + clone.name, 'نبرة مختلفة', 'سعودي حجازي'] : ['نبرة مختلفة'], [{ type: 'talents', items: this.shown }]);
    }
  };

  // نغمة تجريبية للوضع التجريبي فقط
  if (CFG.mock) {
    var wav = (function () {
      var sr = 8000, secs = 2, n = sr * secs, buf = new ArrayBuffer(44 + n * 2), v = new DataView(buf);
      function w(o, s) { for (var i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); }
      w(0, 'RIFF'); v.setUint32(4, 36 + n * 2, true); w(8, 'WAVEfmt '); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
      v.setUint32(24, sr, true); v.setUint32(28, sr * 2, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true); w(36, 'data'); v.setUint32(40, n * 2, true);
      for (var i = 0; i < n; i++) v.setInt16(44 + i * 2, Math.sin(i / sr * 2 * Math.PI * (330 + 110 * Math.sin(i / sr * 3))) * 6000 * Math.min(1, (n - i) / 800), true);
      return URL.createObjectURL(new Blob([buf], { type: 'audio/wav' }));
    })();
    var origPlayer = player;
    player = function (src, label, autoplay) { return origPlayer(src === 'BEEP' ? wav : src, label, autoplay); };
  }

  render();
})();
