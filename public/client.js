const socket = io();
let currentRoom = null;

// ── 서버 이벤트 수신 ──────────────────────────
socket.on('waiting', (msg) => {
  setStatus('⏳ ' + msg);
});

socket.on('matched', ({ room }) => {
  currentRoom = room;
  setStatus('🟢 연결됨! 채팅을 시작하세요');
  setInputEnabled(true);
  addMessage('상대방과 연결되었습니다.', 'system');
});

socket.on('message', ({ text, time }) => {
  addMessage(text, 'received', time);
});

socket.on('partner_left', (msg) => {
  setStatus('🔴 ' + msg);
  setInputEnabled(false);
  addMessage(msg, 'system');
  currentRoom = null;
});

// ── 메시지 전송 ──────────────────────────────
function sendMessage() {
  const input = document.getElementById('input');
  const text = input.value.trim();
  if (!text || !currentRoom) return;

  socket.emit('message', { room: currentRoom, text });
  addMessage(text, 'sent', new Date().toLocaleTimeString('ko-KR'));
  input.value = '';
  input.focus();
}

// Enter 키로 전송
document.getElementById('input').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') sendMessage();
});

// ── 유틸 함수 ─────────────────────────────────
function addMessage(text, type, time) {
  const messages = document.getElementById('messages');
  const div = document.createElement('div');
  div.className = `message ${type}`;
  div.innerHTML = `${text}${time ? `<small>${time}</small>` : ''}`;
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight; // 자동 스크롤
}

function setStatus(msg) {
  document.getElementById('status').textContent = msg;
}

function setInputEnabled(enabled) {
  document.getElementById('input').disabled = !enabled;
  document.getElementById('send-btn').disabled = !enabled;
}