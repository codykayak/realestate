import { Component } from 'react';
import styles from '../pm.module.css';

/**
 * Catches render errors in a page so a single broken view shows a readable
 * message (with the error text) instead of a blank screen, while the sidebar
 * stays usable. Resets when the route changes (keyed by location in the parent).
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('[property-management] page error:', error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div className={styles.content}>
          <div className={`${styles.banner} ${styles.bannerRed}`} style={{ alignItems: 'flex-start' }}>
            <div>
              <strong>Something went wrong rendering this page.</strong>
              <div className={styles.hint} style={{ marginTop: 6, whiteSpace: 'pre-wrap' }}>
                {String(this.state.error?.message || this.state.error)}
              </div>
              <button
                className={`${styles.btn} ${styles.btnSm}`}
                style={{ marginTop: 12 }}
                onClick={() => this.setState({ error: null })}
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
