import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import styles from './PlaceholderPage.module.css';

/**
 * About Page - Placeholder
 * Will contain: Company info, mission, team
 */
export default function About() {
    return (
        <>
            <Navbar />
            <main className={styles.container}>
                <div className={styles.content}>
                    <h1 className={styles.title}>About Us</h1>
                    <p className={styles.description}>
                        We help job seekers optimize their resumes for ATS systems.
                    </p>
                    <div className={styles.placeholder}>
                        <span className={styles.comingSoon}>Coming Soon</span>
                        <p>Our mission, story, and team.</p>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}
