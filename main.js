(() => {
  const root = document.documentElement;
  root.classList.add('js');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Ano no rodapé */
  const ano = document.getElementById('ano');
  if (ano) ano.textContent = new Date().getFullYear();

  /* Header ao rolar + CTA fixo no mobile */
  const header = document.querySelector('.site-header');
  const sticky = document.querySelector('.sticky-cta');
  const hero = document.querySelector('.hero');
  const aplicar = document.getElementById('aplicar');
  let ticking = false;
  const onScroll = () => {
    const y = window.scrollY;
    header.classList.toggle('is-scrolled', y > 24);
    if (sticky && hero && aplicar) {
      const pastHero = y > hero.offsetHeight * 0.8;
      const atForm = aplicar.getBoundingClientRect().top < window.innerHeight * 0.9;
      sticky.classList.toggle('is-visible', pastHero && !atForm);
    }
    ticking = false;
  };
  window.addEventListener('scroll', () => {
    if (!ticking) { requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });
  onScroll();

  /* Menu mobile */
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.getElementById('menu');
  const setMenu = (open) => {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    nav.classList.toggle('is-open', open);
    header.classList.toggle('menu-open', open);
  };
  toggle.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
  nav.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && nav.classList.contains('is-open')) { setMenu(false); toggle.focus(); }
  });

  /* Link ativo na navegação */
  const links = [...nav.querySelectorAll('a[href^="#"]:not(.btn)')];
  const sections = links.map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);
  if ('IntersectionObserver' in window) {
    const navObs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          links.forEach(a => a.classList.toggle('is-active', a.getAttribute('href') === '#' + entry.target.id));
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(s => navObs.observe(s));
  }

  /* Revelação ao rolar (com escalonamento por grupo) */
  const reveals = document.querySelectorAll('.reveal');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    reveals.forEach(el => el.classList.add('is-visible'));
  } else {
    // escalonamento de 60ms entre irmãos em grids
    document.querySelectorAll('.cards, .bonus-grid, .pillars, .steps, .quotes, .hero-copy').forEach(group => {
      [...group.querySelectorAll(':scope > .reveal')].forEach((el, i) => el.style.setProperty('--delay', `${i * 60}ms`));
    });
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) { entry.target.classList.add('is-visible'); obs.unobserve(entry.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    reveals.forEach(el => obs.observe(el));
  }

  /* Contadores do hero */
  const counters = document.querySelectorAll('[data-count]');
  const fmt = new Intl.NumberFormat('pt-BR');
  if (!reduceMotion && 'IntersectionObserver' in window) {
    const cObs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const end = +el.dataset.count;
        const suffix = el.dataset.suffix || '';
        const start = performance.now();
        const dur = 1400;
        const tick = (now) => {
          const p = Math.min((now - start) / dur, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          el.textContent = fmt.format(Math.round(end * eased)) + suffix;
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
        cObs.unobserve(el);
      });
    }, { threshold: 0.6 });
    counters.forEach(el => cObs.observe(el));
  }

  /* Formulário de aplicação */
  const form = document.getElementById('apply-form');
  if (!form) return;
  const status = form.querySelector('.form-status');

  // Máscara simples de telefone BR
  const whats = form.querySelector('#f-whats');
  whats.addEventListener('input', () => {
    const d = whats.value.replace(/\D/g, '').slice(0, 11);
    let out = d;
    if (d.length > 2) out = `(${d.slice(0, 2)}) ${d.slice(2)}`;
    if (d.length > 7) out = `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
    whats.value = out;
  });

  const rules = {
    nome: v => v.trim().split(/\s+/).length >= 2 || 'Informe seu nome e sobrenome.',
    whatsapp: v => v.replace(/\D/g, '').length >= 10 || 'Informe um WhatsApp com DDD, ex.: (11) 91234-5678.',
    email: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) || 'Informe um e-mail válido, ex.: nome@empresa.com.',
    faturamento: v => !!v || 'Selecione a faixa de faturamento mensal.',
  };

  const validateField = (input) => {
    const rule = rules[input.name];
    if (!rule) return true;
    const result = rule(input.value);
    const field = input.closest('.field');
    const err = field.querySelector('.field-error');
    const ok = result === true;
    field.classList.toggle('has-error', !ok);
    input.setAttribute('aria-invalid', String(!ok));
    err.textContent = ok ? '' : result;
    return ok;
  };

  form.querySelectorAll('input, select').forEach(input => {
    input.addEventListener('blur', () => { if (input.value) validateField(input); });
    input.addEventListener('input', () => { if (input.closest('.field').classList.contains('has-error')) validateField(input); });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const inputs = [...form.querySelectorAll('input[name], select[name]')];
    const invalid = inputs.filter(i => !validateField(i));
    if (invalid.length) { invalid[0].focus(); status.textContent = ''; return; }

    const numero = (form.dataset.whatsapp || '').replace(/\D/g, '');
    status.className = 'form-status';
    if (numero.length < 12) {
      status.textContent = 'O número de WhatsApp de destino ainda não foi configurado no site.';
      console.warn('Defina data-whatsapp no <form id="apply-form"> com DDI + DDD + número, ex.: 5511912345678');
      return;
    }

    const d = Object.fromEntries(new FormData(form));
    const linhas = [
      'Olá, Sérgio! Quero aplicar para a *Mentoria Multiplicador Empresarial*.',
      '',
      `*Nome:* ${d.nome.trim()}`,
      `*WhatsApp:* ${d.whatsapp}`,
      `*E-mail:* ${d.email.trim()}`,
    ];
    if (d.empresa && d.empresa.trim()) linhas.push(`*Empresa:* ${d.empresa.trim()}`);
    linhas.push(`*Faturamento mensal:* ${d.faturamento}`, '', 'Gostaria de agendar meu diagnóstico individual.');

    const url = `https://wa.me/${numero}?text=${encodeURIComponent(linhas.join('\n'))}`;
    // Abre de forma síncrona ao clique para não ser bloqueado como pop-up
    const win = window.open(url, '_blank');
    if (win) win.opener = null; else window.location.href = url;

    status.classList.add('is-success');
    status.innerHTML = 'Abrimos o WhatsApp com sua aplicação pronta — é só tocar em <strong>enviar</strong>. ' +
      `Não abriu? <a href="${url}" target="_blank" rel="noopener">Clique aqui</a>.`;
  });
})();
