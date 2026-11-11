/* Mobile navigation */
const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav-links');

if (menuButton && nav) {
  menuButton.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    menuButton.setAttribute('aria-expanded', String(isOpen));
    menuButton.textContent = isOpen ? '×' : '☰';
  });

  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      nav.classList.remove('open');
      menuButton.setAttribute('aria-expanded', 'false');
      menuButton.textContent = '☰';
    });
  });
}

const year = document.getElementById('year');
if (year) year.textContent = new Date().getFullYear();

/* Reveal content only when the browser supports IntersectionObserver. */
const revealItems = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window && revealItems.length) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  revealItems.forEach((item) => revealObserver.observe(item));
}

/* A small decorative portrait moves to the opposite edge as sections change. */
const companion = document.getElementById('avatarCompanion');
const pageSections = [
  { id: 'work', position: 'position-right' },
  { id: 'about', position: 'position-left' },
  { id: 'approach', position: 'position-right' },
  { id: 'contact', position: 'position-left' }
];

if (companion && 'IntersectionObserver' in window) {
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const section = pageSections.find((item) => item.id === entry.target.id);
      companion.classList.remove('position-left', 'position-center', 'position-right');
      companion.classList.add(section ? section.position : 'position-right', 'is-visible');
    });
  }, { rootMargin: '-30% 0px -35% 0px', threshold: 0 });

  pageSections.forEach(({ id }) => {
    const section = document.getElementById(id);
    if (section) sectionObserver.observe(section);
  });

  const hero = document.getElementById('home');
  if (hero) {
    const heroObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) companion.classList.remove('is-visible');
      });
    }, { threshold: 0.18 });
    heroObserver.observe(hero);
  }
}

/* The supplied portrait is a single flat image: tilt the whole portrait gently,
   rather than pretending that its eyes or head are independently rigged. */
const avatarStage = document.getElementById('avatarStage');
const avatarWrap = document.getElementById('avatarWrap');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(pointer: fine)').matches;

if (avatarStage && avatarWrap && !reduceMotion && finePointer) {
  let pointerX = 0;
  let pointerY = 0;
  let scrollFactor = 0;
  let frame = 0;

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  const render = () => {
    frame = 0;
    const x = pointerX * 10;
    const y = pointerY * -5 + scrollFactor * -12;
    const rotateX = pointerY * -2.5;
    const rotateY = pointerX * 4;
    avatarWrap.style.transform =
      `translate3d(${x}px, ${y}px, 0) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  };

  const scheduleRender = () => {
    if (!frame) frame = requestAnimationFrame(render);
  };

  document.addEventListener('pointermove', (event) => {
    pointerX = clamp((event.clientX / window.innerWidth - 0.5) * 2, -1, 1);
    pointerY = clamp((event.clientY / window.innerHeight - 0.5) * 2, -1, 1);
    scheduleRender();
  }, { passive: true });

  document.addEventListener('pointerleave', () => {
    pointerX = 0;
    pointerY = 0;
    scheduleRender();
  });

  const updateScroll = () => {
    const rect = avatarStage.getBoundingClientRect();
    scrollFactor = clamp(
      (window.innerHeight - rect.top) / (window.innerHeight + rect.height), 0, 1
    );
    scheduleRender();
  };

  window.addEventListener('scroll', updateScroll, { passive: true });
  window.addEventListener('resize', updateScroll);
  updateScroll();
}
