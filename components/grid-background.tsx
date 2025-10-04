"use client";

import { useEffect, useState } from "react";

interface RandomElement {
  left: number;
  top: number;
  width: number;
  height: number;
  opacity: number;
  animationDelay: number;
  animationDuration: number;
}

interface RandomLine extends RandomElement {
  transform: number;
}

interface RandomShape extends RandomElement {
  background: string;
  borderRadius: string;
}

export function GridBackground() {
  const [dots, setDots] = useState<RandomElement[]>([]);
  const [largeDots, setLargeDots] = useState<RandomElement[]>([]);
  const [lines, setLines] = useState<RandomLine[]>([]);
  const [shapes, setShapes] = useState<RandomShape[]>([]);

  useEffect(() => {
    // Generate random values only on client side
    setDots(
      Array.from({ length: 25 }).map(() => ({
        left: Math.random() * 100,
        top: Math.random() * 100,
        width: 2 + Math.random() * 3,
        height: 2 + Math.random() * 3,
        opacity: 0.2 + Math.random() * 0.3,
        animationDelay: Math.random() * 4,
        animationDuration: 2 + Math.random() * 3,
      })),
    );

    setLargeDots(
      Array.from({ length: 8 }).map(() => ({
        left: Math.random() * 100,
        top: Math.random() * 100,
        width: 4 + Math.random() * 2,
        height: 4 + Math.random() * 2,
        opacity: 0.2 + Math.random() * 0.3,
        animationDelay: Math.random() * 6,
        animationDuration: 4 + Math.random() * 4,
      })),
    );

    setLines(
      Array.from({ length: 12 }).map(() => ({
        left: Math.random() * 100,
        top: Math.random() * 100,
        width: 150 + Math.random() * 400,
        height: 1, // h-px
        opacity: 0.3,
        animationDelay: Math.random() * 5,
        animationDuration: 3 + Math.random() * 4,
        transform: Math.random() * 360,
      })),
    );

    setShapes(
      Array.from({ length: 6 }).map((_, i) => ({
        left: Math.random() * 100,
        top: Math.random() * 100,
        width: 8 + Math.random() * 4,
        height: 8 + Math.random() * 4,
        opacity: 0.2,
        animationDelay: Math.random() * 8,
        animationDuration: 5 + Math.random() * 3,
        background:
          i % 2 === 0
            ? "linear-gradient(45deg, #3b82f6, #8b5cf6)"
            : "linear-gradient(45deg, #06b6d4, #3b82f6)",
        borderRadius: i % 3 === 0 ? "50%" : "20%",
      })),
    );
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Main grid pattern */}
      <div
        className="absolute inset-0 opacity-25"
        style={{
          backgroundImage: `
            linear-gradient(rgba(59, 130, 246, 0.15) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59, 130, 246, 0.15) 1px, transparent 1px)
          `,
          backgroundSize: "50px 50px",
          backgroundPosition: "0 0, 0 0",
        }}
      />

      {/* Secondary grid pattern for depth */}
      <div
        className="absolute inset-0 opacity-15"
        style={{
          backgroundImage: `
            linear-gradient(rgba(99, 102, 241, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(99, 102, 241, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: "100px 100px",
          backgroundPosition: "25px 25px, 25px 25px",
        }}
      />

      {/* Tertiary grid for more depth */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(rgba(147, 51, 234, 0.08) 1px, transparent 1px),
            linear-gradient(90deg, rgba(147, 51, 234, 0.08) 1px, transparent 1px)
          `,
          backgroundSize: "200px 200px",
          backgroundPosition: "50px 50px, 50px 50px",
        }}
      />

      {/* Animated dots for visual interest */}
      <div className="absolute inset-0">
        {dots.map((dot, i) => (
          <div
            key={i}
            className="absolute bg-blue-400 rounded-full animate-pulse"
            style={{
              left: `${dot.left}%`,
              top: `${dot.top}%`,
              width: `${dot.width}px`,
              height: `${dot.height}px`,
              opacity: dot.opacity,
              animationDelay: `${dot.animationDelay}s`,
              animationDuration: `${dot.animationDuration}s`,
            }}
          />
        ))}
      </div>

      {/* Larger floating dots */}
      <div className="absolute inset-0">
        {largeDots.map((dot, i) => (
          <div
            key={`large-${i}`}
            className="absolute bg-gradient-to-r from-blue-400 to-purple-500 rounded-full animate-pulse"
            style={{
              left: `${dot.left}%`,
              top: `${dot.top}%`,
              width: `${dot.width}px`,
              height: `${dot.height}px`,
              opacity: dot.opacity,
              animationDelay: `${dot.animationDelay}s`,
              animationDuration: `${dot.animationDuration}s`,
            }}
          />
        ))}
      </div>

      {/* Subtle animated lines */}
      <div className="absolute inset-0">
        {lines.map((line, i) => (
          <div
            key={`line-${i}`}
            className="absolute h-px bg-gradient-to-r from-transparent via-blue-300 to-transparent opacity-30 animate-pulse"
            style={{
              left: `${line.left}%`,
              top: `${line.top}%`,
              width: `${line.width}px`,
              transform: `rotate(${line.transform}deg)`,
              animationDelay: `${line.animationDelay}s`,
              animationDuration: `${line.animationDuration}s`,
            }}
          />
        ))}
      </div>

      {/* Floating geometric shapes */}
      <div className="absolute inset-0">
        {shapes.map((shape, i) => (
          <div
            key={`shape-${i}`}
            className="absolute opacity-20 animate-pulse"
            style={{
              left: `${shape.left}%`,
              top: `${shape.top}%`,
              width: `${shape.width}px`,
              height: `${shape.height}px`,
              background: shape.background,
              borderRadius: shape.borderRadius,
              animationDelay: `${shape.animationDelay}s`,
              animationDuration: `${shape.animationDuration}s`,
            }}
          />
        ))}
      </div>

      {/* Gradient overlay for subtle fade */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white/10" />
    </div>
  );
}
