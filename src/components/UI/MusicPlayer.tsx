// components/UI/MusicPlayer.tsx
import React, { useState, useEffect, useRef } from "react";
import "./MusicPlayer.css"; // ✅ Import CSS externe

interface Track {
  name: string;
  file: string;
}

interface MusicPlayerProps {
  onMusicToggle?: (isPlaying: boolean, track?: Track) => void;
  onVolumeChange?: (volume: number) => void;
}

const MusicPlayer: React.FC<MusicPlayerProps> = ({
  onMusicToggle,
  onVolumeChange,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [volume, setVolume] = useState(0.5);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const audioRef = useRef<HTMLAudioElement>(null);

  const lofiTracks: Track[] = [
    { name: "Rainy Afternoon", file: "/audio/rainy-afternoon.mp3" },
    { name: "Study Session", file: "/audio/study-session.mp3" },
    { name: "Coffee Break", file: "/audio/coffee-break.mp3" },
    { name: "Midnight Jazz", file: "/audio/midnight-jazz.mp3" },
    { name: "City Lights", file: "/audio/city-lights.mp3" },
  ];

  // ✅ Écouter les événements de la platine 3D
  useEffect(() => {
    const handleVinylToggle = (event: CustomEvent) => {
      const { playerId, isPlaying: vinylPlaying, track } = event.detail;
      if (playerId === "vinyle-player") {
        setIsPlaying(vinylPlaying);
        if (track) {
          // Chercher l'index du track
          const trackIndex = lofiTracks.findIndex((t) => t.name === track.name);
          if (trackIndex !== -1) {
            setCurrentTrack(trackIndex);
          }
        }
      }
    };

    window.addEventListener("vinylToggle", handleVinylToggle as EventListener);

    return () => {
      window.removeEventListener(
        "vinylToggle",
        handleVinylToggle as EventListener
      );
    };
  }, []);

  // ✅ Gestion de l'audio HTML5
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", updateDuration);

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", updateDuration);
    };
  }, [currentTrack]);

  // ✅ Contrôle du volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // ✅ Contrôle play/pause
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play();
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentTrack]);

  const handlePlayPause = () => {
    const newIsPlaying = !isPlaying;
    setIsPlaying(newIsPlaying);

    // ✅ Notifier la scène 3D et les callbacks
    if (onMusicToggle) {
      onMusicToggle(newIsPlaying, lofiTracks[currentTrack]);
    }

    // ✅ Émettre événement pour la platine 3D
    const event = new CustomEvent("uiMusicToggle", {
      detail: {
        playerId: "vinyle-player",
        isPlaying: newIsPlaying,
        track: lofiTracks[currentTrack],
      },
    });
    window.dispatchEvent(event);
  };

  const handleTrackChange = (direction: "prev" | "next") => {
    let newTrack;
    if (direction === "next") {
      newTrack = (currentTrack + 1) % lofiTracks.length;
    } else {
      newTrack = currentTrack === 0 ? lofiTracks.length - 1 : currentTrack - 1;
    }

    setCurrentTrack(newTrack);

    if (isPlaying && onMusicToggle) {
      onMusicToggle(true, lofiTracks[newTrack]);
    }
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    if (onVolumeChange) {
      onVolumeChange(newVolume);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !duration) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    const newTime = percentage * duration;

    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  return (
    <div className="music-player">
      {/* ✅ Audio element caché */}
      <audio
        ref={audioRef}
        src={lofiTracks[currentTrack].file}
        onEnded={() => handleTrackChange("next")}
      />

      {/* Interface du lecteur */}
      <div className="player-container">
        {/* Informations du track */}
        <div className="track-info">
          <div className="track-name">{lofiTracks[currentTrack].name}</div>
          <div className="track-time">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>
        </div>

        {/* Barre de progression */}
        <div className="progress-container" onClick={handleProgressClick}>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{
                width: duration ? `${(currentTime / duration) * 100}%` : "0%",
              }}
            />
          </div>
        </div>

        {/* Contrôles */}
        <div className="controls">
          <button
            onClick={() => handleTrackChange("prev")}
            className="control-btn"
          >
            ⏮️
          </button>

          <button
            onClick={handlePlayPause}
            className={`play-btn ${isPlaying ? "playing" : ""}`}
          >
            {isPlaying ? "⏸️" : "▶️"}
          </button>

          <button
            onClick={() => handleTrackChange("next")}
            className="control-btn"
          >
            ⏭️
          </button>
        </div>

        {/* Volume */}
        <div className="volume-container">
          <span className="volume-icon">🔊</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
            className="volume-slider"
          />
        </div>
      </div>
    </div>
  );
};

export default MusicPlayer;
