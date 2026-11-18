// Бургер-меню и цели Метрики по data-goal.
(() => {
	const btn = document.querySelector('.mt-burger');
	const nav = document.getElementById('mt-nav');
	if (btn && nav) {
		const set = open => {
			btn.setAttribute('aria-expanded', open);
			btn.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
			nav.classList.toggle('is-open', open);
			document.body.classList.toggle('mt-menu-open', open);
		};
		btn.addEventListener('click', () => set(btn.getAttribute('aria-expanded') !== 'true'));
		nav.addEventListener('click', e => { if (e.target.closest('a')) set(false); });
		document.addEventListener('keydown', e => { if (e.key === 'Escape') set(false); });
		matchMedia('(min-width: 1025px)').addEventListener('change', e => { if (e.matches) set(false); });
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
