import React from 'react';
import { NavLink } from 'react-router-dom';
import styles from './Sidebar.module.css';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
    const { logout, user } = useAuth();
    return (
        <div className={styles.sidebar}>
            <div className={styles.logo}>LLINGOLEAP</div>
            <nav className={styles.nav}>
                <NavLink to="/reading-tasks" className={({isActive}) => isActive ? styles.active : ''}>TOEFL Reading</NavLink>
                <NavLink to="/speaking-tasks" className={({isActive}) => isActive ? styles.active : ''}>TOEFL Speaking</NavLink>
                <NavLink to="/ai-chat" className={({isActive}) => isActive ? styles.active : ''}>AI Chat</NavLink>
                {/* Add other links for Listening, Writing, etc. later */}
            </nav>
            <div className={styles.account}>
                <p>{user?.username}</p>
                <button onClick={logout}>Logout</button>
            </div>
        </div>
    );
};
export default Sidebar;