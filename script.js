// ==========================================================
// Khun San Wai — Resume site interactions
// ==========================================================

document.addEventListener('DOMContentLoaded', () => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const progressBar = document.getElementById('scrollProgress');
  function updateProgress(){
    if(!progressBar) return;
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    progressBar.style.width = pct + '%';
  }
  updateProgress();
  window.addEventListener('scroll', updateProgress, { passive: true });
  window.addEventListener('resize', updateProgress);

  const codeEl = document.getElementById('typedCode');

  const codeLines = [
    { text: "const developer = {", type: "punc" },
    { text: "  name: ", type: "prop", tail: "\"Khun San Wai\",", tailType: "str" },
    { text: "  role: ", type: "prop", tail: "\"Full-Stack (Frontend-focused)\",", tailType: "str" },
    { text: "  based: ", type: "prop", tail: "\"Daegu, Korea\",", tailType: "str" },
    { text: "  loves: ", type: "prop", tail: "[\"React\", \"UI craft\", \"detail\"],", tailType: "str" },
    { text: "  status: ", type: "prop", tail: "\"open to work\"", tailType: "str" },
    { text: "};", type: "punc" }
  ];

  async function typeText(el, text, speed){
    for(let i=0;i<text.length;i++){
      el.textContent += text[i];
      await new Promise(r => setTimeout(r, speed));
    }
  }

  async function typeCode(){
    if(!codeEl) return;

    if(prefersReducedMotion){
      codeEl.innerHTML = codeLines.map(l => {
        const head = `<span class="tok-${l.type}">${l.text}</span>`;
        const tail = l.tail ? `<span class="tok-${l.tailType}">${l.tail}</span>` : '';
        return head + tail;
      }).join('\n');
      return;
    }

    codeEl.textContent = '';
    for(const line of codeLines){
      const headSpan = document.createElement('span');
      headSpan.className = `tok-${line.type}`;
      codeEl.appendChild(headSpan);
      await typeText(headSpan, line.text, 26);

      if(line.tail){
        const tailSpan = document.createElement('span');
        tailSpan.className = `tok-${line.tailType}`;
        codeEl.appendChild(tailSpan);
        await typeText(tailSpan, line.tail, 20);
      }
      codeEl.appendChild(document.createTextNode('\n'));
      await new Promise(r => setTimeout(r, 90));
    }
  }

  typeCode();

  const revealEls = document.querySelectorAll('.reveal');
  if('IntersectionObserver' in window){
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if(entry.isIntersecting){
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('is-visible'));
  }

  const langRings = document.querySelectorAll('.lang-ring');
  const langRingsSvg = document.querySelector('.lang-rings');
  langRings.forEach(ring => {
    const r = parseFloat(ring.getAttribute('r'));
    const circumference = 2 * Math.PI * r;
    ring.style.strokeDasharray = String(circumference);
    ring.style.strokeDashoffset = String(circumference);
    ring.dataset.circumference = String(circumference);
  });

  function fillLangRings(){
    langRings.forEach(ring => {
      const value = parseFloat(ring.getAttribute('data-value')) || 0;
      const circumference = parseFloat(ring.dataset.circumference);
      const target = circumference - (circumference * value / 100);
      requestAnimationFrame(() => {
        ring.style.strokeDashoffset = String(target);
      });
    });
  }

  if(langRingsSvg && 'IntersectionObserver' in window){
    const ringIo = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if(entry.isIntersecting){
          fillLangRings();
          ringIo.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });
    ringIo.observe(langRingsSvg);
  } else {
    fillLangRings();
  }

  const burger = document.getElementById('navBurger');
  const mobileMenu = document.getElementById('mobileMenu');
  if(burger && mobileMenu){
    burger.addEventListener('click', () => {
      const isOpen = mobileMenu.classList.toggle('open');
      burger.setAttribute('aria-expanded', String(isOpen));
    });
    mobileMenu.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        mobileMenu.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
      });
    });
  }

  const yearEl = document.getElementById('year');
  if(yearEl) yearEl.textContent = new Date().getFullYear();

  const caseHeads = document.querySelectorAll('.case__head');

  function setCaseHeight(article, detail){
    if(article.getAttribute('data-open') === 'true'){
      detail.style.maxHeight = detail.scrollHeight + 'px';
    }
  }

  caseHeads.forEach(head => {
    const article = head.closest('.case');
    const detailId = head.getAttribute('aria-controls');
    const detail = document.getElementById(detailId);

    head.addEventListener('click', () => {
      const isOpen = article.getAttribute('data-open') === 'true';

      if(isOpen){
        detail.style.maxHeight = '0px';
        article.setAttribute('data-open', 'false');
        head.setAttribute('aria-expanded', 'false');
      } else {
        article.setAttribute('data-open', 'true');
        head.setAttribute('aria-expanded', 'true');
        detail.style.maxHeight = detail.scrollHeight + 'px';
      }
    });

    window.addEventListener('resize', () => setCaseHeight(article, detail));
  });

  if(document.fonts && document.fonts.ready){
    document.fonts.ready.then(() => {
      document.querySelectorAll('.case').forEach(article => {
        const head = article.querySelector('.case__head');
        const detail = document.getElementById(head.getAttribute('aria-controls'));
        setCaseHeight(article, detail);
      });
    });
  }

  const navEl = document.getElementById('nav');
  const navLinks = document.querySelectorAll('.nav__links a[href^="#"]');
  const scrollDots = document.querySelectorAll('.scroll-dot');
  const spySections = Array.from(navLinks)
    .map(link => document.querySelector(link.getAttribute('href')))
    .filter(Boolean);

  function updateActiveLink(){
    const navHeight = navEl ? navEl.offsetHeight : 0;
    const scrollPos = window.scrollY + navHeight + 8;

    let currentId = null;
    spySections.forEach(section => {
      if(section.offsetTop <= scrollPos){
        currentId = section.id;
      }
    });

    navLinks.forEach(link => {
      link.classList.toggle('active', !!currentId && link.getAttribute('href') === '#' + currentId);
    });
    scrollDots.forEach(dot => {
      dot.classList.toggle('active', !!currentId && dot.dataset.dot === currentId);
    });
  }

  updateActiveLink();
  window.addEventListener('scroll', updateActiveLink, { passive: true });
  window.addEventListener('resize', updateActiveLink);
});