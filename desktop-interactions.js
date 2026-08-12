// desktop-interactions.js (Phase 7 - Cinematic Update)

document.addEventListener('DOMContentLoaded', () => {
    // Only run on desktop
    if (window.innerWidth < 992) return;

    // 1. Initialize Lenis Smooth Scrolling (if available)
    let lenis = null;
    try {
        if (typeof Lenis !== 'undefined') {
            lenis = new Lenis({
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
        }
    } catch(e) {
        console.warn('Lenis not available:', e.message);
    }

    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        
        if (!prefersReducedMotion) {
            gsap.registerPlugin(ScrollTrigger);
            
            if (lenis) {
                lenis.on('scroll', ScrollTrigger.update);
                gsap.ticker.add((time) => lenis.raf(time * 1000));
            }
        gsap.ticker.lagSmoothing(0, 0);

        // ==========================================
        // 01. GLOBAL HEADER SCROLL
        // ==========================================
        const header = document.querySelector('.global-header');
        if (header) {
            ScrollTrigger.create({
                start: 'top -50',
                end: 99999,
                toggleClass: { className: 'scrolled', targets: header }
            });
        }

        // ==========================================
        // 02. HERO PARALLAX (Scroll Depth)
        // ==========================================
        const heroLayers = document.querySelectorAll('.hero-layer');
        heroLayers.forEach(layer => {
            const speed = parseFloat(layer.getAttribute('data-speed')) || 0;
            gsap.to(layer, {
                y: window.innerHeight * speed,
                ease: "none",
                scrollTrigger: {
                    trigger: '.hero-cinematic',
                    start: 'top top',
                    end: 'bottom top',
                    scrub: true
                }
            });
        });

        // ==========================================
        // 03. HERO MOUSE INTERACTION (Physics)
        // ==========================================
        const heroSection = document.querySelector('.hero-cinematic');
        const tiltElements = document.querySelectorAll('.parallax-tilt');
        const tiltOpposite = document.querySelectorAll('.parallax-tilt-opposite');
        
        if (heroSection) {
            heroSection.addEventListener('mousemove', (e) => {
                const rect = heroSection.getBoundingClientRect();
                const x = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2); // -1 to 1
                const y = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2); // -1 to 1
                
                // Tilt main
                gsap.to(tiltElements, {
                    rotationX: -y * 15,
                    rotationY: x * 15,
                    x: x * 30,
                    y: y * 30,
                    duration: 1,
                    ease: "power2.out"
                });

                // Tilt secondary opposite
                gsap.to(tiltOpposite, {
                    rotationX: y * 10,
                    rotationY: -x * 10,
                    x: -x * 40,
                    y: -y * 40,
                    duration: 1.5,
                    ease: "power2.out"
                });
            });
            
            heroSection.addEventListener('mouseleave', () => {
                gsap.to([...tiltElements, ...tiltOpposite], {
                    rotationX: 0, rotationY: 0, x: 0, y: 0,
                    duration: 1.5,
                    ease: "power3.out"
                });
            });
        }

        // ==========================================
        // 04. SCROLL FADE UP ANIMATIONS
        // ==========================================
        const fadeElements = document.querySelectorAll('.scroll-fade-up');
        fadeElements.forEach(el => {
            gsap.fromTo(el, 
                { y: 50, opacity: 0 },
                { 
                    y: 0, opacity: 1, duration: 1, ease: "power3.out",
                    scrollTrigger: {
                        trigger: el,
                        start: "top 85%",
                        toggleActions: "play none none reverse"
                    }
                }
            );
        });

        // ==========================================
        // 05. LOW & SLOW ZOOM EFFECT
        // ==========================================
        const lowSlowBg = document.querySelector('.low-slow-bg img');
        if (lowSlowBg) {
            gsap.to(lowSlowBg, {
                scale: 1.15,
                ease: "none",
                scrollTrigger: {
                    trigger: '.scroll-zoom-section',
                    start: 'top bottom',
                    end: 'bottom top',
                    scrub: true
                }
            });
        }
        
        const parallaxTexts = document.querySelectorAll('.parallax-text');
        parallaxTexts.forEach(txt => {
            const speed = parseFloat(txt.getAttribute('data-speed')) || 0.2;
            // Find closest parent section to act as trigger
            const triggerEl = txt.closest('section') || '.scroll-zoom-section';
            
            gsap.to(txt, {
                y: -100 * speed,
                ease: "none",
                scrollTrigger: {
                    trigger: triggerEl,
                    start: 'top bottom',
                    end: 'bottom top',
                    scrub: true
                }
            });
        });
        
        } // End of prefersReducedMotion check
    }

    // Export function for dynamic cards (from app-core) if we need specific hover JS
    window.initDesktop3DMenu = function() {
        // Handled mostly by CSS for the new signature cards.
    };
});
