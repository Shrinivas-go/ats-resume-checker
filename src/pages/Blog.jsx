import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import styles from './PlaceholderPage.module.css';

/**
 * Blog Page - Placeholder
 * Will contain: Documentation-style layout with sidebar navigation, feature sections
 */
export default function Blog() {
    return (
        <>
            <Navbar />
            <main className={styles.container}>
                <div className={styles.content}>
                    <h1 className={styles.title}>Blog</h1>
                    <p className={styles.description}>
                        Expert tips on resume writing, ATS optimization, and landing your dream job.
                    </p>
                    <div className={styles.placeholder}>
                        <span className={styles.comingSoon}>Coming Soon</span>
                        <p>In-depth articles with documentation-style layout and sidebar navigation.</p>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}
