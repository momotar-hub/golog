import React, { useRef, useEffect, useState } from 'react';
import { Word, PhysicsBubble, TouchTrailNode } from '../types';
import { RefreshCw, Lock, Hand, Sparkles, HelpCircle, X } from 'lucide-react';

interface WordCanvasProps {
  words: Word[];
  totalMemorizedCount: number;
  onWordTap: (word: Word) => void;
  isSidebarOpen?: boolean;
  shuffleTriggerCount: number;
}

// Check if a word is currently locked under the cooldown rule
export function isWordLocked(word: Word, totalMemorizedCount: number): boolean {
  if (word.lockedUntil <= 0) return false;
  const timeRemaining = word.lockedUntil - Date.now();
  if (timeRemaining <= 0) return false;
  const memorizedDiff = totalMemorizedCount - word.lockedAtCount;
  if (memorizedDiff >= 5) return false;
  return true;
}

// Get required memorized count to master the word based on its initial size tier (Level 1-5)
export function getRequiredCount(word: Word): number {
  if (word.initialSizeTier !== undefined) {
    return word.initialSizeTier + 1;
  }
  const estimatedInitialTier = Math.min(4, word.sizeTier + (word.memorizedCount || 0));
  return estimatedInitialTier + 1;
}

// Pastel Palette Generator for Insta-Worthy Vibe
export const getPastelColor = (word: Word): string => {
  if (word.partsOfSpeech.includes('Noun')) {
    return 'rgba(255, 236, 239, 0.9)'; // Soft Sakura Pink
  }
  if (word.partsOfSpeech.includes('Verb')) {
    return 'rgba(234, 252, 241, 0.9)'; // Soft Mint Green
  }
  if (word.partsOfSpeech.includes('Adjective')) {
    return 'rgba(243, 238, 255, 0.9)'; // Soft Lavender Purple
  }
  if (word.partsOfSpeech.includes('Adverb')) {
    return 'rgba(255, 249, 230, 0.9)'; // Soft Honey Yellow
  }
  return 'rgba(247, 247, 247, 0.9)'; // Soft Off-white
};

export const getTextColor = (word: Word): string => {
  if (word.partsOfSpeech.includes('Noun')) {
    return '#d34e6c'; // Darker Coral Pink
  }
  if (word.partsOfSpeech.includes('Verb')) {
    return '#2d8a4e'; // Darker Sage Green
  }
  if (word.partsOfSpeech.includes('Adjective')) {
    return '#6a52c0'; // Darker Iris Purple
  }
  if (word.partsOfSpeech.includes('Adverb')) {
    return '#b28a1c'; // Darker Ochre Yellow
  }
  return '#4b5563'; // Slate gray
};

// Measure precise text width and height on offscreen canvas
export const measureTextDimensions = (text: string, sizeTier: number) => {
  const fontSizes = [35, 40, 50, 65, 85];
  const fontSize = fontSizes[sizeTier] !== undefined ? fontSizes[sizeTier] : 50;
  
  if (typeof document !== 'undefined') {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.font = `700 ${fontSize}px "Fredoka", "Zen Maru Gothic", sans-serif`;
      const metrics = ctx.measureText(text);
      // Give a 20% safety padding factor because custom fonts can be wider, and to provide comfortable spacing!
      return {
        width: Math.max(metrics.width, text.length * fontSize * 0.65) * 1.20,
        height: fontSize * 1.20
      };
    }
  }
  // Fallback estimation
  return {
    width: text.length * fontSize * 0.70 * 1.20,
    height: fontSize * 1.20
  };
};

// Helper to resolve overlapping and pack words tightly to center (Static collage solver using rectangular bounding boxes)
export const resolveStaticCollisions = (bubbles: PhysicsBubble[], width: number, height: number, pullToCenter: boolean = true) => {
  const len = bubbles.length;
  if (len === 0) return;

  const centerX = width / 2;
  const centerY = height / 2;

  // Execute fast iterations synchronously to achieve a perfectly non-overlapping, packed layout
  for (let iter = 0; iter < 350; iter++) {
    // 1. Centripetal gravitational pull to center - softer horizontally to allow elegant landscape distribution
    if (pullToCenter) {
      for (let i = 0; i < len; i++) {
        const b = bubbles[i];
        const dx = centerX - b.x;
        const dy = centerY - b.y;
        
        // Strongly pull during first 310 iterations, then let physical collision resolution completely relax any remaining overlaps for the final 40 iterations.
        const pull = iter < 310 ? 0.65 * (1.0 - iter / 310) : 0;
        
        // Pull to center, let words group tighter to see many together!
        b.x += dx * pull * 0.35;
        b.y += dy * pull * 0.55;
      }
    }

    // 2. Rigid rectangle overlap resolution (AABB push-apart with 10px + buffer of spacing)
    for (let i = 0; i < len; i++) {
      for (let j = i + 1; j < len; j++) {
        const b1 = bubbles[i];
        const b2 = bubbles[j];

        const dx = b2.x - b1.x;
        const dy = b2.y - b1.y;

        const w1 = (b1.textWidth !== undefined ? b1.textWidth : 100) / 2 + 10;
        const h1 = (b1.textHeight !== undefined ? b1.textHeight : 40) / 2 + 10;
        const w2 = (b2.textWidth !== undefined ? b2.textWidth : 100) / 2 + 10;
        const h2 = (b2.textHeight !== undefined ? b2.textHeight : 40) / 2 + 10;

        // Add an additional 15px separation buffer so characters never touch
        const buffer = 15;
        const overlapX = (w1 + w2 + buffer) - Math.abs(dx);
        const overlapY = (h1 + h2 + buffer) - Math.abs(dy);

        if (overlapX > 0 && overlapY > 0) {
          const totalMass = b1.mass + b2.mass;
          const b1Ratio = b2.mass / totalMass;
          const b2Ratio = b1.mass / totalMass;

          // Push apart on the axis of minimum overlap
          if (overlapX < overlapY) {
            const sign = dx >= 0 ? 1 : -1;
            b1.x -= sign * overlapX * b1Ratio;
            b2.x += sign * overlapX * b2Ratio;
            
            // Add a small vertical slide nudge to prevent lock-in columns
            const signY = dy >= 0 ? 1 : -1;
            b1.y -= signY * 6 * b1Ratio;
            b2.y += signY * 6 * b2Ratio;
          } else {
            const sign = dy >= 0 ? 1 : -1;
            b1.y -= sign * overlapY * b1Ratio;
            b2.y += sign * overlapY * b2Ratio;
            
            // Add a small horizontal slide nudge to encourage side-by-side spreading
            const signX = dx >= 0 ? 1 : -1;
            b1.x -= signX * 10 * b1Ratio;
            b2.x += signX * 10 * b2Ratio;
          }
        }
      }
    }

    // 3. Boundary padding walls using rectangular bounds
    for (let i = 0; i < len; i++) {
      const b = bubbles[i];
      const w = (b.textWidth !== undefined ? b.textWidth : 100) / 2 + 10;
      const h = (b.textHeight !== undefined ? b.textHeight : 40) / 2 + 10;
      const padding = 20;
      if (b.x - w < padding) b.x = w + padding;
      if (b.x + w > width - padding) b.x = width - w - padding;
      if (b.y - h < padding) b.y = h + padding;
      if (b.y + h > height - padding) b.y = height - h - padding;
    }
  }
};

export const WordCanvas: React.FC<WordCanvasProps> = ({ words, totalMemorizedCount, onWordTap, isSidebarOpen = false, shuffleTriggerCount }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bubblesRef = useRef<PhysicsBubble[]>([]);
  
  // Track container sizing dynamically to support mobile rotations and correct dynamic field scaling
  const [containerSize, setContainerSize] = useState({ width: 800, height: 600 });

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setContainerSize({
          width: containerRef.current.clientWidth || 800,
          height: containerRef.current.clientHeight || 600
        });
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Dynamically compute size based on words count to scroll if necessary
  const dimensions = React.useMemo(() => {
    const baseWidth = Math.max(containerSize.width, 320);
    const baseHeight = Math.max(containerSize.height, 320);

    // Sum of approximate areas needed for each word using rectangular bounding box
    // We use a stable size tier of 2 to keep the estimated total area constant
    // even if a word's individual level (sizeTier) changes on tap.
    let totalAreaNeeded = 0;
    words.forEach((w) => {
      const { width: textW, height: textH } = measureTextDimensions(w.spelling, 2);
      const wArea = (textW + 20) * (textH + 20);
      totalAreaNeeded += wArea * 1.35; // with some comfortable padding
    });

    const containerArea = baseWidth * baseHeight;

    // If words require more than 55% of the viewport's area, expand the scrollable canvas proportionally to avoid crowding
    if (totalAreaNeeded > containerArea * 0.55) {
      const scale = Math.sqrt(totalAreaNeeded / (containerArea * 0.55));
      return {
        width: Math.floor(baseWidth * scale),
        height: Math.floor(baseHeight * scale)
      };
    }

    return {
      width: baseWidth,
      height: baseHeight
    };
  }, [words.length, containerSize]);

  // Center the canvas if it matches container, or let overflow scroll it
  const isCentered = dimensions.width <= containerSize.width && dimensions.height <= containerSize.height;

  const tapStartPos = useRef<{ x: number; y: number; time: number } | null>(null);

  // Sync physics bubbles with the words prop
  useEffect(() => {
    const currentBubbles = bubblesRef.current;
    const isFirstLoad = currentBubbles.length === 0;
    const newBubbles: PhysicsBubble[] = [];

    words.forEach((word) => {
      const existing = currentBubbles.find((b) => b.id === word.id);
      const { width: textW, height: textH } = measureTextDimensions(word.spelling, word.sizeTier);
      
      const targetW = textW + 20;
      const targetH = textH + 20;
      const targetRadius = Math.max(targetW, targetH) / 2;

      if (existing) {
        existing.word = word;
        existing.radius = targetRadius;
        existing.mass = targetRadius;
        existing.textWidth = textW;
        existing.textHeight = textH;
        
        // Clamp inside dimensions
        const marginW = textW / 2 + 10;
        const marginH = textH / 2 + 10;
        existing.x = Math.max(marginW, Math.min(existing.x, dimensions.width - marginW));
        existing.y = Math.max(marginH, Math.min(existing.y, dimensions.height - marginH));
        
        newBubbles.push(existing);
      } else {
        const centerX = dimensions.width / 2;
        const centerY = dimensions.height / 2;
        // Spread the initial spawn points wider horizontally since screen is landscape!
        const x = centerX + (Math.random() - 0.5) * (dimensions.width * 0.55);
        const y = centerY + (Math.random() - 0.5) * (dimensions.height * 0.35);
        
        const color = getPastelColor(word);
        const textColor = getTextColor(word);

        newBubbles.push({
          id: word.id,
          word,
          x,
          y,
          vx: 0,
          vy: 0,
          radius: targetRadius,
          mass: targetRadius,
          color,
          textColor,
          pulseScale: 1.0,
          isTapped: false,
          textWidth: textW,
          textHeight: textH,
        });
      }
    });

    // Run the static solver instantly to pack all bubbles nicely without overlaps!
    // Pull to center only during the very first load of words, to allow initial cluster packing.
    // Otherwise, do not pull to center, so existing words remain precisely in their original positions.
    resolveStaticCollisions(newBubbles, dimensions.width, dimensions.height, isFirstLoad);
    bubblesRef.current = newBubbles;
  }, [words, dimensions.width, dimensions.height]);

  const isCenteredRef = useRef(false);

  // Viewport centering once initially so bubbles start nicely in the center of the playground
  useEffect(() => {
    if (containerRef.current && !isCenteredRef.current && dimensions.width > 0 && containerSize.width > 0) {
      containerRef.current.scrollLeft = Math.max(0, (dimensions.width - containerSize.width) / 2);
      containerRef.current.scrollTop = Math.max(0, (dimensions.height - containerSize.height) / 2);
      isCenteredRef.current = true;
    }
  }, [dimensions, containerSize]);

  // Shuffle positions, sets random positions and solves overlap
  const triggerShuffle = () => {
    const bubbles = bubblesRef.current;
    bubbles.forEach((bubble) => {
       const w = (bubble.textWidth !== undefined ? bubble.textWidth : 100) / 2 + 10;
       const h = (bubble.textHeight !== undefined ? bubble.textHeight : 40) / 2 + 10;
       const marginX = w + 15;
       const marginY = h + 15;
       bubble.x = marginX + Math.random() * (dimensions.width - marginX * 2);
       bubble.y = marginY + Math.random() * (dimensions.height - marginY * 2);
    });

    // Run the solver to instantly pack everything beautiful and stationary!
    resolveStaticCollisions(bubbles, dimensions.width, dimensions.height, true);
  };

  // Listen for external shuffle requests from the App header
  const lastShuffleCount = useRef(0);
  useEffect(() => {
    if (shuffleTriggerCount > 0 && shuffleTriggerCount !== lastShuffleCount.current) {
      lastShuffleCount.current = shuffleTriggerCount;
      triggerShuffle();
    }
  }, [shuffleTriggerCount]);

  // Canvas Drawing & Physics Update Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const updatePhysics = () => {
      // Intentionally empty! Static positions are determined at sync and shuffle to guarantee ZERO jitter or shivering.
    };

    const draw = () => {
      // Clear with elegant pristine pure white background
      ctx.clearRect(0, 0, dimensions.width, dimensions.height);
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, dimensions.width, dimensions.height);

      // Draw each Word as a beautiful stationary rotated typography sticker
      const bubbles = bubblesRef.current;
      bubbles.forEach((b) => {
        const locked = isWordLocked(b.word, totalMemorizedCount);
        const radius = b.radius;

        ctx.save();
        ctx.translate(b.x, b.y);

        // Determine text color based on level (sizeTier) and lock state as requested
        let textColor = '#000000'; // Default LV.3 and LV.4 are black
        if (locked) {
          textColor = '#9CA3AF'; // Faint gray for locked
        } else {
          switch (b.word.sizeTier) {
            case 4: // LV.1
              textColor = '#9E1B32'; // Wine Red (ワインレッド)
              break;
            case 3: // LV.2
              textColor = '#D49EA7'; // Light Wine Red (薄いワインレッド)
              break;
            case 2: // LV.3
              textColor = '#000000'; // Black (黒)
              break;
            case 1: // LV.4
              textColor = '#6D8CB3'; // Light Navy Blue (薄い紺色)
              break;
            case 0: // LV.5
              textColor = '#00205B'; // Deep Blue (紺色)
              break;
            default:
              textColor = '#000000';
          }
        }

        // Font sizes as requested by user
        const fontSizes = [35, 40, 50, 65, 85];
        const fontSize = fontSizes[b.word.sizeTier] !== undefined ? fontSizes[b.word.sizeTier] : 50;
        ctx.font = `700 ${fontSize}px "Fredoka", "Zen Maru Gothic", sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = textColor;

        let displayText = b.word.spelling;
        if (locked) {
          displayText = '🔒 ' + displayText;
        }
        
        ctx.fillText(displayText, 0, 0);

        // Save measured text width and height for rectangular tap detection (10px around text)
        const textMetrics = ctx.measureText(displayText);
        b.textWidth = textMetrics.width;
        b.textHeight = fontSize;

        ctx.restore();
      });
    };

    const loop = () => {
      updatePhysics();
      draw();
      animationFrameId = requestAnimationFrame(loop);
    };

    loop();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [dimensions, totalMemorizedCount]);

  // Pointer event handlers: purely for single taps. No dragging or swipe forces.
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    tapStartPos.current = { x, y, time: Date.now() };
    canvas.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = () => {
    // No drag/swipe velocity additions
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.releasePointerCapture(e.pointerId);

    if (!tapStartPos.current) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const dx = x - tapStartPos.current.x;
    const dy = y - tapStartPos.current.y;
    const distance = Math.hypot(dx, dy);
    const duration = Date.now() - tapStartPos.current.time;

    // Trigger tap if it is a quick press and hasn't drifted much
    if (distance < 12 && duration < 300) {
      let clickedWord: Word | null = null;
      for (let i = bubblesRef.current.length - 1; i >= 0; i--) {
        const b = bubblesRef.current[i];
        
        // Rectangular bounds of text + 10px on each side as requested (文字の周りから10px)
        const halfW = (b.textWidth !== undefined ? b.textWidth : 100) / 2 + 10;
        const halfH = (b.textHeight !== undefined ? b.textHeight : 40) / 2 + 10;

        if (x >= b.x - halfW && x <= b.x + halfW &&
            y >= b.y - halfH && y <= b.y + halfH) {
          clickedWord = b.word;
          break;
        }
      }

      if (clickedWord) {
        onWordTap(clickedWord);
      }
    }

    tapStartPos.current = null;
  };

  return (
    <div 
      ref={containerRef} 
      className={`relative w-full h-full rounded-xl sm:rounded-3xl overflow-auto scrollbar-thin border border-[#E9E4DB] bg-white shadow-inner-lg group select-none ${
        isCentered ? 'flex items-center justify-center' : ''
      }`}
    >
      {/* Spacious Virtual Dynamic Canvas */}
      <canvas
        ref={canvasRef}
        width={dimensions.width}
        height={dimensions.height}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className="block bg-white touch-none select-none"
      />
    </div>
  );
};
