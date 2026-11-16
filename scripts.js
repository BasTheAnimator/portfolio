/* ==========================================================================
   BasTheAnimator — "THE VAULT" Interactive Scripts (Desktop + Mobile)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Mobile Nav Drawer & Scroll Spy
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const navLinksContainer = document.getElementById('navLinks');
    const navLinks = document.querySelectorAll('.vault-nav__link');

    function setMobileMenu(open) {
        if (!mobileMenuBtn || !navLinksContainer) return;
        navLinksContainer.classList.toggle('open', open);
        mobileMenuBtn.classList.toggle('is-open', open);
        mobileMenuBtn.setAttribute('aria-expanded', String(open));
    }

    if (mobileMenuBtn && navLinksContainer) {
        mobileMenuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = !navLinksContainer.classList.contains('open');
            setMobileMenu(isOpen);
        });

        document.addEventListener('click', (e) => {
            if (navLinksContainer.classList.contains('open') &&
                !navLinksContainer.contains(e.target) &&
                !mobileMenuBtn.contains(e.target)) {
                setMobileMenu(false);
            }
        });
    }

    navLinks.forEach(link => {
        link.addEventListener('click', () => setMobileMenu(false));
    });

    const sectionIds = ['welcome', 'work', 'payment-times', 'availability', 'contacts'];
    const sectionEls = sectionIds.map(id => document.getElementById(id)).filter(Boolean);

    window.addEventListener('scroll', () => {
        const y = window.scrollY + 180;
        let activeId = 'work';
        sectionEls.forEach(sec => {
            if (y >= sec.offsetTop) activeId = sec.id;
        });

        navLinks.forEach(link => {
            const target = (link.getAttribute('href') || '').replace('#', '');
            link.classList.toggle('is-active', target === activeId);
        });
    }, { passive: true });

    // 2. Toast & Clipboard Copy
    const toast = document.getElementById('copyToast');
    const toastMessage = document.getElementById('toastMessage');
    let toastTimeout = null;

    function showToast(msg) {
        if (!toast || !toastMessage) return;
        toastMessage.textContent = msg;
        toast.classList.add('visible');
        clearTimeout(toastTimeout);
        toastTimeout = setTimeout(() => {
            toast.classList.remove('visible');
        }, 3200);
    }

    async function copyToClipboard(text, message) {
        try {
            await navigator.clipboard.writeText(text);
        } catch {
            const area = document.createElement('textarea');
            area.value = text;
            document.body.appendChild(area);
            area.select();
            document.execCommand('copy');
            document.body.removeChild(area);
        }
        showToast(message || `Copied "${text}" to clipboard!`);
    }

    document.querySelectorAll('[data-copy]').forEach(btn => {
        btn.addEventListener('click', () => {
            const val = btn.getAttribute('data-copy');
            copyToClipboard(val, `Copied "${val}" to clipboard!`);
        });
    });

    // 3. Showreel Video (Action Cut Loop & Audio Toggle)
    const heroVideo = document.getElementById('heroVideo');
    const soundToggleBtn = document.getElementById('soundToggleBtn');
    const soundStatusDot = document.getElementById('soundStatusDot');
    const soundBtnLabel = document.getElementById('soundBtnLabel');
    const ACTION_LOOP_END = 16.8;

    if (heroVideo) {
        heroVideo.addEventListener('timeupdate', () => {
            if (heroVideo.currentTime >= ACTION_LOOP_END) {
                heroVideo.currentTime = 0;
                heroVideo.play().catch(() => {});
            }
        });

        if (soundToggleBtn) {
            soundToggleBtn.addEventListener('click', () => {
                heroVideo.muted = !heroVideo.muted;
                if (!heroVideo.muted && heroVideo.paused) {
                    heroVideo.play().catch(() => {});
                }
                if (soundStatusDot) {
                    soundStatusDot.classList.toggle('is-unmuted', !heroVideo.muted);
                }
                if (soundBtnLabel) {
                    soundBtnLabel.textContent = heroVideo.muted
                        ? 'Muted • Tap for Audio'
                        : 'Audio Live • SFX On';
                }
            });
        }
    }

    // 4. Vault Filters & Scatter / Align Toggle
    const filterBtns = document.querySelectorAll('.vault-filter');
    const vaultItems = document.querySelectorAll('.vault-index__item');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const filter = btn.getAttribute('data-filter');
            filterBtns.forEach(b => b.classList.remove('is-active'));
            btn.classList.add('is-active');

            vaultItems.forEach(item => {
                const cats = (item.getAttribute('data-category') || '').split(' ');
                const match = filter === 'all' || cats.includes(filter);
                item.classList.toggle('hidden', !match);
            });
        });
    });

    const toggleScatterBtn = document.getElementById('toggleScatterBtn');
    const scatterBtnLabel = document.getElementById('scatterBtnLabel');

    function toggleScatter() {
        const aligned = document.body.classList.toggle('vault-aligned');
        if (scatterBtnLabel) {
            scatterBtnLabel.textContent = aligned ? 'Scatter Prints' : 'Align Grid';
        }
        showToast(aligned ? 'Polaroid prints aligned to grid' : 'Polaroid prints scattered');
    }

    if (toggleScatterBtn) {
        toggleScatterBtn.addEventListener('click', toggleScatter);
    }

    // 5. Commission Tier Polaroids -> Copy Ready Discord DM
    document.querySelectorAll('[data-select-tier]').forEach(card => {
        card.addEventListener('click', () => {
            const tier = card.getAttribute('data-select-tier');
            const dm = `Hey Bas! I saw your Vault portfolio and want to commission a Roblox animation.\n• Tier: ${tier}\n• Payment Method: Robux`;
            copyToClipboard(dm, `Copied "${tier}" DM! Message @basmatirice_ on Discord.`);
        });
    });

    // 6. Live Weekly Availability & Header Status Pill
    const now = new Date();
    const day = now.getDay(); // 0=Sun, 1..4=Mon..Thu, 5=Fri, 6=Sat
    const hour = now.getHours();

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const windows = {
        0: { label: '9 AM - 9 PM', start: 9, end: 21 },
        1: { label: '5 PM - 9 PM', start: 17, end: 21 },
        2: { label: '5 PM - 9 PM', start: 17, end: 21 },
        3: { label: '5 PM - 9 PM', start: 17, end: 21 },
        4: { label: '5 PM - 9 PM', start: 17, end: 21 },
        5: { label: '5 PM - 11 PM', start: 17, end: 23 },
        6: { label: '11 AM - 11 PM', start: 11, end: 23 }
    };

    const todayWin = windows[day];
    const isOnlineNow = hour >= todayWin.start && hour < todayWin.end;

    document.querySelectorAll('.print--schedule').forEach(card => {
        const days = (card.getAttribute('data-days') || '').split(',').map(Number);
        if (days.includes(day)) {
            card.classList.add('is-today');
            const sticker = card.querySelector('.today-sticker');
            if (sticker) sticker.classList.remove('hidden');
        }
    });

    const todayScheduleBanner = document.getElementById('todayScheduleBanner');
    if (todayScheduleBanner) {
        todayScheduleBanner.textContent = `TODAY (${dayNames[day].toUpperCase()}): ${todayWin.label}`;
    }

    const headerStatusDot = document.getElementById('headerStatusDot');
    const headerStatusText = document.getElementById('headerStatusText');
    if (headerStatusDot && headerStatusText) {
        headerStatusDot.classList.toggle('is-online', isOnlineNow);
        headerStatusText.textContent = isOnlineNow
            ? `Online (${todayWin.label})`
            : `Today: ${todayWin.label}`;
    }

    // 7. Back to Top Mechanical Keycap
    const backToTopBtn = document.getElementById('backToTopBtn');
    if (backToTopBtn) {
        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // 8. Lightbox / Polaroid Inspector Modal
    const vaultModal = document.getElementById('vaultModal');
    const modalBackdrop = document.getElementById('modalBackdrop');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const modalStage = document.getElementById('modalStage');
    const modalTitle = document.getElementById('modalTitle');
    const modalCaption = document.getElementById('modalCaption');
    const modalExtraControls = document.getElementById('modalExtraControls');
    const openReelModalBtn = document.getElementById('openReelModalBtn');

    function closeModal() {
        if (!vaultModal) return;
        vaultModal.classList.add('hidden');
        if (modalStage) modalStage.innerHTML = '';
        if (modalExtraControls) modalExtraControls.innerHTML = '';
    }

    if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
    if (modalBackdrop) modalBackdrop.addEventListener('click', closeModal);
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') {
            closeModal();
            setMobileMenu(false);
        }
    });

    if (openReelModalBtn) {
        openReelModalBtn.addEventListener('click', () => {
            if (!vaultModal || !modalStage) return;
            modalCaption.textContent = '#0001 // SHOWREEL KEYFRAME INSPECTOR';
            modalTitle.textContent = 'Blue Lock: Two-Gun Direct Shot (frontpagevideo.mp4)';
            modalStage.innerHTML = `
                <video id="modalVideo" controls autoplay loop playsinline webkit-playsinline style="width:100%;height:100%;object-fit:contain;">
                    <source src="frontpagevideo.mp4" type="video/mp4">
                </video>
            `;
            modalExtraControls.innerHTML = `
                <button type="button" class="keycap-pill" id="modalStepBack">-1 Frame</button>
                <button type="button" class="keycap-pill" id="modalStepFwd">+1 Frame</button>
                <button type="button" class="keycap-pill" data-modal-rate="0.25">0.25x</button>
                <button type="button" class="keycap-pill" data-modal-rate="0.5">0.5x</button>
                <button type="button" class="keycap-pill" data-modal-rate="1">1x</button>
            `;
            vaultModal.classList.remove('hidden');

            const mv = document.getElementById('modalVideo');
            if (mv) {
                mv.addEventListener('timeupdate', () => {
                    if (mv.currentTime >= ACTION_LOOP_END) mv.currentTime = 0;
                });
                document.getElementById('modalStepBack')?.addEventListener('click', () => {
                    mv.pause();
                    mv.currentTime = Math.max(0, mv.currentTime - (1 / 60));
                });
                document.getElementById('modalStepFwd')?.addEventListener('click', () => {
                    mv.pause();
                    mv.currentTime = Math.min(ACTION_LOOP_END, mv.currentTime + (1 / 60));
                });
                modalExtraControls.querySelectorAll('[data-modal-rate]').forEach(b => {
                    b.addEventListener('click', () => {
                        mv.playbackRate = Number(b.getAttribute('data-modal-rate'));
                    });
                });
            }
        });
    }

    document.querySelectorAll('[data-yt]').forEach(btn => {
        btn.addEventListener('click', () => {
            const ytId = btn.getAttribute('data-yt');
            const title = btn.getAttribute('data-title');
            if (!vaultModal || !modalStage) return;
            modalCaption.textContent = 'THEATER VIEW // YOUTUBE';
            modalTitle.textContent = title || 'Animation Showcase';
            modalStage.innerHTML = `
                <iframe
                    src="https://www.youtube.com/embed/${ytId}?autoplay=1"
                    title="${title}"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowfullscreen>
                </iframe>
            `;
            modalExtraControls.innerHTML = `
                <a href="https://www.youtube.com/watch?v=${ytId}" target="_blank" rel="noopener noreferrer" class="keycap-pill" style="text-decoration:none;">
                    Open on YouTube ↗
                </a>
            `;
            vaultModal.classList.remove('hidden');
        });
    });
});
