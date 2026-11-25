// =========================================================
// MELLOW BEAN — 인터랙션
// =========================================================

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ----- 1. 히어로 타이핑 효과 -----
const typingEl = document.getElementById('typing');
const fullText = typingEl.dataset.text;

if (reduceMotion) {
  typingEl.textContent = fullText;
} else {
  let i = 0;
  const type = () => {
    typingEl.textContent = fullText.slice(0, ++i);
    if (i < fullText.length) setTimeout(type, 120);
  };
  setTimeout(type, 600);
}

// ----- 2. 스크롤 시 상단 메뉴 배경 변경 + 히어로 패럴랙스 -----
const nav = document.getElementById('nav');
const heroBg = document.getElementById('heroBg');
let ticking = false;

const onScroll = () => {
  const y = window.scrollY;
  nav.classList.toggle('is-scrolled', y > 60);
  if (!reduceMotion && y < window.innerHeight) {
    heroBg.style.transform = `translateY(${y * 0.4}px)`;
  }
  ticking = false;
};

window.addEventListener('scroll', () => {
  if (!ticking) {
    requestAnimationFrame(onScroll);
    ticking = true;
  }
}, { passive: true });
onScroll();

// ----- 3. 모바일 햄버거 메뉴 -----
const navToggle = document.getElementById('navToggle');

const setMenu = (open) => {
  nav.classList.toggle('is-open', open);
  document.body.classList.toggle('no-scroll', open);
  navToggle.setAttribute('aria-expanded', open);
  navToggle.setAttribute('aria-label', open ? '메뉴 닫기' : '메뉴 열기');
};

navToggle.addEventListener('click', () => setMenu(!nav.classList.contains('is-open')));
// 메뉴 항목을 누르면 닫기
document.querySelectorAll('.nav__links a').forEach(a => a.addEventListener('click', () => setMenu(false)));
// ESC 키로 닫기
document.addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });
// 화면을 넓히면(태블릿/데스크톱) 자동으로 닫기
window.matchMedia('(min-width: 768px)').addEventListener('change', e => { if (e.matches) setMenu(false); });

// ----- 4. 스크롤하면 요소가 나타나는 효과 -----
const targets = document.querySelectorAll('.reveal, .slide-left, .slide-right');

if (reduceMotion || !('IntersectionObserver' in window)) {
  targets.forEach(el => el.classList.add('is-visible'));
} else {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });
  targets.forEach(el => observer.observe(el));
}
