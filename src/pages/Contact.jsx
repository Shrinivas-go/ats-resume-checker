import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import styles from './PlaceholderPage.module.css';

/**
 * Contact Page - Placeholder
 * Will contain: Contact form, social links, office info
 */
export default function Contact() {
    return (
        <>
            <Navbar />
            <main className={styles.container}>
                <div className={styles.content}>
                    <h1 className={styles.title}>Contact Us</h1>
                    <p className={styles.description}>
                        Have questions? We'd love to hear from you.
                    </p>
                    <div className={styles.placeholder}>
                        <span className={styles.comingSoon}>Coming Soon</span>
                        <p>Contact form and social links.</p>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}
