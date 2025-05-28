import React, { useEffect, useRef } from 'react';
import './Orbit.css';
import NextButton from '../small_components/next_button';

export default function Orbit() {
  // Referencias a los elementos que mueves por JS
  const cursorRef   = useRef(null);
  const progressRef = useRef(null);
  const circlesRef  = {
    c1: useRef(null),
    c2: useRef(null),
    c3: useRef(null),
    c4: useRef(null),
    c5: useRef(null),
  };

  useEffect(() => {
    console.log("Orbit montado 🚀");
    // ===== SCROLL & CIRCLES =====
    const size = 50; // diámetro

    function onScroll() {
      const scrollTop = window.scrollY;
      const maxScroll = document.body.scrollHeight - window.innerHeight;
      const prog = scrollTop / maxScroll;

      const { c1, c2, c3, c4, c5 } = circlesRef;
      // lógica de displayCircle
      if (prog >= 0.8 || prog <= 0.55) {
        c3.current.classList.remove("displayCircle");
        c4.current.classList.add("displayCircle");
        c5.current.classList.add("displayCircle");
      } else if (prog >= 0.5) {
        c3.current.classList.add("displayCircle");
        c4.current.classList.remove("displayCircle");
        c5.current.classList.remove("displayCircle");
      }

      // órbita
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      const r  = Math.hypot(cx, cy) * 0.8;
      const startAngle = -3.5 * Math.PI / 4;
      const theta1 = startAngle + prog * 3 * Math.PI;
      const theta2 = theta1 + Math.PI;

      const x1 = cx + r * Math.cos(theta1) - size/2;
      const y1 = cy + r * Math.sin(theta1) - size/2;
      const x2 = cx + r * Math.cos(theta2) - size/2;
      const y2 = cy + r * Math.sin(theta2) - size/2;

      c1.current.style.left = `${x1}px`;
      c1.current.style.top  = `${y1}px`;
      c2.current.style.left = `${x2}px`;
      c2.current.style.top  = `${y2}px`;
    }

    window.addEventListener('scroll', onScroll);
    onScroll(); // posición inicial

    // ===== INTERSECTION OBSERVER =====
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('fade-in');
          entry.target.classList.remove('hidden');
        } else {
          entry.target.classList.remove('fade-in');
          entry.target.classList.add('hidden');
        }
      });
    }, { threshold: 0.5 });

    document.querySelectorAll('.title, .subtitle').forEach(el => {
      el.classList.add('hidden');
      observer.observe(el);
    });

    // ===== PROGRESS BAR =====
    const pb = progressRef.current;
    pb.style.transformOrigin = '0% 50%';
    pb.animate(
      { transform: ['scaleX(0)', 'scaleX(1)'] },
      { fill: 'forwards', timeline: new ScrollTimeline({ source: document.documentElement }) }
    );

    // ===== CUSTOM CURSOR =====
    let mouseX = 0, mouseY = 0, currentX = 0, currentY = 0;

    function onMouseMove(e) {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (e.target.closest('.interactive')) {
        cursorRef.current.classList.add('cursorActive');
      } else {
        cursorRef.current.classList.remove('cursorActive');
      }
    }

    function animateCursor() {
      currentX += (mouseX - currentX) * 0.1;
      currentY += (mouseY - currentY) * 0.1;
      cursorRef.current.style.transform = `translate(${currentX}px, ${currentY}px)`;
      requestAnimationFrame(animateCursor);
    }

    window.addEventListener('mousemove', onMouseMove);
    animateCursor();

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('mousemove', onMouseMove);
      observer.disconnect();
    };
  }, []);

  return (
    <>
      <div className="cursor"   ref={cursorRef}   />
      <div id="progress"        ref={progressRef} />
      <div className="circle1"   ref={circlesRef.c1} />
      <div className="circle2"   ref={circlesRef.c2} />
      <div className="circle3"   ref={circlesRef.c3} />
      <div className="circle4"   ref={circlesRef.c4} />
      <div className="circle5"   ref={circlesRef.c5} />

      {[1,2,3,4].map(n => (
        <section key={n} id={`${n}`}>
          <h1 className="title interactive">
            {['A new era','In the way','Welcome to','mirrOS'][n-1]}
          </h1>
          {n===2 && <h3 className="subtitle interactive">You see stuff</h3>}
        </section>
      ))}
      <NextButton />
    </>
  );
}
