import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import styles from './Accordion.module.css';

/**
 * Accordion Component
 * FAQ-style expandable sections with smooth animations
 */
export default function Accordion({ items, allowMultiple = false }) {
    const [openItems, setOpenItems] = useState([]);

    const toggleItem = (index) => {
        if (allowMultiple) {
            setOpenItems(prev =>
                prev.includes(index)
                    ? prev.filter(i => i !== index)
                    : [...prev, index]
            );
        } else {
            setOpenItems(prev =>
                prev.includes(index) ? [] : [index]
            );
        }
    };

    return (
        <div className={styles.accordion}>
            {items.map((item, index) => {
                const isOpen = openItems.includes(index);
                return (
                    <div
                        key={index}
                        className={`${styles.accordionItem} ${isOpen ? styles.open : ''}`}
                    >
                        <button
                            className={styles.accordionHeader}
                            onClick={() => toggleItem(index)}
                            aria-expanded={isOpen}
                        >
                            <span className={styles.accordionQuestion}>
                                {item.question}
                            </span>
                            <motion.div
                                className={styles.accordionIcon}
                                animate={{ rotate: isOpen ? 180 : 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                <ChevronDown size={20} />
                            </motion.div>
                        </button>

                        <AnimatePresence initial={false}>
                            {isOpen && (
                                <motion.div
                                    className={styles.accordionContent}
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.25, ease: 'easeInOut' }}
                                >
                                    <div className={styles.accordionAnswer}>
                                        {item.answer}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                );
            })}
        </div>
    );
}
