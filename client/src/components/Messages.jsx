import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Messages.css';

const Messages = () => {
  const [messages, setMessages] = useState([]);
  const [newReply, setNewReply] = useState('');

  // Simulate fetching messages (you can replace with a real API call)
  useEffect(() => {
    const fetchedMessages = [
      { content: 'Your thesis submission needs further edits.', timestamp: '2024-11-08 1:00 PM', isRead: false, replies: [] },
      { content: 'Please upload the latest version of your thesis.', timestamp: '2024-11-08 2:00 PM', isRead: true, replies: [] },
      { content: 'Your advisor has scheduled a meeting.', timestamp: '2024-11-08 3:00 PM', isRead: false, replies: [] },
    ];
    setMessages(fetchedMessages);
  }, []);

  const handleMarkAsRead = (index) => {
    setMessages((prevMessages) =>
      prevMessages.map((message, i) =>
        i === index ? { ...message, isRead: true } : message
      )
    );
  };

  const handleDeleteMessage = (index) => {
    setMessages((prevMessages) => prevMessages.filter((_, i) => i !== index));
  };

  const handleReplyChange = (e) => {
    setNewReply(e.target.value);
  };

  const handleSendReply = (index) => {
    if (newReply.trim()) {
      setMessages((prevMessages) =>
        prevMessages.map((message, i) =>
          i === index
            ? { ...message, replies: [...message.replies, { content: newReply, timestamp: new Date().toLocaleString() }] }
            : message
        )
      );
      setNewReply('');
    }
  };

  return (
    <div className="dashboard">
      {/* Sidebar */}
      <div className="sidebar">
        <ul>
          <li><Link to="/student-dashboard">Dashboard Home</Link></li>
          <li><Link to="/thesis-submission">Thesis Submission</Link></li>
          <li><Link to="/notifications">Notifications</Link></li>
          <li><Link to="/messages">Messages</Link></li>
          <li><Link to="/profile-settings">Profile Settings</Link></li>
          <li>Log Out</li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Top Navigation Bar */}
        <div className="top-nav">
          <div className="logo">University Logo</div>
          <div className="nav-icons">
            <div className="notifications">🔔</div>
            <div className="settings">⚙️</div>
            <div className="profile">
              <img src="profile-pic.jpg" alt="Profile" />
              <span>Student Name</span>
            </div>
          </div>
        </div>
        
        {/* Messages Section */}
        <div className="messages-container">
          <h3>Messages</h3>
          <div className="messages-list">
            {messages.length === 0 ? (
              <p>No new messages.</p>
            ) : (
              messages.map((message, index) => (
                <div key={index} className={`message-item ${message.isRead ? 'read' : 'unread'}`}>
                  <p className="message-content">{message.content}</p>
                  <span className="message-timestamp">{message.timestamp}</span>
                  <div className="message-actions">
                    {!message.isRead && (
                      <button className="mark-read-btn" onClick={() => handleMarkAsRead(index)}>
                        Mark as Read
                      </button>
                    )}
                    <button className="delete-btn" onClick={() => handleDeleteMessage(index)}>
                      Delete
                    </button>
                  </div>

                  {/* Display Replies */}
                  {message.replies.length > 0 && (
                    <div className="replies">
                      <h4>Replies</h4>
                      {message.replies.map((reply, replyIndex) => (
                        <div key={replyIndex} className="reply-item">
                          <p>{reply.content}</p>
                          <span className="reply-timestamp">{reply.timestamp}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Reply Section */}
                  <div className="reply-section">
                    <textarea
                      value={newReply}
                      onChange={handleReplyChange}
                      placeholder="Write a reply..."
                    />
                    <button
                      className="send-reply-btn"
                      onClick={() => handleSendReply(index)}
                    >
                      Send Reply
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;
