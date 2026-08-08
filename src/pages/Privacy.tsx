import PageTransition, { FadeIn } from '@/components/ui/PageTransition';
import SEO from '@/components/ui/SEO';
import Card from '@/components/ui/Card';
import Breadcrumbs from '@/components/ui/Breadcrumbs';

const privacyBreadcrumbs = {
  visual: [{ name: 'Home', url: '/' }, { name: 'Privacy Policy' }],
  schema: [{ name: 'Home', path: '/' }, { name: 'Privacy Policy', path: '/privacy' }],
};

export default function Privacy() {
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <PageTransition className="page-medium">
      <SEO title="Privacy Policy" description="CalcHub privacy policy — your data stays on your device." path="/privacy" breadcrumbSchema={privacyBreadcrumbs.schema} />
      <Breadcrumbs items={privacyBreadcrumbs.visual} />
      <div className="tool-header">
        <div className="eyebrow">Privacy</div>
        <h1 className="page-title">Privacy Policy</h1>
        <p className="page-lede">Last updated: {today}</p>
      </div>
      <FadeIn>
        <Card padding="lg">
          <h2 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: 8 }}>Your data stays local</h2>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 20 }}>
            Every calculation on CalcHub runs entirely in your browser. Dates, numbers, and inputs are never sent to any server.
            History and preferences are stored in your browser's local storage only.
          </p>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: 8 }}>Local storage</h2>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 20 }}>
            We use localStorage to save your theme preference, calculation history, and recently used tools.
            This data remains on your device and can be cleared at any time through your browser settings.
          </p>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: 8 }}>No tracking</h2>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 20 }}>
            CalcHub does not use analytics, advertising, or third-party tracking of any kind.
          </p>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: 8 }}>Contact</h2>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
            Questions about this policy can be directed through the About page.
          </p>
        </Card>
      </FadeIn>
    </PageTransition>
  );
}
