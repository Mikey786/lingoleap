import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import styles from './SpeakingTest.module.css';

type TestStatus = 'loading' | 'ready' | 'preparing' | 'recording' | 'finished_recording' | 'submitting' | 'results' | 'error';

const PREP_TIME = 15;
const RECORD_TIME = 45;

const SpeakingTestPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [status, setStatus] = useState<TestStatus>('loading');
    const [topic, setTopic] = useState('');
    const [error, setError] = useState('');
    const [timer, setTimer] = useState(PREP_TIME);
    const [feedback, setFeedback] = useState({ score: '', transcript: '', feedback: '' });

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const timerIntervalRef = useRef<number | null>(null);

    useEffect(() => {
        const fetchTopic = async () => {
            try {
                const response = await api.get(`/generate/speaking/${id}/`);
                setTopic(response.data.topic);
                setStatus('ready');
            } catch (err) {
                setError('Failed to load topic.');
                setStatus('error');
            }
        };
        fetchTopic();
    }, [id]);

    useEffect(() => {
        return () => {
            if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
        };
    }, []);

    const startTimer = (duration: number, onComplete: () => void) => {
        setTimer(duration);
        if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = window.setInterval(() => {
            setTimer(prev => {
                if (prev <= 1) {
                    clearInterval(timerIntervalRef.current!);
                    onComplete();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const handleStartPreparation = () => {
        setStatus('preparing');
        startTimer(PREP_TIME, handleStartRecording);
    };

    const handleStartRecording = async () => {
        setStatus('recording');
        audioChunksRef.current = [];
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            mediaRecorderRef.current.ondataavailable = (event) => {
                audioChunksRef.current.push(event.data);
            };
            mediaRecorderRef.current.onstop = handleSubmit;
            mediaRecorderRef.current.start();
            startTimer(RECORD_TIME, handleStopRecording);
        } catch (err) {
            setError('Could not access microphone.');
            setStatus('error');
        }
    };

    const handleStopRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.stop();
            setStatus('finished_recording');
        }
    };

    const handleSubmit = async () => {
        setStatus('submitting');
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const formData = new FormData();
        formData.append('audio', audioBlob, 'recording.webm');

        try {
            const response = await api.post(`/submit/speaking/${id}/`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setFeedback(response.data);
            setStatus('results');
        } catch (err) {
            setError('Failed to submit recording.');
            setStatus('error');
        }
    };

    const renderContent = () => {
        switch (status) {
            case 'loading': return <div>Loading...</div>;
            case 'error': return <div>Error: {error}</div>;
            case 'ready':
                return (
                    <>
                        <p className={styles.question}>{topic}</p>
                        <button className={styles.actionButton} onClick={handleStartPreparation}>Start Preparation</button>
                    </>
                );
            case 'preparing':
                return (
                    <>
                        <p className={styles.question}>{topic}</p>
                        <div className={styles.timerBox}>
                            <p>Preparation Time</p>
                            <p className={styles.timer}>{timer}s</p>
                        </div>
                    </>
                );
            case 'recording':
                 return (
                    <>
                        <p className={styles.question}>{topic}</p>
                        <div className={styles.timerBox}>
                            <p>Recording...</p>
                            <p className={styles.timer}>{timer}s</p>
                        </div>
                        <button className={styles.stopButton} onClick={handleStopRecording}>Stop Recording</button>
                    </>
                );
            case 'finished_recording':
            case 'submitting':
                return <div>Submitting your response...</div>;
            case 'results':
                return (
                    <div className={styles.results}>
                        <h2>Evaluation Results</h2>
                        <div className={styles.resultCard}>
                            <h3>Score: {feedback.score}/30</h3>
                        </div>
                         <div className={styles.resultCard}>
                            <h3>Transcript</h3>
                            <p>{feedback.transcript}</p>
                        </div>
                        <div className={styles.resultCard}>
                            <h3>Feedback</h3>
                            <p style={{whiteSpace: 'pre-wrap'}}>{feedback.feedback}</p>
                        </div>
                        <button className={styles.actionButton} onClick={() => navigate('/speaking-tasks')}>Back to Tasks</button>
                    </div>
                );
        }
    };

    return (
        <div className={styles.speakingTestContainer}>
            <div className={styles.contentBox}>
                <h1>Speaking Practice</h1>
                {renderContent()}
            </div>
        </div>
    );
};

export default SpeakingTestPage;