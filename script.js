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

// Work carousel
const carousel = document.getElementById('workCarousel');
if (carousel) {
  const cards = [...carousel.querySelectorAll('.project-card')];
  const prevBtn = document.getElementById('carouselPrev');
  const nextBtn = document.getElementById('carouselNext');
  const dots = [...document.getElementById('carouselDots').querySelectorAll('.dot')];

  function cardOffset(i){ return cards[i].offsetLeft - carousel.offsetLeft; }

  function currentIndex(){
    let idx = 0, minDist = Infinity;
    cards.forEach((c, i) => {
      const dist = Math.abs(cardOffset(i) - carousel.scrollLeft);
      if (dist < minDist) { minDist = dist; idx = i; }
    });
    return idx;
  }

  function goTo(i){
    carousel.scrollTo({ left: cardOffset(i), behavior: reduceMotion ? 'auto' : 'smooth' });
  }

  function updateControls(){
    const idx = currentIndex();
    dots.forEach((d, i) => d.classList.toggle('active', i === idx));
    prevBtn.disabled = idx === 0;
    nextBtn.disabled = idx === cards.length - 1;
  }

  prevBtn.addEventListener('click', () => goTo(Math.max(0, currentIndex() - 1)));
  nextBtn.addEventListener('click', () => goTo(Math.min(cards.length - 1, currentIndex() + 1)));
  dots.forEach((d, i) => {
    d.addEventListener('click', () => goTo(i));
    d.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); goTo(i); } });
  });
  carousel.addEventListener('scroll', () => requestAnimationFrame(updateControls), { passive: true });
}

// Footer year
document.getElementById('year').textContent = new Date().getFullYear();
