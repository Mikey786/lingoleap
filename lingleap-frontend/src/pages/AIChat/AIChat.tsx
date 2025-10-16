import React from 'react';
import { Link } from 'react-router-dom';
import styles from './AIChat.module.css';

// REMOVED: The local image imports that were causing the error.

const characters = [
    { 
        id: 'sarah', 
        name: 'Sarah, Your TOEFL Teacher', 
        description: 'Expert in TOEFL preparation with 10+ years of experience.', 
        // UPDATED: Using a public URL for the avatar image
        avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' 
    },
    { 
        id: 'mike', 
        name: 'Coach Mike, Interview Expert', 
        description: 'Your dedicated interview preparation guide and confidence builder.', 
        // UPDATED: Using a public URL for the avatar image
        avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' 
    },
    { 
        id: 'kate', 
        name: 'Dr. Kate, College Advisor', 
        description: 'Your expert US & UK college advisor for academic success.', 
        // UPDATED: Using a public URL for the avatar image
        avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' 
    },
];

const AIChatPage = () => {
    return (
        <div className={styles.selectionContainer}>
            <h1>How can I help you today?</h1>
            <div className={styles.characterGrid}>
                {characters.map(char => (
                    <div key={char.id} className={styles.characterCard}>
                        {/* The img tag works perfectly with URLs */}
                        <img src={char.avatar} alt={char.name} className={styles.avatar} />
                        <h3>{char.name}</h3>
                        <p>{char.description}</p>
                        <Link to={`/ai-chat/${char.id}`} className={styles.chatButton}>
                            Chat now
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AIChatPage;