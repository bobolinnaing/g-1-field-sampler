"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface GiftSuggestion {
  name: string;
  description: string;
  why: string;
  imageUrl?: string;
  sourceSite?: string;
}

const DEFAULT_INTERESTS = [
  "TECH", "MUSIC", "SPORTS", "BOOKS",
  "FOOD", "TRAVEL", "ART", "GAMING",
  "FASHION", "NATURE", "FILM",
];

const BOOT_SEQUENCE = [
  { text: "INITIALIZING G-1 SYSTEM...", delay: 0 },
  { text: "CHECKING RAM.......... OK", delay: 200 },
  { text: "LOADING NEURAL NET.... OK", delay: 400 },
  { text: "CALIBRATING SENSORS... OK", delay: 600 },
  { text: "SIGNAL LOCK........... OK", delay: 800 },
  { text: "LOGIC CORE............ OK", delay: 1000 },
  { text: "DATABASE SYNC......... OK", delay: 1200 },
  { text: "GIFT ALGORITHMS....... LOADED", delay: 1400 },
  { text: "", delay: 1600 },
];

function BootSequence({ onComplete }: { onComplete: () => void }) {
  const [visibleLines, setVisibleLines] = useState<number>(0);
  const [showLogo, setShowLogo] = useState(false);
  const [showReady, setShowReady] = useState(false);

  useEffect(() => {
    BOOT_SEQUENCE.forEach((_, index) => {
      setTimeout(() => {
        setVisibleLines(index + 1);
      }, BOOT_SEQUENCE[index].delay);
    });

    setTimeout(() => setShowLogo(true), 1600);
    setTimeout(() => setShowReady(true), 2000);
    setTimeout(onComplete, 2800);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center p-8"
    >
      <div className="w-full max-w-md space-y-1 font-mono text-xs">
        {BOOT_SEQUENCE.slice(0, visibleLines).map((line, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-[#33FF33] tracking-wider"
          >
            {line.text}
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {showLogo && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-12 text-center"
          >
            <div className="relative">
              <div className="text-6xl md:text-8xl font-black font-mono text-[#33FF33] tracking-tighter"
                style={{
                  textShadow: "0 0 20px rgba(51,255,51,0.5), 0 0 40px rgba(51,255,51,0.3)",
                  fontFamily: "monospace",
                }}
              >
                G-1
              </div>
              <div className="absolute inset-0 text-6xl md:text-8xl font-black font-mono text-[#33FF33]/20 tracking-tighter blur-sm">
                G-1
              </div>
            </div>
            <div className="mt-2 text-[10px] tracking-[0.3em] text-[#33FF33]/60">
              GIFT SAMPLER
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showReady && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0.7, 1] }}
            transition={{ duration: 0.5 }}
            className="mt-8 flex items-center gap-3"
          >
            <motion.div
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 0.8, repeat: Infinity }}
              className="w-2 h-2 rounded-full bg-[#33FF33]"
              style={{ boxShadow: "0 0 8px rgba(51,255,51,0.8)" }}
            />
            <span className="text-sm font-mono tracking-widest text-[#33FF33]">
              SYSTEM READY
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute bottom-8 left-0 right-0 flex justify-center">
        <div className="h-[1px] w-32 bg-gradient-to-r from-transparent via-[#33FF33]/30 to-transparent" />
      </div>
    </motion.div>
  );
}

function triggerHaptic(type: "light" | "heavy" | "success") {
  if (typeof window === "undefined") return;

  if ("vibrate" in navigator) {
    switch (type) {
      case "light":
        navigator.vibrate(10);
        break;
      case "heavy":
        navigator.vibrate([20, 30, 20]);
        break;
      case "success":
        navigator.vibrate([10, 50, 10, 50, 30]);
        break;
    }
  } else {
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.style.position = "absolute";
    checkbox.style.opacity = "0";
    checkbox.style.pointerEvents = "none";
    document.body.appendChild(checkbox);
    checkbox.click();
    setTimeout(() => document.body.removeChild(checkbox), 10);
  }
}

function useSoundEngine() {
  const audioContextRef = useRef<AudioContext | null>(null);

  const getContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }
    return audioContextRef.current;
  }, []);

  const playMechanicalClick = useCallback(() => {
    const ctx = getContext();
    const now = ctx.currentTime;

    const clickOsc = ctx.createOscillator();
    const clickGain = ctx.createGain();
    const noiseGain = ctx.createGain();

    clickOsc.connect(clickGain);
    clickGain.connect(ctx.destination);

    clickOsc.frequency.setValueAtTime(1200, now);
    clickOsc.frequency.exponentialRampToValueAtTime(80, now + 0.02);

    clickGain.gain.setValueAtTime(0.4, now);
    clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    clickOsc.start(now);
    clickOsc.stop(now + 0.04);

    const bufferSize = ctx.sampleRate * 0.015;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
    }

    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;

    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = "highpass";
    noiseFilter.frequency.value = 2000;

    noiseSource.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(ctx.destination);

    noiseGain.gain.setValueAtTime(0.15, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

    noiseSource.start(now);
    noiseSource.stop(now + 0.03);

    triggerHaptic("light");
  }, [getContext]);

  const playPaperSlide = useCallback(() => {
    const ctx = getContext();
    const now = ctx.currentTime;

    const bufferSize = ctx.sampleRate * 0.12;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      const progress = i / bufferSize;
      const envelope = Math.sin(progress * Math.PI) * 0.5;
      output[i] = (Math.random() * 2 - 1) * envelope;
    }

    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;

    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 3000;
    filter.Q.value = 0.5;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.08, now);

    noiseSource.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noiseSource.start(now);
    noiseSource.stop(now + 0.12);

    triggerHaptic("success");
  }, [getContext]);

  const playFaderMove = useCallback(() => {
    const ctx = getContext();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(60 + Math.random() * 20, now);

    osc.connect(gain);
    gain.connect(ctx.destination);

    gain.gain.setValueAtTime(0.05, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);

    osc.start(now);
    osc.stop(now + 0.02);
  }, [getContext]);

  const playHeavyClick = useCallback(() => {
    const ctx = getContext();
    const now = ctx.currentTime;

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = "square";
    osc2.type = "triangle";

    osc1.frequency.setValueAtTime(150, now);
    osc1.frequency.exponentialRampToValueAtTime(40, now + 0.05);

    osc2.frequency.setValueAtTime(800, now);
    osc2.frequency.exponentialRampToValueAtTime(100, now + 0.03);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc1.start(now);
    osc1.stop(now + 0.08);
    osc2.start(now);
    osc2.stop(now + 0.05);

    triggerHaptic("heavy");
  }, [getContext]);

  return {
    playMechanicalClick,
    playPaperSlide,
    playFaderMove,
    playHeavyClick,
    triggerHaptic,
  };
}

function useClickSound() {
  const { playMechanicalClick } = useSoundEngine();
  return playMechanicalClick;
}

function Screw({ className }: { className?: string }) {
  return (
    <div className={`absolute w-4 h-4 ${className}`}>
      <div className="w-full h-full rounded-full bg-gradient-to-br from-zinc-400 to-zinc-500 shadow-inner flex items-center justify-center">
        <div className="w-2 h-[2px] bg-zinc-600 rounded-full" />
      </div>
    </div>
  );
}

type RelationshipType = "FRIEND" | "FAMILY" | "PARTNER" | "COLLEAGUE";

function DotMatrixIcon({
  type,
  isActive,
  size = 32,
}: {
  type: RelationshipType;
  isActive: boolean;
  size?: number;
}) {
  const activeColor = "#FF5C00";
  const inactiveColor = "rgba(255,255,255,0.2)";
  const color = isActive ? activeColor : inactiveColor;
  const glowFilter = isActive ? "url(#dotGlow)" : undefined;
  const dotRadius = 1.8;

  const renderDots = () => {
    switch (type) {
      case "PARTNER":
        return (
          <>
            <circle cx="4" cy="16" r={dotRadius} />
            <circle cx="7" cy="12" r={dotRadius} />
            <circle cx="10" cy="10" r={dotRadius} />
            <circle cx="14" cy="10" r={dotRadius} />
            <circle cx="18" cy="10" r={dotRadius} />
            <circle cx="22" cy="10" r={dotRadius} />
            <circle cx="25" cy="12" r={dotRadius} />
            <circle cx="28" cy="16" r={dotRadius} />
            <circle cx="25" cy="20" r={dotRadius} />
            <circle cx="22" cy="22" r={dotRadius} />
            <circle cx="18" cy="22" r={dotRadius} />
            <circle cx="14" cy="22" r={dotRadius} />
            <circle cx="10" cy="22" r={dotRadius} />
            <circle cx="7" cy="20" r={dotRadius} />
            <circle cx="16" cy="14" r={dotRadius} />
            <circle cx="16" cy="18" r={dotRadius} />
          </>
        );

      case "FRIEND":
        return (
          <>
            <circle cx="10" cy="10" r={dotRadius} />
            <circle cx="16" cy="10" r={dotRadius} />
            <circle cx="22" cy="10" r={dotRadius} />
            <circle cx="10" cy="16" r={dotRadius} />
            <circle cx="16" cy="16" r={dotRadius} />
            <circle cx="22" cy="16" r={dotRadius} />
            <circle cx="10" cy="22" r={dotRadius} />
            <circle cx="16" cy="22" r={dotRadius} />
            <circle cx="22" cy="22" r={dotRadius} />
          </>
        );

      case "FAMILY":
        return (
          <>
            <circle cx="16" cy="6" r={dotRadius} />
            <circle cx="16" cy="12" r={dotRadius} />
            <circle cx="10" cy="18" r={dotRadius} />
            <circle cx="16" cy="18" r={dotRadius} />
            <circle cx="22" cy="18" r={dotRadius} />
            <circle cx="6" cy="24" r={dotRadius} />
            <circle cx="12" cy="24" r={dotRadius} />
            <circle cx="20" cy="24" r={dotRadius} />
            <circle cx="26" cy="24" r={dotRadius} />
          </>
        );

      case "COLLEAGUE":
        return (
          <>
            <circle cx="16" cy="8" r={dotRadius} />
            <circle cx="11" cy="11" r={dotRadius} />
            <circle cx="21" cy="11" r={dotRadius} />
            <circle cx="8" cy="16" r={dotRadius} />
            <circle cx="24" cy="16" r={dotRadius} />
            <circle cx="11" cy="21" r={dotRadius} />
            <circle cx="21" cy="21" r={dotRadius} />
            <circle cx="16" cy="24" r={dotRadius} />
            <circle cx="16" cy="16" r={dotRadius} />
          </>
        );

      default:
        return null;
    }
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill={color}
      filter={glowFilter}
    >
      <defs>
        <filter id="dotGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {renderDots()}
    </svg>
  );
}

const RELATIONSHIP_OPTIONS: {
  value: RelationshipType;
  label: string;
  description: string;
}[] = [
  {
    value: "PARTNER",
    label: "PARTNER",
    description: "Romantic partner or spouse",
  },
  {
    value: "FRIEND",
    label: "FRIEND",
    description: "Close friend or buddy",
  },
  {
    value: "FAMILY",
    label: "FAMILY",
    description: "Family member or relative",
  },
  {
    value: "COLLEAGUE",
    label: "COLLEAGUE",
    description: "Work colleague or professional contact",
  },
];

function RelationshipSelector({
  value,
  onChange,
}: {
  value: RelationshipType | null;
  onChange: (v: RelationshipType) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const playClick = useClickSound();

  const selectedOption = RELATIONSHIP_OPTIONS.find((opt) => opt.value === value);

  const handleSelect = (v: RelationshipType) => {
    playClick();
    onChange(v);
    setIsOpen(false);
  };

  return (
    <>
      <motion.button
        onClick={() => {
          playClick();
          setIsOpen(true);
        }}
        whileTap={{ scale: 0.98 }}
        style={{ touchAction: "manipulation" }}
        className="w-full px-4 py-3 bg-zinc-200 rounded-lg flex items-center justify-between shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)] min-h-[52px]"
      >
        {selectedOption ? (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-zinc-800 shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)]">
              <DotMatrixIcon type={selectedOption.value} isActive={true} size={28} />
            </div>
            <span className="font-mono text-sm tracking-widest text-zinc-700 font-bold uppercase">
              {selectedOption.label}
            </span>
          </div>
        ) : (
          <span className="font-mono text-sm tracking-widest text-zinc-400">
            [ TAP TO SELECT ]
          </span>
        )}
        <div className="text-zinc-400 text-xs tracking-widest font-mono">▼</div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/40 z-40"
            />

            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-[#EBEBEB] rounded-t-2xl p-6 pb-8 shadow-[0_-8px_32px_rgba(0,0,0,0.25),inset_0_1px_0_rgba(255,255,255,0.8)]"
            >
              <div className="absolute top-2 left-1/2 -translate-x-1/2 w-10 h-1 bg-zinc-400 rounded-full" />

              <Screw className="top-4 left-4" />
              <Screw className="top-4 right-4" />

              <div className="flex items-center justify-between mb-5 mt-2">
                <div>
                  <h3 className="text-lg font-black tracking-widest text-zinc-800 font-mono uppercase">
                    RELATIONSHIP
                  </h3>
                  <p className="text-[10px] tracking-widest text-zinc-500 font-mono">
                    SELECT RECIPIENT TYPE
                  </p>
                </div>
                <motion.button
                  onClick={() => setIsOpen(false)}
                  whileTap={{ scale: 0.9 }}
                  style={{ touchAction: "manipulation" }}
                  className="w-9 h-9 rounded-full bg-zinc-200 flex items-center justify-center border border-zinc-400 shadow-[inset_0_-2px_0_0_rgba(0,0,0,0.05)]"
                >
                  <X size={16} className="text-zinc-600" strokeWidth={2} />
                </motion.button>
              </div>

              <div className="h-[1px] bg-zinc-300 mb-5" />

              <div className="grid grid-cols-2 gap-3">
                {RELATIONSHIP_OPTIONS.map((option) => {
                  const isSelected = value === option.value;

                  return (
                    <motion.button
                      key={option.value}
                      onClick={() => handleSelect(option.value)}
                      whileTap={{ scale: 0.97, y: 2 }}
                      transition={{ type: "spring", stiffness: 500, damping: 20 }}
                      style={{ touchAction: "manipulation" }}
                      className={`relative p-4 rounded-xl flex flex-col items-center gap-3 min-h-[130px] transition-all
                        ${
                          isSelected
                            ? "bg-zinc-300 shadow-[inset_0_3px_8px_rgba(0,0,0,0.12)] border-2 border-[#FF5C00]"
                            : "bg-zinc-200 shadow-[inset_0_-3px_0_0_rgba(0,0,0,0.06),0_2px_4px_rgba(0,0,0,0.06)] border-2 border-transparent"
                        }
                      `}
                    >
                      <motion.div
                        animate={isSelected ? { y: 1, scale: 1.05 } : { y: 0, scale: 1 }}
                        transition={{ type: "spring", stiffness: 500, damping: 20 }}
                        className="w-14 h-14 rounded-lg flex items-center justify-center bg-zinc-800 shadow-[inset_0_2px_6px_rgba(0,0,0,0.4)]"
                        style={{
                          boxShadow: isSelected
                            ? "0 0 16px rgba(255,92,0,0.35), inset 0 2px 6px rgba(0,0,0,0.4)"
                            : "inset 0 2px 6px rgba(0,0,0,0.4)",
                        }}
                      >
                        <DotMatrixIcon
                          type={option.value}
                          isActive={isSelected}
                          size={36}
                        />
                      </motion.div>
                      <div className="text-center">
                        <div className="font-mono text-[11px] font-bold tracking-widest text-zinc-700 uppercase">
                          {option.label}
                        </div>
                        <div className="text-[9px] text-zinc-500 mt-0.5 font-mono">
                          {option.description}
                        </div>
                      </div>
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#FF5C00] flex items-center justify-center"
                          style={{ boxShadow: "0 0 8px rgba(255,92,0,0.5)" }}
                        >
                          <span className="text-[11px] text-white font-bold">✓</span>
                        </motion.div>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function InterestSwitch({
  label,
  isActive,
  onClick,
  isCustomButton = false,
}: {
  label: string;
  isActive: boolean;
  onClick: () => void;
  isCustomButton?: boolean;
}) {
  const playClick = useClickSound();

  const handleClick = () => {
    playClick();
    onClick();
  };

  return (
    <motion.button
      onClick={handleClick}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 600, damping: 20 }}
      className="relative flex flex-col items-center gap-1"
      style={{ touchAction: "manipulation" }}
    >
      <div className="flex items-center gap-1">
        <motion.div
          animate={isActive ? { opacity: 1 } : { opacity: 0.2 }}
          className={`w-1.5 h-1.5 rounded-full ${isCustomButton ? "bg-[#33FF33]" : "bg-[#FF5722]"}`}
          style={{
            boxShadow: isActive
              ? isCustomButton
                ? "0 0 6px 2px rgba(51,255,51,0.6)"
                : "0 0 6px 2px rgba(255,87,34,0.6)"
              : "none",
          }}
        />
      </div>
      <motion.div
        animate={isActive ? { y: 2 } : { y: 0 }}
        transition={{ type: "spring", stiffness: 600, damping: 20 }}
        className={`w-full h-12 md:h-14 rounded-lg flex items-center justify-center text-[9px] font-bold tracking-wider min-h-[44px]
          ${
            isActive
              ? "bg-zinc-300 shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)]"
              : "bg-zinc-200 shadow-[inset_0_-3px_0_0_rgba(0,0,0,0.1),0_2px_4px_rgba(0,0,0,0.1)]"
          }
          ${isCustomButton ? "border border-dashed border-zinc-400" : ""}
        `}
      >
        <span className={isActive ? "text-zinc-700" : "text-zinc-500"}>
          {label}
        </span>
      </motion.div>
    </motion.button>
  );
}

function CustomTagInput({
  onAdd,
  onClose,
}: {
  onAdd: (tag: string) => void;
  onClose: () => void;
}) {
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = () => {
    if (value.trim()) {
      onAdd(value.trim().toUpperCase());
      setValue("");
      onClose();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="col-span-4 bg-zinc-900 rounded-lg p-3 font-mono"
    >
      <div className="flex items-center gap-2 text-[#33FF33] text-xs">
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.5, repeat: Infinity }}
        >
          ▶
        </motion.span>
        <span>INJECT_TAG:</span>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSubmit();
            if (e.key === "Escape") onClose();
          }}
          maxLength={12}
          className="flex-1 bg-transparent outline-none text-[#33FF33] uppercase tracking-wider"
          placeholder="TYPE & ENTER"
        />
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.4, repeat: Infinity }}
          className="w-2 h-4 bg-[#33FF33]"
        />
      </div>
    </motion.div>
  );
}

function SilverFader({
  value,
  onChange,
  onFaderMove,
  min,
  max,
  formatValue,
}: {
  value: number;
  onChange: (v: number) => void;
  onFaderMove?: () => void;
  min: number;
  max: number;
  formatValue?: (v: number) => string;
}) {
  const lastSoundTime = useRef(0);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const now = Date.now();
    if (now - lastSoundTime.current > 50) {
      lastSoundTime.current = now;
      onFaderMove?.();
    }
    onChange(Number(e.target.value));
  };

  return (
    <div className="relative w-full">
      <div className="relative h-16 flex items-center">
        <div className="absolute inset-x-4 h-3 bg-gradient-to-b from-zinc-500 to-zinc-400 rounded-sm shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)]">
          <div className="absolute inset-0 flex items-center justify-between px-2">
            {Array.from({ length: 11 }).map((_, i) => (
              <div key={i} className="w-[1px] h-1 bg-zinc-600" />
            ))}
          </div>
        </div>
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={handleChange}
          className="relative w-full h-3 appearance-none bg-transparent cursor-pointer z-10
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-6
            [&::-webkit-slider-thumb]:h-12
            [&::-webkit-slider-thumb]:rounded-sm
            [&::-webkit-slider-thumb]:bg-gradient-to-b
            [&::-webkit-slider-thumb]:from-zinc-100
            [&::-webkit-slider-thumb]:via-zinc-300
            [&::-webkit-slider-thumb]:to-zinc-400
            [&::-webkit-slider-thumb]:shadow-[0_2px_8px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.8),inset_0_-1px_0_rgba(0,0,0,0.2)]
            [&::-webkit-slider-thumb]:border
            [&::-webkit-slider-thumb]:border-zinc-400
            [&::-moz-range-thumb]:w-6
            [&::-moz-range-thumb]:h-12
            [&::-moz-range-thumb]:rounded-sm
            [&::-moz-range-thumb]:bg-gradient-to-b
            [&::-moz-range-thumb]:from-zinc-100
            [&::-moz-range-thumb]:via-zinc-300
            [&::-moz-range-thumb]:to-zinc-400
            [&::-moz-range-thumb]:shadow-[0_2px_8px_rgba(0,0,0,0.3)]
            [&::-moz-range-thumb]:border
            [&::-moz-range-thumb]:border-zinc-400
          "
          style={{ touchAction: "none" }}
        />
      </div>
      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-zinc-900 px-3 py-1 rounded">
        <span className="font-mono text-sm text-[#33FF33] tracking-wider">
          {formatValue ? formatValue(value) : value}
        </span>
      </div>
    </div>
  );
}

function DualRangeFader({
  value,
  onChange,
  onFaderMove,
  min = 10,
  max = 5000,
}: {
  value: [number, number];
  onChange: (v: [number, number]) => void;
  onFaderMove?: () => void;
  min?: number;
  max?: number;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [minValue, maxValue] = value;
  const lastSoundTime = useRef(0);

  const toLinear = (logValue: number) => {
    const minLog = Math.log(min);
    const maxLog = Math.log(max);
    return ((Math.log(logValue) - minLog) / (maxLog - minLog)) * 100;
  };

  const fromLinear = (linearValue: number) => {
    const minLog = Math.log(min);
    const maxLog = Math.log(max);
    return Math.round(Math.exp(minLog + (linearValue / 100) * (maxLog - minLog)));
  };

  const minLinear = toLinear(minValue);
  const maxLinear = toLinear(maxValue);

  const throttledFaderSound = useCallback(() => {
    const now = Date.now();
    if (now - lastSoundTime.current > 50) {
      lastSoundTime.current = now;
      onFaderMove?.();
    }
  }, [onFaderMove]);

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newLinear = Number(e.target.value);
    const newValue = fromLinear(newLinear);
    if (newValue < maxValue) {
      throttledFaderSound();
      onChange([newValue, maxValue]);
    }
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newLinear = Number(e.target.value);
    const newValue = fromLinear(newLinear);
    if (newValue > minValue) {
      throttledFaderSound();
      onChange([minValue, newValue]);
    }
  };

  const leftPercent = minLinear;
  const rightPercent = 100 - maxLinear;

  return (
    <div className="relative w-full">
      <div className="relative h-20 flex items-center pt-2">
        <div
          ref={trackRef}
          className="absolute inset-x-4 h-4 bg-zinc-700 rounded-sm shadow-[inset_0_3px_6px_rgba(0,0,0,0.6)]"
        >
          <div className="absolute inset-0 flex items-center justify-between px-1">
            {Array.from({ length: 21 }).map((_, i) => (
              <div
                key={i}
                className={`w-[1px] ${i % 5 === 0 ? "h-2" : "h-1"} bg-zinc-600`}
              />
            ))}
          </div>

          <div
            className="absolute top-0 bottom-0 bg-[#FF5C00] rounded-sm"
            style={{
              left: `${leftPercent}%`,
              right: `${rightPercent}%`,
              boxShadow: "0 0 12px rgba(255,92,0,0.4)",
            }}
          />
        </div>

        <input
          type="range"
          min={0}
          max={100}
          value={minLinear}
          onChange={handleMinChange}
          className="absolute inset-x-4 h-4 appearance-none bg-transparent cursor-pointer z-20
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-7
            [&::-webkit-slider-thumb]:h-16
            [&::-webkit-slider-thumb]:rounded-sm
            [&::-webkit-slider-thumb]:bg-gradient-to-b
            [&::-webkit-slider-thumb]:from-zinc-100
            [&::-webkit-slider-thumb]:via-zinc-300
            [&::-webkit-slider-thumb]:to-zinc-400
            [&::-webkit-slider-thumb]:shadow-[0_2px_8px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.9)]
            [&::-webkit-slider-thumb]:border
            [&::-webkit-slider-thumb]:border-zinc-500
            [&::-webkit-slider-thumb]:cursor-grab
            [&::-webkit-slider-thumb]:active:cursor-grabbing
            [&::-moz-range-thumb]:w-7
            [&::-moz-range-thumb]:h-16
            [&::-moz-range-thumb]:rounded-sm
            [&::-moz-range-thumb]:bg-gradient-to-b
            [&::-moz-range-thumb]:from-zinc-100
            [&::-moz-range-thumb]:via-zinc-300
            [&::-moz-range-thumb]:to-zinc-400
            [&::-moz-range-thumb]:shadow-[0_2px_8px_rgba(0,0,0,0.4)]
            [&::-moz-range-thumb]:border
            [&::-moz-range-thumb]:border-zinc-500
          "
          style={{ pointerEvents: "auto", touchAction: "none" }}
        />

        <input
          type="range"
          min={0}
          max={100}
          value={maxLinear}
          onChange={handleMaxChange}
          className="absolute inset-x-4 h-4 appearance-none bg-transparent cursor-pointer z-20
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-7
            [&::-webkit-slider-thumb]:h-16
            [&::-webkit-slider-thumb]:rounded-sm
            [&::-webkit-slider-thumb]:bg-gradient-to-b
            [&::-webkit-slider-thumb]:from-zinc-100
            [&::-webkit-slider-thumb]:via-zinc-300
            [&::-webkit-slider-thumb]:to-zinc-400
            [&::-webkit-slider-thumb]:shadow-[0_2px_8px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.9)]
            [&::-webkit-slider-thumb]:border
            [&::-webkit-slider-thumb]:border-zinc-500
            [&::-webkit-slider-thumb]:cursor-grab
            [&::-webkit-slider-thumb]:active:cursor-grabbing
            [&::-moz-range-thumb]:w-7
            [&::-moz-range-thumb]:h-16
            [&::-moz-range-thumb]:rounded-sm
            [&::-moz-range-thumb]:bg-gradient-to-b
            [&::-moz-range-thumb]:from-zinc-100
            [&::-moz-range-thumb]:via-zinc-300
            [&::-moz-range-thumb]:to-zinc-400
            [&::-moz-range-thumb]:shadow-[0_2px_8px_rgba(0,0,0,0.4)]
            [&::-moz-range-thumb]:border
            [&::-moz-range-thumb]:border-zinc-500
          "
          style={{ pointerEvents: "auto", touchAction: "none" }}
        />
      </div>

      <div className="flex justify-center mt-2">
        <div className="bg-zinc-900 px-4 py-2 rounded flex items-center gap-3">
          <div className="flex items-center gap-1">
            <span className="text-[8px] text-zinc-500 tracking-widest">MIN</span>
            <span className="font-mono text-lg text-[#33FF33] tracking-wider tabular-nums">
              ${minValue.toLocaleString()}
            </span>
          </div>
          <div className="text-zinc-600 text-lg">—</div>
          <div className="flex items-center gap-1">
            <span className="font-mono text-lg text-[#33FF33] tracking-wider tabular-nums">
              ${maxValue.toLocaleString()}
            </span>
            <span className="text-[8px] text-zinc-500 tracking-widest">MAX</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function VisualMonitor({
  imageUrl,
  name,
}: {
  imageUrl?: string;
  name: string;
}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [showGlitch, setShowGlitch] = useState(false);
  const [signalBars, setSignalBars] = useState([3, 4, 2, 5, 3]);
  const [scrollOffset, setScrollOffset] = useState(0);

  useEffect(() => {
    const signalInterval = setInterval(() => {
      setSignalBars(Array.from({ length: 5 }, () => Math.floor(Math.random() * 5) + 1));
    }, 800);
    return () => clearInterval(signalInterval);
  }, []);

  useEffect(() => {
    if (!isLoaded && imageUrl && !imageUrl.includes("placeholder")) {
      const scrollInterval = setInterval(() => {
        setScrollOffset((prev) => (prev + 1) % 200);
      }, 50);
      return () => clearInterval(scrollInterval);
    }
  }, [isLoaded, imageUrl]);

  useEffect(() => {
    if (isLoaded) {
      setShowGlitch(true);
      const timer = setTimeout(() => setShowGlitch(false), 200);
      return () => clearTimeout(timer);
    }
  }, [isLoaded]);

  const isPlaceholder = !imageUrl || imageUrl === "";

  return (
    <motion.div
      animate={{ opacity: [0.97, 1, 0.98, 1] }}
      transition={{ duration: 0.1, repeat: Infinity, repeatDelay: Math.random() * 2 + 1 }}
      className="aspect-square relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-zinc-900 rounded-sm p-2">
        <div className="relative w-full h-full bg-zinc-950 rounded-sm overflow-hidden shadow-[inset_0_4px_12px_rgba(0,0,0,0.8)]">
          
          <div 
            className="absolute inset-0 z-20 pointer-events-none mix-blend-screen"
            style={{
              background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)",
            }}
          />

          <div className="absolute top-2 left-2 z-30 flex items-center gap-1">
            <span className="text-[8px] font-mono text-[#33FF33] bg-black/60 px-1.5 py-0.5 rounded tracking-wider flex items-center gap-1">
              <motion.span
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 0.6, repeat: Infinity }}
                className="inline-block w-1.5 h-1.5 rounded-full bg-[#33FF33]"
                style={{ boxShadow: "0 0 4px rgba(51,255,51,0.8)" }}
              />
              LIVE
            </span>
          </div>

          <div className="absolute bottom-2 left-2 z-30 flex items-end gap-[2px]">
            {signalBars.map((height, i) => (
              <motion.div
                key={i}
                animate={{ height: `${height * 3}px` }}
                transition={{ type: "spring" as const, stiffness: 300, damping: 15 }}
                className="w-[3px] bg-[#33FF33] rounded-sm"
                style={{ 
                  opacity: height > 2 ? 1 : 0.4,
                  boxShadow: height > 3 ? "0 0 4px rgba(51,255,51,0.5)" : "none"
                }}
              />
            ))}
            <span className="text-[7px] font-mono text-zinc-500 ml-1">SIG</span>
          </div>

          <div className="absolute bottom-2 right-2 z-30">
            <span className="text-[7px] font-mono text-zinc-600 bg-black/60 px-1.5 py-0.5 rounded">
              1024×1024
            </span>
          </div>

          {!isLoaded && !isPlaceholder && (
            <div className="absolute inset-0 bg-zinc-950 z-10 flex flex-col items-center justify-center">
              <div className="absolute inset-0 overflow-hidden">
                {Array.from({ length: 30 }).map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute h-[1px] bg-zinc-700"
                    style={{
                      top: `${(i * 3.5 + scrollOffset) % 100}%`,
                      left: 0,
                      right: 0,
                      opacity: Math.random() * 0.3 + 0.1,
                    }}
                  />
                ))}
              </div>

              <div className="relative overflow-hidden w-full">
                <motion.div
                  animate={{ x: [0, -200] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  className="whitespace-nowrap text-[#33FF33] text-xs font-mono tracking-widest"
                >
                  SEARCHING SATELLITE... SEARCHING SATELLITE... SEARCHING SATELLITE... SEARCHING SATELLITE...
                </motion.div>
              </div>

              <div className="mt-4 flex items-center gap-2">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="w-4 h-4 border-2 border-[#33FF33] border-t-transparent rounded-full"
                />
                <span className="text-[9px] font-mono text-zinc-500">ACQUIRING LOCK</span>
              </div>
            </div>
          )}

          {isPlaceholder ? (
            <div className="absolute inset-0 bg-zinc-950 flex items-center justify-center">
              <div className="absolute inset-0">
                {Array.from({ length: 15 }).map((_, i) => (
                  <div
                    key={`h-${i}`}
                    className="absolute w-full h-[1px] bg-zinc-800/50"
                    style={{ top: `${i * 7}%` }}
                  />
                ))}
                {Array.from({ length: 15 }).map((_, i) => (
                  <div
                    key={`v-${i}`}
                    className="absolute h-full w-[1px] bg-zinc-800/50"
                    style={{ left: `${i * 7}%` }}
                  />
                ))}
              </div>
              <div className="text-center z-10">
                <motion.div
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="text-[#33FF33] text-sm font-mono tracking-widest"
                >
                  NO_SIGNAL
                </motion.div>
                <div className="text-zinc-600 text-[8px] font-mono mt-1 tracking-wider">
                  AWAITING_UPLINK
                </div>
              </div>
            </div>
          ) : (
            <motion.img
              src={imageUrl}
              alt={name}
              className="w-full h-full object-contain bg-white"
              initial={{ opacity: 0, x: 0 }}
              animate={{ 
                opacity: isLoaded ? 1 : 0,
                x: showGlitch ? [0, -8, 5, -3, 0] : 0,
              }}
              transition={{
                opacity: { duration: 0.3 },
                x: { duration: 0.2, ease: "easeOut" }
              }}
              onLoad={() => setIsLoaded(true)}
              onError={() => setIsLoaded(true)}
            />
          )}
        </div>
      </div>
    </motion.div>
  );
}

function GiftCard({
  gift,
  index,
}: {
  gift: GiftSuggestion;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: "spring" as const,
        stiffness: 100,
        damping: 15,
        delay: index * 0.2,
      }}
      className="bg-zinc-800 rounded-lg overflow-hidden"
    >
      <div className="flex flex-col md:flex-row">
        <div className="w-full md:w-auto flex-shrink-0">
          <VisualMonitor
            imageUrl={gift.imageUrl}
            name={gift.name}
          />
        </div>

        <div className="p-4 space-y-3 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-[#FF5722] font-bold">
              0{index + 1}
            </span>
            <div className="flex-1 h-[1px] bg-zinc-700" />
            <span className="text-[8px] font-mono text-zinc-600">
              ITEM_{String(index + 1).padStart(3, "0")}
            </span>
          </div>

          <h3 className="text-sm font-bold text-white tracking-wide leading-tight">
            {gift.name}
          </h3>

          <p className="text-[11px] text-zinc-400 leading-relaxed">
            {gift.description}
          </p>

          <div className="pt-3 border-t border-zinc-700 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[8px] tracking-widest text-[#33FF33]">
                [ MATCH_ANALYSIS ]
              </span>
              <div className="flex-1 h-[1px] bg-zinc-800" />
            </div>
            <p className="text-[10px] text-[#33FF33]/80 font-mono leading-relaxed">
              ▶ {gift.why}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function LCDScreen({
  isAnalyzing,
  progress,
  gifts,
  subjectName,
}: {
  isAnalyzing: boolean;
  progress: number;
  gifts: GiftSuggestion[] | null;
  subjectName: string;
}) {
  const [waveOffset, setWaveOffset] = useState(0);

  useEffect(() => {
    if (isAnalyzing) {
      const interval = setInterval(() => {
        setWaveOffset((prev) => (prev + 1) % 20);
      }, 100);
      return () => clearInterval(interval);
    }
  }, [isAnalyzing]);

  const renderWaveform = () => {
    const bars = [];
    for (let i = 0; i < 32; i++) {
      const height = Math.abs(Math.sin((i + waveOffset) * 0.5) * 20) + 4;
      bars.push(
        <div
          key={i}
          className="w-1 bg-[#33FF33] rounded-sm"
          style={{ height: `${height}px` }}
        />
      );
    }
    return bars;
  };

  return (
    <div className="relative w-full bg-zinc-800 rounded-lg shadow-[inset_0_4px_12px_rgba(0,0,0,0.5)] p-4 overflow-hidden">
      <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,0,0,0.1)_2px,rgba(0,0,0,0.1)_4px)]" />

      <div className="relative font-mono">
        <AnimatePresence mode="wait">
          {isAnalyzing ? (
            <motion.div
              key="analyzing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center gap-4 py-8"
            >
              <div className="flex items-end gap-[2px] h-8">
                {renderWaveform()}
              </div>
              <div className="text-[#33FF33] text-xs tracking-widest">
                ANALYZING... {Math.min(Math.floor(progress), 100)}%
              </div>
              <div className="w-full max-w-xs h-2 bg-zinc-900 rounded overflow-hidden">
                <motion.div
                  className="h-full bg-[#33FF33]"
                  initial={{ width: "0%" }}
                  animate={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
            </motion.div>
          ) : gifts ? (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-center gap-3 text-[10px] tracking-widest">
                <span className="text-zinc-600">◆</span>
                <span className="text-[#FFAB00]">
                  GIFT MANIFEST FOR: {subjectName.toUpperCase() || "SUBJECT"}
                </span>
                <span className="text-zinc-600">◆</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {gifts.map((gift, index) => (
                  <GiftCard key={index} gift={gift} index={index} />
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-8"
            >
              <div className="text-[#33FF33] text-lg tracking-widest mb-2">
                G-1 GIFT SAMPLER
              </div>
              <div className="text-[#33FF33]/50 text-[10px] tracking-widest">
                v3.1.0 // READY
              </div>
              <motion.div
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-[#33FF33]/30 text-[10px] tracking-widest mt-4"
              >
                ▶ CONFIGURE & PRESS ANALYZE
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function Home() {
  const [isBooting, setIsBooting] = useState(true);
  const [subjectName, setSubjectName] = useState("");
  const [age, setAge] = useState(30);
  const [relationship, setRelationship] = useState<RelationshipType | null>(null);
  const [interests, setInterests] = useState<string[]>([]);
  const [customInterests, setCustomInterests] = useState<string[]>([]);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [budgetRange, setBudgetRange] = useState<[number, number]>([50, 200]);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [gifts, setGifts] = useState<GiftSuggestion[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { playMechanicalClick, playPaperSlide, playHeavyClick, playFaderMove } = useSoundEngine();
  const playClick = playMechanicalClick;

  const allInterests = [...DEFAULT_INTERESTS, ...customInterests];

  useEffect(() => {
    if (isAnalyzing && progress < 90) {
      const timer = setTimeout(() => {
        setProgress((prev) => prev + Math.random() * 15 + 5);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isAnalyzing, progress]);

  const toggleInterest = (interest: string) => {
    setInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
  };

  const handleAddCustomInterest = (tag: string) => {
    if (!customInterests.includes(tag) && !DEFAULT_INTERESTS.includes(tag)) {
      setCustomInterests((prev) => [...prev, tag]);
      setInterests((prev) => [...prev, tag]);
    }
  };

  const handleAnalyze = async () => {
    playHeavyClick();
    setIsAnalyzing(true);
    setProgress(0);
    setError(null);
    setGifts(null);

    try {
      const response = await fetch("/api/oracle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subjectName,
          age,
          tags: interests.map((i) => `#${i}`),
          relationship,
          budget: `$${budgetRange[0]} - $${budgetRange[1]}`,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to analyze");
      }

      setProgress(100);
      await new Promise((resolve) => setTimeout(resolve, 500));
      playPaperSlide();
      setGifts(Array.isArray(data) ? data : data.gifts);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    playClick();
    setGifts(null);
    setProgress(0);
    setError(null);
  };

  return (
    <>
      <AnimatePresence>
        {isBooting && <BootSequence onComplete={() => setIsBooting(false)} />}
      </AnimatePresence>

      <div className="min-h-screen bg-zinc-300 flex items-center justify-center p-4 md:p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: isBooting ? 0 : 1, y: isBooting ? 20 : 0 }}
          transition={{ delay: 0.1 }}
          className="relative w-full max-w-2xl bg-[#EBEBEB] rounded-2xl p-4 md:p-8 shadow-[0_8px_32px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.8),inset_0_-1px_0_rgba(0,0,0,0.1)]"
        >
          <Screw className="top-3 left-3 hidden md:block" />
          <Screw className="top-3 right-3 hidden md:block" />
          <Screw className="bottom-3 left-3 hidden md:block" />
          <Screw className="bottom-3 right-3 hidden md:block" />

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-black tracking-wider text-zinc-800 font-mono">
                G-1 GIFT SAMPLER
              </h1>
              <p className="text-[10px] tracking-widest text-zinc-500">
                MODEL G-1 // REV 3.0
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#33FF33] shadow-[0_0_6px_rgba(51,255,51,0.5)]" />
              <span className="text-[10px] tracking-widest text-zinc-500">PWR</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold tracking-widest text-zinc-500">
              RECIPIENT
            </label>
            <input
              type="text"
              value={subjectName}
              onChange={(e) => setSubjectName(e.target.value)}
              placeholder="ENTER NAME"
              className="w-full px-4 py-3 bg-zinc-200 rounded-lg text-sm font-mono tracking-wider text-zinc-700 placeholder:text-zinc-400 outline-none focus:ring-2 focus:ring-[#FF5722] shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)]"
            />
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-bold tracking-widest text-zinc-500">
              RELATIONSHIP
            </label>
            <RelationshipSelector
              value={relationship}
              onChange={setRelationship}
            />
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-bold tracking-widest text-zinc-500">
              INTEREST MATRIX
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {allInterests.map((interest) => (
                <InterestSwitch
                  key={interest}
                  label={interest}
                  isActive={interests.includes(interest)}
                  onClick={() => toggleInterest(interest)}
                />
              ))}
              <InterestSwitch
                label="CUSTOM+"
                isActive={showCustomInput}
                onClick={() => setShowCustomInput(!showCustomInput)}
                isCustomButton
              />
              <AnimatePresence>
                {showCustomInput && (
                  <CustomTagInput
                    onAdd={handleAddCustomInterest}
                    onClose={() => setShowCustomInput(false)}
                  />
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-bold tracking-widest text-zinc-500">
                AGE
              </label>
            </div>
            <SilverFader
              value={age}
              onChange={setAge}
              onFaderMove={playFaderMove}
              min={1}
              max={99}
              formatValue={(v) => `${v} YRS`}
            />
          </div>

          <div className="space-y-3 mt-8">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-bold tracking-widest text-zinc-500">
                BUDGET RANGE
              </label>
              <span className="text-[8px] text-zinc-500 tracking-widest">
                LOGARITHMIC FADER
              </span>
            </div>
            <DualRangeFader
              value={budgetRange}
              onChange={setBudgetRange}
              onFaderMove={playFaderMove}
              min={10}
              max={5000}
            />
          </div>

          <div className="mt-8">
            <LCDScreen
              isAnalyzing={isAnalyzing}
              progress={progress}
              gifts={gifts}
              subjectName={subjectName}
            />
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-100 border border-red-300 rounded-lg p-3 text-xs text-red-600 font-mono"
            >
              ERROR: {error}
            </motion.div>
          )}

          <div className="flex gap-3">
            <motion.button
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              whileTap={{ scale: 0.98, y: 2 }}
              transition={{ type: "spring", stiffness: 500, damping: 20 }}
              style={{ touchAction: "manipulation" }}
              className={`flex-1 py-4 min-h-[52px] rounded-lg font-bold tracking-widest text-sm transition-all
                ${
                  isAnalyzing
                    ? "bg-zinc-400 text-zinc-600 cursor-not-allowed"
                    : "bg-[#FF5722] text-white shadow-[inset_0_-4px_0_0_#BF360C,0_4px_12px_rgba(255,87,34,0.3)] hover:shadow-[inset_0_-4px_0_0_#BF360C,0_6px_16px_rgba(255,87,34,0.4)]"
                }
              `}
            >
              {isAnalyzing ? "ANALYZING..." : "ANALYZE"}
            </motion.button>

            {gifts && (
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={handleReset}
                whileTap={{ scale: 0.98, y: 2 }}
                transition={{ type: "spring", stiffness: 500, damping: 20 }}
                style={{ touchAction: "manipulation" }}
                className="px-6 py-4 min-h-[52px] rounded-lg font-bold tracking-widest text-sm bg-zinc-300 text-zinc-600 shadow-[inset_0_-3px_0_0_rgba(0,0,0,0.1),0_2px_6px_rgba(0,0,0,0.1)]"
              >
                RESET
              </motion.button>
            )}
          </div>

          <div className="text-center text-[9px] tracking-widest text-zinc-400">
            G-1 GIFT SAMPLER // PROFESSIONAL SERIES
          </div>
        </div>
      </motion.div>
    </div>
    </>
  );
}
