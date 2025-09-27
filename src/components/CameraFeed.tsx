import { Card } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw, ExternalLink, Play, Pause } from "lucide-react";

interface CameraFeedProps {
  id: string;
  name: string;
  status: "active" | "alert" | "offline";
  streamUrl: string;
  location: string;
}

interface MediaInfo {
  type: 'video' | 'image' | 'stream' | 'iframe' | 'unknown';
  isEmbeddable: boolean;
  embedUrl?: string;
}

export const CameraFeed = ({ id, name, status, streamUrl, location }: CameraFeedProps) => {
  const [streamError, setStreamError] = useState(false);
  const [mediaInfo, setMediaInfo] = useState<MediaInfo>({ type: 'unknown', isEmbeddable: false });
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);

  // Detect media type and prepare embed URL
  const analyzeMediaUrl = (url: string): MediaInfo => {
    if (!url || url.trim() === '') {
      return { type: 'unknown', isEmbeddable: false };
    }

    // Clean and normalize URL
    const cleanUrl = url.trim();
    
    // YouTube detection and embed conversion
    if (cleanUrl.includes('youtube.com') || cleanUrl.includes('youtu.be')) {
      const videoId = extractYouTubeId(cleanUrl);
      if (videoId) {
        return {
          type: 'video',
          isEmbeddable: true,
          embedUrl: `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=1`
        };
      }
    }

    // Vimeo detection
    if (cleanUrl.includes('vimeo.com')) {
      const videoId = cleanUrl.split('/').pop();
      if (videoId) {
        return {
          type: 'video',
          isEmbeddable: true,
          embedUrl: `https://player.vimeo.com/video/${videoId}?autoplay=1&muted=1`
        };
      }
    }

    // Twitch detection
    if (cleanUrl.includes('twitch.tv')) {
      const channel = cleanUrl.split('/').pop();
      if (channel) {
        return {
          type: 'stream',
          isEmbeddable: true,
          embedUrl: `https://player.twitch.tv/?channel=${channel}&parent=${window.location.hostname}&autoplay=true&muted=true`
        };
      }
    }

    // Direct video/image file detection
    const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.mkv', '.m3u8'];
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
    
    const lowerUrl = cleanUrl.toLowerCase();
    
    if (videoExtensions.some(ext => lowerUrl.includes(ext))) {
      return { type: 'video', isEmbeddable: false, embedUrl: cleanUrl };
    }
    
    if (imageExtensions.some(ext => lowerUrl.includes(ext))) {
      return { type: 'image', isEmbeddable: false, embedUrl: cleanUrl };
    }

    // HLS stream detection
    if (lowerUrl.includes('.m3u8') || lowerUrl.includes('hls')) {
      return { type: 'stream', isEmbeddable: false, embedUrl: cleanUrl };
    }

    // IP Camera patterns
    if (lowerUrl.includes(':8080') || lowerUrl.includes('mjpeg') || lowerUrl.includes('stream')) {
      return { type: 'stream', isEmbeddable: false, embedUrl: cleanUrl };
    }

    // Default to iframe for web content
    return { type: 'iframe', isEmbeddable: true, embedUrl: cleanUrl };
  };

  const extractYouTubeId = (url: string): string | null => {
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[7].length === 11) ? match[7] : null;
  };

  useEffect(() => {
    if (streamUrl) {
      setIsLoading(true);
      const info = analyzeMediaUrl(streamUrl);
      setMediaInfo(info);
      setStreamError(false);
      setIsLoading(false);
    }
  }, [streamUrl]);

  const getStatusColor = () => {
    switch (status) {
      case "active":
        return "bg-status-active";
      case "alert":
        return "bg-status-alert";
      case "offline":
        return "bg-status-offline";
      default:
        return "bg-muted";
    }
  };

  const getStatusText = () => {
    switch (status) {
      case "active":
        return "ACTIVE";
      case "alert":
        return "ALERT";
      case "offline":
        return "OFFLINE";
      default:
        return "UNKNOWN";
    }
  };

  const handleRefresh = () => {
    setStreamError(false);
    setIsLoading(true);
    const info = analyzeMediaUrl(streamUrl);
    setMediaInfo(info);
    setIsLoading(false);
  };

  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
  };

  // Render content based on media type
  const renderMediaContent = () => {
    if (isLoading) {
      return (
        <div className="w-full h-48 bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
          <div className="text-center">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />
            <p className="text-sm text-muted-foreground">Loading...</p>
          </div>
        </div>
      );
    }

    if (streamError || !streamUrl || !mediaInfo.embedUrl) {
      return (
        <div className="w-full h-48 bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-2">
              <div className="w-4 h-4 bg-primary rounded-full animate-pulse"></div>
            </div>
            <p className="text-sm text-muted-foreground mb-2">Stream unavailable</p>
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </div>
        </div>
      );
    }

    switch (mediaInfo.type) {
      case 'image':
        return (
          <img
            src={mediaInfo.embedUrl}
            alt={`${name} camera feed`}
            className="w-full h-48 object-cover"
            onError={() => setStreamError(true)}
            data-testid={`img-camera-${id}`}
          />
        );

      case 'video':
        if (mediaInfo.isEmbeddable) {
          return (
            <iframe
              src={mediaInfo.embedUrl}
              className="w-full h-48 border-0"
              title={`${name} video stream`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              onError={() => setStreamError(true)}
              data-testid={`iframe-video-${id}`}
            />
          );
        } else {
          return (
            <video
              src={mediaInfo.embedUrl}
              className="w-full h-48 object-cover"
              autoPlay={isPlaying}
              muted
              loop
              controls
              onError={() => setStreamError(true)}
              data-testid={`video-direct-${id}`}
            />
          );
        }

      case 'stream':
        if (mediaInfo.isEmbeddable) {
          return (
            <iframe
              src={mediaInfo.embedUrl}
              className="w-full h-48 border-0"
              title={`${name} live stream`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              onError={() => setStreamError(true)}
              data-testid={`iframe-stream-${id}`}
            />
          );
        } else {
          return (
            <video
              src={mediaInfo.embedUrl}
              className="w-full h-48 object-cover"
              autoPlay={isPlaying}
              muted
              controls
              onError={() => setStreamError(true)}
              data-testid={`video-stream-${id}`}
            />
          );
        }

      case 'iframe':
      default:
        return (
          <iframe
            src={mediaInfo.embedUrl}
            className="w-full h-48 border-0"
            title={`${name} content`}
            sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
            onError={() => setStreamError(true)}
            data-testid={`iframe-content-${id}`}
          />
        );
    }
  };

  return (
    <Card className="overflow-hidden border-border bg-card hover:bg-card/80 transition-colors">
      <div className="relative">
        {renderMediaContent()}
        <div className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-bold ${getStatusColor()} text-white`}>
          {getStatusText()}
        </div>
        <div className="absolute bottom-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
          ID: {id}
        </div>
      </div>
      <div className="p-3">
        <h3 className="font-semibold text-sm text-foreground">{name}</h3>
        <p className="text-xs text-muted-foreground mt-1">{location}</p>
      </div>
    </Card>
  );
};