const APP_CONFIG = {
    birthdayName: 'Nandini',
    birthdayDate: '25th August',
    password: '25august',
    musicPath: 'images/images/song.mp3',
    photoFolder: 'images/ayan',
    autoScrollSpeed: 18,
    autoScrollPauseMs: 5000,
    reducedMotionQuery: '(prefers-reduced-motion: reduce)'
};

const loginScreen = document.getElementById('login-screen');
const loginForm = document.getElementById('login-form');
const passwordInput = document.getElementById('passwordInput');
const errorMsg = document.getElementById('errorMsg');
const curtainStage = document.getElementById('curtain-stage');
const balloonScene = document.getElementById('balloon-scene');
const heartScene = document.getElementById('heart-scene');
const mainStory = document.getElementById('main-story');
const heroIntro = document.getElementById('heroIntro');
const madeForYou = document.getElementById('madeForYou');
const openSurpriseBtn = document.getElementById('openSurpriseBtn');
const nextStoryBtn = document.getElementById('nextStoryBtn');
const readyOpenBtn = document.getElementById('readyOpenBtn');
const galleryNextBtn = document.getElementById('galleryNextBtn');
const celebrationRain = document.getElementById('celebrationRain');
const welcomeRain = document.getElementById('welcomeRain');
const photoGallery = document.getElementById('photoGallery');
const bgMusic = document.getElementById('bgMusic');
const arrow = document.getElementById('arrow');
const arrowScene = document.querySelector('.arrow-scene');
const impactBursts = document.getElementById('impactBursts');
const finalMessage = document.getElementById('finalMessage');

const state = {
    passwordUnlocked: false,
    autoScrollOn: false,
    lastFrame: 0,
    isDraggingArrow: false,
    arrowPull: 0,
    arrowShot: false,
    balloonProgress: 0,
    musicPlaying: false,
    reducedMotion: window.matchMedia(APP_CONFIG.reducedMotionQuery).matches,
    pauseUntil: 0,
    rafId: null,
    finalArrowTriggered: false,
    resumeTimer: null
};

const curatedPhotos = [
    {
        src: 'IMG-20260317-WA0001.jpg',
        title: 'A Beautiful Beginning',
        text: 'Some moments are worth remembering forever.'
    },
    {
        src: 'IMG-20260319-WA0000.jpg',
        title: 'That Smile ✨',
        text: 'Your smile has its own kind of magic.'
    },
    {
        src: 'IMG-20260322-WA0020.jpg',
        title: 'Simply You',
        text: 'No filter, no perfection—just you.'
    },
    {
        src: 'IMG-20260413-WA0110.jpg',
        title: 'My Favorite View',
        text: 'Some views never get old.'
    },
    {
        src: 'IMG-20260413-WA0115.jpg',
        title: 'A Little Sunshine',
        text: 'You make ordinary moments feel special.'
    },
    {
        src: 'IMG-20260420-WA0060.jpg',
        title: 'The Way You Smile',
        text: 'And somehow, this smile makes everything better.'
    },
    {
        src: 'IMG-20260420-WA0085.jpg',
        title: 'Beautifully You',
        text: 'Stay exactly the way you are.'
    },
    {
        src: 'IMG-20260420-WA0096.jpg',
        title: 'A Moment to Keep',
        text: 'One of those little moments I would keep forever.'
    },
    {
        src: 'IMG-20260429-WA0012.jpg',
        title: 'Little Glow',
        text: 'The quiet kind of beauty that stays with you.'
    },
    {
        src: 'IMG-20260429-WA0015.jpg',
        title: 'Sweet and Calm',
        text: 'A softness you cannot help but notice.'
    },
    {
        src: 'IMG-20260522-WA0279.jpg',
        title: 'Warm and Effortless',
        text: 'Some faces feel like summer evenings.'
    },
    {
        src: 'IMG-20260522-WA0291.jpg',
        title: 'A Gentle Radiance',
        text: 'You bring a little warmth to every frame.'
    },
    {
        src: 'IMG-20260522-WA0312.jpg',
        title: 'A Beautiful Pause',
        text: 'Even the quiet moments look lovely with you in them.'
    },
    {
        src: 'IMG-20260705-WA0053.jpg',
        title: 'Light in Motion',
        text: 'There is a softness to the way you carry yourself.'
    },
    {
        src: 'IMG-20260723-WA0010.jpg',
        title: 'Always Lovely',
        text: 'A little reminder that beauty can be calm and simple.'
    }
];

const galleryMarkup = curatedPhotos.map((item, index) => {
    const cardClass = index % 3 === 0 ? 'gallery-card tall' : 'gallery-card';
    return `
        <figure class="${cardClass}">
            <img src="${APP_CONFIG.photoFolder}/${item.src}" alt="${item.title}" loading="lazy">
            <figcaption class="gallery-caption">
                <strong>${item.title}</strong>
                <span>${item.text}</span>
            </figcaption>
        </figure>
    `;
}).join('');

photoGallery.innerHTML = galleryMarkup;

function setScreenVisibility(element, show) {
    if (!element) {
        return;
    }
    element.setAttribute('aria-hidden', String(!show));
    if (show) {
        element.classList.add('active');
        element.style.display = 'block';
    } else {
        element.classList.remove('active');
        element.style.display = 'none';
    }
}

function showLoginError() {
    errorMsg.textContent = 'That password is not quite right. Try again.';
    passwordInput.select();
}

function toggleMusic(forceValue) {
    if (!bgMusic) {
        return;
    }

    const nextValue = typeof forceValue === 'boolean' ? forceValue : !state.musicPlaying;
    state.musicPlaying = nextValue;

    if (nextValue) {
        bgMusic.volume = 0.55;
        bgMusic.play().catch(() => {});
    } else {
        bgMusic.pause();
    }
}

function startPasswordReveal() {
    if (state.passwordUnlocked) {
        return;
    }

    state.passwordUnlocked = true;
    startMusicOnInteraction();
    startWelcomeRain();
    setScreenVisibility(loginScreen, false);
    setScreenVisibility(curtainStage, true);
    curtainStage.classList.remove('reveal');
    requestAnimationFrame(() => {
        curtainStage.classList.add('reveal');
    });

    setTimeout(() => {
        setScreenVisibility(curtainStage, false);
        startBalloonExperience();
    }, 1900);
}

function createBalloons() {
    if (!balloonScene) {
        return;
    }

    const field = document.getElementById('balloon-field');
    field.innerHTML = '';
    const palette = ['#ff8ab0', '#f4c46c', '#87d4ff', '#d5b4ff', '#f4a88a', '#f8d3a4'];
    const balloonCount = 14;

    for (let index = 0; index < balloonCount; index += 1) {
        const balloon = document.createElement('button');
        balloon.type = 'button';
        balloon.className = 'balloon';
        balloon.style.left = `${Math.random() * 82 + 4}%`;
        balloon.style.top = `${Math.random() * 52 + 18}%`;
        balloon.style.setProperty('--balloon-hue', palette[index % palette.length]);
        balloon.style.width = `${52 + Math.random() * 38}px`;
        balloon.style.height = `${64 + Math.random() * 32}px`;
        balloon.style.animationDuration = `${5 + Math.random() * 5}s`;
        balloon.setAttribute('aria-label', 'Pop balloon');

        const label = document.createElement('span');
        label.className = 'balloon-message';
        label.textContent = index % 2 === 0 ? 'joy' : 'smile';
        balloon.appendChild(label);

        balloon.addEventListener('click', () => popBalloon(balloon));
        field.appendChild(balloon);
    }
}

function launchBurst(x, y, amount, color) {
    const fragmentColor = color || '#ff7cab';
    for (let index = 0; index < amount; index += 1) {
        const particle = document.createElement('span');
        particle.className = 'particle';
        particle.style.left = `${x}px`;
        particle.style.top = `${y}px`;
        particle.style.setProperty('--particle-color', fragmentColor);
        particle.style.setProperty('--dx', `${(Math.random() - 0.5) * 110}px`);
        particle.style.setProperty('--dy', `${(Math.random() - 0.5) * 110}px`);
        impactBursts.appendChild(particle);
        setTimeout(() => particle.remove(), 900);
    }
}

function popBalloon(balloon) {
    if (!balloon || balloon.classList.contains('popped')) {
        return;
    }

    balloon.classList.add('popped');
    const rect = balloon.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    launchBurst(centerX, centerY, 12, balloon.style.getPropertyValue('--balloon-hue'));
    state.balloonProgress += 1;

    if (state.balloonProgress >= 6) {
        setTimeout(() => {
            triggerHeartScene();
        }, 650);
    }
}

function startBalloonExperience() {
    setScreenVisibility(balloonScene, true);
    createBalloons();
    setTimeout(() => {
        if (!state.passwordUnlocked) {
            return;
        }
        if (state.balloonProgress < 6) {
            triggerHeartScene();
        }
    }, 5200);
}

function triggerHeartScene() {
    setScreenVisibility(balloonScene, false);
    setScreenVisibility(heartScene, true);

    heartScene.classList.remove('active');
    void heartScene.offsetWidth;
    requestAnimationFrame(() => {
        heartScene.classList.add('active');
    });

    setTimeout(() => {
        setScreenVisibility(heartScene, false);
        showMainIntro();
    }, 2600);
}

function showMainIntro() {
    if (!state.passwordUnlocked) {
        return;
    }

    setScreenVisibility(mainStory, true);
    document.body.classList.add('story-live');
    document.body.classList.add('guided-start');
    window.scrollTo({ top: 0, behavior: 'auto' });
    heroIntro.scrollIntoView({ behavior: 'auto', block: 'start' });

    window.setTimeout(() => {
        state.autoScrollOn = true;
        state.pauseUntil = 0;
        startAutoScroll();
    }, 1800);
}

function startMusicOnInteraction() {
    if (bgMusic && !state.musicPlaying) {
        toggleMusic(true);
    }
}

function revealGalleryCards() {
    const cards = photoGallery.querySelectorAll('.gallery-card');
    cards.forEach((card, index) => {
        setTimeout(() => {
            card.classList.add('visible');
        }, index * 90);
    });
}

function startCelebrationRain() {
    if (!celebrationRain) {
        return;
    }

    celebrationRain.innerHTML = '';
    const symbols = ['♥', '✿', '✦', '❤', '❀'];
    for (let index = 0; index < 42; index += 1) {
        const drop = document.createElement('span');
        drop.className = 'rain-drop';
        drop.textContent = symbols[index % symbols.length];
        drop.style.left = `${Math.random() * 100}%`;
        drop.style.animationDelay = `${Math.random() * 0.8}s`;
        drop.style.animationDuration = `${2.4 + Math.random() * 1.6}s`;
        celebrationRain.appendChild(drop);
    }
}

function startWelcomeRain() {
    if (!welcomeRain) {
        return;
    }

    welcomeRain.innerHTML = '';
    for (let index = 0; index < 48; index += 1) {
        const drop = document.createElement('span');
        drop.className = 'rain-drop welcome-drop';
        drop.textContent = index % 2 === 0 ? '🩷' : '💗';
        drop.style.left = `${Math.random() * 100}%`;
        drop.style.animationDelay = `${Math.random() * 0.6}s`;
        drop.style.animationDuration = `${2.5 + Math.random() * 1.3}s`;
        welcomeRain.appendChild(drop);
    }

    document.body.classList.add('welcome-rain-active');
    window.setTimeout(() => {
        document.body.classList.remove('welcome-rain-active');
    }, 4300);
}

function startGalleryRain() {
    startWelcomeRain();
    document.body.classList.add('gallery-rain-active');
}

function attachLoginEvents() {
    loginForm.addEventListener('submit', (event) => {
        event.preventDefault();

        if (passwordInput.value.trim() === APP_CONFIG.password) {
            startPasswordReveal();
            return;
        }

        showLoginError();
    });

    openSurpriseBtn.addEventListener('click', () => {
        startMusicOnInteraction();
        state.autoScrollOn = false;
        document.body.classList.add('surprise-open', 'made-visible');
        if (state.rafId) {
            cancelAnimationFrame(state.rafId);
            state.rafId = null;
        }
        requestAnimationFrame(() => {
            madeForYou.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });

    nextStoryBtn.addEventListener('click', () => {
        document.body.classList.add('why-visible');
        document.getElementById('whyMade').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    readyOpenBtn.addEventListener('click', () => {
        startCelebrationRain();
        document.body.classList.add('celebration-active');
        window.setTimeout(() => {
            document.body.classList.add('gallery-visible');
            startGalleryRain();
            revealGalleryCards();
            document.getElementById('gallerySection').scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 2400);
    });

    galleryNextBtn.addEventListener('click', () => {
        document.body.classList.remove('gallery-rain-active', 'welcome-rain-active');
        document.body.classList.add('love-visible');
        document.getElementById('loveSection').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
}

function startAutoScroll() {
    if (state.reducedMotion || !state.passwordUnlocked || !state.autoScrollOn) {
        return;
    }

    const loop = (timestamp) => {
        if (!state.autoScrollOn || state.reducedMotion) {
            return;
        }

        if (Date.now() < state.pauseUntil) {
            state.lastFrame = timestamp;
            state.rafId = requestAnimationFrame(loop);
            return;
        }

        if (state.lastFrame === 0) {
            state.lastFrame = timestamp;
        }

        const delta = Math.max(timestamp - state.lastFrame, 16);
        state.lastFrame = timestamp;

        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        if (window.scrollY >= maxScroll - 2) {
            state.autoScrollOn = false;
            return;
        }

        window.scrollBy(0, (APP_CONFIG.autoScrollSpeed * delta) / 1000);
        state.rafId = requestAnimationFrame(loop);
    };

    if (state.rafId) {
        cancelAnimationFrame(state.rafId);
    }

    state.lastFrame = 0;
    state.rafId = requestAnimationFrame(loop);
}

function pauseAutoScroll() {
    if (state.reducedMotion || !state.passwordUnlocked) {
        return;
    }

    state.autoScrollOn = false;
    if (state.rafId) {
        cancelAnimationFrame(state.rafId);
        state.rafId = null;
    }
    state.pauseUntil = Date.now() + APP_CONFIG.autoScrollPauseMs;
    state.lastFrame = 0;
}

function resumeAutoScrollAfterPause() {
    if (state.reducedMotion || !state.passwordUnlocked || state.resumeTimer) {
        return;
    }

    state.resumeTimer = window.setTimeout(() => {
        state.resumeTimer = null;
        if (Date.now() >= state.pauseUntil && state.passwordUnlocked) {
            state.autoScrollOn = true;
            startAutoScroll();
        }
    }, APP_CONFIG.autoScrollPauseMs);
}

function attachScrollPauseHandlers() {
    ['wheel', 'touchstart', 'touchmove', 'keydown', 'pointerdown'].forEach((eventName) => {
        window.addEventListener(eventName, () => {
            pauseAutoScroll();
            resumeAutoScrollAfterPause();
        }, { passive: true });
    });
}

function buildArrowInteraction() {
    if (!arrow) {
        return;
    }

    const setArrowTransform = () => {
        const pullOffset = state.arrowPull;
        const angle = -32 - pullOffset * 0.4;
        const x = -pullOffset * 0.85;
        const y = -pullOffset * 0.26;
        arrow.style.setProperty('--x', `${x}px`);
        arrow.style.setProperty('--y', `${y}px`);
        arrow.style.setProperty('--rot', `${angle}deg`);
    };

    const releaseArrow = () => {
        if (state.arrowShot) {
            return;
        }
        state.isDraggingArrow = false;
        state.arrowShot = true;
        arrow.style.transition = 'transform 0.8s cubic-bezier(0.22, 0.9, 0.26, 1)';
        arrow.style.setProperty('--x', '520px');
        arrow.style.setProperty('--y', '-80px');
        arrow.style.setProperty('--rot', '-18deg');

        setTimeout(() => {
            triggerHeartImpact();
            setTimeout(() => {
                finalMessage.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 550);
        }, 700);
    };

    const handlePointerMove = (event) => {
        if (!state.isDraggingArrow) {
            return;
        }

        const rect = arrowScene.getBoundingClientRect();
        const pointerX = event.clientX - rect.left;
        const pointerY = event.clientY - rect.top;
        const releaseX = pointerX - rect.width * 0.13;
        const releaseY = pointerY - rect.height * 0.55;
        const computedPull = Math.min(Math.max(Math.hypot(releaseX, releaseY) * 0.52, 0), 120);
        state.arrowPull = computedPull;
        setArrowTransform();
    };

    arrow.addEventListener('pointerdown', (event) => {
        if (state.arrowShot) {
            return;
        }
        state.isDraggingArrow = true;
        state.arrowPull = 0;
        arrow.setPointerCapture(event.pointerId);
        arrow.style.transition = 'none';
    });

    arrow.addEventListener('pointermove', handlePointerMove);
    arrow.addEventListener('pointerup', releaseArrow);
    arrow.addEventListener('pointercancel', () => {
        state.isDraggingArrow = false;
        state.arrowPull = 0;
        setArrowTransform();
    });
    arrow.addEventListener('click', releaseArrow);

    arrow.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            if (!state.arrowShot) {
                releaseArrow();
            }
        }
    });
}

function triggerHeartImpact() {
    if (state.finalArrowTriggered) {
        return;
    }
    state.finalArrowTriggered = true;

    const heartX = arrowScene.getBoundingClientRect().left + arrowScene.offsetWidth * 0.74;
    const heartY = arrowScene.getBoundingClientRect().top + arrowScene.offsetHeight * 0.58;

    for (let index = 0; index < 36; index += 1) {
        const heart = document.createElement('span');
        heart.className = 'heart-particle';
        heart.style.left = `${heartX}px`;
        heart.style.top = `${heartY}px`;
        heart.style.setProperty('--dx', `${(Math.random() - 0.5) * 200}px`);
        heart.style.setProperty('--dy', `${(-80 - Math.random() * 120)}px`);
        impactBursts.appendChild(heart);
        setTimeout(() => heart.remove(), 1200);
    }

    for (let index = 0; index < 28; index += 1) {
        const particle = document.createElement('span');
        particle.className = 'particle';
        particle.style.left = `${heartX}px`;
        particle.style.top = `${heartY}px`;
        particle.style.setProperty('--particle-color', ['#ffd1e7', '#f7c4ff', '#ffc46f', '#ff8ac7'][index % 4]);
        particle.style.setProperty('--dx', `${(Math.random() - 0.5) * 220}px`);
        particle.style.setProperty('--dy', `${(Math.random() - 0.5) * 220}px`);
        impactBursts.appendChild(particle);
        setTimeout(() => particle.remove(), 900);
    }
}

function initializeEverything() {
    setScreenVisibility(loginScreen, true);
    setScreenVisibility(mainStory, false);
    setScreenVisibility(curtainStage, false);
    setScreenVisibility(balloonScene, false);
    setScreenVisibility(heartScene, false);
    document.body.classList.remove('story-live');

    attachLoginEvents();
    revealGalleryCards();
    attachScrollPauseHandlers();
    buildArrowInteraction();

    if (bgMusic) {
        bgMusic.src = APP_CONFIG.musicPath;
    }
}

initializeEverything();
