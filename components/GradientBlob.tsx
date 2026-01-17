"use client";

import { useEffect, useRef } from "react";

export default function GradientBlob() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    const setCanvasSize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    setCanvasSize();
    window.addEventListener("resize", setCanvasSize);

    let animationFrameId: number;
    let time = 0;

    const animate = () => {
      time += 0.005;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const width = canvas.offsetWidth;
      const height = canvas.offsetHeight;

      // Create gradient blob
      const gradient1 = ctx.createRadialGradient(
        width * 0.3 + Math.sin(time) * 100,
        height * 0.4 + Math.cos(time * 0.8) * 80,
        0,
        width * 0.3 + Math.sin(time) * 100,
        height * 0.4 + Math.cos(time * 0.8) * 80,
        width * 0.6
      );
      gradient1.addColorStop(0, "rgba(168, 85, 247, 0.4)"); // Purple
      gradient1.addColorStop(0.5, "rgba(59, 130, 246, 0.3)"); // Blue
      gradient1.addColorStop(1, "rgba(0, 0, 0, 0)");

      const gradient2 = ctx.createRadialGradient(
        width * 0.7 + Math.cos(time * 1.2) * 120,
        height * 0.6 + Math.sin(time * 0.9) * 90,
        0,
        width * 0.7 + Math.cos(time * 1.2) * 120,
        height * 0.6 + Math.sin(time * 0.9) * 90,
        width * 0.5
      );
      gradient2.addColorStop(0, "rgba(236, 72, 153, 0.3)"); // Pink
      gradient2.addColorStop(0.5, "rgba(59, 130, 246, 0.2)"); // Blue
      gradient2.addColorStop(1, "rgba(0, 0, 0, 0)");

      const gradient3 = ctx.createRadialGradient(
        width * 0.5 + Math.sin(time * 0.7) * 80,
        height * 0.3 + Math.cos(time * 1.1) * 100,
        0,
        width * 0.5 + Math.sin(time * 0.7) * 80,
        height * 0.3 + Math.cos(time * 1.1) * 100,
        width * 0.4
      );
      gradient3.addColorStop(0, "rgba(34, 211, 238, 0.3)"); // Cyan
      gradient3.addColorStop(0.5, "rgba(16, 185, 129, 0.2)"); // Emerald
      gradient3.addColorStop(1, "rgba(0, 0, 0, 0)");

      // Draw blobs
      ctx.fillStyle = gradient1;
      ctx.fillRect(0, 0, width, height);

      ctx.globalCompositeOperation = "screen";
      ctx.fillStyle = gradient2;
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = gradient3;
      ctx.fillRect(0, 0, width, height);

      ctx.globalCompositeOperation = "source-over";

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", setCanvasSize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden">
      <canvas
        ref={canvasRef}
        className="h-full w-full blur-3xl"
        style={{ filter: "blur(80px)" }}
      />
    </div>
  );
}
