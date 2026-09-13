  // ---------- CONTACT CHOICE (WhatsApp vs form) ----------
  (function () {
    const choiceWrap = document.getElementById('contact-choice');
    const waBtn = document.getElementById('choice-wa');
    const formBtn = document.getElementById('choice-form');
    const panelWa = document.getElementById('panel-wa');
    const panelForm = document.getElementById('panel-form');
    const backWa = document.getElementById('back-from-wa');
    const backForm = document.getElementById('back-from-form');

    if (!choiceWrap) return;

    function showPanel(panel) {
      choiceWrap.hidden = true;
      panelWa.hidden = panel !== 'wa';
      panelForm.hidden = panel !== 'form';
    }
    function showChoice() {
      choiceWrap.hidden = false;
      panelWa.hidden = true;
      panelForm.hidden = true;
    }

    waBtn.addEventListener('click', function () { showPanel('wa'); });
    formBtn.addEventListener('click', function () { showPanel('form'); });
    backWa.addEventListener('click', showChoice);
    backForm.addEventListener('click', showChoice);
  })();

  // ---------- LEAD FORM (Google Sheets via Apps Script) ----------
  const LEAD_FORM_ENDPOINT = "https://sheetdb.io/api/v1/bwvuinll3a90g";

  const leadForm = document.getElementById('lead-form');
  if (leadForm) {
    leadForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const statusEl = document.getElementById('lead-status');
      const submitBtn = document.getElementById('lead-submit');

      if (LEAD_FORM_ENDPOINT.indexOf('PASTE_YOUR') === 0) {
        statusEl.hidden = false;
        statusEl.className = 'lead-status err';
        statusEl.textContent = "Form isn't connected yet — see GOOGLE-SHEETS-SETUP.md.";
        return;
      }

      const payload = {
        data: {
          timestamp: new Date().toISOString(),
          name: document.getElementById('lead-name').value,
          contact: document.getElementById('lead-contact').value,
          projectType: document.getElementById('lead-type').value,
          message: document.getElementById('lead-message').value
        }
      };

      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending...';

      fetch(LEAD_FORM_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
        .then(function (res) {
          if (!res.ok) throw new Error('bad response');
          statusEl.hidden = false;
          statusEl.className = 'lead-status ok';
          statusEl.textContent = "Got it — I'll reply soon!";
          leadForm.reset();
        })
        .catch(function () {
          statusEl.hidden = false;
          statusEl.className = 'lead-status err';
          statusEl.textContent = 'Something went wrong — try WhatsApp instead.';
        })
        .finally(function () {
          submitBtn.disabled = false;
          submitBtn.innerHTML = 'Send it over <svg class="icon" style="color:#fff;"><use href="#icon-rocket"/></svg>';
        });
    });
  }

  // simple pop-in on scroll for anything not already visible on load
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{
      if(e.isIntersecting){
        e.target.style.animationPlayState = 'running';
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.15 });
  document.querySelectorAll('section:not(.hero) .pop').forEach(el=>{
    el.style.animationPlayState = 'paused';
    io.observe(el);
  });

  // count-up flex stats
  const statEls = document.querySelectorAll('.flex-card .num');
  const statIo = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{
      if(e.isIntersecting){
        const el = e.target;
        const target = parseInt(el.dataset.count, 10);
        const dur = 1100;
        const start = performance.now();
        function tick(now){
          const p = Math.min((now - start) / dur, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.round(eased * target);
          if(p < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
        statIo.unobserve(el);
      }
    });
  }, { threshold: 0.4 });
  statEls.forEach(el => statIo.observe(el));

  // confetti burst on "Say hello"
  (function(){
    const canvas = document.getElementById('confetti-canvas');
    if(!canvas) return;
    const ctx = canvas.getContext('2d');
    function resize(){ canvas.width = innerWidth; canvas.height = innerHeight; }
    resize(); window.addEventListener('resize', resize);
    const colors = ['#FF6B6B','#FFCB3D','#4FD1A5','#4D96FF','#A66CFF'];
    let particles = [];
    function burst(x, y){
      for(let i=0;i<70;i++){
        const angle = Math.random()*Math.PI*2;
        const speed = 4 + Math.random()*7;
        particles.push({
          x, y,
          vx: Math.cos(angle)*speed,
          vy: Math.sin(angle)*speed - 3,
          size: 5 + Math.random()*5,
          color: colors[Math.floor(Math.random()*colors.length)],
          rot: Math.random()*360,
          vr: (Math.random()-0.5)*14,
          life: 0
        });
      }
    }
    function loop(){
      ctx.clearRect(0,0,canvas.width,canvas.height);
      particles.forEach(p=>{
        p.vy += 0.18; p.x += p.vx; p.y += p.vy; p.rot += p.vr; p.life++;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot * Math.PI/180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size/2, -p.size/2, p.size, p.size*0.6);
        ctx.restore();
      });
      particles = particles.filter(p => p.life < 110 && p.y < canvas.height + 40);
      requestAnimationFrame(loop);
    }
    loop();

    const btn = document.getElementById('say-hello-btn');
    if(btn){
      btn.addEventListener('click', function(e){
        e.preventDefault();
        const r = btn.getBoundingClientRect();
        burst(r.left + r.width/2, r.top + r.height/2);
        const href = btn.getAttribute('href');
        setTimeout(()=>{ window.open(href, '_blank', 'noopener'); }, 380);
      });
    }
  })();

  // rotating headline word
  (function(){
    const el = document.getElementById('rotword');
    if(!el) return;
    const words = ['fun little apps','banger apps','chaotic-good apps','apps that actually ship','the occasional 3am fix'];
    let i = 0;
    setInterval(()=>{
      i = (i + 1) % words.length;
      el.style.transition = 'opacity .25s ease, transform .25s ease';
      el.style.opacity = 0;
      el.style.transform = 'translateY(6px)';
      setTimeout(()=>{
        el.textContent = words[i];
        el.style.opacity = 1;
        el.style.transform = 'translateY(0)';
      }, 250);
    }, 2200);
  })();

  // cursor sparkle trail
  (function(){
    let last = 0;
    window.addEventListener('pointermove', (e)=>{
      const now = performance.now();
      if(now - last < 90) return;
      last = now;
      const s = document.createElement('span');
      s.className = 'sparkle';
      const hue = ['#FF6B6B','#FFCB3D','#4FD1A5','#4D96FF','#A66CFF'][Math.floor(Math.random()*5)];
      s.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" style="fill:'+hue+'"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>';
      s.style.left = (e.clientX - 7) + 'px';
      s.style.top = (e.clientY - 7) + 'px';
      document.body.appendChild(s);
      setTimeout(()=> s.remove(), 950);
    });
  })();

  // aura meter
  (function(){
    const countEl = document.getElementById('aura-count');
    const btn = document.getElementById('aura-btn');
    if(!countEl || !btn) return;
    let aura = 9000;
    const milestoneMsgs = { 9010:'Nice!', 9050:'Certified vibes', 9100:'Aura maxed', 9200:'Legendary status' };
    btn.addEventListener('click', ()=>{
      aura += 1;
      countEl.textContent = aura;
      countEl.style.transform = 'scale(1.35)';
      setTimeout(()=> countEl.style.transform = 'scale(1)', 150);
      if(milestoneMsgs[aura]){
        btn.textContent = milestoneMsgs[aura];
        setTimeout(()=> btn.textContent = '+1 Aura', 1400);
      }
    });
    countEl.style.transition = 'transform .15s cubic-bezier(.2,1.4,.4,1)';
  })();

  // 3D tilt on work cards
  document.querySelectorAll('.work-card').forEach(card=>{
    card.addEventListener('mousemove', (e)=>{
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      card.style.transform = `perspective(700px) rotateX(${(-y*10).toFixed(2)}deg) rotateY(${(x*12).toFixed(2)}deg) translateZ(0)`;
    });
    card.addEventListener('mouseleave', ()=>{
      card.style.transform = '';
    });
  });

  // template wizard: step 1 (app type) -> step 2 (design style) -> full-page live preview + WhatsApp handoff
  (function(){
    const modal = document.getElementById('tpl-modal');
    const modalInner = document.getElementById('tpl-modal-inner');
    const root = document.getElementById('tvfull-root');
    const input = document.getElementById('tpl-name-input');
    const closeBtn = document.getElementById('tpl-close');
    const waCta = document.getElementById('tpl-whatsapp-cta');
    const step1 = document.getElementById('wiz-step1');
    const step2 = document.getElementById('wiz-step2');
    const backBtn = document.getElementById('wiz-back-1');
    const typeLabelEl = document.getElementById('wiz-type-label');
    if(!modal || !root || !step1 || !step2) return;

    const badgeIcon = document.getElementById('tpl-badge-icon');
    const badgeLabel = document.getElementById('tpl-badge-label');

    const STYLES = {
      editorial: 'Editorial',
      modern:    'Modern',
      premium:   'Premium',
      playful:   'Playful',
      seo:       'SEO / Clean'
    };

    const TYPES = {
      portfolio: {
        label:'Portfolio', icon:'icon-star', heroImg:'images/hero-portfolio.jpg',
        nav:['Work','About','Contact'], kicker:'Personal Portfolio',
        title:"Hi, I'm {name} — I design & build things",
        sub:'A selection of recent projects, skills, and how to get in touch.',
        cta:'View my work',
        highlights:[
          {icon:'icon-rocket',t:'Fast delivery',d:'Projects shipped quickly, without cutting corners.'},
          {icon:'icon-sparkle',t:'Clean design',d:'Every project gets a distinct, considered look.'},
          {icon:'icon-message',t:'Easy to reach',d:'One message on WhatsApp and we can talk.'}
        ],
        contentType:'grid', contentTitle:'Selected work',
        items:[
          {label:'App Design', img:'images/portfolio-1.jpg'},
          {label:'Web Design', img:'images/portfolio-2.jpg'},
          {label:'Branding', img:'images/portfolio-3.jpg'},
          {label:'Dashboard UI', img:'images/portfolio-4.jpg'}
        ],
        aboutTitle:'About {name}',
        aboutText:'A short bio goes here — background, focus areas, and what makes the work distinct.',
        footer:'Based in Lahore, Pakistan · Open for freelance work'
      },
      shop: {
        label:'Shop / E-commerce', icon:'icon-box', heroImg:'images/hero-shop.jpg',
        nav:['Shop','Collections','Cart','Contact'], kicker:'Online Store',
        title:'New drops at {name}',
        sub:'Thrifted, preloved & new — shop the full collection online.',
        cta:'Shop now',
        highlights:[
          {icon:'icon-box',t:'COD available',d:'Pay when your order arrives at the door.'},
          {icon:'icon-rocket',t:'Fast dispatch',d:'Orders packed and shipped within 24 hours.'},
          {icon:'icon-message',t:'WhatsApp support',d:'Questions on sizing or stock? Just message.'}
        ],
        contentType:'grid', contentTitle:'New arrivals',
        items:[
          {label:'Hoodie', img:'images/shop-1.jpg'},
          {label:'Sneakers', img:'images/shop-2.jpg'},
          {label:'Denim', img:'images/shop-3.jpg'},
          {label:'Tote Bag', img:'images/shop-4.jpg'}
        ],
        aboutTitle:'About {name}',
        aboutText:'What the store sells, who it is for, and why customers keep coming back.',
        footer:'Cash on delivery · Easypaisa · Bank transfer'
      },
      restaurant: {
        label:'Restaurant & Menu', icon:'icon-message', heroImg:'images/hero-restaurant.jpg',
        nav:['Menu','Order','Locations','Contact'], kicker:'Restaurant',
        title:'{name} — fresh, every day',
        sub:'Order online or visit us in store.',
        cta:'See full menu',
        highlights:[
          {icon:'icon-message',t:'WhatsApp ordering',d:'Order directly, no app download needed.'},
          {icon:'icon-rocket',t:'Fast delivery',d:'Hot food, delivered within the hour.'},
          {icon:'icon-star',t:'Loved locally',d:'A regular spot for the neighborhood.'}
        ],
        contentType:'menu', contentTitle:'Popular picks',
        items:[['Chicken Karahi','Rs 850'],['Beef Biryani','Rs 450'],['Fresh Lassi','Rs 150'],['Seekh Kabab','Rs 350']],
        aboutTitle:'About {name}',
        aboutText:'The story behind the kitchen, the cuisine, and what makes the menu special.',
        footer:'Open daily · Dine-in & delivery'
      },
      salon: {
        label:'Salon & Booking', icon:'icon-scissors', heroImg:'images/hero-salon.jpg',
        nav:['Services','Book','Team','Contact'], kicker:'Salon & Booking',
        title:'Book your slot at {name}',
        sub:'Pick a time, walk in, walk out looking sharp.',
        cta:'Book now',
        highlights:[
          {icon:'icon-scissors',t:'Skilled stylists',d:'Experienced barbers & stylists on every shift.'},
          {icon:'icon-rocket',t:'No waiting',d:'Slot-based booking means no more sitting around.'},
          {icon:'icon-message',t:'Reminders',d:'Get a WhatsApp reminder before your appointment.'}
        ],
        contentType:'slots', contentTitle:"Today's open slots",
        items:['10:00 AM','11:30 AM','2:00 PM','4:30 PM'],
        aboutTitle:'About {name}',
        aboutText:'Services offered, years in business, and what clients can expect.',
        footer:'Walk-ins welcome · Appointments preferred'
      },
      gym: {
        label:'Gym & Fitness', icon:'icon-dumbbell', heroImg:'images/hero-gym.jpg',
        nav:['Classes','Membership','Trainers','Contact'], kicker:'Gym & Fitness',
        title:'This week at {name}',
        sub:'Reserve your spot — limited mats per class.',
        cta:'Reserve a class',
        highlights:[
          {icon:'icon-dumbbell',t:'Certified trainers',d:'Every class led by a qualified coach.'},
          {icon:'icon-rocket',t:'Flexible plans',d:'Daily passes, monthly and yearly memberships.'},
          {icon:'icon-message',t:'Easy booking',d:'Reserve your class slot over WhatsApp.'}
        ],
        contentType:'slots', contentTitle:"This week's classes",
        items:['Strength · 7 AM','HIIT · 6 PM','Yoga · 8 PM','Boxing · 9 PM'],
        aboutTitle:'About {name}',
        aboutText:'The space, the equipment, and the community training there.',
        footer:'Open 6 AM – 11 PM · 7 days a week'
      },
      clinic: {
        label:'Clinic & Health', icon:'icon-heart-pulse', heroImg:'images/hero-clinic.jpg',
        nav:['Services','Book Visit','Doctors','Contact'], kicker:'Clinic & Health',
        title:'{name} — services & fees',
        sub:'Message us on WhatsApp to request an appointment.',
        cta:'Book a visit',
        highlights:[
          {icon:'icon-heart-pulse',t:'Qualified staff',d:'Licensed doctors and trained support staff.'},
          {icon:'icon-rocket',t:'Quick appointments',d:'Most requests confirmed within the hour.'},
          {icon:'icon-message',t:'Follow-up reminders',d:'Never miss a follow-up visit again.'}
        ],
        contentType:'menu', contentTitle:'Services & fees',
        items:[['General Consultation','Rs 1500'],['Follow-up Visit','Rs 800'],['Lab Test Referral','Rs 500'],['Vaccination','Rs 1200']],
        aboutTitle:'About {name}',
        aboutText:'Specialties, years of practice, and the approach to patient care.',
        footer:'Open Mon–Sat · Emergency line available'
      },
      realestate: {
        label:'Real Estate', icon:'icon-home', heroImg:'images/hero-realestate.jpg',
        nav:['Listings','Sell','Agents','Contact'], kicker:'Real Estate',
        title:'New listings from {name}',
        sub:'Browse properties, message the agent directly.',
        cta:'View listings',
        highlights:[
          {icon:'icon-home',t:'Verified listings',d:'Every property visited and verified in person.'},
          {icon:'icon-rocket',t:'Fast responses',d:'Agents typically reply within the hour.'},
          {icon:'icon-message',t:'Direct contact',d:'Message the listing agent on WhatsApp.'}
        ],
        contentType:'grid', contentTitle:'Featured properties',
        items:[
          {label:'Modern House', img:'images/realestate-1.jpg'},
          {label:'Apartment Complex', img:'images/realestate-2.jpg'},
          {label:'Cozy Interior', img:'images/realestate-3.jpg'},
          {label:'New Listing', img:'images/realestate-4.jpg'}
        ],
        aboutTitle:'About {name}',
        aboutText:'Areas covered, years in the market, and how deals get done.',
        footer:'DHA · Bahria Town · Model Town coverage'
      }
    };

    let currentType = null;
    let currentStyle = null;

    function esc(s){ return String(s).replace(/[&<>]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[c])); }

    function renderPreview(type){
      const t = TYPES[type];
      if(!t) return;
      const name = esc(input.value.trim() || 'Your Business');
      const nameSpan = '<span class="bind-name">'+name+'</span>';

      const highlightsHtml = t.highlights.map(h =>
        '<div class="tvfull-hl"><span class="tvfull-hl-ico"><svg class="icon"><use href="#'+h.icon+'"/></svg></span><b>'+h.t+'</b><p>'+h.d+'</p></div>'
      ).join('');

      let contentHtml = '';
      if(t.contentType === 'grid'){
        contentHtml = '<div class="tvfull-grid">' + t.items.map(i =>
          '<div class="tvfull-card"><div class="tvfull-imgbox" style="background-image:url(\''+i.img+'\')"></div><span>'+i.label+'</span></div>'
        ).join('') + '</div>';
      } else if(t.contentType === 'menu'){
        contentHtml = '<div class="tvfull-menu">' + t.items.map(([n,p]) =>
          '<div class="tvfull-menurow"><span>'+n+'</span><span>'+p+'</span></div>'
        ).join('') + '</div>';
      } else if(t.contentType === 'slots'){
        contentHtml = '<div class="tvfull-slots">' + t.items.map(s =>
          '<span class="tvfull-slot">'+s+'</span>'
        ).join('') + '</div>';
      }

      const heroStyle = t.heroImg
        ? ' style="background-image:linear-gradient(180deg, rgba(20,16,10,.25), rgba(10,8,6,.72)), url(\''+t.heroImg+'\')"'
        : '';
      const heroClass = t.heroImg ? 'tvfull-hero has-photo' : 'tvfull-hero';

      root.innerHTML =
        '<nav class="tvfull-nav"><span class="tvfull-brand">'+nameSpan+'</span><span class="tvfull-navlinks">'+t.nav.join(' · ')+'</span></nav>'+
        '<div class="'+heroClass+'"'+heroStyle+'>'+
          '<span class="tvfull-kicker">'+t.kicker+'</span>'+
          '<h2 class="tvfull-title">'+t.title.replace('{name}', nameSpan)+'</h2>'+
          '<p class="tvfull-sub">'+t.sub+'</p>'+
          '<span class="tvfull-cta-btn">'+t.cta+'</span>'+
        '</div>'+
        '<div class="tvfull-highlights">'+highlightsHtml+'</div>'+
        '<div class="tvfull-section">'+
          '<h3 class="tvfull-sectitle">'+t.contentTitle+'</h3>'+
          contentHtml+
        '</div>'+
        '<div class="tvfull-about">'+
          '<h3 class="tvfull-sectitle">'+t.aboutTitle.replace('{name}', nameSpan)+'</h3>'+
          '<p>'+t.aboutText+'</p>'+
        '</div>'+
        '<div class="tvfull-footer">'+nameSpan+' · '+t.footer+'</div>';
    }

    function updateWaLink(){
      const name = input.value.trim() || 'my business';
      const t = TYPES[currentType];
      const styleLabel = STYLES[currentStyle] || '';
      const msg = encodeURIComponent('Hi Abdulrehman, I checked out the ' + (t ? t.label : 'website') + ' (' + styleLabel + ' style) template for "' + name + '" and I want a website like this!');
      waCta.href = 'https://wa.me/923148433928?text=' + msg;
    }

    // step 1: choose app type
    document.querySelectorAll('.type-card').forEach(card=>{
      card.addEventListener('click', ()=>{
        currentType = card.dataset.type;
        document.querySelectorAll('.type-card').forEach(c => c.classList.toggle('selected', c === card));
        if(typeLabelEl) typeLabelEl.textContent = (TYPES[currentType] || {}).label || currentType;
        step2.hidden = false;
        step2.scrollIntoView({ behavior:'smooth', block:'start' });
      });
    });
    if(backBtn){
      backBtn.addEventListener('click', ()=>{
        step2.hidden = true;
        step1.scrollIntoView({ behavior:'smooth', block:'start' });
      });
    }

    // step 2: choose style -> opens the full-page live preview
    document.querySelectorAll('.style-card').forEach(card=>{
      card.addEventListener('click', ()=> openModal(currentType, card.dataset.style));
    });

    function openModal(type, style){
      if(!type || !TYPES[type]) return;
      currentType = type;
      currentStyle = style;
      const t = TYPES[type];
      if(modalInner) modalInner.dataset.style = style;
      if(badgeIcon) badgeIcon.innerHTML = '<use href="#'+t.icon+'"/>';
      if(badgeLabel) badgeLabel.textContent = t.label + ' · ' + (STYLES[style] || '');
      input.value = '';
      renderPreview(type);
      updateWaLink();
      modal.classList.add('open');
      document.body.style.overflow = 'hidden';
      if(root) root.scrollTop = 0;
      setTimeout(()=> input.focus(), 150);
    }
    function closeModal(){
      modal.classList.remove('open');
      document.body.style.overflow = '';
    }
    closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e)=>{ if(e.target === modal) closeModal(); });
    document.addEventListener('keydown', (e)=>{ if(e.key === 'Escape' && modal.classList.contains('open')) closeModal(); });
    input.addEventListener('input', ()=>{ renderPreview(currentType); updateWaLink(); });
  })();

  // mobile nav toggle
  (function(){
    const btn = document.getElementById('nav-toggle');
    const links = document.getElementById('nav-links');
    if(!btn || !links) return;
    btn.addEventListener('click', ()=>{
      const open = links.classList.toggle('open');
      btn.innerHTML = open
        ? '<svg class="icon"><use href="#icon-x"/></svg>'
        : '<svg class="icon"><use href="#icon-menu"/></svg>';
    });
    links.querySelectorAll('a').forEach(a => a.addEventListener('click', ()=>{
      links.classList.remove('open');
      btn.innerHTML = '<svg class="icon"><use href="#icon-menu"/></svg>';
    }));
  })();

  // highlight current page in nav
  (function(){
    const path = location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-links a[data-page]').forEach(a=>{
      if(a.dataset.page === path) a.classList.add('active');
    });
  })();