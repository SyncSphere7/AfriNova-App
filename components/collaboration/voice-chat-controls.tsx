/**
 * Voice Chat Controls Component
 * 
 * WebRTC-based voice communication controls:
 * - Mute/Unmute microphone
 * - Deafen/Undeafen audio
 * - Volume controls
 * - Voice activity indicator
 * - Participant audio indicators
 * 
 * @author AfriNova CTO
 */

'use client';

import { useEffect, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Phone,
  PhoneOff,
  Settings,
} from 'lucide-react';
import type { CollaborationService, VoiceSignal } from '@/lib/services/collaboration';
import { cn } from '@/lib/utils';

interface VoiceChatControlsProps {
  collaborationService: CollaborationService;
  participants: any[];
}

export function VoiceChatControls({
  collaborationService,
  participants,
}: VoiceChatControlsProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isDeafened, setIsDeafened] = useState(false);
  const [volume, setVolume] = useState([100]);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const localStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionsRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  useEffect(() => {
    // Listen for voice signals
    collaborationService.setOnVoiceSignal(handleVoiceSignal);

    return () => {
      // Cleanup
      disconnect();
    };
  }, []);

  // ==================== VOICE CONNECTION ====================

  const connect = async () => {
    try {
      // Get microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      localStreamRef.current = stream;

      // Setup audio analyzer for voice activity detection
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);

      startVoiceActivityDetection();

      // Create peer connections for each participant
      for (const participant of participants) {
        if (participant.id !== collaborationService['currentUser'].id) {
          await createPeerConnection(participant.id);
        }
      }

      setIsConnected(true);
    } catch (error) {
      console.error('[Voice Chat] Failed to connect:', error);
      alert('Failed to access microphone. Please check permissions.');
    }
  };

  const disconnect = () => {
    // Stop local stream
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }

    // Close all peer connections
    peerConnectionsRef.current.forEach((pc) => pc.close());
    peerConnectionsRef.current.clear();

    // Stop audio context
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    setIsConnected(false);
    setIsSpeaking(false);
  };

  // ==================== PEER CONNECTIONS ====================

  const createPeerConnection = async (participantId: string) => {
    const configuration: RTCConfiguration = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
      ],
    };

    const peerConnection = new RTCPeerConnection(configuration);

    // Add local stream
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        peerConnection.addTrack(track, localStreamRef.current!);
      });
    }

    // Handle incoming tracks
    peerConnection.ontrack = (event) => {
      const [remoteStream] = event.streams;
      playRemoteAudio(participantId, remoteStream);
    };

    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        collaborationService.sendVoiceSignal({
          type: 'ice-candidate',
          to: participantId,
          payload: event.candidate,
        });
      }
    };

    // Create and send offer
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);

    collaborationService.sendVoiceSignal({
      type: 'offer',
      to: participantId,
      payload: offer,
    });

    peerConnectionsRef.current.set(participantId, peerConnection);
  };

  const handleVoiceSignal = async (signal: VoiceSignal) => {
    const peerConnection = peerConnectionsRef.current.get(signal.from);

    if (signal.type === 'offer') {
      // Receive offer, create answer
      const pc = await createAnswerPeerConnection(signal.from);
      await pc.setRemoteDescription(new RTCSessionDescription(signal.payload));

      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      collaborationService.sendVoiceSignal({
        type: 'answer',
        to: signal.from,
        payload: answer,
      });
    } else if (signal.type === 'answer' && peerConnection) {
      // Receive answer
      await peerConnection.setRemoteDescription(new RTCSessionDescription(signal.payload));
    } else if (signal.type === 'ice-candidate' && peerConnection) {
      // Receive ICE candidate
      await peerConnection.addIceCandidate(new RTCIceCandidate(signal.payload));
    }
  };

  const createAnswerPeerConnection = async (participantId: string): Promise<RTCPeerConnection> => {
    const configuration: RTCConfiguration = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
      ],
    };

    const peerConnection = new RTCPeerConnection(configuration);

    // Add local stream
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        peerConnection.addTrack(track, localStreamRef.current!);
      });
    }

    // Handle incoming tracks
    peerConnection.ontrack = (event) => {
      const [remoteStream] = event.streams;
      playRemoteAudio(participantId, remoteStream);
    };

    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        collaborationService.sendVoiceSignal({
          type: 'ice-candidate',
          to: participantId,
          payload: event.candidate,
        });
      }
    };

    peerConnectionsRef.current.set(participantId, peerConnection);

    return peerConnection;
  };

  // ==================== AUDIO PLAYBACK ====================

  const playRemoteAudio = (participantId: string, stream: MediaStream) => {
    // Create audio element
    const audio = document.createElement('audio');
    audio.id = `voice-${participantId}`;
    audio.srcObject = stream;
    audio.autoplay = true;
    audio.volume = volume[0] / 100;

    document.body.appendChild(audio);
  };

  // ==================== VOICE ACTIVITY DETECTION ====================

  const startVoiceActivityDetection = () => {
    if (!analyserRef.current) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);

    const detectActivity = () => {
      if (!analyserRef.current) return;

      analyserRef.current.getByteFrequencyData(dataArray);

      const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
      const threshold = 20; // Adjust sensitivity

      setIsSpeaking(average > threshold && !isMuted);

      requestAnimationFrame(detectActivity);
    };

    detectActivity();
  };

  // ==================== CONTROLS ====================

  const toggleMute = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = isMuted;
      });
      setIsMuted(!isMuted);
    }
  };

  const toggleDeafen = () => {
    document.querySelectorAll<HTMLAudioElement>('audio[id^="voice-"]').forEach((audio) => {
      audio.muted = !isDeafened;
    });
    setIsDeafened(!isDeafened);
  };

  const handleVolumeChange = (value: number[]) => {
    setVolume(value);
    document.querySelectorAll<HTMLAudioElement>('audio[id^="voice-"]').forEach((audio) => {
      audio.volume = value[0] / 100;
    });
  };

  // ==================== RENDER ====================

  return (
    <div className="flex items-center gap-2">
      {!isConnected ? (
        <Button
          onClick={connect}
          variant="default"
          size="sm"
          className="font-pixel"
        >
          <Phone className="mr-2 h-4 w-4" />
          Join Voice
        </Button>
      ) : (
        <>
          {/* Mute/Unmute */}
          <Button
            onClick={toggleMute}
            variant={isMuted ? 'destructive' : 'default'}
            size="icon"
            className={cn(
              'relative',
              isSpeaking && !isMuted && 'ring-2 ring-green-500 ring-offset-2'
            )}
          >
            {isMuted ? (
              <MicOff className="h-4 w-4" />
            ) : (
              <Mic className="h-4 w-4" />
            )}
            {isSpeaking && !isMuted && (
              <div className="absolute -top-1 -right-1 h-3 w-3 animate-pulse rounded-full bg-green-500" />
            )}
          </Button>

          {/* Deafen */}
          <Button
            onClick={toggleDeafen}
            variant={isDeafened ? 'destructive' : 'secondary'}
            size="icon"
          >
            {isDeafened ? (
              <VolumeX className="h-4 w-4" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
          </Button>

          {/* Volume Control */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon">
                <Settings className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64" align="end">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-pixel font-semibold">
                    Volume: {volume[0]}%
                  </label>
                  <Slider
                    value={volume}
                    onValueChange={handleVolumeChange}
                    max={100}
                    step={5}
                    className="mt-2"
                  />
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Disconnect */}
          <Button
            onClick={disconnect}
            variant="destructive"
            size="sm"
            className="font-pixel"
          >
            <PhoneOff className="mr-2 h-4 w-4" />
            Leave
          </Button>
        </>
      )}
    </div>
  );
}
