// desktop-interactions.js

document.addEventListener('DOMContentLoaded', () => {
    // Check if desktop
    if (window.innerWidth < 992) return;

    // 1. Initialize Lenis (Smooth Scroll)
    const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // https://www.desmos.com/calculator/brs54l4xou
        direction: 'vertical',
        gestureDirection: 'vertical',
        smooth: true,
        mouseMultiplier: 1,
        smoothTouch: false,
        touchMultiplier: 2,
        infinite: false,
    });

    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Integrate GSAP with Lenis
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);
        
        lenis.on('scroll', ScrollTrigger.update);
        
        gsap.ticker.add((time)=>{
            lenis.raf(time * 1000);
        });
        
        gsap.ticker.lagSmoothing(0, 0);

        // 2. Parallax Animations for Hero and Sections
        
        // Example: Hero title moves slightly up while scrolling down
        gsap.to('.hero-title', {
            y: -50,
            opacity: 0,
            scrollTrigger: {
                trigger: '.hero-section',
                start: 'top top',
                end: 'bottom top',
                scrub: 1
            }
        });

        // 3. Autoplay/Mute Video logic using ScrollTrigger
        const video = document.getElementById('promo-video');
        if (video) {
            ScrollTrigger.create({
                trigger: '.video-section',
                start: "top 80%",
                end: "bottom 20%",
                onEnter: () => video.play(),
                onLeave: () => {
                    video.pause();
                    video.muted = true; // ensure muted when leaving
                    updateMuteBtnIcon(true);
                },
                onEnterBack: () => video.play(),
                onLeaveBack: () => {
                    video.pause();
                    video.muted = true;
                    updateMuteBtnIcon(true);
                }
            });

            // Mute Button Logic
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

    // 4. 3D Tilt Effect on Menu Cards (Initialize globally via event delegation or direct setup)
    // We can export a function to be called by app-core.js after Firebase loads data.
    window.initDesktop3DMenu = function() {
        const cards = document.querySelectorAll('.product-card');
        cards.forEach(card => {
            card.addEventListener('mousemove', handleTilt);
            card.addEventListener('mouseleave', resetTilt);
        });

        function handleTilt(e) {
            const card = e.currentTarget;
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = ((y - centerY) / centerY) * -10; // max 10 deg
            const rotateY = ((x - centerX) / centerX) * 10;
            
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
        }

        function resetTilt(e) {
            const card = e.currentTarget;
            card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
        }
    };
});
