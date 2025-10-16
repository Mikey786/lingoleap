import React from 'react';
import Header from '../../components/Header/Header';
import styles from './HomePage.module.css';
// TODO: Add your images to src/assets
// import heroImage from '../../assets/hero-image.png'; 
// import studentImage from '../../assets/student-ivanka.png';

const HomePage = () => {
  return (
    <div className={styles.homePage}>
      <Header />
      <main>
        {/* Section 1: Hero */}
        <section className={`${styles.section} ${styles.heroSection}`}>
          <div className={styles.heroContent}>
            <h1>Accelerate Your TOEFL Preparation 5x with AI-Powered Instant Feedback.</h1>
            <p>Boost your scores, refine your language skills, and achieve your study abroad dreams - anytime, anywhere.</p>
            <button className={styles.ctaButton}>Start free practice test</button>
          </div>
          <div className={styles.heroImage}>
            {/* <img src={heroImage} alt="AI Feedback interface" /> */}
            <div className={styles.placeholderImage}>Hero Image Placeholder</div>
          </div>
        </section>

        {/* Section 2: Why Choose LingoLeap (Image 4 & 5) */}
        <section className={styles.section}>
            <h2>Why Choose LingoLeap?</h2>
            <p className={styles.subheading}>LingoLeap offers a revolutionary approach to TOEFL preparation, leveraging artificial intelligence to provide personalized feedback and guidance tailored to individual learning needs.</p>
            <div className={styles.featuresGrid}>
                <div className={styles.featureCard}>
                    <h3>1. Personalized AI Evaluation →</h3>
                    <p>See exactly where you stand with accurate score predictions and tailored tips to boost your TOEFL results.</p>
                </div>
                <div className={styles.featureCard}>
                    <h3>2. Customized High-Score Answers →</h3>
                    <p>Get personalized feedback on your answers, helping you learn how to write strong responses based on your own ideas.</p>
                </div>
                 <div className={styles.featureCard}>
                    <h3>3. Comprehensive Resources →</h3>
                    <p>Practice 1000+ free TOEFL questions, customized high-score answers, and a realistic mock test environment.</p>
                </div>
                 <div className={styles.featureCard}>
                    <h3>4. Ideas & Vocabulary Boost →</h3>
                    <p>Expand your ideas and vocabulary to express yourself fluently and persuasively.</p>
                </div>
            </div>
        </section>

        {/* Section 3: Testimonials (Image 6) */}
        <section className={`${styles.section} ${styles.testimonialSection}`}>
            <h2>See What Students are Saying about LingoLeap</h2>
            <div className={styles.testimonialCard}>
                 <div className={styles.testimonialImage}>
                    {/* <img src={studentImage} alt="Student Ivanka" /> */}
                     <div className={styles.placeholderImageSmall}>Student Image</div>
                 </div>
                 <div className={styles.testimonialContent}>
                    <h4>Ivanka</h4>
                    <p>"I used LingoLeap.AI to improve my TOEFL writing, focusing on effective essay structuring, refining sentences, and generating compelling examples to support my arguments. I found the Mind Map feature particularly valuable... Thanks to LingoLeap, I felt more confident and ultimately scored 28 in the writing section of my TOEFL exam."</p>
                 </div>
            </div>
        </section>
      </main>
    </div>
  );
};

export default HomePage;