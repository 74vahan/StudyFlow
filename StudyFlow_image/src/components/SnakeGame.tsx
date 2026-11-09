"use client";

import { useEffect, useRef, useState } from "react";

// A small, playable Snake game drawn on a canvas. Meant to sit in the background
// of the /pending screen: arrow keys / WASD steer the snake; hitting a wall or
// itself restarts. Purely client-side, no state leaves the component.

const CELL = 22; // px per grid cell
const TICK_MS = 110; // step interval

type Point = { x: number; y: number };

function roundRect(
  c: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  c.beginPath();
  c.moveTo(x + r, y);
  c.arcTo(x + w, y, x + w, y + h, r);
  c.arcTo(x + w, y + h, x, y + h, r);
  c.arcTo(x, y + h, x, y, r);
  c.arcTo(x, y, x + w, y, r);
  c.closePath();
}

export function SnakeGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);

  useEffect(() => {
    const canvasEl = canvasRef.current;
    if (!canvasEl) return;
    const context = canvasEl.getContext("2d");
    if (!context) return;
    const el: HTMLCanvasElement = canvasEl;
    const ctx: CanvasRenderingContext2D = context;

    let cols = 0;
    let rows = 0;
    let snake: Point[] = [];
    let dir: Point = { x: 1, y: 0 };
    let nextDir: Point = { x: 1, y: 0 };
    let food: Point = { x: 5, y: 5 };
    let localScore = 0;

    function sizeToParent() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = el.clientWidth;
      const h = el.clientHeight;
      el.width = Math.floor(w * dpr);
      el.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.max(8, Math.floor(w / CELL));
      rows = Math.max(8, Math.floor(h / CELL));
    }

    function randCell(): Point {
      return {
        x: Math.floor(Math.random() * cols),
        y: Math.floor(Math.random() * rows),
      };
    }

    function placeFood() {
      let f = randCell();
      while (snake.some((s) => s.x === f.x && s.y === f.y)) f = randCell();
      food = f;
    }

    function reset() {
      const cx = Math.floor(cols / 2);
      const cy = Math.floor(rows / 2);
      snake = [
        { x: cx, y: cy },
        { x: cx - 1, y: cy },
        { x: cx - 2, y: cy },
      ];
      dir = { x: 1, y: 0 };
      nextDir = { x: 1, y: 0 };
      localScore = 0;
      setScore(0);
      placeFood();
    }

    function stepGame() {
      dir = nextDir;
      const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };
      if (head.x < 0 || head.y < 0 || head.x >= cols || head.y >= rows) {
        reset();
        return;
      }
      if (snake.some((s) => s.x === head.x && s.y === head.y)) {
        reset();
        return;
      }
      snake.unshift(head);
      if (head.x === food.x && head.y === food.y) {
        localScore += 1;
        setScore(localScore);
        placeFood();
      } else {
        snake.pop();
      }
    }

    function draw() {
      const w = el.clientWidth;
      const h = el.clientHeight;
      ctx.clearRect(0, 0, w, h);
      // Atompunk board: warm cream with faint ink grid.
      ctx.fillStyle = "#ece0c3";
      ctx.fillRect(0, 0, w, h);

      ctx.strokeStyle = "rgba(43,36,32,0.06)";
      ctx.lineWidth = 1;
      for (let x = 0; x <= cols; x++) {
        ctx.beginPath();
        ctx.moveTo(x * CELL, 0);
        ctx.lineTo(x * CELL, rows * CELL);
        ctx.stroke();
      }
      for (let y = 0; y <= rows; y++) {
        ctx.beginPath();
        ctx.moveTo(0, y * CELL);
        ctx.lineTo(cols * CELL, y * CELL);
        ctx.stroke();
      }

      // Food: teal. Snake: tangerine body, mustard head.
      ctx.fillStyle = "#11999e";
      roundRect(ctx, food.x * CELL + 3, food.y * CELL + 3, CELL - 6, CELL - 6, 4);
      ctx.fill();

      snake.forEach((s, i) => {
        ctx.fillStyle = i === 0 ? "#edab25" : "#f26419";
        roundRect(ctx, s.x * CELL + 2, s.y * CELL + 2, CELL - 4, CELL - 4, 5);
        ctx.fill();
      });
    }

    function loop() {
      stepGame();
      draw();
    }

    const onKey = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      let nd: Point | null = null;
      if (k === "arrowup" || k === "w") nd = { x: 0, y: -1 };
      else if (k === "arrowdown" || k === "s") nd = { x: 0, y: 1 };
      else if (k === "arrowleft" || k === "a") nd = { x: -1, y: 0 };
      else if (k === "arrowright" || k === "d") nd = { x: 1, y: 0 };
      if (!nd) return;
      e.preventDefault();
      if (nd.x === -dir.x && nd.y === -dir.y) return; // no 180° reversal
      nextDir = nd;
    };

    const onResize = () => sizeToParent();

    sizeToParent();
    reset();
    draw();
    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    const id = window.setInterval(loop, TICK_MS);

    return () => {
      window.clearInterval(id);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <>
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden="true" />
      <div className="pointer-events-none absolute left-4 top-16 z-20 select-none text-sm font-bold text-ink/70">
        🐍 {score}
      </div>
    </>
  );
}
