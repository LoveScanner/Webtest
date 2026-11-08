(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const WA = '972526779001';

  // Year
  $('#year').textContent = new Date().getFullYear();

  // Sticky header shadow
  const header = $('.header');
  const onScroll = () => header.classList.toggle('scrolled', scrollY > 10);
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Close mobile menu after choosing a link
  const mm = $('#mobile-menu');
  $$('#mobile-menu a').forEach(a => a.addEventListener('click', () => mm.hidePopover?.()));

  // Active nav link
  const navLinks = $$('.nav a');
  const sections = navLinks.map(a => $(a.getAttribute('href'))).filter(Boolean);
  const navObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id));
      }
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  sections.forEach(s => navObs.observe(s));

  // Reveal fallback for browsers without scroll-driven animations
  if (!CSS.supports('animation-timeline: view()')) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: .12 });
    $$('.reveal').forEach(el => io.observe(el));
  }

  // Spotlight effect on service cards
  $$('.svc').forEach(card => card.addEventListener('pointermove', e => {
    const r = card.getBoundingClientRect();
    card.style.setProperty('--mx', `${e.clientX - r.left}px`);
    card.style.setProperty('--my', `${e.clientY - r.top}px`);
  }));

  // Lite YouTube embeds
  $$('.yt').forEach(btn => {
    const id = btn.dataset.id;
    btn.style.backgroundImage = `url(https://i.ytimg.com/vi/${id}/hqdefault.jpg)`;
    btn.addEventListener('click', () => {
      const f = document.createElement('iframe');
      f.src = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`;
      f.allow = 'accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; fullscreen';
      f.title = btn.getAttribute('aria-label') || 'וידאו';
      btn.replaceChildren(f);
      btn.style.cursor = 'default';
    }, { once: true });
  });

  // Toast
  const toast = $('#toast');
  let tt;
  const showToast = msg => {
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(tt);
    tt = setTimeout(() => toast.classList.remove('show'), 4200);
  };

  // Lead forms (demo – no backend yet)
  $$('.js-lead').forEach(form => form.addEventListener('submit', e => {
    e.preventDefault();
    if (!form.checkValidity()) { form.reportValidity(); return; }
    form.reset();
    showToast('תודה! 💜 הפרטים התקבלו (בגרסת ההדגמה הטופס עוד לא מחובר)');
  }));

  // Contact form → opens WhatsApp with a pre-filled message
  $$('.js-contact').forEach(form => form.addEventListener('submit', e => {
    e.preventDefault();
    if (!form.checkValidity()) { form.reportValidity(); return; }
    const d = Object.fromEntries(new FormData(form));
    const text = `היי אילה, אשמח שתחזרי אליי.\nשם: ${d.name}\nטלפון: ${d.phone}` +
      (d.email ? `\nאימייל: ${d.email}` : '') + (d.msg ? `\n\n${d.msg}` : '');
    open(`https://wa.me/${WA}?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
    showToast('פותחת עבורך הודעת וטסאפ מוכנה לשליחה');
  }));

  // ===== Self quiz =====
  const questions = [
    'האם את מרגישה לפעמים שאת "הולכת על קליפות ביצים" ליד בן הזוג שלך, כדי לא להצית כעס או שתיקה?',
    'האם את מקבלת לעיתים קרובות ביקורת שמקטינה אותך – גם על דברים קטנים?',
    'האם הוא גורם לך לפקפק בתחושות שלך, באינטואיציה שלך, או גורם לך להרגיש שאת "הבעיה"?',
    'האם קורה שהוא מתעלם ממך, מראה אדישות, או שותק ימים שלמים כעונש?',
    'האם הוא מנסה לשלוט בהחלטות שלך – כסף, חברויות, לבוש או כל תחום אישי אחר?',
    'האם הוא משתמש בדת ובהלכה כדי לשלוט בך בדרכים שונות וגם בחדרי חדרים?',
    'האם את מרגישה שאת משקיעה הרבה מאוד בקשר, אבל כמעט לא מקבלת אהבה או תמיכה בחזרה?',
    'האם את חווה ירידה בביטחון העצמי שלך מאז שאת בזוגיות הזו?',
    'האם יש בך פחד מתמיד לאבד אותו, למרות שאת סובלת מהקשר?',
    'האם את מרגישה לפעמים שאת הולכת לאיבוד בתוכו ושכבר קשה לך לזהות מי את באמת?',
    'האם את שואלת את עצמך לעיתים קרובות: "אולי אני מגזימה? אולי זו רק אני?"'
  ];
  const body = $('#quiz-body'), bar = $('#quiz-bar'), count = $('#quiz-count');
  let i = 0, yes = 0;

  const swap = fn => document.startViewTransition ? document.startViewTransition(fn) : fn();

  function renderQ() {
    count.textContent = `שאלה ${i + 1} מתוך ${questions.length}`;
    bar.style.width = `${(i / questions.length) * 100}%`;
    body.innerHTML = `
      <div class="q-anim">
        <p class="quiz-q">${questions[i]}</p>
        <div class="quiz-btns">
          <button class="btn" data-a="1">כן</button>
          <button class="btn btn-ghost" data-a="0">לא</button>
          ${i > 0 ? '<button class="btn btn-ghost" data-a="back" style="margin-inline-start:auto">→ חזרה</button>' : ''}
        </div>
      </div>`;
  }
  const answers = [];
  function renderResult() {
    bar.style.width = '100%';
    count.textContent = 'סיימת 💜';
    let title, text;
    if (yes >= 5) {
      title = 'הקול הפנימי שלך מנסה לומר לך משהו';
      text = 'ענית "כן" על רבות מהשאלות. ייתכן שאת נמצאת בקשר שפוגע בך יותר משהוא מצמיח אותך. את לא לבד, וזו לא אשמתך – ויש דרך לחזור לעצמך. אשמח לדבר איתך בשיחת ייעוץ ללא עלות.';
    } else if (yes >= 2) {
      title = 'יש כאן סימנים שכדאי להקשיב להם';
      text = 'חלק מהתשובות מעידות על דפוסים שמכבידים עלייך. הצעד הראשון הוא לזהות – ושיחה אחת יכולה לעשות סדר ולהחזיר בהירות.';
    } else {
      title = 'נשמע שיש לך בסיס טוב';
      text = 'זוגיות בריאה מתחילה בקשר שיש לך עם עצמך. אם בכל זאת משהו מציק לך – אני כאן לכל שאלה.';
    }
    body.innerHTML = `
      <div class="quiz-result q-anim">
        <div class="score">${yes}/${questions.length}</div>
        <h3>${title}</h3>
        <p>${text}</p>
        <div class="quiz-btns">
          <a class="btn btn-wa" href="https://wa.me/${WA}?text=${encodeURIComponent('היי אילה, מילאתי את השאלון באתר ואשמח לשיחת ייעוץ')}" target="_blank" rel="noopener">לשיחת ייעוץ ללא עלות</a>
          <button class="btn btn-ghost" data-a="restart">מילוי מחדש</button>
        </div>
        <p class="quiz-note">השאלון נועד לעזור לך להתבונן פנימה ואינו מהווה אבחון. התשובות אינן נשמרות ואינן נשלחות.</p>
      </div>`;
  }
  body.addEventListener('click', e => {
    const a = e.target.closest('[data-a]')?.dataset.a;
    if (!a) return;
    swap(() => {
      if (a === 'restart') { i = 0; yes = 0; answers.length = 0; renderQ(); return; }
      if (a === 'back') { i--; yes -= answers.pop(); renderQ(); return; }
      const v = +a; answers.push(v); yes += v; i++;
      i < questions.length ? renderQ() : renderResult();
    });
  });
  renderQ();

  // ===== Accessibility panel =====
  const root = document.documentElement;
  const KEY = 'a11y-prefs';
  let prefs = [];
  try { prefs = JSON.parse(localStorage.getItem(KEY) || '[]'); } catch {}
  const apply = () => {
    ['big', 'contrast', 'gray', 'links', 'readable'].forEach(k => root.classList.toggle('a11y-' + k, prefs.includes(k)));
    $$('#a11y-panel [data-a11y]').forEach(b => b.dataset.a11y !== 'reset' && b.setAttribute('aria-pressed', prefs.includes(b.dataset.a11y)));
    try { localStorage.setItem(KEY, JSON.stringify(prefs)); } catch {}
  };
  $$('#a11y-panel [data-a11y]').forEach(b => b.addEventListener('click', () => {
    const k = b.dataset.a11y;
    prefs = k === 'reset' ? [] : prefs.includes(k) ? prefs.filter(p => p !== k) : [...prefs, k];
    apply();
  }));
  apply();
})();
