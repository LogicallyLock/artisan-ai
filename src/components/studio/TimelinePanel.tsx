import { Play, Pause, SkipBack, SkipForward, Volume2, Scissors, Film, Music, Type } from "lucide-react";
import { useState } from "react";

const tracks = [
  { id: "v1", label: "Video 1", icon: Film, color: "bg-studio-blue", clips: [{ start: 0, end: 60 }, { start: 70, end: 100 }] },
  { id: "v2", label: "Video 2", icon: Film, color: "bg-studio-green", clips: [{ start: 20, end: 50 }] },
  { id: "t1", label: "Text", icon: Type, color: "bg-primary", clips: [{ start: 10, end: 40 }] },
  { id: "a1", label: "Audio", icon: Music, color: "bg-studio-highlight", clips: [{ start: 0, end: 90 }] },
];

export function TimelinePanel() {
  const [playing, setPlaying] = useState(false);
  const [playhead, setPlayhead] = useState(25);

  return (
    <div className="h-48 bg-studio-timeline border-t border-border flex flex-col">
      {/* Transport controls */}
      <div className="h-9 flex items-center px-3 border-b border-border gap-2">
        <button className="studio-tool-btn w-7 h-7"><SkipBack className="w-3.5 h-3.5" /></button>
        <button onClick={() => setPlaying(!playing)} className="studio-tool-btn w-7 h-7">
          {playing ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
        </button>
        <button className="studio-tool-btn w-7 h-7"><SkipForward className="w-3.5 h-3.5" /></button>
        <div className="w-px h-5 bg-border mx-1" />
        <button className="studio-tool-btn w-7 h-7"><Scissors className="w-3.5 h-3.5" /></button>
        <button className="studio-tool-btn w-7 h-7"><Volume2 className="w-3.5 h-3.5" /></button>
        <div className="flex-1" />
        <span className="text-xs font-mono-code text-muted-foreground">00:00:{String(playhead).padStart(2, "0")} / 00:01:40</span>
      </div>

      {/* Timeline tracks */}
      <div className="flex-1 flex overflow-hidden">
        {/* Track labels */}
        <div className="w-24 border-r border-border flex flex-col">
          {tracks.map(track => (
            <div key={track.id} className="h-8 flex items-center px-2 gap-1.5 text-xs text-muted-foreground border-b border-border/50">
              <track.icon className="w-3 h-3" />
              <span className="truncate">{track.label}</span>
            </div>
          ))}
        </div>

        {/* Track clips */}
        <div className="flex-1 relative overflow-x-auto">
          {/* Time ruler */}
          <div className="h-4 border-b border-border flex items-end px-1">
            {Array.from({ length: 11 }).map((_, i) => (
              <div key={i} className="flex-1 text-[9px] font-mono-code text-studio-dim border-l border-border/30 pl-0.5">
                {i * 10}s
              </div>
            ))}
          </div>

          {/* Tracks */}
          {tracks.map(track => (
            <div key={track.id} className="h-8 relative border-b border-border/50">
              {track.clips.map((clip, ci) => (
                <div
                  key={ci}
                  className={`absolute top-1 bottom-1 ${track.color} rounded-sm opacity-70 hover:opacity-100 transition-opacity cursor-pointer`}
                  style={{ left: `${clip.start}%`, width: `${clip.end - clip.start}%` }}
                />
              ))}
            </div>
          ))}

          {/* Playhead */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-primary z-10 pointer-events-none"
            style={{ left: `${playhead}%` }}
          >
            <div className="w-2.5 h-2.5 bg-primary rounded-full -ml-[4px] -mt-0.5" />
          </div>
        </div>
      </div>
    </div>
  );
}
