// Scroll progress bar
const progressFill = document.getElementById('progressFill');
function updateProgress(){
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
  progressFill.style.width = pct + '%';
}
window.addEventListener('scroll', updateProgress, { passive: true });
updateProgress();

// Reveal on scroll
const revealEls = document.querySelectorAll('.reveal');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function drawSchematic(root){
  root.querySelectorAll('.draw-line').forEach(path => {
    const len = path.getTotalLength();
    path.style.strokeDasharray = len;
    path.style.strokeDashoffset = len;
    requestAnimationFrame(() => {
      path.style.transition = 'stroke-dashoffset 1.1s ease';
      path.style.strokeDashoffset = '0';
    });
  });
}

if (reduceMotion || !('IntersectionObserver' in window)) {
  revealEls.forEach(el => el.classList.add('is-visible'));
} else {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        drawSchematic(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  revealEls.forEach(el => observer.observe(el));
}

// Mobile nav toggle
const navToggle = document.getElementById('navToggle');
const siteNav = document.getElementById('siteNav');
navToggle.addEventListener('click', () => {
  const isOpen = siteNav.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', isOpen);
});
siteNav.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    siteNav.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  });
});

// Work stage: center card with smaller neighbors on each side (loops)
const stage = document.getElementById('workStage');
if (stage) {
  const slides = [...stage.querySelectorAll('.work-slide')];
  const prevBtn = document.getElementById('carouselPrev');
  const nextBtn = document.getElementById('carouselNext');
  const dots = [...document.getElementById('carouselDots').querySelectorAll('.dot')];
  let current = slides.findIndex(s => s.classList.contains('is-active'));
  if (current === -1) current = 0;

  function render(){
    const n = slides.length;
    slides.forEach((s, i) => {
      const isActive = i === current;
      s.classList.toggle('is-active', isActive);
      s.classList.toggle('is-prev', i === (current - 1 + n) % n);
      s.classList.toggle('is-next', i === (current + 1) % n);
      s.inert = !isActive;
    });
    dots.forEach((d, i) => d.classList.toggle('active', i === current));
  }

  function goTo(i){
    current = (i + slides.length) % slides.length;
    render();
  }

  prevBtn.addEventListener('click', () => goTo(current - 1));
  nextBtn.addEventListener('click', () => goTo(current + 1));
  dots.forEach((d, i) => {
    d.addEventListener('click', () => goTo(i));
    d.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); goTo(i); } });
  });

  // Drag / swipe left or right to change slides
  const SWIPE_THRESHOLD = 60;
  let startX = null, dx = 0;
  stage.addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return;
    startX = e.clientX;
    dx = 0;
  });
  stage.addEventListener('pointermove', (e) => {
    if (startX === null) return;
    dx = e.clientX - startX;
    if (!stage.classList.contains('is-dragging') && Math.abs(dx) > 5) {
      stage.classList.add('is-dragging');
      stage.setPointerCapture(e.pointerId);
    }
    if (stage.classList.contains('is-dragging')) {
      stage.style.setProperty('--drag', `${dx}px`);
    }
  });
  function endDrag(){
    if (startX === null) return;
    startX = null;
    stage.style.setProperty('--drag', '0px');
    stage.classList.remove('is-dragging');
    if (dx < -SWIPE_THRESHOLD) goTo(current + 1);
    else if (dx > SWIPE_THRESHOLD) goTo(current - 1);
  }
  stage.addEventListener('pointerup', endDrag);
  stage.addEventListener('pointercancel', endDrag);
  // Don't open a link when the pointer was released at the end of a drag;
  // otherwise a click on a side card brings it to the center
  stage.addEventListener('click', (e) => {
    if (Math.abs(dx) > 5) { e.preventDefault(); e.stopPropagation(); return; }
    const rect = slides[current].getBoundingClientRect();
    if (e.clientX < rect.left) goTo(current - 1);
    else if (e.clientX > rect.right) goTo(current + 1);
  }, true);
  stage.addEventListener('dragstart', (e) => e.preventDefault());

  render();
}

// Footer year
document.getElementById('year').textContent = new Date().getFullYear();
