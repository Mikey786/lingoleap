import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import styles from './TasksPage.module.css';

interface Task {
    id: number;
    title: string;
}

const ReadingTasksPage = () => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const response = await api.get('/tasks/reading/');
                setTasks(response.data);
            } catch (err) {
                setError('Failed to load tasks.');
            } finally {
                setLoading(false);
            }
        };
        fetchTasks();
    }, []);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div className={styles.tasksPage}>
            <header className={styles.header}>
                <h1>TOEFL Reading</h1>
                {/* Add filters here if needed */}
            </header>
            <div className={styles.tasksGrid}>
                {tasks.map(task => (
                    <div key={task.id} className={styles.taskCard}>
                        <h3>{task.title}</h3>
                        <p>Practice reading comprehension based on this topic.</p>
                        <Link to={`/reading-test/${task.id}`} className={styles.practiceButton}>
                            Practice
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ReadingTasksPage;