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

// Footer year
document.getElementById('year').textContent = new Date().getFullYear();
