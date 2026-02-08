import React, { useState, useRef, useEffect } from 'react';
import './Chatbot.css';

const Chatbot = ({ isOpen, onClose }) => {
    // Initial state: empty or just system message hidden from view until interaction
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [hasInteracted, setHasInteracted] = useState(false);
    const [activeCollection, setActiveCollection] = useState('default');
    const [isUploading, setIsUploading] = useState(false);

    // Model Switcher State
    const [selectedModel, setSelectedModel] = useState('Amber');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (hasInteracted) {
            scrollToBottom();
        }
    }, [messages, isTyping, hasInteracted]);

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        // Use filename as collection name for simplicity, sanitized
        const collectionName = file.name.replace(/[^a-zA-Z0-9]/g, '_');
        formData.append('collection_name', collectionName);

        try {
            const response = await fetch('http://localhost:8000/upload', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Upload failed');
            }

            const data = await response.json();
            setActiveCollection(collectionName);
            setMessages(prev => [...prev, {
                id: Date.now(),
                text: `File uploaded successfully! Switched context to document: ${file.name}`,
                sender: 'bot',
                timestamp: new Date()
            }]);
            if (!hasInteracted) setHasInteracted(true);
        } catch (error) {
            console.error("Error uploading file:", error);
            setMessages(prev => [...prev, {
                id: Date.now(),
                text: "Sorry, I encountered an error uploading your document.",
                sender: 'bot',
                timestamp: new Date()
            }]);
        } finally {
            setIsUploading(false);
            // Reset input
            e.target.value = null;
        }
    };

    const handleSendMessage = async (e, text = inputValue) => {
        if (e) e.preventDefault();
        const content = text.trim();
        if (content === '') return;

        if (!hasInteracted) setHasInteracted(true);

        // Add user message
        const userMessage = {
            id: Date.now(),
            text: content,
            sender: 'user',
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsTyping(true);

        try {
            const response = await fetch('http://localhost:8000/query', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    collection_name: activeCollection,
                    query: content
                }),
            });

            const data = await response.json();

            const botMessage = {
                id: Date.now() + 1,
                text: data.answer || "I couldn't generate an answer.",
                sender: 'bot',
                timestamp: new Date(),
                sources: data.sources // Optional: display sources if needed
            };
            setMessages(prev => [...prev, botMessage]);

        } catch (error) {
            console.error("Error querying backend:", error);
            const errorMessage = {
                id: Date.now() + 1,
                text: "Sorry, I'm having trouble connecting to my brain right now.",
                sender: 'bot',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage(e);
        }
    };

    const handleSuggestionClick = (suggestion) => {
        handleSendMessage(null, suggestion);
    };

    const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

    const handleModelSelect = (model) => {
        setSelectedModel(model);
        setIsDropdownOpen(false);
    };

    const handleBackClick = () => {
        setHasInteracted(false);
    };

    const triggerFileUpload = () => {
        fileInputRef.current?.click();
    };

    if (!isOpen) return null;

    return (
        <div className="chatbot-container glass-panel">
            {/* Minimal Header */}
            <div className="chatbot-header-minimal">
                {hasInteracted && (
                    <button className="icon-btn" onClick={handleBackClick} style={{ marginRight: '0.5rem' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="15 18 9 12 15 6"></polyline>
                        </svg>
                    </button>
                )}
                <div className="header-brand" onClick={toggleDropdown}>
                    <span className="brand-icon">✦</span>
                    <span>{selectedModel}</span>
                    <span className={`dropdown-arrow ${isDropdownOpen ? 'open' : ''}`}>▼</span>

                    {isDropdownOpen && (
                        <div className="model-dropdown">
                            {['Amber', 'GenQ RAG', 'Claude'].map(model => (
                                <div
                                    key={model}
                                    className={`model-dropdown-item ${selectedModel === model ? 'selected' : ''}`}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleModelSelect(model);
                                    }}
                                >
                                    {model}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <div className="header-actions">
                    <button className="icon-btn">•••</button>
                    <button className="icon-btn" onClick={onClose}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>
            </div>

            <div className="chatbot-content">
                <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    onChange={handleFileUpload}
                    accept=".pdf,.docx,.txt"
                />

                {!hasInteracted ? (
                    /* Hero / Empty State */
                    <div className="chatbot-hero">
                        <div className="hero-orb-container">
                            <div className="hero-orb"></div>
                        </div>
                        <h2 className="hero-greeting">
                            Hello, <span className="gradient-text">User</span>
                        </h2>
                        <h3 className="hero-subtitle">How can I assist you today?</h3>

                        {/* Input Area (Centered for Hero) */}
                        <div className="hero-input-area">
                            <div className="input-box">
                                <input
                                    type="text"
                                    placeholder="Ask me anything..."
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    disabled={isUploading}
                                />
                                <div className="input-actions-row">
                                    <button className="deep-research-btn">
                                        <span className="sc-icon">⚛</span> {activeCollection !== 'default' ? activeCollection : 'Deeper Research'}
                                    </button>
                                    <div className="right-icons">
                                        <button className="icon-btn-small" onClick={triggerFileUpload} title="Upload Document">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
                                            </svg>
                                        </button>
                                        <button className="icon-btn-small">📷</button>
                                        <button className="icon-btn-small">💡</button>
                                        <button className="icon-btn-small mic-btn">🎤</button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Suggestion Cards */}
                        <div className="suggestions-grid">
                            <div className="suggestion-card" onClick={() => handleSuggestionClick("Synthesize Data")}>
                                <div className="card-icon">◔</div>
                                <div className="card-text">
                                    <h4>Synthesize Data</h4>
                                    <p>Turn my meeting notes into 5 bullets.</p>
                                </div>
                            </div>
                            <div className="suggestion-card" onClick={() => handleSuggestionClick("Creative Brainstorm")}>
                                <div className="card-icon">💡</div>
                                <div className="card-text">
                                    <h4>Creative Brainstorm</h4>
                                    <p>Generate 3 taglines for a brand.</p>
                                </div>
                            </div>
                            <div className="suggestion-card" onClick={() => handleSuggestionClick("Check Facts")}>
                                <div className="card-icon">🔨</div>
                                <div className="card-text">
                                    <h4>Check Facts</h4>
                                    <p>Compare key differences between GDPR.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    /* Chat Interface (Standard) */
                    <div className="chatbot-chat-view">
                        <div className="chatbot-messages">
                            {messages.map((message) => (
                                <div
                                    key={message.id}
                                    className={`message ${message.sender === 'user' ? 'message-user' : 'message-bot'}`}
                                >
                                    <div className="message-bubble">
                                        <p>{message.text}</p>
                                        {message.sources && message.sources.length > 0 && (
                                            <div style={{ fontSize: '0.7rem', opacity: 0.7, marginTop: '5px' }}>
                                                Sources: {message.sources.join(', ')}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {isTyping && (
                                <div className="message message-bot">
                                    <div className="message-bubble typing-indicator">
                                        <span></span>
                                        <span></span>
                                        <span></span>
                                    </div>
                                </div>
                            )}
                            {isUploading && (
                                <div className="message message-bot">
                                    <div className="message-bubble">
                                        <p>Uploading and processing document...</p>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Compact Input for Chat View */}
                        <div className="chat-input-bar">
                            <button className="icon-btn-small" onClick={triggerFileUpload} style={{ marginRight: '8px' }} title="Upload Document">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
                                </svg>
                            </button>
                            <input
                                type="text"
                                placeholder={`Ask me about ${activeCollection === 'default' ? 'anything...' : activeCollection}`}
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyPress={handleKeyPress}
                                disabled={isUploading}
                            />
                            <button className="send-btn-compact" onClick={(e) => handleSendMessage(e)}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="22" y1="2" x2="11" y2="13"></line>
                                    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                                </svg>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Chatbot;
