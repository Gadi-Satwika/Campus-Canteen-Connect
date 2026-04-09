import React, { useState, useEffect, useRef } from 'react';
import API from '../api';
import axios from 'axios';

const AIChatBot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState("");
    const [chatHistory, setChatHistory] = useState([
        { role: 'bot', text: "👋 Hi! I'm your Campus Assistant. Ask me about today's menu, prices, or ratings!" }
    ]);
    const [loading, setLoading] = useState(false);
    const chatEndRef = useRef(null);

    // Auto-scroll to bottom of chat
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chatHistory]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!message.trim()) return;

        const userMsg = { role: 'user', text: message };
        setChatHistory(prev => [...prev, userMsg]);
        setLoading(true);
        setMessage("");

        try {
            const res = await API.post('/ai/chat', { message });
            setChatHistory(prev => [...prev, { role: 'bot', text: res.data.reply }]);
        } catch (err) {
            setChatHistory(prev => [...prev, { role: 'bot', text: "Sorry, I'm having trouble connecting to the kitchen right now! 🔌" }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ position: 'fixed', bottom: '30px', right: '30px', zIndex: 9999, fontFamily: 'Inter, sans-serif' }}>
            {/* --- CHAT WINDOW --- */}
            {isOpen && (
                <div style={{ 
                    width: '350px', height: '500px', background: 'white', borderRadius: '25px', 
                    boxShadow: '0 15px 50px rgba(0,0,0,0.2)', display: 'flex', flexDirection: 'column',
                    overflow: 'hidden', marginBottom: '20px', animation: 'fadeInUp 0.3s ease-out'
                }}>
                    {/* Header */}
                    <div style={{ background: '#800000', color: 'white', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ width: '10px', height: '10px', background: '#10B981', borderRadius: '50%' }}></div>
                            <span style={{ fontWeight: 'bold' }}>Campus Assistant</span>
                        </div>
                        <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '1.2rem' }}>×</button>
                    </div>

                    {/* Chat Body */}
                    <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {chatHistory.map((chat, i) => (
                            <div key={i} style={{ 
                                alignSelf: chat.role === 'user' ? 'flex-end' : 'flex-start',
                                maxWidth: '80%', padding: '12px 16px', borderRadius: '18px',
                                background: chat.role === 'user' ? '#800000' : '#F1F5F9',
                                color: chat.role === 'user' ? 'white' : '#1E293B',
                                fontSize: '0.9rem', lineHeight: '1.4'
                            }}>
                                {chat.text}
                            </div>
                        ))}
                        {loading && <div style={{ color: '#94A3B8', fontSize: '0.8rem', fontStyle: 'italic' }}>AI is thinking...</div>}
                        <div ref={chatEndRef} />
                    </div>

                    {/* Input Area */}
                    <form onSubmit={handleSendMessage} style={{ padding: '15px', borderTop: '1px solid #F1F5F9', display: 'flex', gap: '10px' }}>
                        <input 
                            placeholder="Ask me anything..." 
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            style={{ flex: 1, padding: '10px 15px', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none' }}
                        />
                        <button type="submit" style={{ background: '#800000', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '12px', cursor: 'pointer' }}>
                            ➤
                        </button>
                    </form>
                </div>
            )}

            {/* --- FLOATING BUBBLE BUTTON --- */}
            <button 
                onClick={() => setIsOpen(!isOpen)}
                style={{ 
                    width: '65px', height: '65px', borderRadius: '50%', background: '#800000', color: 'white',
                    border: 'none', cursor: 'pointer', fontSize: '1.8rem', boxShadow: '0 8px 25px rgba(128,0,0,0.3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'transform 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.transform = 'scale(1.1)'}
                onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
            >
                {isOpen ? '💬' : '🤖'}
            </button>

            {/* Animation CSS */}
            <style>{`
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

export default AIChatBot;