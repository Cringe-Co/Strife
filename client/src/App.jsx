import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const socket = io('http://localhost:4000');

function App() {
  const [room, setRoom] = useState('general');
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [user, setUser] = useState('guest');

  useEffect(() => {
    socket.emit('chat:join', room);

    socket.on('chat:message', (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    return () => {
      socket.off('chat:message');
    };
  }, [room]);

  const send = () => {
    if (text.trim()) {
      socket.emit('chat:message', { room, user, text });
      setText('');
    }
  };

  return (
    <div>
      <h1>Room: {room}</h1>
      <div>
        {messages.map((msg, index) => (
          <div key={index}>
            <b>{msg.user}</b>: {msg.text}
          </div>
        ))}
      </div>
      <input id="message-input" type="text" value={text} onChange={(e) => setText(e.target.value)} />
      <button onClick={send}>Send</button>
    </div>
  );
}

export default App
