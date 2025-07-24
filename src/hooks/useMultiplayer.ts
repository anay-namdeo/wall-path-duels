import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { GameState, GameRoom, GameMove, ChatMessage, User } from '@/types/game';
import { useAuth } from './useAuth';

export const useMultiplayer = () => {
  const { user, gameUser } = useAuth();
  const [rooms, setRooms] = useState<GameRoom[]>([]);
  const [currentRoom, setCurrentRoom] = useState<GameRoom | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!user) return;

    // Subscribe to room updates
    const roomSubscription = supabase
      .channel('game_rooms')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'game_rooms' },
        (payload) => {
          handleRoomUpdate(payload);
        }
      )
      .subscribe();

    // Subscribe to game moves
    const moveSubscription = supabase
      .channel('game_moves')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'game_moves' },
        (payload) => {
          handleGameMove(payload.new as GameMove);
        }
      )
      .subscribe();

    // Subscribe to chat messages
    const chatSubscription = supabase
      .channel('chat_messages')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chat_messages' },
        (payload) => {
          handleChatMessage(payload.new as ChatMessage);
        }
      )
      .subscribe();

    setIsConnected(true);

    return () => {
      roomSubscription.unsubscribe();
      moveSubscription.unsubscribe();
      chatSubscription.unsubscribe();
    };
  }, [user]);

  const handleRoomUpdate = (payload: any) => {
    // Handle room updates
    fetchRooms();
  };

  const handleGameMove = (move: GameMove) => {
    if (!currentRoom) return;
    // Update current room with new move
    setCurrentRoom(prev => {
      if (!prev) return null;
      return {
        ...prev,
        gameState: {
          ...prev.gameState,
          gameHistory: [...prev.gameState.gameHistory, move]
        }
      };
    });
  };

  const handleChatMessage = (message: ChatMessage) => {
    if (!currentRoom) return;
    setCurrentRoom(prev => {
      if (!prev) return null;
      return {
        ...prev,
        gameState: {
          ...prev.gameState,
          chat: [...prev.gameState.chat, message]
        }
      };
    });
  };

  const fetchRooms = async () => {
    const { data, error } = await supabase
      .from('game_rooms')
      .select(`
        *,
        players:game_room_players(
          user:users(*)
        )
      `)
      .eq('is_active', true);

    if (data) {
      setRooms(data);
    }
  };

  const createRoom = async (name: string, maxPlayers: number, isPrivate: boolean = false) => {
    if (!user || !gameUser) return null;

    const { data, error } = await supabase
      .from('game_rooms')
      .insert({
        name,
        host_id: user.id,
        max_players: maxPlayers,
        is_private: isPrivate,
        is_active: true
      })
      .select()
      .single();

    if (data) {
      await joinRoom(data.id);
      return data;
    }
    return null;
  };

  const joinRoom = async (roomId: string) => {
    if (!user) return false;

    const { error } = await supabase
      .from('game_room_players')
      .insert({
        room_id: roomId,
        user_id: user.id,
        is_spectator: false
      });

    if (!error) {
      const { data: roomData } = await supabase
        .from('game_rooms')
        .select(`
          *,
          players:game_room_players(
            user:users(*)
          )
        `)
        .eq('id', roomId)
        .single();

      if (roomData) {
        setCurrentRoom(roomData);
        return true;
      }
    }
    return false;
  };

  const leaveRoom = async () => {
    if (!user || !currentRoom) return;

    await supabase
      .from('game_room_players')
      .delete()
      .eq('room_id', currentRoom.id)
      .eq('user_id', user.id);

    setCurrentRoom(null);
  };

  const makeMove = async (move: GameMove) => {
    if (!currentRoom || !user) return false;

    const { error } = await supabase
      .from('game_moves')
      .insert({
        room_id: currentRoom.id,
        player_id: user.id,
        move_type: move.type,
        move_data: move,
        timestamp: new Date().toISOString()
      });

    return !error;
  };

  const sendChatMessage = async (message: string) => {
    if (!currentRoom || !user || !gameUser) return false;

    const { error } = await supabase
      .from('chat_messages')
      .insert({
        room_id: currentRoom.id,
        player_id: user.id,
        player_name: gameUser.username,
        message,
        timestamp: new Date().toISOString(),
        type: 'chat'
      });

    return !error;
  };

  return {
    rooms,
    currentRoom,
    isConnected,
    createRoom,
    joinRoom,
    leaveRoom,
    makeMove,
    sendChatMessage,
    fetchRooms
  };
};