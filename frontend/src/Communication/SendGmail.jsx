import React, { useRef, useState, useEffect } from 'react';
import emailjs from '@emailjs/browser';
import 'bootstrap/dist/css/bootstrap.min.css';

const SendGmail = () => {
  const form = useRef();
  const messagesEndRef = useRef(null);
  const [emailSent, setEmailSent] = useState(false);
  const [messages, setMessages] = useState({});
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [activeChat, setActiveChat] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const recentChats = [
    { id: 1, name: "John Doe", avatar: "https://via.placeholder.com/40", lastMessage: "See you tomorrow!", unread: 2, timestamp: "09:30", status: "online" },
    { id: 2, name: "Jane Smith", avatar: "https://via.placeholder.com/40", lastMessage: "Thanks!", unread: 0, timestamp: "Yesterday", status: "offline" },
    { id: 3, name: "Mike Johnson", avatar: "https://via.placeholder.com/40", lastMessage: "Great idea!", unread: 1, timestamp: "Yesterday", status: "online" },
  ];

  const favorites = [
    { id: 4, name: "Alice Brown", avatar: "https://via.placeholder.com/40", status: "online" },
    { id: 5, name: "Bob Wilson", avatar: "https://via.placeholder.com/40", status: "offline" },
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleTyping = (e) => {
    setInputMessage(e.target.value);
    setIsTyping(true);
    setTimeout(() => setIsTyping(false), 1000);
  };

  const sendEmail = (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const newMessage = {
      id: Date.now(),
      message: inputMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'sending',
      isUser: true
    };

    setMessages(prev => ({
      ...prev,
      [activeChat]: [...(prev[activeChat] || []), newMessage]
    }));
    
    setInputMessage('');

    emailjs
      .sendForm('service_ovo3dyn', 'template_8wzmxwc', form.current, {
        publicKey: 'QmN8gJbNtqkmaTH9k',
      })
      .then(
        () => {
          setEmailSent(true);
          // Simulate response
          setTimeout(() => {
            const responseMessage = {
              id: Date.now(),
              message: "Thanks for your message!",
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              status: 'sent',
              isUser: false
            };
            setMessages(prev => ({
              ...prev,
              [activeChat]: [...(prev[activeChat] || []), responseMessage]
            }));
          }, 1000);
        },
        (error) => {
          console.error('Failed to send email:', error.text);
        }
      );
  };

  const filteredChats = recentChats.filter(chat => 
    chat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container-fluid py-4">
      <div className="row" style={{ height: '90vh' }}>
        {/* Left Sidebar */}
        <div className="col-md-4 p-0" style={{ borderRight: '1px solid #dee2e6' }}>
          <div className="d-flex flex-column h-100">
            {/* User Profile Header */}
            <div className="p-3" style={{ backgroundColor: '#075e54', color: 'white' }}>
              <div className="d-flex align-items-center">
                <img src="https://via.placeholder.com/40" alt="Your Profile" className="rounded-circle" />
                <h5 className="mb-0 ms-3">My Profile</h5>
              </div>
            </div>

            {/* Search Bar */}
            <div className="p-2">
              <input
                type="search"
                className="form-control"
                placeholder="Search or start new chat"
                style={{ borderRadius: '20px' }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Recent Chats */}
            <div className="flex-grow-1 overflow-auto">
              <div className="p-2">
                <h6 className="text-muted mb-3">Recent Chats</h6>
                {filteredChats.map(chat => (
                  <div 
                    key={chat.id}
                    className="d-flex align-items-center p-2 rounded mb-2"
                    style={{ 
                      cursor: 'pointer',
                      backgroundColor: activeChat === chat.id ? '#f0f2f5' : 'transparent'
                    }}
                    onClick={() => setActiveChat(chat.id)}
                  >
                    <div className="position-relative">
                      <img src={chat.avatar} alt={chat.name} className="rounded-circle" width="50" />
                      <span 
                        className="position-absolute bottom-0 end-0 rounded-circle border border-white"
                        style={{ 
                          width: '12px', 
                          height: '12px',
                          backgroundColor: chat.status === 'online' ? '#4CAF50' : '#bbb'
                        }}
                      ></span>
                    </div>
                    <div className="ms-3 flex-grow-1">
                      <div className="d-flex justify-content-between">
                        <h6 className="mb-0">{chat.name}</h6>
                        <small className="text-muted">{chat.timestamp}</small>
                      </div>
                      <small className="text-muted">{chat.lastMessage}</small>
                    </div>
                    {chat.unread > 0 && (
                      <span className="badge bg-success rounded-pill">{chat.unread}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Favorites */}
            <div className="p-3 bg-light">
              <h6 className="text-muted mb-3">Favorites</h6>
              <div className="d-flex gap-2 overflow-auto">
                {favorites.map(favorite => (
                  <div 
                    key={favorite.id} 
                    className="text-center" 
                    style={{ minWidth: '60px', cursor: 'pointer' }}
                    onClick={() => setActiveChat(favorite.id)}
                  >
                    <div className="position-relative">
                      <img 
                        src={favorite.avatar} 
                        alt={favorite.name} 
                        className="rounded-circle mb-1" 
                        width="40" 
                      />
                      <span 
                        className="position-absolute bottom-0 end-0 rounded-circle border border-white"
                        style={{ 
                          width: '12px', 
                          height: '12px',
                          backgroundColor: favorite.status === 'online' ? '#4CAF50' : '#bbb'
                        }}
                      ></span>
                    </div>
                    <small className="d-block text-truncate" style={{ fontSize: '0.7rem' }}>
                      {favorite.name}
                    </small>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Chat Area */}
        <div className="col-md-8 p-0">
          {activeChat ? (
            <div className="d-flex flex-column h-100">
              {/* Chat Header */}
              <div className="p-3" style={{ backgroundColor: '#075e54', color: 'white' }}>
                <div className="d-flex align-items-center">
                  {[...recentChats, ...favorites].map(chat => chat.id === activeChat && (
                    <React.Fragment key={chat.id}>
                      <div className="position-relative">
                        <img src={chat.avatar} alt={chat.name} className="rounded-circle" width="40" />
                        <span 
                          className="position-absolute bottom-0 end-0 rounded-circle border border-white"
                          style={{ 
                            width: '12px', 
                            height: '12px',
                            backgroundColor: chat.status === 'online' ? '#4CAF50' : '#bbb'
                          }}
                        ></span>
                      </div>
                      <div className="ms-3">
                        <h6 className="mb-0">{chat.name}</h6>
                        <small className="text-white-50">
                          {isTyping ? 'typing...' : chat.status}
                        </small>
                      </div>
                    </React.Fragment>
                  ))}
                </div>
              </div>

              {/* Messages Area */}
              <div 
                className="flex-grow-1 overflow-auto p-3"
                style={{ backgroundColor: '#e5ddd5' }}
              >
                {(messages[activeChat] || []).map((msg, index) => (
                  <div 
                    key={msg.id} 
                    className={`d-flex mb-3 ${msg.isUser ? 'justify-content-end' : 'justify-content-start'}`}
                  >
                    {!msg.isUser && (
                      <img 
                        src={recentChats.find(chat => chat.id === activeChat)?.avatar} 
                        alt="User" 
                        className="rounded-circle align-self-end me-2" 
                        width="30" 
                        height="30" 
                      />
                    )}
                    <div
                      style={{
                        backgroundColor: msg.isUser ? '#dcf8c6' : '#ffffff',
                        maxWidth: '60%',
                        borderRadius: '12px',
                        padding: '8px 12px',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                      }}
                    >
                      <div className="mb-1">{msg.message}</div>
                      <div 
                        className="d-flex align-items-center justify-content-end gap-1"
                        style={{ fontSize: '0.7em', color: '#667781' }}
                      >
                        <span>{msg.timestamp}</span>
                        {msg.isUser && (
                          <span>
                            {msg.status === 'sent' && '✓✓'}
                            {msg.status === 'sending' && '○'}
                            {msg.status === 'failed' && '⚠️'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-3" style={{ backgroundColor: '#f0f0f0' }}>
                <form ref={form} onSubmit={sendEmail} className="d-flex gap-2 align-items-center">
                  <div className="d-none">
                    <input type="text" name="from_name" defaultValue="User" />
                    <input type="email" name="from_email" defaultValue="user@example.com" />
                  </div>

                  <button 
                    type="button" 
                    className="btn btn-light rounded-circle p-2"
                    style={{ width: '40px', height: '40px' }}
                  >
                    😊
                  </button>

                  <button 
                    type="button" 
                    className="btn btn-light rounded-circle p-2"
                    style={{ width: '40px', height: '40px' }}
                  >
                    📎
                  </button>

                  <input
                    type="text"
                    name="message"
                    value={inputMessage}
                    onChange={handleTyping}
                    placeholder="Type a message"
                    className="form-control"
                    style={{
                      borderRadius: '25px',
                      padding: '12px 20px'
                    }}
                  />

                  <button 
                    type="submit" 
                    className="btn rounded-circle d-flex align-items-center justify-content-center"
                    style={{
                      backgroundColor: '#128c7e',
                      color: 'white',
                      width: '40px',
                      height: '40px'
                    }}
                    disabled={!inputMessage.trim()}
                  >
                    ➤
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <div className="d-flex align-items-center justify-content-center h-100 text-muted">
              <div className="text-center">
                <h4>Select a chat to start messaging</h4>
                <p>Choose from your recent conversations or favorites</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SendGmail;