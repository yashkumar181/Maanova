import React, { useState, useRef, useEffect, ChangeEvent } from 'react';

// Define the shape of a message object
interface ChatMessage {
    id: string;
    content: string;
    sender: 'user' | 'bot';
    timestamp: Date;
    type: 'normal' | 'crisis' | 'error';
}

const initialMessage: ChatMessage = {
    id: "1",
    content:
        "Hello! I'm here to provide mental health support and guidance. How are you feeling today? Remember, this is a safe and confidential space.",
    sender: "bot",
    timestamp: new Date(),
    type: "normal",
};

const Chatbot: React.FC = () => {
    const [messages, setMessages] = useState<ChatMessage[]>([initialMessage]);
    const [isTyping, setIsTyping] = useState<boolean>(false);
    const [inputValue, setInputValue] = useState<string>('');
    const chatInputRef = useRef<HTMLInputElement>(null);
    const chatMessagesRef = useRef<HTMLDivElement>(null);

    // Scroll to the bottom of the chat on every new message or typing indicator change
    useEffect(() => {
        if (chatMessagesRef.current) {
            chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
        }
    }, [messages, isTyping]);

    const handleSendMessage = async () => {
        if (!inputValue.trim() || isTyping) return;

        const userMessage: ChatMessage = {
            id: Date.now().toString(),
            content: inputValue.trim(),
            sender: "user",
            timestamp: new Date(),
            type: "normal",
        };

        // Add the user's message to the chat history
        setMessages(prevMessages => [...prevMessages, userMessage]);
        setInputValue(''); // Clear the input field
        setIsTyping(true); // Show the typing indicator

        try {
            // Send the message to your Node.js backend
            const response = await fetch("/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: inputValue.trim() }),
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            const botResponse: ChatMessage = {
                id: Date.now().toString(),
                content: data.response,
                sender: "bot",
                timestamp: new Date(),
                type: data.type,
            };

            setMessages(prevMessages => [...prevMessages, botResponse]);
        } catch (error) {
            console.error("Error fetching chatbot response:", error);
            const errorMessage: ChatMessage = {
                id: Date.now().toString(),
                content: "I'm having trouble responding right now. Please try again later.",
                sender: "bot",
                timestamp: new Date(),
                type: "error",
            };
            setMessages(prevMessages => [...prevMessages, errorMessage]);
        } finally {
            setIsTyping(false); // Hide the typing indicator
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };
    
    // A simple function to render each message
const renderMessage = (message: ChatMessage) => {
  const isUser = message.sender === "user";
  const messageClass = isUser ? "user-message" : "bot-message";
  const additionalClass = message.type === "crisis" ? "crisis-message" : "";

  // Return a React element instead of an HTML string
  return (
    <div key={message.id} className={`message ${messageClass} ${additionalClass}`}>
      <div className={`message-avatar ${isUser ? "user-avatar" : "bot-avatar"}`}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          {isUser ? (
            <>
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </>
          ) : (
            <>
              <circle cx="12" cy="8" r="7" />
              <polyline points="8.21,13.89 7,23 12,20 17,23 15.79,13.88" />
            </>
          )}
        </svg>
      </div>

      <div className="message-content">
        <p>{message.content}</p>
        {message.type === "crisis" && (
          <button
            className="crisis-button"
            onClick={() => window.open("tel:988", "_self")}
          >
            Call Crisis Line: 988
          </button>
        )}
      </div>
    </div>
  );
};


    return (
        <section className="chat-section">
            <div className="chat-container">
                <div className="chat-header">
                    <div className="chat-header-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="8" r="7"/><polyline points="8.21,13.89 7,23 12,20 17,23 15.79,13.88"/>
                        </svg>
                    </div>
                    <div className="chat-header-text">
                        <h2>AI Mental Health Support</h2>
                        <p>Confidential chat support available 24/7</p>
                    </div>
                </div>

                <div className="chat-alert">
                    <svg className="alert-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                    <p>This AI provides initial support and coping strategies. For immediate crisis support, call 988 or contact campus emergency services.</p>
                </div>

                <div className="chat-messages" id="chatMessages" ref={chatMessagesRef}>
                    {messages.map(renderMessage)}
                    {isTyping && (
                        <div className="message typing-indicator">
                            <div className="message-avatar bot-avatar">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="8" r="7"/><polyline points="8.21,13.89 7,23 12,20 17,23 15.79,13.88"/>
                                </svg>
                            </div>
                            <div className="message-content">
                                <div className="typing-dots">
                                    <div className="typing-dot"></div><div className="typing-dot"></div><div className="typing-dot"></div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="chat-input-container">
                    <input 
                        type="text" 
                        id="chatInput" 
                        className="chat-input" 
                        placeholder="Share what's on your mind... (Press Enter to send)"
                        value={inputValue}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setInputValue(e.target.value)}
                        onKeyPress={handleKeyPress}
                        disabled={isTyping}
                        ref={chatInputRef}
                    />
                    <button 
                        id="sendButton" 
                        className="send-button"
                        onClick={handleSendMessage}
                        disabled={!inputValue.trim() || isTyping}
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22,2 15,22 11,13 2,9 22,2"/>
                        </svg>
                    </button>
                </div>

                <div className="chat-footer">
                    <p>Need immediate help? Call 988 (Suicide & Crisis Lifeline) or your campus emergency services</p>
                </div>
            </div>
        </section>
    );
};

export default Chatbot;