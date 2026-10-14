document.addEventListener('DOMContentLoaded', () => {
    const root = document.querySelector('.projects-carousel');
    if (!root) return;
    const track = root.querySelector('#projects-track');
    const slides = [...track.querySelectorAll('.project-slide')];
    const controls = root.querySelector('.projects-controls');
    const dots = root.querySelector('.projects-dots');
    const status = root.querySelector('#projects-status');
    const pause = root.querySelector('#projects-pause');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    let current = 0, direction = 1, timer, settling, inView = false;
    let paused = reduced.matches, hovered = false, focused = false, dragging = false;
    let dragStart = 0, dragScroll = 0, moved = false;
    root.classList.add('is-ready');
    controls.hidden = dots.hidden = false;
    const selectors = slides.map((slide, index) => {
        slide.setAttribute('role', 'group');
        slide.setAttribute('aria-roledescription', 'diapositiva');
        slide.setAttribute('aria-label', `${index + 1} de ${slides.length}`);
        const button = document.createElement('button');
        button.type = 'button';
        button.setAttribute('aria-label', `Ver ${slide.querySelector('h3').textContent}`);
        button.addEventListener('click', () => go(index, true));
        dots.append(button);
        return button;
    });
    function update(index) {
        current = index;
        status.textContent = `${index + 1} / ${slides.length} · ${slides[index].querySelector('h3').textContent}`;
        selectors.forEach((button, i) => button.setAttribute('aria-pressed', String(i === index)));
        slides.forEach((slide, i) => {
            slide.inert = i !== index;
            if (i !== index) slide.querySelectorAll('details[open]').forEach(detail => { detail.open = false; });
        });
    }
    function nearest() {
        return slides.reduce((best, slide, i) => Math.abs(slide.offsetLeft - track.offsetLeft - track.scrollLeft) < Math.abs(slides[best].offsetLeft - track.offsetLeft - track.scrollLeft) ? i : best, 0);
    }
    function go(index, manual = false) {
        const next = (index + slides.length) % slides.length;
        status.setAttribute('aria-live', manual ? 'polite' : 'off');
        update(next);
        track.scrollTo({left: slides[next].offsetLeft - track.offsetLeft, behavior: reduced.matches ? 'instant' : 'smooth'});
        schedule();
    }
    function schedule() {
        clearTimeout(timer);
        if (paused || hovered || focused || dragging || !inView || document.hidden || reduced.matches) return;
        timer = setTimeout(() => {
            if (current === slides.length - 1) direction = -1;
            if (current === 0) direction = 1;
            go(current + direction);
        }, 6500);
    }
    function renderPause() {
        pause.textContent = paused ? 'Reanudar carrusel ▶' : 'Pausar carrusel Ⅱ';
        pause.setAttribute('aria-pressed', String(paused));
    }
    pause.addEventListener('click', () => { paused = !paused; renderPause(); schedule(); });
    root.querySelector('#projects-prev').addEventListener('click', () => go(current - 1, true));
    root.querySelector('#projects-next').addEventListener('click', () => go(current + 1, true));
    track.addEventListener('keydown', event => {
        if (event.target !== track) return;
        if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) {
            event.preventDefault();
            go(event.key === 'Home' ? 0 : event.key === 'End' ? slides.length - 1 : current + (event.key === 'ArrowRight' ? 1 : -1), true);
        }
    });
    track.addEventListener('scroll', () => {
        clearTimeout(timer); clearTimeout(settling);
        settling = setTimeout(() => { update(nearest()); schedule(); }, 180);
    }, {passive: true});
    root.addEventListener('mouseenter', () => { hovered = true; schedule(); });
    root.addEventListener('mouseleave', () => { hovered = false; schedule(); });
    root.addEventListener('focusin', () => { focused = true; schedule(); });
    root.addEventListener('focusout', () => { focused = root.contains(document.activeElement); schedule(); });
    track.addEventListener('pointerdown', event => {
        if (event.pointerType !== 'mouse' || event.button !== 0 || event.target.closest('button, summary, details')) return;
        dragging = true; moved = false; dragStart = event.clientX; dragScroll = track.scrollLeft; schedule();
    });
    track.addEventListener('pointermove', event => {
        if (!dragging) return;
        if (Math.abs(event.clientX - dragStart) > 8) {
            moved = true; track.setPointerCapture(event.pointerId); track.classList.add('is-dragging');
            track.scrollLeft = dragScroll - (event.clientX - dragStart);
        }
    });
    function endDrag() {
        if (!dragging) return;
        dragging = false; track.classList.remove('is-dragging');
        if (moved) go(nearest(), true); else schedule();
    }
    track.addEventListener('pointerup', endDrag);
    track.addEventListener('pointercancel', endDrag);
    track.addEventListener('pointerleave', () => { if (!moved) endDrag(); });
    track.addEventListener('dragstart', event => event.preventDefault());
    track.addEventListener('click', event => { if (moved) { event.preventDefault(); event.stopPropagation(); moved = false; } }, true);
    document.addEventListener('visibilitychange', schedule);
    reduced.addEventListener('change', () => { paused = reduced.matches; renderPause(); schedule(); });
    new IntersectionObserver(entries => { inView = entries[0].isIntersecting; schedule(); }, {threshold: 0.2}).observe(track);
    new ResizeObserver(() => {
        track.scrollTo({left: slides[current].offsetLeft - track.offsetLeft, behavior: 'instant'});
    }).observe(track);
    update(0); renderPause();
});
