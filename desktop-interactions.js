// desktop-interactions.js (Zero to Production Rewrite)

document.addEventListener('DOMContentLoaded', () => {
    // Only run on desktop
    if (window.innerWidth < 992) return;

    // 1. Initialize Lenis Smooth Scrolling
    const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), 
        direction: 'vertical',
        smooth: true,
        smoothTouch: false,
    });

    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);
        
        lenis.on('scroll', ScrollTrigger.update);
        gsap.ticker.add((time) => lenis.raf(time * 1000));
        gsap.ticker.lagSmoothing(0, 0);

        // ==========================================
        // 01. GLOBAL HEADER SCROLL
        // ==========================================
        const header = document.querySelector('.global-header');
        ScrollTrigger.create({
            start: 'top -50',
            end: 99999,
            toggleClass: { className: 'scrolled', targets: header }
        });

        // ==========================================
        // 02. HERO ANIMATIONS (Initial Load & Scroll)
        // ==========================================
        // Initial Entry
        const tlHero = gsap.timeline();
        tlHero.from('.hero-title', { y: 100, opacity: 0, duration: 1.5, ease: "power4.out" })
              .from('#main-hero-food', { scale: 0.8, opacity: 0, rotationY: 15, duration: 1.5, ease: "power3.out" }, "-=1")
              .from('.hero-float', { y: 50, opacity: 0, duration: 1, stagger: 0.2, ease: "back.out(1.5)" }, "-=1");

        // Scroll Parallax (Depth Effect)
        gsap.to('.hero-title', {
            y: 300,
            scale: 0.9,
            opacity: 0,
            scrollTrigger: {
                trigger: '#hero-section',
                start: 'top top',
                end: 'bottom top',
                scrub: true
            }
        });

        gsap.to('#main-hero-food', {
            y: -150,
            scale: 1.1,
            scrollTrigger: {
                trigger: '#hero-section',
                start: 'top top',
                end: 'bottom top',
                scrub: true
            }
        });

        // ==========================================
        // 03. HERO MOUSE INTERACTION (Physics)
        // ==========================================
        const heroSection = document.getElementById('hero-section');
        const mainFood = document.getElementById('main-hero-food');
        const floats = document.querySelectorAll('.hero-float');
        
        if (heroSection && mainFood) {
            heroSection.addEventListener('mousemove', (e) => {
                const rect = heroSection.getBoundingClientRect();
                const x = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2); // -1 to 1
                const y = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2); // -1 to 1
                
                // Tilt & Move main food
                gsap.to(mainFood, {
                    rotationX: -y * 10,
                    rotationY: x * 10,
                    x: x * 20,
                    y: y * 20,
                    duration: 1,
                    ease: "power2.out"
                });

                // Move floating elements inversely and faster for depth
                floats.forEach(float => {
                    const isFast = float.classList.contains('float-fast');
                    const multiplier = isFast ? -40 : -20;
                    gsap.to(float, {
                        x: x * multiplier,
                        y: y * multiplier,
                        rotation: x * 15,
                        duration: 1.5,
                        ease: "power2.out"
                    });
                });
            });
            
            heroSection.addEventListener('mouseleave', () => {
                gsap.to([mainFood, ...floats], {
                    rotationX: 0, rotationY: 0, x: 0, y: 0, rotation: 0,
                    duration: 1.5,
                    ease: "elastic.out(1, 0.5)"
                });
            });
        }

        // ==========================================
        // 04. EDITORIAL MENU (Card Hover Depth)
        // ==========================================
        const editCards = document.querySelectorAll('.editorial-card');
        editCards.forEach(card => {
            const img = card.querySelector('img');
            
            card.addEventListener('mouseenter', () => {
                gsap.to(card, { y: -10, boxShadow: '0 20px 40px rgba(0,0,0,0.8)', duration: 0.4, ease: "power2.out" });
                gsap.to(img, { scale: 1.15, y: -20, rotationZ: 5, duration: 0.5, ease: "back.out(1.5)" });
            });
            
            card.addEventListener('mouseleave', () => {
                gsap.to(card, { y: 0, boxShadow: 'none', duration: 0.4, ease: "power2.out" });
                gsap.to(img, { scale: 1, y: 0, rotationZ: 0, duration: 0.5, ease: "power2.out" });
            });
        });
    }

    // Export function for dynamic cards (from app-core)
    window.initDesktop3DMenu = function() {
        // Redefined for dynamic injection if needed
        const editCards = document.querySelectorAll('.editorial-card');
        editCards.forEach(card => {
            const img = card.querySelector('img');
            card.addEventListener('mouseenter', () => {
                gsap.to(card, { y: -10, boxShadow: '0 20px 40px rgba(0,0,0,0.8)', duration: 0.4, ease: "power2.out" });
                gsap.to(img, { scale: 1.15, y: -20, rotationZ: 5, duration: 0.5, ease: "back.out(1.5)" });
            });
            card.addEventListener('mouseleave', () => {
                gsap.to(card, { y: 0, boxShadow: 'none', duration: 0.4, ease: "power2.out" });
                gsap.to(img, { scale: 1, y: 0, rotationZ: 0, duration: 0.5, ease: "power2.out" });
            });
        });
    };
});
