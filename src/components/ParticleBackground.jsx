import React, { useEffect, useRef } from 'react';

const ParticleBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    let animationFrameId;
    let particles = [];
    const colors = ['#8b5cf6', '#3b82f6', '#d946ef', '#10b981']; // violet, blue, fuchsia, emerald
    
    let mouse = {
      x: typeof window !== 'undefined' ? window.innerWidth / 2 : 0,
      y: typeof window !== 'undefined' ? window.innerHeight / 2 : 0,
      radius: 500 // Expanded perimeter around the mouse
    };

    const handleMouseMove = (event) => {
      mouse.x = event.clientX;
      mouse.y = event.clientY;
    };

    const handleMouseLeave = () => {
      mouse.x = window.innerWidth / 2;
      mouse.y = window.innerHeight / 2;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    const handleMouseClick = (event) => {
      const explosionCount = 40;
      for (let i = 0; i < explosionCount; i++) {
        const p = new Particle();
        p.reset(true, event.clientX, event.clientY);
        particles.push(p);
      }
    };
    window.addEventListener('click', handleMouseClick);

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles();
    };

    class Particle {
      constructor() {
        this.isTemporary = false;
        this.reset();
        // Scatter life initially so they don't all die at the same time
        this.life = Math.random() * this.maxLife;
      }

      reset(isExplosion = false, x = 0, y = 0) {
        if (isExplosion) {
          this.x = x;
          this.y = y;
          const angle = Math.random() * Math.PI * 2;
          const speed = Math.random() * 8 + 2; // Fast initial burst
          this.vx = Math.cos(angle) * speed;
          this.vy = Math.sin(angle) * speed;
          this.size = Math.random() * 3 + 1;
          this.maxLife = Math.random() * 30 + 15; // Shorter life for explosion
          this.isTemporary = true;
        } else {
          // Spawn within a circle around the mouse
          const angle = Math.random() * Math.PI * 2;
          const distance = Math.sqrt(Math.random()) * mouse.radius;
          this.x = mouse.x + Math.cos(angle) * distance;
          this.y = mouse.y + Math.sin(angle) * distance;
          // Very slow drift
          this.vx = (Math.random() - 0.5) * 0.4;
          this.vy = (Math.random() - 0.5) * 0.4;
          this.size = Math.random() * 2 + 1; // thickness
          this.maxLife = Math.random() * 120 + 60; // How long it lives (frames)
          this.isTemporary = false;
        }
        
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.life = this.maxLife;
        
        // Make it look like a dash
        this.angle = Math.random() * Math.PI * 2;
        this.length = Math.random() * 8 + 4;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life--;

        if (this.isTemporary) {
           // Explosion particles slow down (friction)
           this.vx *= 0.92;
           this.vy *= 0.92;
        } else {
           // Gently pull towards mouse if it drifted too far
           const dx = mouse.x - this.x;
           const dy = mouse.y - this.y;
           const distance = Math.sqrt(dx * dx + dy * dy);
           if (distance > mouse.radius) {
              this.x += dx * 0.005;
              this.y += dy * 0.005;
           }
        }

        // Only reset permanent particles
        if (this.life <= 0 && !this.isTemporary) {
          this.reset();
        }
      }

      draw() {
        // Fade in and fade out logic based on life
        let opacity = 1;
        const fadeFrames = 20;
        if (this.life < fadeFrames) {
           opacity = this.life / fadeFrames;
        } else if (this.life > this.maxLife - fadeFrames) {
           opacity = (this.maxLife - this.life) / fadeFrames;
        }

        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x + Math.cos(this.angle) * this.length, this.y + Math.sin(this.angle) * this.length);
        ctx.strokeStyle = this.color;
        ctx.lineWidth = this.size;
        ctx.lineCap = 'round';
        ctx.globalAlpha = opacity * 0.7; // Max opacity 70% to keep it subtle
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
    }

    const initParticles = () => {
      particles = [];
      const count = 200; // Increased number of floating particles to cover larger area
      for (let i = 0; i < count; i++) {
        particles.push(new Particle());
      }
    };

    const animate = () => {
      // Clear canvas entirely (no trailing effect needed for floating particles)
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Filter out dead temporary particles to avoid array growing indefinitely
      particles = particles.filter(p => !(p.isTemporary && p.life <= 0));

      particles.forEach(p => {
        p.update();
        p.draw();
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    window.addEventListener('resize', resize);
    resize();
    animate();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('click', handleMouseClick);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed inset-0 pointer-events-none z-0"
      style={{ background: 'transparent' }}
    />
  );
};

export default ParticleBackground;
