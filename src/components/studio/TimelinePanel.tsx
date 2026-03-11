import { Play, Pause, SkipBack, SkipForward, Volume2, Scissors, Film, Music, Type, Upload } from "lucide-react";
import { useRef, useCallback } from "react";
import type { useVideoEngine } from "@/hooks/useVideoEngine";

interface TimelinePanelProps {
  engine: ReturnType<typeof useVideoEngine>;
}

export function TimelinePanel({ engine }: TimelinePanelProps) {
  const trackAreaRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { playing, currentTime, duration, tracks, togglePlayPause, skipBack, skipForward, seek, formatTime, importVideo, importAudio } = engine;

  const playheadPct = duration > 0 ? (currentTime / duration) * 100 : 0;

  const calcTimeFromEvent = useCallback((clientX: number) => {
    const el = trackAreaRef.current;
    if (!el) return currentTime;
    const rect = el.getBoundingClientRect();
    const x = clientX - rect.left;
    const pct = Math.max(0, Math.min(1, x / rect.width));
    return pct * duration;
  }, [currentTime, duration]);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    isDraggingRef.current = true;
    seek(calcTimeFromEvent(e.clientX));
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, [calcTimeFromEvent, seek]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    seek(calcTimeFromEvent(e.clientX));
  }, [calcTimeFromEvent, seek]);

  const handlePointerUp = useCallback(() => {
    isDraggingRef.current = false;
  }, []);

  const handleFileImport = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type.startsWith("video/")) {
      await importVideo(file);
    } else if (file.type.startsWith("audio/")) {
      await importAudio(file);
    }
    e.target.value = "";
  }, [importVideo, importAudio]);

  const trackIcons: Record<string, any> = { video: Film, audio: Music, text: Type };

  // Generate ruler marks
  const rulerMarks = [];
  const step = duration <= 30 ? 5 : duration <= 120 ? 10 : 30;
  for (let t = 0; t <= duration; t += step) {
    rulerMarks.push(t);
  }

  return (
    <div className="h-48 bg-studio-timeline border-t border-border flex flex-col select-none">
      {/* Transport controls */}
      <div className="h-9 flex items-center px-3 border-b border-border gap-2">
        <button onClick={skipBack} className="studio-tool-btn w-7 h-7">
          <SkipBack className="w-3.5 h-3.5" />
        </button>
        <button onClick={togglePlayPause} className="studio-tool-btn w-7 h-7">
          {playing ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
        </button>
        <button onClick={skipForward} className="studio-tool-btn w-7 h-7">
          <SkipForward className="w-3.5 h-3.5" />
        </button>
        <div className="w-px h-5 bg-border mx-1" />
        <button className="studio-tool-btn w-7 h-7"><Scissors className="w-3.5 h-3.5" /></button>
        <button className="studio-tool-btn w-7 h-7"><Volume2 className="w-3.5 h-3.5" /></button>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="studio-tool-btn w-7 h-7"
          title="Import video/audio"
        >
          <Upload className="w-3.5 h-3.5" />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="video/*,audio/*"
          className="hidden"
          onChange={handleFileImport}
        />
        <div className="flex-1" />
        <span className="text-xs font-mono-code text-muted-foreground">
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>
      </div>

      {/* Timeline tracks */}
      <div className="flex-1 flex overflow-hidden">
        {/* Track labels */}
        <div className="w-24 border-r border-border flex flex-col">
          <div className="h-5 border-b border-border" />
          {tracks.map((track) => {
            const Icon = trackIcons[track.type] || Film;
            return (
              <div key={track.id} className="h-8 flex items-center px-2 gap-1.5 text-xs text-muted-foreground border-b border-border/50">
                <Icon className="w-3 h-3" />
                <span className="truncate">{track.label}</span>
              </div>
            );
          })}
        </div>

        {/* Track clips area */}
        <div
          ref={trackAreaRef}
          className="flex-1 relative overflow-x-auto cursor-pointer"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        >
          {/* Time ruler */}
          <div className="h-5 border-b border-border flex items-end relative">
            {rulerMarks.map((t) => (
              <div
                key={t}
                className="absolute text-[9px] font-mono-code text-studio-dim border-l border-border/30 pl-0.5 bottom-0 h-full flex items-end"
                style={{ left: `${(t / duration) * 100}%` }}
              >
                {t}s
              </div>
            ))}
            {/* Minor ticks */}
            {Array.from({ length: Math.min(101, Math.ceil(duration / 2) + 1) }).map((_, i) => {
              const tickTime = i * 2;
              if (tickTime > duration) return null;
              return (
                <div
                  key={`tick-${i}`}
                  className="absolute bottom-0 w-px bg-border/20"
                  style={{
                    left: `${(tickTime / duration) * 100}%`,
                    height: tickTime % step === 0 ? "8px" : "4px",
                  }}
                />
              );
            })}
          </div>

          {/* Tracks */}
          {tracks.map((track) => {
            const colors: Record<string, string> = {
              video: "bg-studio-blue",
              audio: "bg-studio-highlight",
              text: "bg-primary",
            };
            const trackColor = colors[track.type] || "bg-studio-blue";

            return (
              <div key={track.id} className="h-8 relative border-b border-border/50">
                {track.clips.map((clip) => {
                  const leftPct = (clip.start / duration) * 100;
                  const widthPct = ((clip.end - clip.start) / duration) * 100;

                  return (
                    <div
                      key={clip.id}
                      className={`absolute top-1 bottom-1 ${trackColor} rounded-sm opacity-70 hover:opacity-100 transition-opacity overflow-hidden`}
                      style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
                    >
                      {/* Waveform visualization for audio */}
                      {clip.waveformData && (
                        <WaveformDisplay data={clip.waveformData} />
                      )}
                      {/* Clip label */}
                      {clip.label && (
                        <span className="absolute left-1 top-0 bottom-0 flex items-center text-[9px] text-foreground/80 truncate pointer-events-none">
                          {clip.label}
                        </span>
                      )}
                      {/* Resize handles */}
                      <div className="absolute left-0 top-0 bottom-0 w-1 cursor-ew-resize hover:bg-foreground/30 rounded-l-sm" />
                      <div className="absolute right-0 top-0 bottom-0 w-1 cursor-ew-resize hover:bg-foreground/30 rounded-r-sm" />
                    </div>
                  );
                })}
              </div>
            );
          })}

          {/* Playhead */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-primary z-10 pointer-events-none"
            style={{ left: `${playheadPct}%` }}
          >
            <div className="w-3 h-4 bg-primary rounded-b-sm -ml-[5px] flex items-center justify-center">
              <div className="w-0 h-0 border-l-[4px] border-r-[4px] border-t-[5px] border-l-transparent border-r-transparent border-t-primary-foreground" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Audio waveform component
function WaveformDisplay({ data }: { data: number[] }) {
  return (
    <div className="absolute inset-0 flex items-end gap-px px-px">
      {data.map((amplitude, i) => (
        <div
          key={i}
          className="flex-1 bg-foreground/40 rounded-t-sm min-w-[1px]"
          style={{ height: `${Math.max(10, amplitude * 100)}%` }}
        />
      ))}
    </div>
  );
}
