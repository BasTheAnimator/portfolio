/* ==========================================================================
   BasTheAnimator — Studio Portfolio Interactive Scripts
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Mobile Navigation & Scroll Spy
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const navLinksContainer = document.getElementById('navLinks');
    const navLinks = document.querySelectorAll('.nav-link');

    if (mobileMenuBtn && navLinksContainer) {
        mobileMenuBtn.addEventListener('click', () => {
            const isOpen = navLinksContainer.classList.toggle('open');
            mobileMenuBtn.setAttribute('aria-expanded', String(isOpen));
        });
    }

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (navLinksContainer) navLinksContainer.classList.remove('open');
        });
    });

    const sections = ['welcome', 'work', 'payment-times', 'availability', 'contacts']
        .map(id => document.getElementById(id))
        .filter(Boolean);

    window.addEventListener('scroll', () => {
        const scrollPos = window.scrollY + 180;
        let currentId = 'welcome';

        sections.forEach(sec => {
            if (scrollPos >= sec.offsetTop) {
                currentId = sec.id;
            }
        });

        navLinks.forEach(link => {
            const href = link.getAttribute('href').replace('#', '');
            link.classList.toggle('active', href === currentId);
        });
    }, { passive: true });

    // 2. Toast Helper & Clipboard Copy
    const toast = document.getElementById('copyToast');
    const toastMessage = document.getElementById('toastMessage');
    let toastTimer = null;

    function showToast(msg) {
        if (!toast || !toastMessage) return;
        toastMessage.textContent = msg;
        toast.classList.add('visible');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => {
            toast.classList.remove('visible');
        }, 3200);
    }

    async function copyText(text, label) {
        try {
            await navigator.clipboard.writeText(text);
            showToast(label || `Copied "${text}" to clipboard!`);
        } catch {
            // Fallback for older contexts
            const temp = document.createElement('textarea');
            temp.value = text;
            document.body.appendChild(temp);
            temp.select();
            document.execCommand('copy');
            document.body.removeChild(temp);
            showToast(label || `Copied "${text}" to clipboard!`);
        }
    }

    document.querySelectorAll('[data-copy]').forEach(btn => {
        btn.addEventListener('click', () => {
            const val = btn.getAttribute('data-copy');
            copyText(val, `Copied "${val}" to clipboard!`);
        });
    });

    // 3. Studio Showreel Player Controls
    const video = document.getElementById('heroVideo');
    const playPauseBtn = document.getElementById('playPauseBtn');
    const playPauseLabel = document.getElementById('playPauseLabel');
    const frameBackBtn = document.getElementById('frameBackBtn');
    const frameFwdBtn = document.getElementById('frameFwdBtn');
    const scrubber = document.getElementById('reelScrubber');
    const timecodeEl = document.getElementById('reelTimecode');
    const soundToggleBtn = document.getElementById('soundToggleBtn');
    const soundIconMuted = document.getElementById('soundIconMuted');
    const soundIconUnmuted = document.getElementById('soundIconUnmuted');
    const soundBadgeText = document.getElementById('soundBadgeText');
    const smartTrimBtn = document.getElementById('smartTrimBtn');
    const fullscreenBtn = document.getElementById('fullscreenBtn');
    const cinemaViewport = document.getElementById('cinemaViewport');

    const ACTION_LOOP_END = 16.8; // End of active visual frames in frontpagevideo.mp4
    let smartLoopEnabled = true;

    function formatTimecode(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        const frames = Math.floor((seconds % 1) * 60);
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${String(frames).padStart(2, '0')}`;
    }

    if (video) {
        video.addEventListener('timeupdate', () => {
            if (smartLoopEnabled && video.currentTime >= ACTION_LOOP_END) {
                video.currentTime = 0;
                video.play().catch(() => {});
            }
            if (scrubber) {
                scrubber.value = Math.min(video.currentTime, Number(scrubber.max));
            }
            if (timecodeEl) {
                timecodeEl.textContent = formatTimecode(video.currentTime);
            }
        });

        video.addEventListener('play', () => {
            if (playPauseLabel) playPauseLabel.textContent = 'Pause';
        });

        video.addEventListener('pause', () => {
            if (playPauseLabel) playPauseLabel.textContent = 'Play';
        });

        if (playPauseBtn) {
            playPauseBtn.addEventListener('click', () => {
                if (video.paused) {
                    video.play();
                } else {
                    video.pause();
                }
            });
        }

        // Frame stepping (1/60s per step)
        if (frameBackBtn) {
            frameBackBtn.addEventListener('click', () => {
                video.pause();
                video.currentTime = Math.max(0, video.currentTime - (1 / 60));
            });
        }

        if (frameFwdBtn) {
            frameFwdBtn.addEventListener('click', () => {
                video.pause();
                const maxTime = smartLoopEnabled ? ACTION_LOOP_END : (video.duration || 29);
                video.currentTime = Math.min(maxTime, video.currentTime + (1 / 60));
            });
        }

        if (scrubber) {
            scrubber.addEventListener('input', () => {
                video.currentTime = Number(scrubber.value);
            });
        }

        // Keyframe diamond jump buttons
        document.querySelectorAll('.kf-marker').forEach(marker => {
            marker.addEventListener('click', () => {
                const targetTime = Number(marker.getAttribute('data-time') || 0);
                video.currentTime = targetTime;
            });
        });

        // Playback speed selector
        const speedBtns = document.querySelectorAll('.speed-btn');
        speedBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const rate = Number(btn.getAttribute('data-speed') || 1);
                video.playbackRate = rate;
                speedBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });

        // Smart Loop toggle (0:00–0:16.8 action cut vs full 29.5s)
        if (smartTrimBtn) {
            smartTrimBtn.addEventListener('click', () => {
                smartLoopEnabled = !smartLoopEnabled;
                smartTrimBtn.classList.toggle('active', smartLoopEnabled);
                if (scrubber) {
                    scrubber.max = smartLoopEnabled ? String(ACTION_LOOP_END) : String(video.duration || 29.5);
                }
                showToast(
                    smartLoopEnabled
                        ? 'Action Loop enabled (loops 0:00–0:16.8 seamlessly)'
                        : 'Full 29s playback enabled (includes trailing audio fade)'
                );
            });
        }

        // Sound toggle
        if (soundToggleBtn) {
            soundToggleBtn.addEventListener('click', () => {
                video.muted = !video.muted;
                soundToggleBtn.classList.toggle('unmuted', !video.muted);
                if (soundIconMuted && soundIconUnmuted && soundBadgeText) {
                    soundIconMuted.classList.toggle('hidden', !video.muted);
                    soundIconUnmuted.classList.toggle('hidden', video.muted);
                    soundBadgeText.textContent = video.muted
                        ? 'Muted • Click for Voice & SFX'
                        : 'Audio Active • Voice & SFX On';
                }
            });
        }

        // Fullscreen toggle
        if (fullscreenBtn && cinemaViewport) {
            fullscreenBtn.addEventListener('click', () => {
                if (document.fullscreenElement) {
                    document.exitFullscreen();
                } else if (cinemaViewport.requestFullscreen) {
                    cinemaViewport.requestFullscreen();
                } else if (video.requestFullscreen) {
                    video.requestFullscreen();
                }
            });
        }
    }

    // 4. Work Portfolio Category Filter
    const filterTabs = document.querySelectorAll('.filter-tab');
    const workCards = document.querySelectorAll('.work-card');

    filterTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const filter = tab.getAttribute('data-filter');
            filterTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            workCards.forEach(card => {
                const cats = (card.getAttribute('data-category') || '').split(' ');
                const show = filter === 'all' || cats.includes(filter);
                card.classList.toggle('hidden', !show);
            });
        });
    });

    // 5. Commission Tier Selection & DM Builder
    const tierSelectInput = document.getElementById('tierSelectInput');
    const projectNotesInput = document.getElementById('projectNotesInput');
    const selectedTierDisplay = document.getElementById('selectedTierDisplay');
    const copyCommissionBtn = document.getElementById('copyCommissionBtn');
    const emailCommissionBtn = document.getElementById('emailCommissionBtn');
    const commissionBuilder = document.getElementById('commissionBuilder');

    function updateCommissionLinks() {
        const tier = tierSelectInput ? tierSelectInput.value : 'Complex Animation (2000 - 3000 Robux)';
        const notes = projectNotesInput && projectNotesInput.value.trim()
            ? projectNotesInput.value.trim()
            : 'I would like to discuss an animation commission.';

        if (selectedTierDisplay) {
            selectedTierDisplay.textContent = `Selected: ${tier}`;
        }

        if (emailCommissionBtn) {
            const subject = encodeURIComponent(`Roblox Animation Commission — ${tier}`);
            const body = encodeURIComponent(
                `Hi BasTheAnimator,\n\nI'd like to inquire about commissioning a Roblox animation:\n` +
                `• Tier: ${tier}\n` +
                `• Payment Method: Robux\n` +
                `• Details: ${notes}\n\nThanks!`
            );
            emailCommissionBtn.href = `mailto:shybxii@outlook.com?subject=${subject}&body=${body}`;
        }
    }

    document.querySelectorAll('[data-select-tier]').forEach(btn => {
        btn.addEventListener('click', () => {
            const chosenTier = btn.getAttribute('data-select-tier');
            if (tierSelectInput && chosenTier) {
                tierSelectInput.value = chosenTier;
                updateCommissionLinks();
            }
            if (commissionBuilder) {
                commissionBuilder.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            if (projectNotesInput) {
                projectNotesInput.focus();
            }
        });
    });

    if (tierSelectInput) tierSelectInput.addEventListener('change', updateCommissionLinks);
    if (projectNotesInput) projectNotesInput.addEventListener('input', updateCommissionLinks);
    updateCommissionLinks();

    if (copyCommissionBtn) {
        copyCommissionBtn.addEventListener('click', () => {
            const tier = tierSelectInput ? tierSelectInput.value : 'Complex Animation (2000 - 3000 Robux)';
            const notes = projectNotesInput && projectNotesInput.value.trim()
                ? projectNotesInput.value.trim()
                : '[Describe your animation idea / reference here]';
            const dmText = `Hey Bas! I'd like to commission a Roblox animation.\n• Tier: ${tier} (Payment: Robux)\n• Project Idea: ${notes}`;
            copyText(dmText, 'Copied Commission Brief! DM @basmatirice_ on Discord.');
        });
    }

    // 6. Live Weekly Availability Highlight
    const scheduleCards = document.querySelectorAll('.schedule-card');
    const liveScheduleText = document.getElementById('liveScheduleText');
    const now = new Date();
    const currentDay = now.getDay(); // 0 = Sun, 1..4 = Mon..Thu, 5 = Fri, 6 = Sat

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const scheduleMap = {
        0: '9 AM - 9 PM',
        1: '5 PM - 9 PM',
        2: '5 PM - 9 PM',
        3: '5 PM - 9 PM',
        4: '5 PM - 9 PM',
        5: '5 PM - 11 PM',
        6: '11 AM - 11 PM'
    };

    scheduleCards.forEach(card => {
        const days = (card.getAttribute('data-days') || '').split(',').map(Number);
        if (days.includes(currentDay)) {
            card.classList.add('is-today');
            const badge = card.querySelector('.today-tag');
            if (badge) badge.classList.remove('hidden');
        }
    });

    if (liveScheduleText) {
        liveScheduleText.textContent = `Today (${dayNames[currentDay]}): Active ${scheduleMap[currentDay]}`;
    }
});
