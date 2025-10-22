// src/lib/socket.js
import { io } from 'socket.io-client';

/**
 * Find token in sessionStorage, localStorage or cookie (order: session -> local -> cookie 'socketToken' or 'token')
 */
function getTokenFromStorage() {
  if (typeof window === 'undefined') return null;
  const session = sessionStorage.getItem('socketToken');
  if (session) return session;
  const local = localStorage.getItem('socketToken') || localStorage.getItem('authToken') || localStorage.getItem('token');
  if (local) return local;

  // cookie fallback
  const cookieMatch = document.cookie.match(new RegExp('(^| )(?:socketToken|token|authToken)=([^;]+)'));
  if (cookieMatch) return cookieMatch[2];
  return null;
}

class SocketService {
  constructor() {
    if (SocketService.instance) return SocketService.instance;
    SocketService.instance = this;

    this.socket = null;
    this.isConnected = false;
    this.listeners = new Map(); // event -> [callbacks]
  }

  /**
   * Connects to server using token from storage (no param required).
   * Resolves with the socket instance on success.
   */
  connect() {
    if (this.socket && this.socket.connected) {
      // console.log('✅ Socket already connected (reuse)');
      // ensure internal listeners are wired
      this._ensureSetup();
      return Promise.resolve(this.socket);
    }

    return new Promise((resolve, reject) => {
      const token = getTokenFromStorage();
      if (!token) {
        console.warn('❌ No auth token found in storage — socket will not connect');
        return reject(new Error('No auth token'));
      }

      const url = import.meta.env.VITE_API_URL || 'http://localhost:8080';
      // console.log('🚀 Connecting to socket:', url);

      this.socket = io(url, {
        auth: { token },
        withCredentials: true,
        transports: ['websocket', 'polling']
      });

      // To avoid multiple rejects/resolves, track whether we already resolved
      let settled = false;

      this.socket.on('connect', () => {
        this.isConnected = true;
        // console.log('✅ Socket connected (id: %s)', this.socket.id);
        this.emit('connect');
        // Ensure all event forwarding is set
        this._ensureSetup();
        if (!settled) {
          settled = true;
          resolve(this.socket);
        }
      });

      this.socket.on('disconnect', (reason) => {
        this.isConnected = false;
        console.warn('⚠️ Socket disconnected:', reason);
        this.emit('disconnect');
      });

      this.socket.on('connect_error', (err) => {
        console.error('❌ Socket connect_error:', err && err.message ? err.message : err);
        this.emit('connect_error', err);
        if (!settled) {
          settled = true;
          reject(err || new Error('connect_error'));
        }
      });

      // Safety: if server sends an 'error' event
      this.socket.on('error', (err) => {
        console.error('❌ Socket error event:', err);
        this.emit('error', err);
      });
    });
  }

  /**
   * Ensure the socket has forwarding listeners installed exactly once.
   */
  _ensureSetup() {
    if (!this.socket) return;

    // Avoid multiple attachments: store a symbol on socket
    if (this.socket.__socketServiceAttached) return;
    this.socket.__socketServiceAttached = true;

    // Backend events (use the names your backend emits)
    const events = [
      'new-message', 
      'message-notification',
      'messages-read',
      'user-typing',
      'user-stop-typing',
      'user-status',
      'chat-loaded',
      'error'
    ];

    events.forEach((evt) => {
      this.socket.on(evt, (data) => {
        // forward to registered listeners
        this.emit(evt, data);
      });
    });

    // Accept camelCase variants too (optional)
    const camelEvents = ['newMessage', 'messageNotification', 'messagesRead', 'userTyping', 'userStopTyping', 'userStatus', 'chatLoaded', 'error'];
    camelEvents.forEach(evt => {
      this.socket.on(evt, (data) => this.emit(evt, data));
    });
  }

  // Disconnect and cleanup
  disconnect() {
    if (!this.socket) return;
    try {
      // remove all socket listeners to avoid leaks
      this.socket.removeAllListeners();
      this.socket.disconnect();
    } catch (err) {
      console.warn('Error during socket.disconnect():', err);
    } finally {
      this.socket = null;
      this.isConnected = false;
    }
  }

  // ---- Emitters (server-bound actions) ----
  joinChat(chatId) { 
    this.socket?.emit('join-chat', chatId);
    // console.log('📡 Emitting join-chat event:', chatId, 'Socket exists:', !!this.socket);

   }
  loadChats(chatId) { this.socket?.emit('load-chat',chatId)}
  leaveChat(chatId) { this.socket?.emit('leave-chat', chatId); }
  sendMessage(chatId, text, messageType = 'text', fileData = null, senderId) {
    this.socket?.emit('send-message', { chatId, text, messageType, fileData, senderId});
  }  
  startTyping(chatId) { this.socket?.emit('typing', { chatId }); }
  stopTyping(chatId) { this.socket?.emit('stop-typing', { chatId }); }
  markMessagesAsRead(chatId) { this.socket?.emit('mark-as-read', { chatId }); }
  setOnline() { this.socket?.emit('set-online'); }
  getOnlineUsers() { this.socket?.emit('get-online-users'); }

  // ---- Listener API: on / off / emit to registered client callbacks ----
  on(event, callback) {
    if (!event || typeof callback !== 'function') return;
    if (!this.listeners.has(event)) this.listeners.set(event, []);
    this.listeners.get(event).push(callback);
  }

  // off(event) removes all listeners for that event
  // off(event, callback) removes a single callback
  off(event, callback) {
    if (!this.listeners.has(event)) return;
    if (!callback) {
      this.listeners.delete(event);
      return;
    }
    const arr = this.listeners.get(event).filter(cb => cb !== callback);
    if (arr.length === 0) this.listeners.delete(event);
    else this.listeners.set(event, arr);
  }

  // internal: call all registered callbacks for event
  emit(event, data) {
    const arr = this.listeners.get(event);
    if (!arr || arr.length === 0) return;
    arr.forEach(cb => {
      try { cb(data); } catch (err) { console.error('Listener error for', event, err); }
    });
  }
}

// export singleton
const socketService = new SocketService();

// // Auto-connect only if token present and not yet initialized.
// // (This is optional; if you prefer manual connect from ChatContext, you can remove this block)
// if (typeof window !== 'undefined' && !window.socketInitialized) {
//   const token = getTokenFromStorage();
//   if (token) {
//     socketService.connect().catch(err => console.warn('Auto-connect failed:', err?.message || err));
//   }
//   window.socketInitialized = true;
// }

export default socketService;
export { SocketService };
