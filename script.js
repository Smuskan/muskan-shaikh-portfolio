const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

const progressBar = document.querySelector('.scroll-progress');
if (progressBar) {
  let progressQueued = false;
  const updateScrollProgress = () => {
    const pageHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = pageHeight > 0 ? Math.min(1, Math.max(0, window.scrollY / pageHeight)) : 0;
    progressBar.style.transform = `scaleX(${progress})`;
    progressBar.setAttribute('aria-valuenow', String(Math.round(progress * 100)));
    progressQueued = false;
  };
  const queueScrollProgress = () => {
    if (progressQueued) return;
    progressQueued = true;
    requestAnimationFrame(updateScrollProgress);
  };
  window.addEventListener('scroll', queueScrollProgress, { passive: true });
  window.addEventListener('resize', queueScrollProgress, { passive: true });
  updateScrollProgress();
}

const assignStaggerIndices = (containerSelector, childSelector) => {
  document.querySelectorAll(containerSelector).forEach(container => {
    container.querySelectorAll(childSelector).forEach((child, index) => child.style.setProperty('--i', index));
  });
};
assignStaggerIndices('.tag-row', 'span');
assignStaggerIndices('.cert-list', 'article');
assignStaggerIndices('.other-projects', '.mini-project');
assignStaggerIndices('.beyond-grid', '.leadership-item');

const skillData = {
  languages: { label: 'LANGUAGES', items: ['Java', 'Python'], note: 'The building blocks I use to turn a clear idea into working software.', project: 'Flight Price Prediction', href: '#projects' },
  frontend: { label: 'FRONTEND', items: ['HTML', 'CSS', 'JavaScript', 'React.js'], note: 'Interfaces that make useful functionality feel clear and approachable.', project: 'Grocerz · React.js', href: 'resume.html#experience' },
  backend: { label: 'BACKEND & APIs', items: ['Spring Boot', 'REST APIs', 'Flask'], note: 'Connecting the interface to the logic and data behind a product.', project: 'Flight Price Prediction · Flask', href: '#projects' },
  data: { label: 'DATABASES & SERVICES', items: ['MySQL', 'MongoDB', 'Firebase'], note: 'Persisting and serving the information an application needs.', project: 'M-Learning · Firebase', href: '#projects' },
  cloud: { label: 'CLOUD & DEVOPS', items: ['AWS', 'Docker', 'Linux'], note: 'Tools for packaging, running and understanding software systems.', project: 'Flight Price Prediction', href: '#projects' },
  ml: { label: 'MACHINE LEARNING', items: ['Machine Learning', 'scikit-learn'], note: 'Exploring how data can support more informed predictions.', project: 'Flight Price Prediction', href: '#projects' },
  other: { label: 'OTHER', items: ['Android Development', 'API Integration'], note: 'Building for mobile and bringing services together into a useful whole.', project: 'M-Learning · Android', href: '#projects' }
};

const tabs = [...document.querySelectorAll('.skill-tab')];
tabs.forEach(tab => tab.id = `tab-${tab.dataset.skill}`);
function renderSkill(key) {
  const data = skillData[key];
  if (!data) return;
  tabs.forEach(tab => {
    const selected = tab.dataset.skill === key;
    tab.classList.toggle('active', selected);
    tab.setAttribute('aria-selected', String(selected));
    tab.tabIndex = selected ? 0 : -1;
  });
  document.querySelector('#skill-label').textContent = data.label;
  document.querySelector('#skill-panel').setAttribute('aria-labelledby', `tab-${key}`);
  document.querySelector('#skill-chips').innerHTML = data.items.map(item => `<span>${item}</span>`).join('');
  document.querySelector('#skill-note').textContent = data.note;
  const link = document.querySelector('#skill-project');
  link.textContent = `Explore ${data.project} ↗`;
  link.href = data.href;
}
const skillPanel = document.querySelector('#skill-panel');
let skillSwapTimer;
function selectSkill(key, animate = true) {
  if (!skillData[key]) return;
  clearTimeout(skillSwapTimer);
  if (!animate || reduceMotion) {
    skillPanel.classList.remove('is-switching');
    renderSkill(key);
    assignStaggerIndices('#skill-chips', 'span');
    return;
  }
  skillPanel.classList.add('is-switching');
  skillSwapTimer = setTimeout(() => {
    renderSkill(key);
    assignStaggerIndices('#skill-chips', 'span');
    requestAnimationFrame(() => requestAnimationFrame(() => skillPanel.classList.remove('is-switching')));
  }, 120);
}
tabs.forEach((tab, index) => {
  tab.addEventListener('click', () => selectSkill(tab.dataset.skill));
  tab.addEventListener('keydown', event => {
    if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (index + (event.key === 'ArrowDown' ? 1 : -1) + tabs.length) % tabs.length;
    tabs[next].focus();
    selectSkill(tabs[next].dataset.skill);
  });
});
selectSkill('languages', false);

const menuButton = document.querySelector('.menu-toggle');
const mobileMenu = document.querySelector('#mobile-menu');
menuButton.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') !== 'true';
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  mobileMenu.hidden = !open;
});
mobileMenu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  mobileMenu.hidden = true;
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Open navigation');
}));

const caseTimers = new WeakMap();
const caseVersions = new WeakMap();
function setCasePanel(panel, open) {
  if (!panel) return;
  clearTimeout(caseTimers.get(panel));
  const version = (caseVersions.get(panel) || 0) + 1;
  caseVersions.set(panel, version);
  const trigger = document.querySelector(`.case-trigger[data-case="${panel.id.replace('case-', '')}"]`);
  if (trigger) {
    trigger.setAttribute('aria-expanded', String(open));
    const mark = trigger.querySelector('span');
    if (mark) mark.textContent = open ? '−' : '＋';
  }
  if (open) {
    panel.hidden = false;
    panel.inert = false;
    panel.setAttribute('aria-hidden', 'false');
    panel.classList.remove('is-open');
    panel.style.maxHeight = '0px';
    if (reduceMotion) {
      panel.classList.add('is-open');
      panel.style.maxHeight = 'none';
      panel.scrollIntoView({ behavior: 'auto', block: 'nearest' });
      return;
    }
    requestAnimationFrame(() => {
      if (caseVersions.get(panel) !== version || panel.hidden || panel.inert) return;
      panel.classList.add('is-open');
      panel.style.maxHeight = `${panel.scrollHeight}px`;
    });
    caseTimers.set(panel, setTimeout(() => {
      if (caseVersions.get(panel) !== version || !panel.classList.contains('is-open')) return;
      panel.style.maxHeight = 'none';
      panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 430));
    return;
  }
  if (panel.hidden) return;
  panel.inert = true;
  panel.setAttribute('aria-hidden', 'true');
  if (reduceMotion) {
    panel.hidden = true;
    panel.classList.remove('is-open');
    panel.style.removeProperty('max-height');
      if (trigger && panel.contains(document.activeElement)) trigger.focus();
    return;
  }
  panel.style.maxHeight = `${panel.scrollHeight}px`;
  panel.offsetHeight;
  requestAnimationFrame(() => {
    if (caseVersions.get(panel) !== version || panel.hidden) return;
    panel.classList.remove('is-open');
    panel.style.maxHeight = '0px';
  });
  caseTimers.set(panel, setTimeout(() => {
    if (caseVersions.get(panel) !== version || panel.classList.contains('is-open')) return;
    panel.hidden = true;
    panel.style.removeProperty('max-height');
    if (trigger && panel.contains(document.activeElement)) trigger.focus();
  }, 430));
}
document.querySelectorAll('.case-trigger').forEach(button => button.addEventListener('click', () => {
  const panel = document.querySelector(`#${button.getAttribute('aria-controls')}`);
  const opening = button.getAttribute('aria-expanded') !== 'true';
  document.querySelectorAll('.case-panel').forEach(item => setCasePanel(item, opening && item === panel));
}));
document.querySelectorAll('.case-close').forEach(button => button.addEventListener('click', () => setCasePanel(button.closest('.case-panel'), false)));

document.querySelector('#year').textContent = new Date().getFullYear();

if ('IntersectionObserver' in window && !reduceMotion) {
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  }), { threshold: .12 });
  document.querySelectorAll('.section-heading, .section-intro, .skill-detail, .education-item, .project-card, .mini-project, .beyond-card, .cert-list article').forEach(element => {
    element.classList.add('reveal');
    observer.observe(element);
  });
}

if ('IntersectionObserver' in window && !reduceMotion) {
  const countObserver = new IntersectionObserver(entries => entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const element = entry.target;
    countObserver.unobserve(element);
    const valueNode = element.querySelector('.count-up-value');
    const end = Number(element.dataset.count);
    const decimals = Number(element.dataset.decimals || 0);
    const pad = Number(element.dataset.pad || 0);
    if (!valueNode || !Number.isFinite(end)) return;
    const start = performance.now();
    const duration = 1050;
    const update = now => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      valueNode.textContent = (end * eased).toFixed(decimals).padStart(pad, '0');
      if (progress < 1) requestAnimationFrame(update);
      else valueNode.textContent = end.toFixed(decimals).padStart(pad, '0');
    };
    valueNode.textContent = (0).toFixed(decimals).padStart(pad, '0');
    requestAnimationFrame(update);
  }), { threshold: .65 });
  document.querySelectorAll('.count-up').forEach(element => countObserver.observe(element));
}

if (!reduceMotion && matchMedia('(hover: hover) and (pointer: fine)').matches) {
  document.querySelectorAll('.magnetic').forEach(button => {
    button.addEventListener('pointermove', event => {
      const rect = button.getBoundingClientRect();
      const x = (event.clientX - rect.left - rect.width / 2) * .08;
      const y = (event.clientY - rect.top - rect.height / 2) * .12;
      button.style.transform = `translate(${x}px, ${y}px)`;
    });
    button.addEventListener('pointerleave', () => button.style.transform = '');
  });
  document.querySelectorAll('.project-card.featured').forEach(card => {
    card.addEventListener('pointermove', event => {
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;
      const rotateX = (0.5 - y) * 12;
      const rotateY = (x - 0.5) * 12;
      card.style.setProperty('--tilt-x', `${rotateX}deg`);
      card.style.setProperty('--tilt-y', `${rotateY}deg`);
      card.style.setProperty('--pointer-x', `${x * 100}%`);
      card.style.setProperty('--pointer-y', `${y * 100}%`);
    });
    card.addEventListener('pointerleave', () => {
      card.style.removeProperty('--tilt-x');
      card.style.removeProperty('--tilt-y');
      card.style.removeProperty('--pointer-x');
      card.style.removeProperty('--pointer-y');
    });
  });
  const scene = document.querySelector('.hero-scene');
  document.querySelector('.hero').addEventListener('pointermove', event => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX / rect.width - .5) * 5;
    const y = (event.clientY / rect.height - .5) * 4;
    scene.style.transform = `translate(${x}px, ${y}px)`;
  });
  document.querySelector('.hero').addEventListener('pointerleave', () => scene.style.transform = '');
}


const navLinks = [...document.querySelectorAll('.desktop-nav a, .mobile-menu a[href^="#"]')];
const navSections = [...new Set(navLinks.map(link => document.querySelector(link.getAttribute('href'))).filter(Boolean))];
if ('IntersectionObserver' in window) {
  const activeNavObserver = new IntersectionObserver(entries => {
    const current = entries.filter(entry => entry.isIntersecting).sort((a,b) => b.intersectionRatio-a.intersectionRatio)[0];
    if (!current) return;
    navLinks.forEach(link => {
      const active = link.getAttribute('href') === `#${current.target.id}`;
      if (link.closest('.desktop-nav')) {
        link.classList.toggle('is-active', active);
        if (active) link.setAttribute('aria-current','location'); else link.removeAttribute('aria-current');
      }
    });
  }, { rootMargin: '-28% 0px -58% 0px', threshold: [0, .15, .35, .6] });
  navSections.forEach(section => activeNavObserver.observe(section));
}
