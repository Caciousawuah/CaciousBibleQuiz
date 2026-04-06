import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Play, 
  Copy, 
  CheckCircle2, 
  Loader2, 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  X,
  UserCircle
} from 'lucide-react';
import { motion } from 'motion/react';
import Peer from 'simple-peer';
import { socket } from '../services/socket';
import { auth } from '../firebase';
import { BIBLE_BOOKS } from '../constants';

export function VideoChat({ roomId }: { roomId: string }) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [peers, setPeers] = useState<any[]>([]);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const userVideo = useRef<HTMLVideoElement>(null);
  const peersRef = useRef<any[]>([]);

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(s => {
      setStream(s);
      if (userVideo.current) {
        userVideo.current.srcObject = s;
      }

      socket.emit('join_video', { roomId, userId: auth.currentUser?.uid });

      socket.on('all_users', users => {
        const peers: any[] = [];
        users.forEach((userId: string) => {
          if (userId !== auth.currentUser?.uid) {
            const peer = createPeer(userId, auth.currentUser?.uid!, s);
            peersRef.current.push({
              peerID: userId,
              peer,
            });
            peers.push({
              peerID: userId,
              peer,
            });
          }
        });
        setPeers(peers);
      });

      socket.on('user_joined_video', payload => {
        const peer = addPeer(payload.signal, payload.callerID, s);
        peersRef.current.push({
          peerID: payload.callerID,
          peer,
        });
        setPeers(users => [...users, { peerID: payload.callerID, peer }]);
      });

      socket.on('receiving_returned_signal', payload => {
        const item = peersRef.current.find(p => p.peerID === payload.id);
        item.peer.signal(payload.signal);
      });
    });

    return () => {
      stream?.getTracks().forEach(track => track.stop());
      socket.off('all_users');
      socket.off('user_joined_video');
      socket.off('receiving_returned_signal');
    };
  }, []);

  function createPeer(userToSignal: string, callerID: string, stream: MediaStream) {
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream,
    });

    peer.on('signal', signal => {
      socket.emit('sending_signal', { userToSignal, callerID, signal });
    });

    return peer;
  }

  function addPeer(incomingSignal: any, callerID: string, stream: MediaStream) {
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream,
    });

    peer.on('signal', signal => {
      socket.emit('returning_signal', { signal, callerID });
    });

    peer.signal(incomingSignal);

    return peer;
  }

  const toggleMic = () => {
    if (stream) {
      stream.getAudioTracks()[0].enabled = !isMicOn;
      setIsMicOn(!isMicOn);
    }
  };

  const toggleVideo = () => {
    if (stream) {
      stream.getVideoTracks()[0].enabled = !isVideoOn;
      setIsVideoOn(!isVideoOn);
    }
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
      <div className="relative aspect-video bg-slate-900 rounded-xl overflow-hidden border-2 border-blue-500">
        <video playsInline muted ref={userVideo} autoPlay className="w-full h-full object-cover" />
        <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded text-[10px] text-white font-bold">You</div>
        <div className="absolute bottom-2 right-2 flex gap-1">
          <button onClick={toggleMic} className="p-1.5 bg-black/50 rounded-full text-white hover:bg-black/70">
            {isMicOn ? <Mic className="w-3 h-3" /> : <MicOff className="w-3 h-3 text-red-500" />}
          </button>
          <button onClick={toggleVideo} className="p-1.5 bg-black/50 rounded-full text-white hover:bg-black/70">
            {isVideoOn ? <Video className="w-3 h-3" /> : <VideoOff className="w-3 h-3 text-red-500" />}
          </button>
        </div>
      </div>
      {peers.map((peer) => (
        <VideoItem key={peer.peerID} peer={peer.peer} />
      ))}
    </div>
  );
}

function VideoItem({ peer }: any) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    peer.on('stream', (stream: MediaStream) => {
      if (ref.current) {
        ref.current.srcObject = stream;
      }
    });
  }, [peer]);

  return (
    <div className="relative aspect-video bg-slate-900 rounded-xl overflow-hidden border border-slate-700">
      <video playsInline autoPlay ref={ref} className="w-full h-full object-cover" />
    </div>
  );
}

export function MultiplayerLobby() {
  const [roomName, setRoomName] = useState('');
  const [roomId, setRoomId] = useState<string | null>(null);
  const [players, setPlayers] = useState<any[]>([]);
  const [isHost, setIsHost] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [difficulty, setDifficulty] = useState('Medium');
  const [selectedBook, setSelectedBook] = useState('Genesis');
  const navigate = useNavigate();

  useEffect(() => {
    socket.on('room_update', (room) => {
      setPlayers(room.players);
      if (room.status === 'playing') {
        navigate(`/quiz/multiplayer/${room.id}`);
      }
    });

    return () => {
      socket.off('room_update');
    };
  }, []);

  const createRoom = () => {
    if (!auth.currentUser) return;
    const id = Math.random().toString(36).substring(2, 8).toUpperCase();
    socket.emit('create_room', { 
      roomId: id, 
      username: auth.currentUser.displayName || 'Anonymous',
      userId: auth.currentUser.uid
    });
    setRoomId(id);
    setIsHost(true);
  };

  const joinRoom = () => {
    if (!auth.currentUser || !roomName) return;
    socket.emit('join_room', { 
      roomId: roomName.toUpperCase(), 
      username: auth.currentUser.displayName || 'Anonymous',
      userId: auth.currentUser.uid
    });
    setRoomId(roomName.toUpperCase());
    setIsHost(false);
  };

  const toggleReady = () => {
    if (!roomId) return;
    const newReady = !isReady;
    setIsReady(newReady);
    socket.emit('player_ready', { roomId, isReady: newReady });
  };

  const startGame = () => {
    if (!roomId || !isHost) return;
    socket.emit('start_game', { roomId, book: selectedBook, difficulty });
  };

  const copyRoomId = () => {
    if (roomId) {
      navigator.clipboard.writeText(roomId);
    }
  };

  if (roomId) {
    return (
      <div className="max-w-4xl mx-auto p-4 space-y-8">
        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-8 shadow-xl space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                <Users className="text-blue-600" /> Room: {roomId}
              </h2>
              <p className="text-slate-500">Share this code with your friends to join.</p>
            </div>
            <button 
              onClick={copyRoomId}
              className="flex items-center gap-2 px-6 py-3 bg-slate-100 dark:bg-slate-900 rounded-xl font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200 transition-all"
            >
              <Copy className="w-5 h-5" /> Copy Code
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="space-y-4">
                <h3 className="font-bold text-slate-400 uppercase tracking-widest text-sm">Players ({players.length})</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {players.map((p) => (
                    <div key={p.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-3">
                        <UserCircle className="w-8 h-8 text-slate-400" />
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">{p.username}</p>
                          <p className="text-xs text-slate-500">{p.isHost ? 'Host' : 'Player'}</p>
                        </div>
                      </div>
                      {p.isReady ? (
                        <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                      ) : (
                        <div className="w-6 h-6 rounded-full border-2 border-slate-200 dark:border-slate-700" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-bold text-slate-400 uppercase tracking-widest text-sm">Live Video</h3>
                <VideoChat roomId={roomId} />
              </div>
            </div>

            <div className="space-y-6 bg-slate-50 dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white">Game Settings</h3>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Book</label>
                  <select 
                    disabled={!isHost}
                    value={selectedBook}
                    onChange={(e) => setSelectedBook(e.target.value)}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    {BIBLE_BOOKS.map(b => (
                      <option key={b.name} value={b.name}>{b.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Difficulty</label>
                  <div className="flex gap-2">
                    {['Easy', 'Medium', 'Hard'].map((d) => (
                      <button
                        key={d}
                        disabled={!isHost}
                        onClick={() => setDifficulty(d)}
                        className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                          difficulty === d 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-white dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700'
                        } disabled:opacity-50`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-6 space-y-3">
                <button 
                  onClick={toggleReady}
                  className={`w-full py-4 rounded-2xl font-bold transition-all ${
                    isReady 
                      ? 'bg-emerald-100 text-emerald-600 border-2 border-emerald-500' 
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {isReady ? 'Ready!' : 'I am Ready'}
                </button>

                {isHost && (
                  <button 
                    onClick={startGame}
                    disabled={players.length < 1 || !players.every(p => p.isReady)}
                    className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                  >
                    <Play className="w-5 h-5" /> Start Game
                  </button>
                )}
                
                {!isHost && !players.every(p => p.isReady) && (
                  <p className="text-xs text-center text-slate-500 animate-pulse">Waiting for all players to be ready...</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-8">
      <div className="text-center space-y-4">
        <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-3xl flex items-center justify-center text-emerald-600 mx-auto">
          <Users className="w-10 h-10" />
        </div>
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white">Multiplayer</h1>
        <p className="text-slate-500">Challenge your friends in real-time Bible trivia.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-6">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Create Room</h2>
          <p className="text-sm text-slate-500">Start a new private room and invite your friends.</p>
          <button 
            onClick={createRoom}
            className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25"
          >
            <Play className="w-5 h-5" /> Create New Room
          </button>
        </div>

        <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-6">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Join Room</h2>
          <div className="space-y-4">
            <input 
              type="text" 
              placeholder="Enter Room Code"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              className="w-full px-4 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 uppercase font-bold tracking-widest text-center"
            />
            <button 
              onClick={joinRoom}
              disabled={!roomName}
              className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 disabled:opacity-50 transition-all"
            >
              Join Room
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
