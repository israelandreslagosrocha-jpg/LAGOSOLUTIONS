document.addEventListener('DOMContentLoaded', () => {
    const root = document.querySelector('.plans-carousel');
    if (!root) return;
    const cards = [...root.querySelectorAll('.plan-card')];
    const buttons = [...root.querySelectorAll('[data-slide]')];
    const status = document.getElementById('plan-slide-status');
    const previous = document.getElementById('plan-prev');
    const next = document.getElementById('plan-next');
    let index = 0;
    const show = (newIndex) => {
        index = (newIndex + cards.length) % cards.length;
        cards.forEach((card, i) => { card.hidden = i !== index; });
        buttons.forEach((button, i) => button.setAttribute('aria-pressed', String(i === index)));
        status.textContent = `${index + 1} de ${cards.length} · ${buttons[index].textContent}`;
    };
    const showHash = () => {
        const matching = cards.findIndex(card => `#${card.id}` === window.location.hash);
        if (matching !== -1) show(matching);
    };
    root.classList.add('is-carousel');
    root.querySelector('.plans-carousel-controls').hidden = false;
    root.querySelector('.plans-carousel-tabs').hidden = false;
    previous.addEventListener('click', () => show(index - 1));
    next.addEventListener('click', () => show(index + 1));
    buttons.forEach((button, i) => button.addEventListener('click', () => show(i)));
    root.addEventListener('keydown', (event) => {
        if (!event.target.matches('.carousel-arrow, [data-slide]')) return;
        if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
            event.preventDefault();
            show(index + (event.key === 'ArrowRight' ? 1 : -1));
        }
    });
    // Reveal the correct card before the browser follows a comparison anchor.
    document.addEventListener('click', (event) => {
        const link = event.target.closest('a[href^="#plan-"]');
        if (!link) return;
        const matching = cards.findIndex(card => `#${card.id}` === link.getAttribute('href'));
        if (matching !== -1) show(matching);
    });
    window.addEventListener('hashchange', showHash);
    show(0);
    showHash();
});
