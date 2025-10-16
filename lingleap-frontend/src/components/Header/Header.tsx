import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Header.module.css';
import { useAuth } from '../../context/AuthContext';

const Header = () => {
    const { isAuthenticated, logout } = useAuth();

    return (
        <header className={styles.header}>
            <div className={styles.container}>
                <Link to="/" className={styles.logo}>LingoLeap</Link>
                <nav className={styles.nav}>
                    <Link to="/ai-chat">AI Chat</Link>
                    <Link to="/reading-tasks">Mock Test</Link>
                    <Link to="#">Tools</Link>
                    <Link to="#">Pricing</Link>
                    <Link to="#">Blog</Link>
                </nav>
                <div className={styles.authButtons}>
                    {isAuthenticated ? (
                         <button onClick={logout} className={styles.loginBtn}>Logout</button>
                    ) : (
                        <>
                            <Link to="/login" className={styles.loginBtn}>Login</Link>
                            <Link to="/register" className={styles.startFreeBtn}>Start Free Trial</Link>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;