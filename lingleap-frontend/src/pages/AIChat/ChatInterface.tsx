import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import styles from './ChatInterface.module.css';

// REMOVED: The local import for sarahAvatar.

// This data structure now holds all character info, including avatar URLs.
const characterData: { [key: string]: any } = {
    sarah: {
        name: 'Sarah',
        title: 'Expert in TOEFL preparation',
        // UPDATED: Using a public URL
        avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
        initialMessages: [
            { text: "Hello! I'm Sarah. How can I help you with your TOEFL preparation today?", sender: 'ai' },
        ],
        responses: {
            "hello": "Hi there! What specific part of the TOEFL are you working on today? Reading, Speaking, Writing, or Listening?",
            "speaking": "Great! For speaking, a key tip is to structure your answer. For independent tasks, state your opinion, provide two reasons, and support each with an example. Would you like to practice a prompt?",
            "writing": "For writing, focusing on a clear thesis statement and well-organized paragraphs is crucial. Make sure your examples directly support your main points. We can go over an essay structure if you'd like.",
            "default": "That's an interesting question. While my expertise is TOEFL, I can try to help. Could you elaborate a bit more?"
        }
    },
    mike: {
        name: 'Coach Mike',
        title: 'Interview Expert',
        // UPDATED: Using a public URL
        avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
        initialMessages: [
            { text: "Hi, I'm Mike. Ready to ace that interview? Let's build your confidence together. What kind of interview are you preparing for?", sender: 'ai' },
        ],
        responses: {
            "hello": "Hello! Let's get started. Tell me about the role you're interviewing for.",
            "strength": "When asked about your strengths, use the STAR method: Situation, Task, Action, Result. It provides a clear, evidence-backed answer. Want to try it?",
            "weakness": "For the 'greatest weakness' question, choose a real but manageable weakness and show how you're actively working to improve it. Honesty and self-awareness are key.",
            "default": "Good point. Let's break that down. In any interview situation, the key is to..."
        }
    },
    kate: {
        name: 'Dr. Kate',
        title: 'College Advisor',
        // UPDATED: Using a public URL
        avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
        initialMessages: [
            { text: "Hello, I'm Dr. Kate. Navigating college applications can be tricky, but I'm here to help. Which part of the process is on your mind today?", sender: 'ai' },
        ],
        responses: {
            "hello": "Welcome! I'm happy to help. Are you working on your personal statement, choosing a major, or something else?",
            "essay": "The personal statement is your chance to shine. Focus on a specific story that reveals your character and passion, rather than just listing accomplishments.",
            "major": "Choosing a major is a big decision. Let's talk about your interests, skills, and long-term goals to narrow down the options.",
            "default": "That's a valid concern. Many students feel that way. Let's explore some strategies to address it."
        }
    }
};


const ChatInterface = () => {
    const { character = 'sarah' } = useParams<{ character: string }>();
    const data = characterData[character];

    const [messages, setMessages] = useState(data?.initialMessages || []);
    const [inputValue, setInputValue] = useState('');

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputValue.trim() || !data) return;

        const userMessage = { text: inputValue, sender: 'user' };
        
        const lowerCaseInput = inputValue.toLowerCase();
        let aiResponseText = data.responses.default;
        
        if (lowerCaseInput.includes('hello') || lowerCaseInput.includes('hi')) {
            aiResponseText = data.responses.hello;
        } else if (Object.keys(data.responses).find(key => lowerCaseInput.includes(key))) {
            const foundKey = Object.keys(data.responses).find(key => lowerCaseInput.includes(key));
            if (foundKey) aiResponseText = data.responses[foundKey];
        }

        const aiMessage = { text: aiResponseText, sender: 'ai' };

        setMessages([...messages, userMessage, aiMessage]);
        setInputValue('');
    };

    if (!data) return <div style={{padding: '2rem', textAlign: 'center'}}>Character not found. <Link to="/ai-chat">Go back</Link></div>;

    return (
        <div className={styles.chatContainer}>
            <header className={styles.chatHeader}>
                <img src={data.avatar} alt={data.name} className={styles.headerAvatar} />
                <div>
                    <h2>{data.name}</h2>
                    <p>{data.title}</p>
                </div>
                <Link to="/ai-chat" className={styles.exitButton}>Exit</Link>
            </header>
            <div className={styles.messageList}>
                {messages.map((msg: any, index: number) => (
                    <div key={index} className={`${styles.message} ${styles[msg.sender]}`}>
                        {msg.text}
                    </div>
                ))}
            </div>
            <form className={styles.messageForm} onSubmit={handleSendMessage}>
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder={`Message ${data.name}...`}
                />
                <button type="submit">Send</button>
            </form>
        </div>
    );
};

export default ChatInterface;