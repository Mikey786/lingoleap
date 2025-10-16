import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import styles from './ReadingTestPage.module.css';

interface Option { [key: string]: string; }
interface Question {
    id: number;
    question_text: string;
    options: Option;
    correct_answer_key: string;
}
interface TestData {
    title: string;
    passage: string;
    questions: Question[];
}
type UserAnswers = { [key: string]: string };

const ReadingTestPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [testData, setTestData] = useState<TestData | null>(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [userAnswers, setUserAnswers] = useState<UserAnswers>({});
    const [score, setScore] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    // --- FIX: Add state to track the ID of the currently loaded test ---
    const [loadedTestId, setLoadedTestId] = useState<string | null>(null);

    useEffect(() => {
        const fetchTest = async () => {
            // Reset state for the new test
            setLoading(true);
            setError('');
            setTestData(null);

            try {
                const response = await api.get(`/generate/reading/${id}/`);
                setTestData(response.data);
                setLoadedTestId(id!); // Mark this test ID as loaded
            } catch (err) {
                setError('Failed to load the test. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        // --- FIX: Only fetch if the component is loading a new test ID ---
        // This condition prevents the re-fetch caused by React's Strict Mode.
        if (loadedTestId !== id) {
            fetchTest();
        }

    }, [id, loadedTestId]); // Add loadedTestId to the dependency array

    const handleOptionSelect = (questionId: number, optionKey: string) => {
        setUserAnswers(prev => ({ ...prev, [questionId]: optionKey }));
    };

    const handleNext = () => {
        if (testData && currentQuestionIndex < testData.questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        }
    };

    const handleBack = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prev => prev - 1);
        }
    };

    const handleSubmit = async () => {
        if (!testData) return;
        const correctAnswers = testData.questions.reduce((acc, q) => {
            acc[q.id.toString()] = q.correct_answer_key;
            return acc;
        }, {} as { [key: string]: string });

        try {
            const response = await api.post('/submit/reading/', { userAnswers, correctAnswers });
            setScore(response.data.score);
        } catch (err) {
            setError('Failed to submit your answers.');
        }
    };

    // Show loading indicator when a new test is being fetched
    if (loading || !testData) return <div className={styles.centered}>Loading test...</div>;
    if (error) return <div className={styles.centered}>{error}</div>;

    if (score !== null) {
        return (
            <div className={styles.resultsContainer}>
                <h2>Test Completed!</h2>
                <p className={styles.score}>Your Score: {score} / {testData.questions.length}</p>
                <button onClick={() => navigate('/reading-tasks')} className={styles.navButton}>Back to Tasks</button>
            </div>
        );
    }
    
    const currentQuestion = testData.questions[currentQuestionIndex];

    return (
        <div className={styles.testContainer}>
            <header className={styles.testHeader}>
                <h2>{testData.title}</h2>
                <div className={styles.questionNav}>
                    <span>Question {currentQuestionIndex + 1} of {testData.questions.length}</span>
                    <button onClick={handleBack} disabled={currentQuestionIndex === 0}>Back</button>
                    <button onClick={handleNext} disabled={currentQuestionIndex === testData.questions.length - 1}>Next</button>
                </div>
            </header>
            <div className={styles.testLayout}>
                <div className={styles.passageContainer}>
                    <p>{testData.passage}</p>
                </div>
                <div className={styles.questionContainer}>
                    <p className={styles.questionText}>{currentQuestion.question_text}</p>
                    <div className={styles.options}>
                        {Object.entries(currentQuestion.options).map(([key, value]) => (
                            <label key={key} className={`${styles.optionLabel} ${userAnswers[currentQuestion.id] === key ? styles.selected : ''}`}>
                                <input
                                    type="radio"
                                    name={`question-${currentQuestion.id}`}
                                    value={key}
                                    checked={userAnswers[currentQuestion.id] === key}
                                    onChange={() => handleOptionSelect(currentQuestion.id, key)}
                                />
                                {key}. {value}
                            </label>
                        ))}
                    </div>
                </div>
            </div>
            {currentQuestionIndex === testData.questions.length - 1 && (
                 <button onClick={handleSubmit} className={styles.submitButton}>Submit Test</button>
            )}
        </div>
    );
};

export default ReadingTestPage;