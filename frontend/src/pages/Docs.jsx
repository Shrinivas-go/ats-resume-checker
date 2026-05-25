import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import styles from './PlaceholderPage.module.css';

/**
 * Docs Page - Placeholder
 * Will contain: API documentation, integration guides
 */
export default function Docs() {
    return (
        <>
            <Navbar />
            <main className={styles.container}>
                <div className={styles.content}>
                    <h1 className={styles.title}>Documentation</h1>
                    <p className={styles.description}>
                        Learn how to get the most out of ATS Checker.
                    </p>
                    <div className={styles.placeholder}>
                        <span className={styles.comingSoon}>Coming Soon</span>
                        <p>Guides, tutorials, and API documentation.</p>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}
