// desktop-interactions.js

document.addEventListener('DOMContentLoaded', () => {
    // Check if desktop
    if (window.innerWidth < 992) return;

    // 1. Initialize Lenis (Smooth Scroll)
    const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), 
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

        // ==========================================
        // CINEMATIC HERO ANIMATIONS
        // ==========================================
        
        // 1. Oversized Text Parallax (Moves down slowly as we scroll down)
        gsap.to('.hero-oversized-text', {
            y: 300,
            opacity: 0,
            scale: 0.9,
            scrollTrigger: {
                trigger: '#hero-section',
                start: 'top top',
                end: 'bottom top',
                scrub: true
            }
        });

        // 2. Main Burger scroll interaction (Moves up slightly, pushing forward)
        gsap.to('#main-hero-burger', {
            y: -100,
            scale: 1.1,
            scrollTrigger: {
                trigger: '#hero-section',
                start: 'top top',
                end: 'bottom top',
                scrub: true
            }
        });

        // 3. Floating Ingredients Parallax based on data-speed
        const ingredients = document.querySelectorAll('.hero-ingredient');
        ingredients.forEach(item => {
            const speed = parseFloat(item.getAttribute('data-speed')) || 0.5;
            // if speed is positive, it moves down (back layer). If negative, it moves up (front layer).
            gsap.to(item, {
                y: () => 500 * speed,
                rotation: () => speed * 100,
                scrollTrigger: {
                    trigger: '#hero-section',
                    start: 'top top',
                    end: 'bottom top',
                    scrub: true
                }
            });
        });

        // 4. Cursor Magnetic 3D Tilt for Main Burger
        const heroSection = document.getElementById('hero-section');
        const mainBurger = document.getElementById('main-hero-burger');
        
        if (heroSection && mainBurger) {
            heroSection.addEventListener('mousemove', (e) => {
                const rect = heroSection.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                
                // Calculate tilt angles based on mouse distance from center
                const rotateX = ((y - centerY) / centerY) * -15; // Max 15 deg tilt
                const rotateY = ((x - centerX) / centerX) * 15;
                
                // Move slightly towards the mouse
                const moveX = ((x - centerX) / centerX) * 30; // Max 30px move
                const moveY = ((y - centerY) / centerY) * 30;
                
                gsap.to(mainBurger, {
                    rotationX: rotateX,
                    rotationY: rotateY,
                    x: moveX,
                    y: moveY,
                    duration: 0.8,
                    ease: "power2.out"
                });
            });
            
            heroSection.addEventListener('mouseleave', () => {
                gsap.to(mainBurger, {
                    rotationX: 0,
                    rotationY: 0,
                    x: 0,
                    y: 0,
                    duration: 1.2,
                    ease: "elastic.out(1, 0.3)"
                });
            });
        }
        // ==========================================
        // 02. BBQ STATEMENT
        // ==========================================
        gsap.from('.reveal-text', {
            y: 50,
            opacity: 0,
            duration: 1.5,
            ease: "power3.out",
            scrollTrigger: {
                trigger: '.reveal-text',
                start: "top 85%"
            }
        });

        // ==========================================
        // 03. THE CRAFT (Parallax assembly)
        // ==========================================
        const craftLayers = document.querySelectorAll('.craft-layer');
        craftLayers.forEach(layer => {
            const startY = parseFloat(layer.getAttribute('data-y')) || 0;
            gsap.fromTo(layer, 
                { y: startY, opacity: 0 },
                {
                    y: 0,
                    opacity: 1,
                    ease: "power2.out",
                    scrollTrigger: {
                        trigger: '#craft-section',
                        start: 'top 60%',
                        end: 'center center',
                        scrub: 1
                    }
                }
            );
        });

        // ==========================================
        // 04. LOW & SLOW (Huge Text Parallax + Brisket rotation)
        // ==========================================
        gsap.to('.low-slow-text', {
            xPercent: -30,
            scrollTrigger: {
                trigger: '#low-slow-section',
                start: 'top bottom',
                end: 'bottom top',
                scrub: true
            }
        });

        gsap.from('.centerpiece-brisket', {
            scale: 0.8,
            rotationZ: -10,
            rotationY: 30,
            scrollTrigger: {
                trigger: '#low-slow-section',
                start: 'top bottom',
                end: 'bottom top',
                scrub: true
            }
        });

        // ==========================================
        // 05. SIGNATURE MENU (Card Hover)
        // ==========================================
        const premiumCards = document.querySelectorAll('.premium-card');
        premiumCards.forEach(card => {
            const img = card.querySelector('.premium-card-img');
            card.addEventListener('mouseenter', () => {
                gsap.to(img, { scale: 1.15, y: -20, duration: 0.5, ease: "power2.out" });
            });
            card.addEventListener('mouseleave', () => {
                gsap.to(img, { scale: 1, y: 0, duration: 0.5, ease: "power2.out" });
            });
        });
    }

    // Menu Card 3D Tilt Effect
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
            
            const rotateX = ((y - centerY) / centerY) * -10;
            const rotateY = ((x - centerX) / centerX) * 10;
            
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
        }

        function resetTilt(e) {
            const card = e.currentTarget;
            card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
        }
    };
});
