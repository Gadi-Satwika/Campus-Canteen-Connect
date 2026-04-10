import React, { useState, useEffect, useRef } from 'react';
import API from '../api';

const AIChatBot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState("");
    const [chatHistory, setChatHistory] = useState([
        { role: 'bot', text: "👋 Hi! I'm your Campus Assistant. Ask me about today's menu, prices, or ratings!" }
    ]);
    const [loading, setLoading] = useState(false);
    const chatEndRef = useRef(null);

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
        <div style={{ 
            position: 'fixed', 
            bottom: '20px', 
            right: '20px', 
            zIndex: 9999, 
            fontFamily: 'Inter, sans-serif',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end'
        }}>
            {/* --- CHAT WINDOW --- */}
            {isOpen && (
                <div style={{ 
                    width: '90vw',          /* Mobile friendly width */
                    maxWidth: '350px',      /* Desktop cap */
                    height: '70vh',         /* Responsive height */
                    maxHeight: '500px', 
                    background: 'white', 
                    borderRadius: '20px', 
                    boxShadow: '0 10px 30px rgba(0,0,0,0.25)', 
                    display: 'flex', 
                    flexDirection: 'column',
                    overflow: 'hidden', 
                    marginBottom: '15px', 
                    animation: 'fadeInUp 0.3s ease-out'
                }}>
                    {/* Header */}
                    <div style={{ background: '#800000', color: 'white', padding: '15px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ width: '8px', height: '8px', background: '#10B981', borderRadius: '50%' }}></div>
                            <span style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>Assistant</span>
                        </div>
                        <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '1.5rem', lineHeight: '1' }}>×</button>
                    </div>

                    {/* Chat Body */}
                    <div style={{ flex: 1, padding: '15px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', background: '#fcfcfc' }}>
                        {chatHistory.map((chat, i) => (
                            <div key={i} style={{ 
                                alignSelf: chat.role === 'user' ? 'flex-end' : 'flex-start',
                                maxWidth: '85%', 
                                padding: '10px 14px', 
                                borderRadius: chat.role === 'user' ? '18px 18px 0 18px' : '18px 18px 18px 0',
                                background: chat.role === 'user' ? '#800000' : '#E2E8F0',
                                color: chat.role === 'user' ? 'white' : '#1E293B',
                                fontSize: '0.85rem', 
                                boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
                            }}>
                                {chat.text}
                            </div>
                        ))}
                        {loading && <div style={{ color: '#94A3B8', fontSize: '0.75rem', paddingLeft: '5px' }}>Thinking...</div>}
                        <div ref={chatEndRef} />
                    </div>

                    {/* Input Area */}
                    <form onSubmit={handleSendMessage} style={{ padding: '12px', borderTop: '1px solid #eee', display: 'flex', gap: '8px', background: 'white' }}>
                        <input 
                            placeholder="Type a message..." 
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            style={{ 
                                flex: 1, 
                                padding: '10px', 
                                borderRadius: '10px', 
                                border: '1px solid #ddd', 
                                outline: 'none',
                                fontSize: '0.9rem' 
                            }}
                        />
                        <button type="submit" style={{ background: '#800000', color: 'white', border: 'none', padding: '0 15px', borderRadius: '10px', cursor: 'pointer' }}>
                            ➤
                        </button>
                    </form>
                </div>
            )}

            {/* --- FLOATING BUBBLE BUTTON --- */}
            <button 
                onClick={() => setIsOpen(!isOpen)}
                style={{ 
                    width: '55px', height: '55px', borderRadius: '50%', background: '#800000', color: 'white',
                    border: 'none', cursor: 'pointer', fontSize: '1.5rem', boxShadow: '0 5px 15px rgba(128,0,0,0.4)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}
            >
                {isOpen ? '❌' : '🤖'}
            </button>

            <style>{`
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

export default AIChatBot;