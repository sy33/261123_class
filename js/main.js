// ===== 예식 정보 (여기만 수정하면 달력/D-day가 바뀝니다) =====
const WEDDING_DATE = new Date(2027, 3, 17, 13, 0); // 월은 0부터 시작 (3 = 4월)
const GUESTBOOK_KEY = 'wedding-guestbook';

// ===== 토스트 메시지 =====
const toast = document.getElementById('toast');
let toastTimer;

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2000);
}

// ===== 클립보드 복사 =====
async function copyText(text, message = '복사되었습니다') {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    // clipboard API를 못 쓰는 환경(file:// 등) 대비
    const temp = document.createElement('textarea');
    temp.value = text;
    document.body.appendChild(temp);
    temp.select();
    document.execCommand('copy');
    temp.remove();
  }
  showToast(message);
}

document.querySelectorAll('[data-copy]').forEach((btn) => {
  btn.addEventListener('click', () => copyText(btn.dataset.copy));
});

document.getElementById('shareBtn').addEventListener('click', () => {
  copyText(location.href, '청첩장 링크가 복사되었습니다');
});

// ===== 달력 =====
function renderCalendar() {
  const year = WEDDING_DATE.getFullYear();
  const month = WEDDING_DATE.getMonth();
  const weddingDay = WEDDING_DATE.getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const lastDate = new Date(year, month + 1, 0).getDate();
  const weekdays = ['일', '월', '화', '수', '목', '금', '토'];

  let html = `<p class="calendar-month">${year}년 ${month + 1}월</p>`;
  html += '<div class="calendar-grid">';

  weekdays.forEach((w, i) => {
    html += `<div class="weekday ${i === 0 ? 'sun' : ''}">${w}</div>`;
  });

  for (let i = 0; i < firstDay; i++) {
    html += '<div class="day"></div>';
  }

  for (let d = 1; d <= lastDate; d++) {
    const isSunday = (firstDay + d - 1) % 7 === 0;
    const classes = ['day'];
    if (isSunday) classes.push('sun');
    if (d === weddingDay) classes.push('wedding');
    html += `<div class="${classes.join(' ')}"><span>${d}</span></div>`;
  }

  html += '</div>';
  document.getElementById('calendar').innerHTML = html;
}

// ===== D-day =====
function renderDday() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(WEDDING_DATE);
  target.setHours(0, 0, 0, 0);
  const diff = Math.round((target - today) / (1000 * 60 * 60 * 24));
  const el = document.getElementById('dday');

  if (diff > 0) {
    el.innerHTML = `민준 ♥ 수연의 결혼식이 <strong>${diff}일</strong> 남았습니다`;
  } else if (diff === 0) {
    el.innerHTML = '<strong>오늘</strong>은 민준 ♥ 수연의 결혼식 날입니다';
  } else {
    el.innerHTML = `민준 ♥ 수연이 함께한 지 <strong>${-diff}일</strong>째입니다`;
  }
}

// ===== 갤러리 라이트박스 =====
const lightbox = document.getElementById('lightbox');
const lightboxContent = document.getElementById('lightboxContent');

document.getElementById('gallery').addEventListener('click', (e) => {
  const item = e.target.closest('.gallery-item, img');
  if (!item) return;
  lightboxContent.innerHTML = '';
  lightboxContent.appendChild(item.cloneNode(true));
  lightbox.classList.add('open');
  lightbox.setAttribute('aria-hidden', 'false');
});

function closeLightbox() {
  lightbox.classList.remove('open');
  lightbox.setAttribute('aria-hidden', 'true');
}

lightbox.addEventListener('click', (e) => {
  if (e.target === lightbox || e.target.classList.contains('lightbox-close')) {
    closeLightbox();
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeLightbox();
});

// ===== 계좌 아코디언 =====
document.querySelectorAll('.accordion').forEach((acc) => {
  const header = acc.querySelector('.accordion-header');
  const body = acc.querySelector('.accordion-body');
  header.addEventListener('click', () => {
    const isOpen = acc.classList.toggle('open');
    body.style.maxHeight = isOpen ? body.scrollHeight + 'px' : '0';
  });
});

// ===== 방명록 (브라우저 localStorage에 저장) =====
function loadGuestbook() {
  try {
    return JSON.parse(localStorage.getItem(GUESTBOOK_KEY)) || [];
  } catch {
    return [];
  }
}

function saveGuestbook(entries) {
  try {
    localStorage.setItem(GUESTBOOK_KEY, JSON.stringify(entries));
  } catch {
    // 저장이 막힌 환경에서는 무시
  }
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function renderGuestbook() {
  const list = document.getElementById('guestList');
  const entries = loadGuestbook();

  if (entries.length === 0) {
    list.innerHTML = '<li class="empty">첫 번째 축하 메시지를 남겨주세요 🌸</li>';
    return;
  }

  list.innerHTML = entries
    .map(
      (entry) => `
      <li>
        <div class="guest-head">
          <span class="guest-name">${escapeHtml(entry.name)}</span>
          <span class="guest-date">${entry.date}</span>
        </div>
        <p class="guest-msg">${escapeHtml(entry.message)}</p>
      </li>`
    )
    .join('');
}

document.getElementById('guestForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const nameInput = document.getElementById('guestName');
  const msgInput = document.getElementById('guestMessage');
  const name = nameInput.value.trim();
  const message = msgInput.value.trim();
  if (!name || !message) return;

  const now = new Date();
  const date = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')}`;

  const entries = loadGuestbook();
  entries.unshift({ name, message, date });
  saveGuestbook(entries);
  renderGuestbook();

  nameInput.value = '';
  msgInput.value = '';
  showToast('축하 메시지가 등록되었습니다');
});

// ===== 스크롤 페이드인 =====
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15 }
);

document.querySelectorAll('.fade-in').forEach((el) => observer.observe(el));

// ===== 초기 실행 =====
renderCalendar();
renderDday();
renderGuestbook();
