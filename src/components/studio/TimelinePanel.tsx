import { Play, Pause, SkipBack, SkipForward, Volume2, Scissors, Film, Music, Type } from "lucide-react";
import { useState, useRef, useCallback } from "react";

const tracks = [
  { id: "v1", label: "Video 1", icon: Film, color: "bg-studio-blue", clips: [{ start: 0, end: 60 }, { start: 70, end: 100 }] },
  { id: "v2", label: "Video 2", icon: Film, color: "bg-studio-green", clips: [{ start: 20, end: 50 }] },
  { id: "t1", label: "Text", icon: Type, color: "bg-primary", clips: [{ start: 10, end: 40 }] },
  { id: "a1", label: "Audio", icon: Music, color: "bg-studio-highlight", clips: [{ start: 0, end: 90 }] },
];

const TOTAL_DURATION = 100; // seconds represented as percentage

export function TimelinePanel() {
  const [playing, setPlaying] = useState(false);
  const [playhead, setPlayhead] = useState(25);
  const trackAreaRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);

  const calcPositionFromEvent = useCallback((clientX: number) => {
    const el = trackAreaRef.current;
    if (!el) return playhead;
    const rect = el.getBoundingClientRect();
    const x = clientX - rect.left;
    const pct = Math.max(0, Math.min(100, (x / rect.width) * 100));
    return Math.round(pct * 10) / 10;
  }, [playhead]);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    isDraggingRef.current = true;
    const pos = calcPositionFromEvent(e.clientX);
    setPlayhead(pos);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, [calcPositionFromEvent]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    const pos = calcPositionFromEvent(e.clientX);
    setPlayhead(pos);
  }, [calcPositionFromEvent]);

  const handlePointerUp = useCallback(() => {
    isDraggingRef.current = false;
  }, []);

  const formatTime = (pct: number) => {
    const totalSec = (pct / 100) * TOTAL_DURATION;
    const min = Math.floor(totalSec / 60);
    const sec = Math.floor(totalSec % 60);
    const frames = Math.floor((totalSec % 1) * 30);
    return `${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}:${String(frames).padStart(2, "0")}`;
  };

  const skipBack = () => setPlayhead(Math.max(0, playhead - 5));
  const skipForward = () => setPlayhead(Math.min(100, playhead + 5));

  return (
    <div className="h-48 bg-studio-timeline border-t border-border flex flex-col select-none">
      {/* Transport controls */}
      <div className="h-9 flex items-center px-3 border-b border-border gap-2">
        <button onClick={skipBack} className="studio-tool-btn w-7 h-7"><SkipBack className="w-3.5 h-3.5" /></button>
        <button onClick={() => setPlaying(!playing)} className="studio-tool-btn w-7 h-7">
          {playing ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
        </button>
        <button onClick={skipForward} className="studio-tool-btn w-7 h-7"><SkipForward className="w-3.5 h-3.5" /></button>
        <div className="w-px h-5 bg-border mx-1" />
        <button className="studio-tool-btn w-7 h-7"><Scissors className="w-3.5 h-3.5" /></button>
        <button className="studio-tool-btn w-7 h-7"><Volume2 className="w-3.5 h-3.5" /></button>
        <div className="flex-1" />
        <span className="text-xs font-mono-code text-muted-foreground">
          {formatTime(playhead)} / {formatTime(100)}
        </span>
      </div>

      {/* Timeline tracks */}
      <div className="flex-1 flex overflow-hidden">
        {/* Track labels */}
        <div className="w-24 border-r border-border flex flex-col">
          {/* Spacer for ruler */}
          <div className="h-5 border-b border-border" />
          {tracks.map(track => (
            <div key={track.id} className="h-8 flex items-center px-2 gap-1.5 text-xs text-muted-foreground border-b border-border/50">
              <track.icon className="w-3 h-3" />
              <span className="truncate">{track.label}</span>
            </div>
          ))}
        </div>

        {/* Track clips area - clickable/draggable */}
        <div
          ref={trackAreaRef}
          className="flex-1 relative overflow-x-auto cursor-pointer"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        >
          {/* Time ruler */}
          <div className="h-5 border-b border-border flex items-end px-0 relative">
            {Array.from({ length: 11 }).map((_, i) => (
              <div
                key={i}
                className="absolute text-[9px] font-mono-code text-studio-dim border-l border-border/30 pl-0.5 bottom-0 h-full flex items-end"
                style={{ left: `${i * 10}%` }}
              >
                {i * 10}s
              </div>
            ))}
            {/* Minor ticks */}
            {Array.from({ length: 51 }).map((_, i) => (
              <div
                key={`tick-${i}`}
                className="absolute bottom-0 w-px bg-border/20"
                style={{ left: `${i * 2}%`, height: i % 5 === 0 ? "8px" : "4px" }}
              />
            ))}
          </div>

          {/* Tracks */}
          {tracks.map(track => (
            <div key={track.id} className="h-8 relative border-b border-border/50">
              {track.clips.map((clip, ci) => (
                <div
                  key={ci}
                  className={`absolute top-1 bottom-1 ${track.color} rounded-sm opacity-70 hover:opacity-100 transition-opacity`}
                  style={{ left: `${clip.start}%`, width: `${clip.end - clip.start}%` }}
                >
                  {/* Clip resize handles */}
                  <div className="absolute left-0 top-0 bottom-0 w-1 cursor-ew-resize hover:bg-foreground/30 rounded-l-sm" />
                  <div className="absolute right-0 top-0 bottom-0 w-1 cursor-ew-resize hover:bg-foreground/30 rounded-r-sm" />
                </div>
              ))}
            </div>
          ))}

          {/* Playhead */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-primary z-10 pointer-events-none"
            style={{ left: `${playhead}%` }}
          >
            <div className="w-3 h-4 bg-primary rounded-b-sm -ml-[5px] -mt-0 flex items-center justify-center">
              <div className="w-0 h-0 border-l-[4px] border-r-[4px] border-t-[5px] border-l-transparent border-r-transparent border-t-primary-foreground" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
