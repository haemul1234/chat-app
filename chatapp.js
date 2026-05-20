const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// public 폴더의 파일들을 자동으로 서빙
app.use(express.static('public'));

let waitingUser = null; // 매칭 대기 중인 유저

io.on('connection', (socket) => {
  console.log('🟢 접속:', socket.id);

  // --- 1대1 매칭 ---
  if (waitingUser) {
    const room = `room_${waitingUser.id}_${socket.id}`;
    waitingUser.join(room);
    socket.join(room);

    // 양쪽 모두에게 매칭 완료 알림
    io.to(room).emit('matched', { room });
    waitingUser = null;
  } else {
    waitingUser = socket;
    socket.emit('waiting', '상대방을 기다리는 중...');
  }

  // --- 메시지 수신 → 상대방에게 전달 ---
  socket.on('message', ({ room, text }) => {
    socket.to(room).emit('message', {
      text,
      time: new Date().toLocaleTimeString('ko-KR')
    });
  });

  // --- 연결 해제 ---
  socket.on('disconnect', () => {
    if (waitingUser?.id === socket.id) waitingUser = null;
    socket.broadcast.emit('partner_left', '상대방이 나갔습니다.');
    console.log('🔴 퇴장:', socket.id);
  });
});

server.listen(3000, () => {
  console.log('✅ 서버 실행 중: http://localhost:3000');
});