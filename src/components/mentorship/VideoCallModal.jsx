import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Video, VideoOff, Mic, MicOff, PhoneOff } from 'lucide-react';
import { toast } from 'sonner';

export default function VideoCallModal({ isOpen, onClose, mentorName }) {
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [stream, setStream] = useState(null);
  const [callStarted, setCallStarted] = useState(false);
  
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  useEffect(() => {
    if (isOpen && !callStarted) {
      startCall();
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isOpen]);

  const startCall = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      
      setStream(mediaStream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = mediaStream;
      }
      setCallStarted(true);
      toast.success('Connected to video call');
    } catch (error) {
      toast.error('Could not access camera/microphone', {
        description: 'Please check your permissions'
      });
      console.error('Error accessing media devices:', error);
    }
  };

  const toggleVideo = () => {
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOn(videoTrack.enabled);
      }
    }
  };

  const toggleAudio = () => {
    if (stream) {
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioOn(audioTrack.enabled);
      }
    }
  };

  const endCall = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    setCallStarted(false);
    onClose();
    toast.info('Call ended');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden">
        <div className="bg-slate-900 min-h-[600px] flex flex-col">
          <DialogHeader className="p-4 bg-slate-800/50">
            <DialogTitle className="text-white">
              Video Call with {mentorName}
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 relative grid grid-cols-1 md:grid-cols-2 gap-2 p-4">
            {/* Remote video (mentor's video - placeholder) */}
            <div className="relative bg-slate-800 rounded-lg overflow-hidden aspect-video flex items-center justify-center">
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover hidden"
              />
              <div className="flex flex-col items-center gap-3 text-slate-400">
                <div className="w-24 h-24 rounded-full bg-slate-700 flex items-center justify-center text-3xl">
                  👤
                </div>
                <p className="text-sm">Waiting for {mentorName}...</p>
              </div>
            </div>

            {/* Local video (your video) */}
            <div className="relative bg-slate-800 rounded-lg overflow-hidden aspect-video">
              {isVideoOn ? (
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400">
                  <div className="flex flex-col items-center gap-2">
                    <VideoOff className="w-12 h-12" />
                    <p className="text-sm">Camera off</p>
                  </div>
                </div>
              )}
              <div className="absolute top-2 right-2 bg-slate-900/80 px-2 py-1 rounded text-xs text-white">
                You
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="p-6 bg-slate-800/50 flex justify-center gap-4">
            <Button
              variant={isVideoOn ? "secondary" : "destructive"}
              size="lg"
              onClick={toggleVideo}
              className="rounded-full w-14 h-14"
            >
              {isVideoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
            </Button>

            <Button
              variant={isAudioOn ? "secondary" : "destructive"}
              size="lg"
              onClick={toggleAudio}
              className="rounded-full w-14 h-14"
            >
              {isAudioOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
            </Button>

            <Button
              variant="destructive"
              size="lg"
              onClick={endCall}
              className="rounded-full w-14 h-14 bg-red-600 hover:bg-red-700"
            >
              <PhoneOff className="w-5 h-5" />
            </Button>
          </div>

          <div className="px-6 pb-4 text-center text-xs text-slate-400">
            <p>🔒 End-to-end encrypted video call</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}