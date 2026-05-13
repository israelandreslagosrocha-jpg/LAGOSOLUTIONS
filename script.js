// LagoSolutions - Hacker Terminal Interface

document.addEventListener('DOMContentLoaded', () => {

    // ==========================================
    // 1. MATRIX RAIN EFFECT
    // ==========================================
    const canvas = document.getElementById('matrix');
    const ctx = canvas.getContext('2d');

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const chars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEF';
    const fontSize = 14;
    let columns = Math.floor(canvas.width / fontSize);
    let drops = Array(columns).fill(1);

    function drawMatrix() {
        ctx.fillStyle = 'rgba(10, 10, 10, 0.05)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = '#00ff41';
        ctx.font = fontSize + 'px monospace';

        for (let i = 0; i < drops.length; i++) {
            const text = chars[Math.floor(Math.random() * chars.length)];
            ctx.fillText(text, i * fontSize, drops[i] * fontSize);

            if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                drops[i] = 0;
            }
            drops[i]++;
        }
    }

    setInterval(drawMatrix, 50);

    window.addEventListener('resize', () => {
        columns = Math.floor(canvas.width / fontSize);
        drops = Array(columns).fill(1);
    });

    // ==========================================
    // 2. BOOT SEQUENCE
    // ==========================================
    const bootSequence = document.getElementById('bootSequence');
    const bootText = document.getElementById('bootText');
    const mainWrapper = document.getElementById('mainWrapper');

    const bootLines = [
        'LAGOSOLUTIONS AI SYSTEM v4.2.1',
        '================================',
        '',
        '[BOOT] Initializing kernel...',
        '[BOOT] Loading neural network modules...',
        '[BOOT] Establishing secure connection...',
        '[BOOT] Calibrating AI agents...',
        '[BOOT] Verifying predictive engines...',
        '[BOOT] Activating automation core...',
        '',
        '[SYS] All systems operational.',
        '[SYS] 150+ deployments active.',
        '[SYS] 97.3% model accuracy confirmed.',
        '',
        '> Welcome to LagoSolutions Terminal.',
        '> Access granted.',
        '',
    ];

    let lineIndex = 0;
    let charIndex = 0;
    let currentText = '';

    function typeBoot() {
        if (lineIndex >= bootLines.length) {
            setTimeout(() => {
                bootSequence.classList.add('hidden');
                mainWrapper.style.opacity = '1';
            }, 800);
            return;
        }

        const line = bootLines[lineIndex];

        if (charIndex < line.length) {
            currentText += line[charIndex];
            bootText.textContent = currentText;
            charIndex++;
            setTimeout(typeBoot, 15 + Math.random() * 20);
        } else {
            currentText += '\n';
            bootText.textContent = currentText;
            lineIndex++;
            charIndex = 0;
            setTimeout(typeBoot, 100 + Math.random() * 200);
        }
    }

    setTimeout(typeBoot, 500);

    // ==========================================
    // 3. TOP BAR CLOCK
    // ==========================================
    const topbarTime = document.getElementById('topbarTime');

    function updateTime() {
        const now = new Date();
        const h = String(now.getHours()).padStart(2, '0');
        const m = String(now.getMinutes()).padStart(2, '0');
        const s = String(now.getSeconds()).padStart(2, '0');
        if (topbarTime) topbarTime.textContent = `${h}:${m}:${s}`;
    }

    updateTime();
    setInterval(updateTime, 1000);

    // ==========================================
    // 4. SCROLL REVEAL
    // ==========================================
    const revealElements = document.querySelectorAll('.reveal');

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    revealElements.forEach(el => revealObserver.observe(el));

    // ==========================================
    // 5. FAQ ACCORDION
    // ==========================================
    document.querySelectorAll('.faq-item').forEach(item => {
        const question = item.querySelector('.faq-question');

        question.addEventListener('click', () => {
            const isActive = item.classList.contains('active');

            document.querySelectorAll('.faq-item').forEach(other => {
                if (other !== item) {
                    other.classList.remove('active');
                    other.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
                }
            });

            item.classList.toggle('active');
            question.setAttribute('aria-expanded', !isActive);
        });
    });

    // ==========================================
    // 6. MOBILE MENU
    // ==========================================
    const navToggle = document.querySelector('.nav-toggle');
    const mobileMenu = document.getElementById('mobileMenu');

    if (navToggle && mobileMenu) {
        navToggle.addEventListener('click', () => {
            const isOpen = mobileMenu.classList.contains('active');
            mobileMenu.classList.toggle('active');
            navToggle.setAttribute('aria-expanded', !isOpen);

            const spans = navToggle.querySelectorAll('span');
            if (!isOpen) {
                spans[0].style.transform = 'rotate(45deg) translate(4px, 4px)';
                spans[1].style.opacity = '0';
                spans[2].style.transform = 'rotate(-45deg) translate(4px, -4px)';
            } else {
                spans[0].style.transform = '';
                spans[1].style.opacity = '';
                spans[2].style.transform = '';
            }
        });

        mobileMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.remove('active');
                navToggle.setAttribute('aria-expanded', 'false');
                navToggle.querySelectorAll('span').forEach(s => {
                    s.style.transform = '';
                    s.style.opacity = '';
                });
            });
        });
    }

    // ==========================================
    // 7. NAVBAR SCROLL EFFECT
    // ==========================================
    const navbar = document.querySelector('.navbar');

    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 50) {
            navbar.style.borderBottomColor = '#00ff4122';
        } else {
            navbar.style.borderBottomColor = '';
        }
    }, { passive: true });

    // ==========================================
    // 8. SMOOTH SCROLL
    // ==========================================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const target = document.querySelector(targetId);
            if (target) {
                e.preventDefault();
                const offset = (navbar?.offsetHeight || 56) + 20;
                const top = target.getBoundingClientRect().top + window.pageYOffset - offset;
                window.scrollTo({ top, behavior: 'smooth' });
            }
        });
    });

    // ==========================================
    // 9. CTA FORM
    // ==========================================
    const ctaForm = document.getElementById('ctaForm');

    if (ctaForm) {
        ctaForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const btn = ctaForm.querySelector('button[type="submit"]');
            const originalHTML = btn.innerHTML;
            const emailInput = ctaForm.querySelector('#email');
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (!emailRegex.test(emailInput.value)) {
                emailInput.style.borderColor = '#ff0040';
                emailInput.style.animation = 'glitch 0.3s ease';
                setTimeout(() => {
                    emailInput.style.borderColor = '';
                    emailInput.style.animation = '';
                }, 500);
                return;
            }

            btn.innerHTML = '<span class="btn-bracket">[</span> PROCESANDO... <span class="btn-bracket">]</span>';
            btn.style.opacity = '0.7';
            btn.style.pointerEvents = 'none';

            setTimeout(() => {
                btn.innerHTML = '<span class="btn-bracket">[</span> SOLICITUD ENVIADA <span class="btn-bracket">]</span>';
                btn.style.opacity = '1';
                btn.style.background = '#00cc33';
                ctaForm.reset();

                setTimeout(() => {
                    btn.innerHTML = originalHTML;
                    btn.style.background = '';
                    btn.style.pointerEvents = '';
                }, 4000);
            }, 2000);
        });
    }

    // ==========================================
    // 10. DYNAMIC KEYFRAMES
    // ==========================================
    const style = document.createElement('style');
    style.textContent = `
        @keyframes glitch {
            0%, 100% { transform: translateX(0); }
            20% { transform: translateX(-4px); }
            40% { transform: translateX(4px); }
            60% { transform: translateX(-2px); }
            80% { transform: translateX(2px); }
        }
    `;
    document.head.appendChild(style);

    // ==========================================
    // 11. CARD HOVER GLITCH EFFECT
    // ==========================================
    document.querySelectorAll('.solution-card').forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.animation = 'glitch 0.2s ease';
            setTimeout(() => { card.style.animation = ''; }, 200);
        });
    });

});
