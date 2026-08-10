import { Link } from 'react-router-dom';
import SEO from '../components/ui/SEO';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import RelatedTools from '../components/ui/RelatedTools';
import './WatchPage.css';

export default function ScientificCalculatorWatch() {
  const youtubeId = 'HnB0w2Zs1Ug';
  const embedUrl = `https://www.youtube.com/embed/${youtubeId}`;
  const thumbnailUrl = `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`;

  return (
    <div className="watch-page-container">
      <SEO
        title="Scientific Calculator Video Tutorial"
        description="Watch our complete video guide on how to perform scientific calculations, trigonometry, logarithms, powers, and memory recall on CalcHub."
        path="/watch/scientific-calculator"
        type="video.other"
        image={thumbnailUrl}
        breadcrumbSchema={[
          { name: 'Home', path: '/' },
          { name: 'Scientific Calculator', path: '/scientific-calculator' },
          { name: 'Video Tutorial', path: '/watch/scientific-calculator' },
        ]}
        videoSchema={{
          name: 'How to Use Free Online Scientific Calculator — CalcHub Tutorial',
          description: 'Learn how to use CalcHub\'s free online scientific calculator for trigonometry, logarithms, powers, roots, memory recall, and scientific notation.',
          thumbnailUrl: thumbnailUrl,
          uploadDate: '2026-08-09',
          duration: 'PT0M45S',
          embedUrl: embedUrl,
          contentUrl: `https://youtu.be/${youtubeId}`,
          clips: [
            { name: 'Meet CalcHub — a smarter way to calculate.', startOffset: 0, endOffset: 4 },
            { name: 'Calculate with precision, without the complexity.', startOffset: 4, endOffset: 8 },
            { name: 'Go beyond basic math with powerful scientific functions.', startOffset: 8, endOffset: 12 },
            { name: 'Everything you need — trigonometry, memory, history.', startOffset: 12, endOffset: 16 },
            { name: 'Powerful, without the complexity — a clean interface.', startOffset: 16, endOffset: 20 },
            { name: 'Calculate smarter. CalcHub — simplified.', startOffset: 20, endOffset: 45 },
          ]
        }}
      />

      <div className="container">
        <Breadcrumbs
          items={[
            { name: 'Home', url: '/' },
            { name: 'Scientific Calculator', url: '/scientific-calculator' },
            { name: 'Video Tutorial' },
          ]}
        />

        <div className="watch-page-header">
          <span className="watch-badge">VIDEO TUTORIAL</span>
          <h1 className="watch-title page-title">How to Use the Free Scientific Calculator</h1>
          <p className="watch-subtitle">
            Master trigonometric functions, logarithms, powers, roots, and memory recall in under 1 minute.
          </p>
        </div>

        {/* MAIN CONTENT: 100% Video Player */}
        <div className="watch-player-wrapper">
          <iframe
            className="watch-player-iframe"
            src={`${embedUrl}?autoplay=0&rel=0&modestbranding=1`}
            title="How to Use Free Online Scientific Calculator — CalcHub Tutorial"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>

        {/* PRIMARY CALL TO ACTION BUTTON */}
        <div className="watch-cta-banner">
          <div className="watch-cta-text">
            <h3>Ready to calculate?</h3>
            <p>Use CalcHub's free, blazing-fast interactive scientific calculator now.</p>
          </div>
          <Link to="/scientific-calculator" className="watch-cta-button">
            Launch Scientific Calculator Tool &rarr;
          </Link>
        </div>

        {/* VIDEO CHAPTERS & TIMESTAMPS */}
        <div className="watch-details-grid">
          <div className="watch-chapters-card">
            <h2>⏱️ Key Moments & Chapters</h2>
            <ul className="watch-chapters-list">
              <li>
                <span className="timestamp">0:00</span>
                <span>Meet CalcHub — a smarter way to calculate.</span>
              </li>
              <li>
                <span className="timestamp">0:04</span>
                <span>Calculate with precision, without the complexity.</span>
              </li>
              <li>
                <span className="timestamp">0:08</span>
                <span>Go beyond basic math with powerful scientific functions.</span>
              </li>
              <li>
                <span className="timestamp">0:12</span>
                <span>Everything you need — trigonometry, memory, history.</span>
              </li>
              <li>
                <span className="timestamp">0:16</span>
                <span>Powerful, without the complexity — a clean interface designed for faster calculations.</span>
              </li>
              <li>
                <span className="timestamp">0:20</span>
                <span>Calculate smarter. CalcHub — your scientific calculator, simplified.</span>
              </li>
            </ul>
          </div>

          <div className="watch-overview-card">
            <h2>💡 What You'll Learn</h2>
            <p>
              CalcHub's Scientific Calculator is designed for students, engineers, and researchers needing fast, precision math computations without cumbersome software downloads or sign-ups.
            </p>
            <ul className="watch-features-list">
              <li>⚡ <strong>Instant Evaluation:</strong> Live expression parsing as you type.</li>
              <li>🔒 <strong>100% Private:</strong> All calculations happen locally inside your browser.</li>
              <li>📱 <strong>PWA Ready:</strong> Works offline on mobile and desktop devices.</li>
            </ul>
          </div>
        </div>

        {/* CROSS-LINKING GRID */}
        <div style={{ marginTop: '48px' }}>
          <RelatedTools currentSlug="scientific-calculator" />
        </div>
      </div>
    </div>
  );
}
