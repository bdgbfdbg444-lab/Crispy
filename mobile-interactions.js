// mobile-interactions.js

document.addEventListener('DOMContentLoaded', () => {
    // Check if mobile
    if (window.innerWidth >= 992) return;

    // 1. Mobile Bottom Navigation active state logic (optional, based on scroll)
    const bottomNavItems = document.querySelectorAll('.bottom-nav-item');
    bottomNavItems.forEach(item => {
        item.addEventListener('click', (e) => {
            // Remove active from all
            bottomNavItems.forEach(nav => nav.classList.remove('active'));
            // Add to clicked
            e.currentTarget.classList.add('active');
        });
    });

    // 2. Haptic Feedback for Cart Buttons
    // Expose a global function for app-core.js to trigger on add to cart
    window.triggerHapticFeedback = function() {
        if (navigator.vibrate) {
            navigator.vibrate(50); // 50ms short vibration
        }
    };

    // 3. Initialize Swiper for Menu Categories & Cards
    window.initMobileSwiper = function() {
        // Find categories container and convert to swiper if not already
        const catSection = document.querySelector('.category-section');
        if(catSection && !catSection.classList.contains('swiper-initialized')) {
            // We need to wrap it appropriately.
            // app-core.js will generate the HTML with Swiper classes, so here we just init.
            try {
                new Swiper('.categories-swiper', {
                    slidesPerView: 'auto',
                    spaceBetween: 10,
                    freeMode: true,
                });

                new Swiper('.products-swiper', {
                    slidesPerView: 1.2,
                    spaceBetween: 20,
                    centeredSlides: true,
                    // If we want endless loop: loop: true,
                });
            } catch (e) {
                console.log("Swiper init error", e);
            }
        }
    };

    // 4. Mobile Video ScrollTrigger (Optional, fallback if GSAP loaded)
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);
        const video = document.getElementById('promo-video');
        if (video) {
            ScrollTrigger.create({
                trigger: '.video-section',
                start: "top 70%",
                end: "bottom 30%",
                onEnter: () => video.play(),
                onLeave: () => { video.pause(); video.muted = true; updateMuteBtnIcon(true); },
                onEnterBack: () => video.play(),
                onLeaveBack: () => { video.pause(); video.muted = true; updateMuteBtnIcon(true); }
            });

            const muteBtn = document.getElementById('mute-btn');
            if(muteBtn) {
                muteBtn.addEventListener('click', () => {
                    video.muted = !video.muted;
                    updateMuteBtnIcon(video.muted);
                });
            }

            function updateMuteBtnIcon(isMuted) {
                const icon = document.querySelector('#mute-btn i');
                if(icon) {
                    icon.className = isMuted ? 'fa-solid fa-volume-xmark' : 'fa-solid fa-volume-high';
                }
            }
        }
    }
});
