import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Maximize2, Minimize2, Volume2, VolumeX, RotateCcw } from "lucide-react";
import Hls from "hls.js";

import { CameraStream } from "@/hooks/useSettings";

interface CameraStreamViewerProps {
  stream: CameraStream;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

// Helper function to convert various video URLs to embed format
const getEmbedUrl = (url: string): string => {
  try {
    // YouTube
    if (url.includes('youtube.com/watch')) {
      const videoId = new URL(url).searchParams.get('v');
      return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1`;
    }
    if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1].split('?')[0];
      return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1`;
    }
    
    // Vimeo
    if (url.includes('vimeo.com/')) {
      const videoId = url.split('vimeo.com/')[1].split('?')[0];
      return `https://player.vimeo.com/video/${videoId}?autoplay=1&muted=1`;
    }
    
    // Twitch
    if (url.includes('twitch.tv/')) {
      const channel = url.split('twitch.tv/')[1].split('?')[0];
      return `https://player.twitch.tv/?channel=${channel}&parent=${window.location.hostname}&autoplay=true&muted=true`;
    }
    
    return url;
  } catch (error) {
    console.error('Error processing embed URL:', error);
    return url;
  }
};

export const CameraStreamViewer = ({ stream, isOpen, onOpenChange }: CameraStreamViewerProps) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  useEffect(() => {
    if (videoRef.current && stream.streamUrl) {
      const video = videoRef.current;
      
      // Check if it's an HLS stream
      if (stream.streamUrl.includes('.m3u8') || stream.streamUrl.includes('hls')) {
        if (Hls.isSupported()) {
          const hls = new Hls();
          hlsRef.current = hls;
          hls.loadSource(stream.streamUrl);
          hls.attachMedia(video);
          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            setIsLoading(false);
          });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = stream.streamUrl;
          video.addEventListener('loadedmetadata', () => {
            setIsLoading(false);
          });
        }
      } else {
        // Regular video source
        video.src = stream.streamUrl;
        video.addEventListener('loadedmetadata', () => {
          setIsLoading(false);
        });
      }
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
    };
  }, [stream.streamUrl]);

  const handleReload = () => {
    setIsLoading(true);
    if (hlsRef.current) {
      hlsRef.current.destroy();
    }
    setTimeout(() => setIsLoading(false), 1000);
  };

  const StreamContent = () => (
    <div className="relative bg-background rounded-lg overflow-hidden">
      {isLoading ? (
        <div className="aspect-video bg-muted flex items-center justify-center">
          <div className="text-center space-y-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-sm text-muted-foreground">Loading stream...</p>
          </div>
        </div>
      ) : (
        <div className="aspect-video bg-black flex items-center justify-center relative overflow-hidden">
          {/* HLS/Video Stream */}
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            controls={false}
            muted={isMuted}
            autoPlay
            playsInline
            onError={() => {
              setIsLoading(false);
              console.log('Video stream failed to load');
            }}
          />
          
          {/* Enhanced multimedia support for external content */}
          {!stream.streamUrl.includes('.m3u8') && !stream.streamUrl.includes('hls') && (
            <iframe
              src={stream.streamUrl}
              className="absolute inset-0 w-full h-full border-0"
              title={`${stream.name} Live Feed`}
              allow="camera; microphone; autoplay; encrypted-media; picture-in-picture; fullscreen"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
              sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-presentation"
              loading="lazy"
              style={{ 
                zIndex: stream.streamUrl.includes('demo') ? 2 : 1,
                backgroundColor: '#000'
              }}
              onError={(e) => {
                console.log('Iframe failed to load, attempting direct embed');
                e.currentTarget.style.display = 'none';
              }}
            />
          )}
          
          {/* Direct media embed for supported formats */}
          {(stream.streamUrl.includes('youtube.com') || 
            stream.streamUrl.includes('youtu.be') ||
            stream.streamUrl.includes('vimeo.com') ||
            stream.streamUrl.includes('twitch.tv')) && (
            <div className="absolute inset-0 w-full h-full bg-black">
              <iframe
                src={getEmbedUrl(stream.streamUrl)}
                className="w-full h-full border-0"
                title={`${stream.name} Stream`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}
          
          {/* Fallback content */}
          <div className="absolute inset-0 bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center" 
               style={{ zIndex: stream.streamUrl.includes('demo') ? 1 : -1 }}>
            <div className="text-center space-y-2">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
                <div className="w-8 h-8 bg-primary rounded-full animate-pulse"></div>
              </div>
              <p className="text-lg font-semibold text-foreground">Live Feed Active</p>
              <p className="text-sm text-muted-foreground">Camera: {stream.name}</p>
              <p className="text-xs text-muted-foreground">URL: {stream.streamUrl}</p>
            </div>
          </div>
          
          {/* Stream overlay controls */}
          <div className="absolute top-2 right-2 flex space-x-2">
            <Badge className="bg-success text-success-foreground">
              LIVE
            </Badge>
          </div>
          
          <div className="absolute bottom-2 left-2 text-white bg-black/70 px-2 py-1 rounded text-xs">
            Robot: {stream.associatedRobot}
          </div>
        </div>
      )}
      
      {/* Control bar */}
      <div className="flex items-center justify-between p-3 bg-card border-t">
        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsMuted(!isMuted)}
          >
            {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleReload}
          >
            <RotateCcw size={14} />
          </Button>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsFullscreen(!isFullscreen)}
          >
            {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </Button>
        </div>
      </div>
    </div>
  );

  if (isFullscreen) {
    return (
      <Dialog open={isOpen && isFullscreen} onOpenChange={(open) => {
        if (!open) setIsFullscreen(false);
      }}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] p-2">
          <StreamContent />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen && !isFullscreen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{stream.name} - Live Stream</DialogTitle>
        </DialogHeader>
        <StreamContent />
      </DialogContent>
    </Dialog>
  );
};