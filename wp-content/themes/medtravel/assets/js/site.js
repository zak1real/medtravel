// Меню (на телефоне — панель справа), подразделы, MAX, цели Метрики по data-goal.
(() => {
	const btn = document.querySelector('.mt-burger');
	const nav = document.getElementById('mt-nav');
	const backdrop = document.querySelector('.mt-backdrop');
	if (btn && nav) {
		const set = open => {
			btn.setAttribute('aria-expanded', open);
			btn.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
			nav.classList.toggle('is-open', open);
			document.body.classList.toggle('mt-menu-open', open);
			if (backdrop) {
				if (open) { backdrop.hidden = false; requestAnimationFrame(() => backdrop.classList.add('is-on')); }
				else { backdrop.classList.remove('is-on'); setTimeout(() => { if (!nav.classList.contains('is-open')) backdrop.hidden = true; }, 300); }
			}
			if (open) nav.querySelector('.mt-nav__close')?.focus({ preventScroll: true });
			else if (nav.contains(document.activeElement)) btn.focus({ preventScroll: true });
		};
		btn.addEventListener('click', () => set(btn.getAttribute('aria-expanded') !== 'true'));
		nav.querySelector('.mt-nav__close')?.addEventListener('click', () => set(false));
		backdrop?.addEventListener('click', () => set(false));
		nav.addEventListener('click', e => { const a = e.target.closest('a'); if (a && !a.dataset.mtMax) set(false); });
		document.addEventListener('keydown', e => { if (e.key === 'Escape' && nav.classList.contains('is-open')) set(false); });
		matchMedia('(min-width: 1025px)').addEventListener('change', e => { if (e.matches) set(false); });

		// Подразделы на телефоне: кнопка-стрелка рядом с пунктом («Направления» → 9 направлений).
		const chevron = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>';
		nav.querySelectorAll('.menu-item-has-children').forEach((li, i) => {
			const sub = li.querySelector(':scope > .sub-menu');
			if (!sub) return;
			sub.id ||= 'mt-sub-' + i;
			const t = document.createElement('button');
			t.type = 'button';
			t.className = 'mt-sub-toggle';
			t.setAttribute('aria-expanded', 'false');
			t.setAttribute('aria-controls', sub.id);
			t.setAttribute('aria-label', 'Подразделы: ' + (li.querySelector(':scope > a')?.textContent || ''));
			t.innerHTML = chevron;
			t.addEventListener('click', () => {
				const open = !li.classList.contains('is-open');
				li.classList.toggle('is-open', open);
				t.setAttribute('aria-expanded', open);
			});
			li.insertBefore(t, sub);
		});
	}

	// MAX: ссылки по номеру у MAX нет — копируем номер и подсказываем найти его в приложении.
	const toast = text => {
		let el = document.querySelector('.mt-toast');
		if (!el) { el = document.createElement('div'); el.className = 'mt-toast'; el.setAttribute('role', 'status'); document.body.appendChild(el); }
		el.textContent = text;
		el.classList.add('is-on');
		clearTimeout(el._t);
		el._t = setTimeout(() => el.classList.remove('is-on'), 3200);
	};
	document.addEventListener('click', e => {
		const a = e.target.closest('[data-mt-max]');
		if (!a) return;
		e.preventDefault();
		const num = a.dataset.mtMax;
		const done = () => toast('Номер ' + num + ' скопирован — найдите его в MAX');
		if (navigator.clipboard) navigator.clipboard.writeText(num.replace(/\s/g, '')).then(done, () => toast('Наш номер в MAX: ' + num));
		else toast('Наш номер в MAX: ' + num);
	});

	// «Как мы работаем»: шаг нажимается и открывает свою карточку (.mt-panel идёт в разметке сразу за шагом).
	// Десктоп — всегда открыта одна карточка; телефон — аккордеон, повторное нажатие закрывает.
	const stepsBox = document.querySelector('.mt-steps');
	if (stepsBox) {
		const steps = [...stepsBox.querySelectorAll(':scope > .mt-step')];
		const panels = steps.map(s => s.nextElementSibling?.classList.contains('mt-panel') ? s.nextElementSibling : null);
		const wide = matchMedia('(min-width: 961px)');
		const show = i => {
			const anchor = steps[i];
			const before = anchor.getBoundingClientRect().top;
			const close = !wide.matches && steps[i].classList.contains('is-active');
			steps.forEach((s, k) => {
				const on = k === i && !close;
				s.classList.toggle('is-active', on);
				s.setAttribute('aria-expanded', on);
				panels[k]?.classList.toggle('is-open', on);
			});
			// на телефоне закрытая карточка выше сдвигает страницу — возвращаем нажатый шаг под палец
			if (!wide.matches) scrollBy(0, anchor.getBoundingClientRect().top - before);
		};
		steps.forEach((s, i) => {
			s.setAttribute('role', 'button');
			s.tabIndex = 0;
			s.setAttribute('aria-expanded', s.classList.contains('is-active'));
			if (panels[i]?.id) s.setAttribute('aria-controls', panels[i].id);
			s.addEventListener('click', () => show(i));
			s.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); show(i); } });
		});
		stepsBox.addEventListener('click', e => {
			const b = e.target.closest('.mt-panel__next');
			if (!b) return;
			const i = Number(b.dataset.step) - 1;
			show(i);
			if (!wide.matches) steps[i].scrollIntoView({ block: 'start', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
			steps[i].focus({ preventScroll: true });
		});
		// при переходе с телефона на десктоп всё закрыто быть не может
		wide.addEventListener('change', e => { if (e.matches && !steps.some(s => s.classList.contains('is-active'))) show(0); });
	}

	const goal = name => { if (window.mtMetrika && typeof window.ym === 'function') window.ym(window.mtMetrika, 'reachGoal', name); };
	document.addEventListener('click', e => {
		const a = e.target.closest('a');
		if (!a) return;
		if (a.dataset.goal) goal(a.dataset.goal);
		else if (a.href.startsWith('tel:')) goal('phone_click');
		else if (a.href.includes('wa.me/')) goal('whatsapp_click');
		else if (a.href.startsWith('mailto:')) goal('email_click');
	});
	document.addEventListener('wpcf7mailsent', () => goal('form_sent'));
})();
