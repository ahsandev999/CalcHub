import { Link } from 'react-router-dom';
import PageTransition, { FadeIn } from '@/components/ui/PageTransition';
import SEO from '@/components/ui/SEO';
import Card from '@/components/ui/Card';

export default function About() {
  return (
    <PageTransition className="page-medium">
      <SEO title="About CalcHub" description="Learn about CalcHub — premium free calculators and tools." path="/about" />
      <div className="tool-header">
        <div className="eyebrow">About</div>
        <h1 className="page-title">Built for precision.</h1>
        <p className="page-lede">CalcHub is a collection of beautiful, free calculators designed for everyday questions — no sign-up, no clutter.</p>
      </div>
      <FadeIn>
        <Card padding="lg">
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 12 }}>What we do</h2>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 20 }}>
            Every tool on CalcHub does one job exceptionally well. From scientific calculations to sleep optimization,
            age tracking to unit conversions — each calculator is crafted with attention to accuracy, design, and usability.
          </p>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 12 }}>Privacy first</h2>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 20 }}>
            All calculations run entirely in your browser. Your data never leaves your device.
            Read our <Link to="/privacy" style={{ color: 'var(--accent)' }}>Privacy Policy</Link> for details.
          </p>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 12 }}>Free forever</h2>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
            CalcHub is and will always be free. No accounts, no subscriptions, no hidden costs.
          </p>
        </Card>
      </FadeIn>
    </PageTransition>
  );
}
