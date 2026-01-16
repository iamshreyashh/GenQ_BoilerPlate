import { useState } from 'react'
import './App.css'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import ChatbotIcon from './components/ChatbotIcon'
import Chatbot from './components/Chatbot'
import LoginModal from './components/LoginModal'

function App() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);

  const handleLoginClick = () => {
    setIsLoginModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsLoginModalOpen(false);
  };

  const handleToggleChatbot = () => {
    setIsChatbotOpen(!isChatbotOpen);
  };

  const handleCloseChatbot = () => {
    setIsChatbotOpen(false);
  };

  return (
    <div className="app-container">
      <Navbar onLoginClick={handleLoginClick} />
      <Hero />
      <ChatbotIcon onClick={handleToggleChatbot} isOpen={isChatbotOpen} />
      <Chatbot isOpen={isChatbotOpen} onClose={handleCloseChatbot} />
      <LoginModal isOpen={isLoginModalOpen} onClose={handleCloseModal} />

      {/* Spacer for scroll demo if needed */}
      <div style={{ height: '50vh', background: 'var(--color-dark-surface)' }}>
        <div style={{ padding: '4rem 2rem', textAlign: 'center', opacity: 0.3 }}>
          <p>More content section...</p>
        </div>
      </div>
    </div>
  )
}

export default App
