import { useRef, useState, useCallback, useEffect } from "react";

export interface VideoTrack {
  id: string;
  label: string;
  type: "video" | "audio" | "text";
  clips: VideoClip[];
}

export interface VideoClip {
  id: string;
  start: number; // seconds
  end: number;   // seconds
  src?: string;  // file URL for video/audio
  label?: string;
  waveformData?: number[]; // normalized 0-1 amplitude values
}

const DEFAULT_DURATION = 100; // seconds

export function useVideoEngine() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const animFrameRef = useRef<number>(0);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(DEFAULT_DURATION);
  const [tracks, setTracks] = useState<VideoTrack[]>([
    { id: "v1", label: "Video 1", type: "video", clips: [] },
    { id: "a1", label: "Audio", type: "audio", clips: [] },
    { id: "t1", label: "Text", type: "text", clips: [] },
  ]);
  const [videoFrame, setVideoFrame] = useState<string | null>(null);

  // Create a hidden video element for playback
  useEffect(() => {
    const video = document.createElement("video");
    video.crossOrigin = "anonymous";
    video.preload = "auto";
    video.muted = false;
    video.style.display = "none";
    document.body.appendChild(video);
    videoRef.current = video;

    video.addEventListener("loadedmetadata", () => {
      setDuration((prev) => Math.max(prev, video.duration));
    });

    return () => {
      video.pause();
      document.body.removeChild(video);
    };
  }, []);

  // Animation loop for playhead sync
  const startPlayback = useCallback(() => {
    const video = videoRef.current;
    const animate = () => {
      if (video && !video.paused) {
        setCurrentTime(video.currentTime);
        extractFrame();
      }
      animFrameRef.current = requestAnimationFrame(animate);
    };
    animFrameRef.current = requestAnimationFrame(animate);
  }, []);

  const stopPlayback = useCallback(() => {
    cancelAnimationFrame(animFrameRef.current);
  }, []);

  const play = useCallback(() => {
    const video = videoRef.current;
    if (!video || !video.src) {
      // No video loaded — simulate playhead animation
      setPlaying(true);
      const startTs = performance.now();
      const startTime = currentTime;
      const animate = () => {
        const elapsed = (performance.now() - startTs) / 1000;
        const newTime = startTime + elapsed;
        if (newTime >= duration) {
          setCurrentTime(0);
          setPlaying(false);
          return;
        }
        setCurrentTime(newTime);
        animFrameRef.current = requestAnimationFrame(animate);
      };
      animFrameRef.current = requestAnimationFrame(animate);
      return;
    }
    video.play();
    setPlaying(true);
    startPlayback();
  }, [currentTime, duration, startPlayback]);

  const pause = useCallback(() => {
    const video = videoRef.current;
    if (video) video.pause();
    setPlaying(false);
    stopPlayback();
  }, [stopPlayback]);

  const seek = useCallback((time: number) => {
    const clampedTime = Math.max(0, Math.min(duration, time));
    setCurrentTime(clampedTime);
    const video = videoRef.current;
    if (video && video.src) {
      video.currentTime = clampedTime;
      // Extract frame at seek position
      setTimeout(() => extractFrame(), 100);
    }
  }, [duration]);

  const extractFrame = useCallback(() => {
    const video = videoRef.current;
    if (!video || !video.src || video.videoWidth === 0) return;
    try {
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(video, 0, 0);
      setVideoFrame(canvas.toDataURL("image/jpeg", 0.8));
    } catch {
      // CORS or other errors
    }
  }, []);

  const importVideo = useCallback(async (file: File): Promise<string> => {
    const url = URL.createObjectURL(file);
    const video = videoRef.current;
    if (!video) return url;

    return new Promise((resolve) => {
      video.onloadedmetadata = () => {
        const videoDuration = video.duration;
        setDuration(Math.max(DEFAULT_DURATION, videoDuration));
        
        const clip: VideoClip = {
          id: `clip-${Date.now()}`,
          start: 0,
          end: videoDuration,
          src: url,
          label: file.name,
        };

        setTracks((prev) =>
          prev.map((t) =>
            t.id === "v1" ? { ...t, clips: [...t.clips, clip] } : t
          )
        );

        // Extract first frame
        video.currentTime = 0;
        video.onseeked = () => {
          extractFrame();
          video.onseeked = null;
          resolve(url);
        };
      };
      video.src = url;
    });
  }, [extractFrame]);

  const importAudio = useCallback(async (file: File): Promise<void> => {
    const url = URL.createObjectURL(file);
    
    // Decode audio for waveform
    const arrayBuffer = await file.arrayBuffer();
    const audioCtx = new AudioContext();
    const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
    const channelData = audioBuffer.getChannelData(0);
    
    // Downsample to ~200 points for waveform visualization
    const samples = 200;
    const blockSize = Math.floor(channelData.length / samples);
    const waveformData: number[] = [];
    for (let i = 0; i < samples; i++) {
      let sum = 0;
      const start = i * blockSize;
      for (let j = 0; j < blockSize; j++) {
        sum += Math.abs(channelData[start + j] || 0);
      }
      waveformData.push(sum / blockSize);
    }
    // Normalize
    const max = Math.max(...waveformData, 0.01);
    const normalized = waveformData.map((v) => v / max);

    const clip: VideoClip = {
      id: `clip-${Date.now()}`,
      start: 0,
      end: audioBuffer.duration,
      src: url,
      label: file.name,
      waveformData: normalized,
    };

    setDuration((prev) => Math.max(prev, audioBuffer.duration));
    setTracks((prev) =>
      prev.map((t) =>
        t.id === "a1" ? { ...t, clips: [...t.clips, clip] } : t
      )
    );

    audioCtx.close();
  }, []);

  const skipBack = useCallback(() => seek(currentTime - 5), [currentTime, seek]);
  const skipForward = useCallback(() => seek(currentTime + 5), [currentTime, seek]);

  const togglePlayPause = useCallback(() => {
    if (playing) pause();
    else play();
  }, [playing, play, pause]);

  const formatTime = useCallback((seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    const frames = Math.floor((seconds % 1) * 30);
    return `${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}:${String(frames).padStart(2, "0")}`;
  }, []);

  return {
    playing,
    currentTime,
    duration,
    tracks,
    videoFrame,
    play,
    pause,
    seek,
    skipBack,
    skipForward,
    togglePlayPause,
    importVideo,
    importAudio,
    formatTime,
  };
}
