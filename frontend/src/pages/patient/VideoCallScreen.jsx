import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, IconButton, Button, CircularProgress, Avatar, keyframes } from '@mui/material';
import { 
  Videocam as VideocamIcon, 
  VideocamOff as VideocamOffIcon,
  Mic as MicIcon,
  MicOff as MicOffIcon,
  CallEnd as CallEndIcon,
  DragIndicator as DragIndicatorIcon,
  Chat as ChatIcon,
  Send as SendIcon,
  Close as CloseIcon,
  ChatBubbleOutline as ChatOutlineIcon,
  SignalCellularAlt as SignalIcon,
  WifiTetheringError as LowBandwidthIcon,
  WifiTetheringOff as NoWifiIcon,
} from '@mui/icons-material';
import { 
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, 
  Drawer, Paper, TextField, List, ListItem, ListItemText, Divider, Stack,
  Tooltip, Alert 
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { io } from 'socket.io-client';
import axios from 'axios';

const pulseRipple = keyframes`
  0% { transform: scale(0.8); opacity: 0.8; }
  100% { transform: scale(2.5); opacity: 0; }
`;

export default function VideoCallScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const appointment = location.state?.appointment;
  const roomId = appointment?._id;

  const currentUserStr = localStorage.getItem('user');
  const currentUser = currentUserStr ? JSON.parse(currentUserStr) : null;
  const isDoctorRole = currentUser?.role === 'doctor';

  const otherPersonName = (isDoctorRole
    ? (appointment?.patient?.full_name || appointment?.patient?.name || 'Patient')
    : (appointment?.doctor?.full_name || appointment?.doctor?.name || 'Doctor')).replace(/^(Dr\.|Dr)\s+/i, '');
    
  const otherPersonAvatar = isDoctorRole
    ? (appointment?.patient?.profileImage || null)
    : (appointment?.doctor?.profileImage || null);

  const [permissionsGranted, setPermissionsGranted] = useState(false);
  const [permissionError, setPermissionError] = useState('');
  const [micEnabled, setMicEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [remoteVideoEnabled, setRemoteVideoEnabled] = useState(true);
  
  // State to track if the doctor has joined
  const [doctorJoined, setDoctorJoined] = useState(false);

  // State to track if the other party ended the meeting
  const [callEndedByPeer, setCallEndedByPeer] = useState(false);

  // State to track local audio volume for the "wave"/glow effect
  const [volume, setVolume] = useState(0);
  
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);

  // WebRTC references
  const peerConnectionRef = useRef(null);
  const socketRef = useRef(null);
  const startTimeRef = useRef(null);

  // PIP Drag state
  const [pipPos, setPipPos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartPos = useRef({ x: 0, y: 0 });

  // Confirmation Modal
  const [confirmOpen, setConfirmOpen] = useState(false);

  // Chat state
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const chatEndRef = useRef(null);

  // Network stats state
  const [networkQuality, setNetworkQuality] = useState('good'); // good, fair, poor
  const [lowBandwidthMode, setLowBandwidthMode] = useState(false);
  const [networkStats, setNetworkStats] = useState({ rtt: 0, loss: 0 });
  const statsIntervalRef = useRef(null);
  const poorCounterRef = useRef(0);
  const goodCounterRef = useRef(0);

  const streamRef = useRef(null);

  const onMouseDown = (e) => {
    setIsDragging(true);
    dragStartPos.current = {
      x: e.clientX - pipPos.x,
      y: e.clientY - pipPos.y,
    };
  };

  // Handle Dragging Events
  useEffect(() => {
    const onMouseMove = (e) => {
      if (!isDragging) return;
      setPipPos({
        x: e.clientX - dragStartPos.current.x,
        y: e.clientY - dragStartPos.current.y,
      });
    };

    const onMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [isDragging]);

  // Initialize Local Media Stream
  useEffect(() => {
    const requestPermissions = async () => {
      try {
        const userStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setStream(userStream);
        streamRef.current = userStream;
        setPermissionsGranted(true);
      } catch (err) {
        console.error('Error accessing media devices.', err);
        setPermissionError('Camera and Microphone permissions are required to start the consultation. Please allow them in your browser settings.');
      }
    };
    
    requestPermissions();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // WebRTC Connection Setup
  const iceCandidateQueue = useRef([]);
  const isRemoteDescriptionSet = useRef(false);

  useEffect(() => {
    if (!stream) return;

    const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const socket = io(backendUrl, { withCredentials: true });
    socketRef.current = socket;

    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' }
      ]
    });
    peerConnectionRef.current = pc;

    // Add local tracks to peer connection
    stream.getTracks().forEach(track => {
      pc.addTrack(track, stream);
    });

    pc.ontrack = (event) => {
      console.log('Remote track received:', event.track.kind);
      if (event.streams && event.streams[0]) {
        setRemoteStream(event.streams[0]);
        setDoctorJoined(true);
        if (!startTimeRef.current) startTimeRef.current = Date.now();
      }
    };

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('ice-candidate', { roomId, candidate: event.candidate });
      }
    };

    pc.onconnectionstatechange = () => {
      console.log('Connection state:', pc.connectionState);
      if (pc.connectionState === 'failed') {
        // Try to restart ICE or handle failure
        console.warn('WebRTC connection failed.');
      }
    };

    // User tracking & Signaling
    socket.emit('join-room', roomId);

    socket.on('user-joined', async () => {
      console.log('Other user joined. Creating offer...');
      try {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit('offer', { roomId, offer });
      } catch (err) {
        console.error('Error creating offer', err);
      }
    });

    socket.on('offer', async (offer) => {
      console.log('Offer received. Creating answer...');
      try {
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        isRemoteDescriptionSet.current = true;
        
        // Process queued candidates
        while (iceCandidateQueue.current.length > 0) {
          const candidate = iceCandidateQueue.current.shift();
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        }

        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit('answer', { roomId, answer });
      } catch (err) {
        console.error('Error handling offer', err);
      }
    });

    socket.on('answer', async (answer) => {
      console.log('Answer received. Setting remote description...');
      try {
        await pc.setRemoteDescription(new RTCSessionDescription(answer));
        isRemoteDescriptionSet.current = true;

        // Process queued candidates
        while (iceCandidateQueue.current.length > 0) {
          const candidate = iceCandidateQueue.current.shift();
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        }
      } catch (err) {
        console.error('Error handling answer', err);
      }
    });

    socket.on('ice-candidate', async (candidate) => {
      try {
        if (isRemoteDescriptionSet.current) {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        } else {
          iceCandidateQueue.current.push(candidate);
        }
      } catch (err) {
        console.error('Error adding ice candidate', err);
      }
    });

    socket.on('toggle-media', (data) => {
       if (data.type === 'video') {
           setRemoteVideoEnabled(data.enabled);
       }
    });

    socket.on('end-call', () => {
       setCallEndedByPeer(true);
       if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
       setRemoteStream(null);
    });

    socket.on('receive-message', (data) => {
       setMessages(prev => [...prev, data]);
       if (!chatOpen) {
          // Play notification sound or show badge?
       }
    });

    socket.on('other-user-disconnected', () => {
       if (!callEndedByPeer) {
          setDoctorJoined(false);
          setRemoteStream(null);
          // Don't close PC yet, wait for them to come back?
          // For now, keep it simple.
       }
    });

    // Setup network quality monitoring
    statsIntervalRef.current = setInterval(async () => {
      if (pc && pc.connectionState === 'connected') {
        const stats = await pc.getStats();
        let currentLoss = 0;
        let currentRtt = 0;
        let currentJitter = 0;

        stats.forEach(report => {
          if (report.type === 'remote-inbound-rtp' || report.type === 'inbound-rtp') {
             currentJitter = Math.max(currentJitter, report.jitter || 0);
             currentLoss = Math.max(currentLoss, report.packetsLost || 0);
             currentRtt = Math.max(currentRtt, report.roundTripTime || 0);
          }
          if (report.type === 'candidate-pair' && report.state === 'succeeded') {
             currentRtt = Math.max(currentRtt, report.currentRoundTripTime || 0);
          }
        });

        setNetworkStats({ rtt: currentRtt * 1000, loss: currentLoss });

        // Logic to determine quality
        if (currentLoss > 50 || currentRtt > 0.4 || currentJitter > 0.08) {
          poorCounterRef.current++;
          goodCounterRef.current = 0;
          if (poorCounterRef.current >= 2) {
            setNetworkQuality('poor');
            if (!lowBandwidthMode && videoEnabled) {
              setLowBandwidthMode(true);
            }
          }
        } else if (currentLoss > 10 || currentRtt > 0.15) {
          setNetworkQuality('fair');
          poorCounterRef.current = 0;
          goodCounterRef.current = 0;
        } else {
          goodCounterRef.current++;
          poorCounterRef.current = 0;
          if (goodCounterRef.current >= 3) {
            setNetworkQuality('good');
          }
        }
      }
    }, 4000);

    return () => {
      socket.disconnect();
      pc.close();
      if (statsIntervalRef.current) clearInterval(statsIntervalRef.current);
      isRemoteDescriptionSet.current = false;
      iceCandidateQueue.current = [];
    };
  }, [stream, roomId]);

  // Scroll chat to bottom
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, chatOpen]);

  // Bind video streams to Video Ref elements safely
  useEffect(() => {
    if (localVideoRef.current && stream) {
      localVideoRef.current.srcObject = stream;
    }
  }, [stream, permissionsGranted, videoEnabled]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream, doctorJoined]);

  // Web Audio API effect to track mic volume for speaking wave
  useEffect(() => {
    if (!stream || !micEnabled) {
      setVolume(0);
      return;
    }

    let audioContext;
    let analyser;
    let source;
    let animationFrameId;

    try {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
      analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      // Connect only the audio tracks
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        const audioStream = new MediaStream([audioTrack]);
        source = audioContext.createMediaStreamSource(audioStream);
        source.connect(analyser);

        const dataArray = new Uint8Array(analyser.frequencyBinCount);

        const checkVolume = () => {
          analyser.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
          }
          const average = sum / dataArray.length; // value between 0 and 255
          setVolume(average);
          animationFrameId = requestAnimationFrame(checkVolume);
        };

        checkVolume();
      }
    } catch (err) {
      console.error("Web Audio API error", err);
    }

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      if (source) source.disconnect();
      if (audioContext && audioContext.state !== 'closed') {
        audioContext.close().catch(() => {});
      }
    };
  }, [stream, micEnabled]);

  // Actions
  const toggleMic = () => {
    if (stream) {
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setMicEnabled(audioTrack.enabled);
        if (socketRef.current) socketRef.current.emit('toggle-media', { roomId, type: 'audio', enabled: audioTrack.enabled });
      }
    }
  };

  const toggleVideo = () => {
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setVideoEnabled(videoTrack.enabled);
        if (socketRef.current) socketRef.current.emit('toggle-media', { roomId, type: 'video', enabled: videoTrack.enabled });
      }
    }
  };

  const handleSendMessage = (e) => {
    if (e) e.preventDefault();
    if (!newMessage.trim()) return;

    const msgData = {
       sender: currentUser?.full_name || currentUser?.name || 'Me',
       senderRole: currentUser?.role,
       text: newMessage.trim(),
       timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    if (socketRef.current) {
        socketRef.current.emit('send-message', { roomId, ...msgData });
    }

    setMessages((prev) => [...prev, msgData]);
    setNewMessage('');
  };

  const endCall = async () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }
    if (socketRef.current) {
      socketRef.current.emit('end-call', { roomId });
      socketRef.current.disconnect();
    }

    // Save Consultation Duration to API if patient ends it, or anytime really.
    if (appointment?._id && startTimeRef.current) {
      const durationMs = Date.now() - startTimeRef.current;
      const durationMins = Math.max(1, Math.round(durationMs / 60000));
      
      try {
        const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        if (currentUser) {
           const token = currentUser.token || localStorage.getItem('token');
           await axios.put(`${backendUrl}/api/appointments/${appointment._id}/end`, 
             { duration: durationMins }, 
             { headers: { Authorization: `Bearer ${token}` } }
           );
        }
      } catch (err) {
        console.error("Failed to save consultation duration", err);
      }
    }

    const redirectPath = isDoctorRole ? '/doctor/appointments' : '/patient/appointments';
    navigate(redirectPath);
  };

  const handleEndClick = () => {
    setConfirmOpen(true);
  };

  if (callEndedByPeer) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#020617', p: 3 }}>
        <Box sx={{ textAlign: 'center', bgcolor: '#0F172A', p: 5, borderRadius: 4, maxWidth: 500, border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
          <Avatar 
             src={otherPersonAvatar} 
             sx={{ width: 100, height: 100, mx: 'auto', mb: 3, border: '4px solid #1E293B', bgcolor: '#3B82F6', fontSize: '2.5rem' }} 
          >
             {otherPersonName.charAt(0).toUpperCase()}
          </Avatar>
          <Typography variant="h5" color="white" gutterBottom sx={{ fontWeight: 800 }}>Meeting Ended</Typography>
          <Typography sx={{ color: '#94A3B8', mb: 4, lineHeight: 1.6 }}>
            The {isDoctorRole ? 'patient' : 'doctor'} has ended this consultation session.
          </Typography>
          <Button 
            variant="contained" 
            fullWidth
            sx={{ bgcolor: '#3B82F6', '&:hover': { bgcolor: '#2563EB' }, py: 1.5, borderRadius: 2, fontWeight: 700, textTransform: 'none' }} 
            onClick={() => navigate(isDoctorRole ? '/doctor/appointments' : '/patient/appointments')}
          >
            Leave Room
          </Button>
        </Box>
      </Box>
    );
  }

  if (permissionError) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#111827', p: 3 }}>
        <Box sx={{ textAlign: 'center', bgcolor: '#1F2937', p: 4, borderRadius: 3, maxWidth: 500, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)' }}>
          <Typography variant="h5" color="error" gutterBottom sx={{ fontWeight: 'bold' }}>Permission Denied</Typography>
          <Typography color="white" sx={{ mb: 4 }}>{permissionError}</Typography>
          <Button variant="contained" sx={{ bgcolor: '#3B82F6', '&:hover': { bgcolor: '#2563EB' }, textTransform: 'none', px: 4, py: 1.5, borderRadius: 2 }} onClick={() => navigate('/patient')}>Return to Dashboard</Button>
        </Box>
      </Box>
    );
  }

  if (!permissionsGranted) {
    return (
      <Box sx={{ height: '100vh', width: '100vw', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', bgcolor: '#0F172A' }}>
        <CircularProgress size={60} thickness={4} sx={{ color: '#3B82F6', mb: 4 }} />
        <Typography variant="h6" sx={{ color: '#F8FAFC', fontWeight: 500, letterSpacing: '0.5px' }}>Requesting Camera and Microphone Permissions...</Typography>
      </Box>
    );
  }

  if (!roomId) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#111827', p: 3 }}>
        <Box sx={{ textAlign: 'center', bgcolor: '#1F2937', p: 4, borderRadius: 3, maxWidth: 500, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)' }}>
          <Typography variant="h5" color="error" gutterBottom sx={{ fontWeight: 'bold' }}>Invalid Session</Typography>
          <Typography color="white" sx={{ mb: 4 }}>Valid appointment data is required to start the consultation.</Typography>
          <Button variant="contained" sx={{ bgcolor: '#3B82F6', '&:hover': { bgcolor: '#2563EB' }, textTransform: 'none', px: 4, py: 1.5, borderRadius: 2 }} onClick={() => navigate(isDoctorRole ? '/doctor/appointments' : '/patient/appointments')}>Back to Appointments</Button>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100vh', width: '100vw', display: 'flex', flexDirection: 'column', bgcolor: '#020617', position: 'relative', overflow: 'hidden' }}>
      
      {/* Main Area: Remote Video or Waiting UI */}
      <Box sx={{ 
        flexGrow: 1, 
        position: 'relative', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        bgcolor: doctorJoined ? '#000' : '#0F172A',
        transition: 'all 0.5s ease-in-out',
        minHeight: 0,
        minWidth: 0,
        overflow: 'hidden'
      }}>
        
        {/* Waiting for Other Side UI */}
        {!doctorJoined && (
           <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 10 }}>
              <Box sx={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 4 }}>
                 <Box sx={{ position: 'absolute', width: 120, height: 120, borderRadius: '50%', border: '2px solid rgba(59, 130, 246, 0.4)', animation: `${pulseRipple} 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite` }} />
                 <Box sx={{ position: 'absolute', width: 120, height: 120, borderRadius: '50%', border: '2px solid rgba(59, 130, 246, 0.2)', animation: `${pulseRipple} 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite`, animationDelay: '1.25s' }} />
                 
                 <Avatar 
                    src={otherPersonAvatar} 
                    sx={{ width: 120, height: 120, border: '4px solid #1E293B', boxShadow: '0 0 30px rgba(59,130,246,0.5)', zIndex: 2, bgcolor: '#3B82F6', fontSize: '3rem' }} 
                 >
                    {otherPersonName.charAt(0).toUpperCase()}
                 </Avatar>
              </Box>
              <Typography variant="h4" sx={{ color: '#F8FAFC', fontWeight: 700, mb: 1.5, letterSpacing: '-0.5px' }}>
                Waiting for {isDoctorRole ? '' : 'Dr. '}{otherPersonName}...
              </Typography>
              <Typography variant="body1" sx={{ color: '#94A3B8', maxWidth: 360, textAlign: 'center', lineHeight: 1.6, fontSize: 16 }}>
                The consultation will begin once the {isDoctorRole ? 'patient' : 'doctor'} joins the room.
              </Typography>
           </Box>
        )}

        {/* Remote Video feed (Full screen) */}
        {doctorJoined && (
          <Box sx={{ width: '100%', height: '100%', position: 'relative' }}>
             <video 
               ref={remoteVideoRef} 
               autoPlay 
               playsInline 
               style={{ width: '100%', height: '100%', objectFit: 'contain', opacity: remoteVideoEnabled ? 1 : 0, transition: 'opacity 0.3s' }} 
             />
             {!remoteVideoEnabled && (
                <Box sx={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2, bgcolor: '#0F172A' }}>
                  <Avatar 
                    src={otherPersonAvatar} 
                    sx={{ width: 140, height: 140, border: '4px solid #1E293B', bgcolor: '#3B82F6', fontSize: '3.5rem' }} 
                  >
                    {otherPersonName.charAt(0).toUpperCase()}
                  </Avatar>
                  <Typography variant="h5" sx={{ color: '#F8FAFC', fontWeight: 600 }}>{otherPersonName}</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, bgcolor: '#1E293B', px: 2, py: 0.8, borderRadius: 2 }}>
                     <VideocamOffIcon sx={{ color: '#EF4444', fontSize: 20 }} />
                     <Typography sx={{ color: '#94A3B8', fontSize: 14, fontWeight: 600 }}>Camera Off</Typography>
                  </Box>
                </Box>
             )}
          </Box>
        )}

        {/* Local Video Picture-in-Picture */}
        <Box 
          sx={{ 
            position: 'absolute', 
            bottom: { xs: 20, md: 24 }, 
            right: { xs: 20, md: 24 }, 
            width: { xs: 120, md: 200 }, 
            height: { xs: 160, md: 140 }, 
            borderRadius: 1.5, 
            overflow: 'hidden',
            bgcolor: '#1E293B',
            boxShadow: volume > 10 ? `0 0 0 ${Math.min(volume / 4, 15)}px rgba(34, 197, 94, 0.3)` : '0 10px 40px rgba(0,0,0,0.6)',
            border: volume > 10 ? '2px solid #22C55E' : '2px solid rgba(255,255,255,0.15)',
            transition: 'box-shadow 0.1s ease-out, border 0.3s ease',
            zIndex: 20,
            transform: `translate(${pipPos.x}px, ${pipPos.y}px)`,
            cursor: isDragging ? 'grabbing' : 'grab'
          }}
          onMouseDown={onMouseDown}
        >
          {/* Drag Handle Icon */}
          <Box sx={{ position: 'absolute', top: 8, left: 8, color: volume > 10 ? '#22C55E' : 'rgba(255,255,255,0.7)', zIndex: 30, display: 'flex', alignItems: 'center', pointerEvents: 'none', transition: 'color 0.3s' }}>
            <DragIndicatorIcon fontSize="small" />
          </Box>
          
          {videoEnabled ? (
            <video 
              ref={localVideoRef} 
              autoPlay 
              playsInline 
              muted 
              style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }} 
            />
          ) : (
            <Box display="flex" flexDirection="column" height="100%" alignItems="center" justifyContent="center" gap={1}>
              <Avatar sx={{ bgcolor: '#475569', width: 44, height: 44 }}><VideocamOffIcon fontSize="small" /></Avatar>
              <Typography color="#94A3B8" variant="caption" fontWeight={600} sx={{ fontSize: 10 }}>Camera Off</Typography>
            </Box>
          )}

          {/* Explicit Mic Indicator overlay when speaking */}
          {volume > 10 && (
             <Box sx={{ position: 'absolute', top: 8, right: 8, display: 'flex', alignItems: 'center', gap: 0.5, bgcolor: 'rgba(0,0,0,0.6)', p: 0.5, borderRadius: 2 }}>
                <MicIcon sx={{ color: '#22C55E', fontSize: 14 }} />
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3, height: 10 }}>
                   {[1, 2, 3].map(i => (
                     <Box key={i} sx={{ width: 2, bgcolor: '#22C55E', borderRadius: 1, 
                        height: Math.min(100, Math.max(20, volume * (Math.random() * 0.5 + 0.5))) + '%', 
                        transition: 'height 0.1s' 
                     }} />
                   ))}
                </Box>
             </Box>
          )}
        </Box>

        {/* Network Quality Alert Popup */}
        {lowBandwidthMode && (
          <Box sx={{ position: 'absolute', top: 20, zIndex: 100, width: '100%', display: 'flex', justifyContent: 'center' }}>
             <Alert 
               severity="warning" 
               variant="filled"
               onClose={() => setLowBandwidthMode(false)}
               sx={{ borderRadius: 2, boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}
             >
               Poor Connection Detected: Switch to Audio-Only for better stability.
             </Alert>
          </Box>
        )}
      </Box>

      {/* Controllers Bottom Bar */}
      <Box sx={{ 
        p: { xs: 2.5, md: 3 }, 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        gap: { xs: 2, md: 3 },
        bgcolor: '#0F172A',
        borderTop: '1px solid #1E293B',
        zIndex: 30
      }}>
        <Stack direction="row" spacing={2} sx={{ position: 'absolute', left: { md: 40, xs: 20 }, display: { xs: 'none', md: 'flex' }, alignItems: 'center' }}>
           <Typography variant="body2" sx={{ color: 'white', opacity: 0.7, fontWeight: 500 }}>
             {otherPersonName} {doctorJoined ? '(Connected)' : '(Waiting...)'}
           </Typography>
           
           <Divider orientation="vertical" flexItem sx={{ bgcolor: 'rgba(255,255,255,0.1)', height: 20 }} />
           
           <Tooltip title={`Latency: ${networkStats.rtt.toFixed(0)}ms | Loss: ${networkStats.loss} pkts`}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, bgcolor: 'rgba(255,255,255,0.05)', px: 2, py: 1, borderRadius: 2, border: '1px solid rgba(255,255,255,0.1)' }}>
                 <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 0.4, height: 16 }}>
                    {[1, 2, 3, 4].map(i => (
                       <Box key={i} sx={{ 
                          width: 3, 
                          borderRadius: 0.5,
                          height: i * 4,
                          bgcolor: (
                            (networkQuality === 'good') || 
                            (networkQuality === 'fair' && i <= 3) ||
                            (networkQuality === 'poor' && i <= 1)
                          ) ? (networkQuality === 'good' ? '#22C55E' : networkQuality === 'fair' ? '#EAB308' : '#EF4444') : 'rgba(255,255,255,0.15)'
                       }} />
                    ))}
                 </Box>
                 <Box>
                   <Typography sx={{ color: networkQuality === 'good' ? '#22C55E' : networkQuality === 'fair' ? '#EAB308' : '#EF4444', fontSize: 11, fontWeight: 800, textTransform: 'uppercase', lineHeight: 1 }}>
                      {networkQuality}
                   </Typography>
                   {networkQuality === 'poor' && <Typography sx={{ color: '#EF4444', fontSize: 9, fontWeight: 600 }}>Unstable</Typography>}
                 </Box>
                 {networkQuality === 'poor' && <LowBandwidthIcon sx={{ fontSize: 16, color: '#EF4444' }} />}
              </Box>
           </Tooltip>
        </Stack>

        <IconButton 
          onClick={toggleMic}
          sx={{ 
            bgcolor: micEnabled ? 'rgba(255,255,255,0.08)' : '#EF4444', 
            color: 'white', 
            width: { xs: 48, md: 56 }, 
            height: { xs: 48, md: 56 },
            transition: 'all 0.2s',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            '&:hover': { bgcolor: micEnabled ? 'rgba(255,255,255,0.15)' : '#DC2626', transform: 'scale(1.05)' } 
          }}
        >
          {micEnabled ? <MicIcon /> : <MicOffIcon />}
        </IconButton>

        <IconButton 
          onClick={toggleVideo} 
          sx={{ 
            bgcolor: videoEnabled ? 'rgba(255,255,255,0.08)' : '#EF4444', 
            color: 'white', 
            width: { xs: 48, md: 56 }, 
            height: { xs: 48, md: 56 },
            transition: 'all 0.2s',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            '&:hover': { bgcolor: videoEnabled ? 'rgba(255,255,255,0.15)' : '#DC2626', transform: 'scale(1.05)' } 
          }}
        >
          {videoEnabled ? <VideocamIcon /> : <VideocamOffIcon />}
        </IconButton>

        <IconButton 
          onClick={() => setChatOpen(!chatOpen)}
          sx={{ 
            bgcolor: chatOpen ? '#3B82F6' : 'rgba(255,255,255,0.08)', 
            color: 'white', 
            width: { xs: 48, md: 56 }, 
            height: { xs: 48, md: 56 },
            transition: 'all 0.2s',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            '&:hover': { bgcolor: chatOpen ? '#2563EB' : 'rgba(255,255,255,0.15)', transform: 'scale(1.05)' } 
          }}
        >
          <ChatIcon />
        </IconButton>

        <Button 
          variant="contained" 
          color="error" 
          onClick={handleEndClick}
          sx={{ 
            borderRadius: 3, 
            px: { xs: 2.5, md: 4 }, 
            height: { xs: 48, md: 56 },
            fontSize: { xs: 14, md: 16 }, 
            fontWeight: 700,
            textTransform: 'none',
            boxShadow: '0 4px 12px rgba(239,68,68,0.4)',
            transition: 'all 0.2s',
            '&:hover': { bgcolor: '#DC2626', transform: 'scale(1.02)', boxShadow: '0 6px 16px rgba(239,68,68,0.5)' }
          }}
        >
          <CallEndIcon sx={{ mr: 1, fontSize: 22 }} />
          End Meeting
        </Button>
      </Box>

      {/* Confirmation Dialog */}
      <Dialog 
        open={confirmOpen} 
        onClose={() => setConfirmOpen(false)}
        PaperProps={{ sx: { borderRadius: 3, p: 1, minWidth: 300 } }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>End Meeting?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to end this consultation? This will disconnect your video call.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setConfirmOpen(false)} sx={{ color: '#64748B', fontWeight: 600, textTransform: 'none' }}>
            Cancel
          </Button>
          <Button onClick={endCall} variant="contained" color="error" sx={{ borderRadius: 2, px: 3, fontWeight: 700, textTransform: 'none' }}>
            End Call
          </Button>
        </DialogActions>
      </Dialog>

      {/* Chat Interface Drawer */}
      <Drawer
        anchor="right"
        open={chatOpen}
        onClose={() => setChatOpen(false)}
        PaperProps={{
          sx: { width: { xs: '100%', sm: 360 }, height: '100%', bgcolor: '#F8FAFC', borderLeft: '1px solid #E2E8F0' }
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          {/* Chat Header */}
          <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #E2E8F0', bgcolor: 'white' }}>
            <Stack direction="row" spacing={1.5} alignItems="center">
               <ChatOutlineIcon color="primary" />
               <Typography variant="h6" fontWeight={700}>Chat</Typography>
            </Stack>
            <IconButton onClick={() => setChatOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Messages Area */}
          <Box sx={{ flexGrow: 1, p: 2, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
            {messages.length === 0 ? (
              <Box sx={{ mt: 10, textAlign: 'center', opacity: 0.5 }}>
                 <ChatIcon sx={{ fontSize: 48, mb: 2 }} />
                 <Typography>No messages yet. Start chatting!</Typography>
              </Box>
            ) : (
              messages.map((msg, idx) => {
                const isMe = msg.senderRole === currentUser?.role;
                return (
                  <Box key={idx} sx={{ alignSelf: isMe ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
                     <Paper 
                       elevation={0}
                       sx={{ 
                         p: 1.5, 
                         borderRadius: isMe ? '16px 16px 0 16px' : '16px 16px 16px 0',
                         bgcolor: isMe ? '#3B82F6' : 'white',
                         color: isMe ? 'white' : '#1E293B',
                         border: isMe ? 'none' : '1px solid #E2E8F0',
                         boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                       }}
                     >
                       <Typography variant="body2" sx={{ wordBreak: 'break-word', lineHeight: 1.5 }}>
                          {msg.text}
                       </Typography>
                       <Typography variant="caption" sx={{ display: 'block', mt: 0.5, textAlign: 'right', opacity: 0.7, fontSize: '0.65rem' }}>
                          {msg.timestamp}
                       </Typography>
                     </Paper>
                  </Box>
                );
              })
            )}
            <div ref={chatEndRef} />
          </Box>

          {/* Input Area */}
          <Box sx={{ p: 2, bgcolor: 'white', borderTop: '1px solid #E2E8F0' }}>
            <form onSubmit={handleSendMessage}>
               <TextField
                 fullWidth
                 placeholder="Type a message..."
                 variant="outlined"
                 size="small"
                 value={newMessage}
                 onChange={(e) => setNewMessage(e.target.value)}
                 autoComplete="off"
                 InputProps={{
                   sx: { borderRadius: 4, bgcolor: '#F1F5F9' },
                   endAdornment: (
                     <IconButton type="submit" color="primary" disabled={!newMessage.trim()}>
                       <SendIcon />
                     </IconButton>
                   )
                 }}
               />
            </form>
          </Box>
        </Box>
      </Drawer>
    </Box>
  );
}
