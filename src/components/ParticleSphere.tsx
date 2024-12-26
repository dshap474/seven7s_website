import React, { useEffect, useRef } from 'react';

const ParticleSphere: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const setCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    setCanvasSize();
    window.addEventListener('resize', setCanvasSize);

    class Particle {
      x: number = 0;
      y: number = 0;
      z: number = 0;
      theta: number;
      phi: number;
      radius: number;

      constructor() {
        const canvasWidth = canvas!.width;
        const canvasHeight = canvas!.height;
        
        this.theta = Math.random() * Math.PI * 2;
        this.phi = Math.random() * Math.PI;
        this.radius = Math.min(canvasWidth, canvasHeight) * 0.45;
        this.updatePosition();
      }

      updatePosition() {
        this.x = canvas!.width/2 + this.radius * Math.sin(this.phi) * Math.cos(this.theta);
        this.y = canvas!.height/2 + this.radius * Math.sin(this.phi) * Math.sin(this.theta);
        this.z = this.radius * Math.cos(this.phi);
      }

      update() {
        this.theta += 0.005;
        this.phi += 0.0025;
        if (this.phi > Math.PI * 2) this.phi = 0;
        this.updatePosition();
      }

      draw() {
        ctx!.fillStyle = 'rgb(0, 255, 255)';
        ctx!.beginPath();
        ctx!.rect(Math.floor(this.x), Math.floor(this.y), 1, 1);
        ctx!.fill();
      }
    }

    const particles: Particle[] = Array.from({ length: 3000 }, () => new Particle());

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach(particle => {
        particle.update();
        particle.draw();
      });
      
      requestAnimationFrame(animate);
    };

    animate();

    return () => window.removeEventListener('resize', setCanvasSize);
  }, []);

  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ background: 'transparent' }}
      />
    </div>
  );
};

export default ParticleSphere; 