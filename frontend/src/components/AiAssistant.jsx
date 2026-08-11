import { useState, useRef, useEffect } from 'react';
import customerApi from '../pages/customer/customerApi';

export default function AiAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'bot',
      text: 'Hi! I can help you find products, compare prices, and discover the best local shops. What are you looking for today?',
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Scroll to bottom of chat
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = async (questionText) => {
    if (!questionText.trim()) return;

    // Add user message
    const userMsgId = Date.now().toString();
    const newMessages = [
      ...messages,
      { id: userMsgId, sender: 'user', text: questionText },
    ];
    setMessages(newMessages);
    setInputValue('');
    setIsLoading(true);

    try {
      const result = await customerApi.askAi(questionText);

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'bot',
          text: result.answer,
          tableData: result.data?.listings || result.data?.products?.flatMap(({ product, listings }) =>
            listings.map((listing) => ({ ...listing, productName: product.name }))
          ) || null,
        },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'bot',
          text: error.message || 'MarketEye could not answer that question right now. Please try again.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Chat Bubble Button */}
      <button
        type="button"
        className="ai-trigger"
        onClick={() => setIsOpen(!isOpen)}
        title="Open AI Assistant"
        aria-label={isOpen ? 'Close MarketEye AI' : 'Open MarketEye AI'}
      >
        <span className="ai-trigger-spark">✦</span>
        <span className="ai-trigger-label">Ask MarketEye</span>
        <span className="ai-trigger-icon">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Custom robot face */}
          <rect x="3" y="11" width="18" height="10" rx="2" />
          <circle cx="12" cy="5" r="2" />
          <path d="M12 7v4M8 15h.01M16 15h.01" />
        </svg>
        </span>
      </button>

      {/* Expandable Chat Card */}
      {isOpen && (
        <div className="ai-chat-card">
          {/* Header */}
          <div className="ai-chat-header">
            <div className="ai-chat-title-group">
              <div className="ai-header-icon">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="11" width="18" height="10" rx="2" />
                  <path d="M12 7v4" />
                </svg>
              </div>
              <div>
                <div className="ai-chat-title">MarketEye AI <span>Beta</span></div>
                <div className="ai-chat-subtitle"><i></i> Online · Ready to help</div>
              </div>
            </div>
            <button
              type="button"
              className="ai-chat-close-btn"
              onClick={() => setIsOpen(false)}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="ai-chat-messages">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`chat-message-row ${
                  msg.sender === 'user' ? 'message-row-user' : 'message-row-bot'
                }`}
              >
                {msg.sender === 'bot' && (
                  <div className="chat-avatar">✦</div>
                )}
                <div
                  className={`chat-bubble ${
                    msg.sender === 'user' ? 'bubble-user' : 'bubble-bot'
                  }`}
                >
                  <div style={{ whiteSpace: 'pre-line' }}>{msg.text}</div>
                  
                  {/* Embedded comparison table if returned by backend API */}
                  {msg.tableData && msg.tableData.length > 0 && (
                    <div className="ai-table-data">
                      {msg.tableData.map((item, idx) => (
                        <div key={idx} className="ai-table-row">
                          <span className="shop-name">
                            {item.productName && <small>{item.productName}<br /></small>}
                            {item.shop?.shopName || 'Shop'}
                          </span>
                          <span className="shop-price">
                            ${item.price?.toFixed(2)}{item.unit ? ` / ${item.unit}` : ''}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="chat-message-row message-row-bot">
                <div className="chat-avatar">✦</div>
                <div className="chat-bubble bubble-bot" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>Thinking</span>
                  <div className="spinner spinner-teal" style={{ width: '12px', height: '12px', borderHeight: '2px' }}></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Footer */}
          <div className="ai-chat-footer">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend(inputValue);
              }}
              className="ai-input-wrapper"
            >
              <input
                type="text"
                className="ai-input"
                placeholder="Ask about prices, trends, or shops..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                disabled={isLoading}
              />
              <button
                type="submit"
                className="ai-send-btn"
                disabled={isLoading || !inputValue.trim()}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

