import { Link } from 'react-router-dom';
import PageTransition, { FadeIn } from '@/components/ui/PageTransition';
import SEO from '@/components/ui/SEO';
import Card from '@/components/ui/Card';
import ToolIcon from '@/components/ui/ToolIcon';
import { TOOLS, CATEGORIES } from '@/lib/tools';

export default function AllCalculators() {
  // Group tools by category (excluding 'all' category)
  const categories = CATEGORIES.filter(c => c.id !== 'all');

  return (
    <PageTransition className="page-medium">
      <SEO
        title="All Calculators — Browse 30 Free Tools"
        description="Browse our full directory of 30 free online calculators and tools. Access high-quality, ad-free utilities for math, health, conversion, time tracking, and education."
        path="/all-calculators"
      />

      <div className="tool-header">
        <div className="eyebrow">Directory</div>
        <h1 className="page-title">All Calculators</h1>
        <p className="page-lede">
          Browse our complete collection of 30 free online tools and calculators. 
          No accounts, no advertisements — just fast, private, and precise computations.
        </p>
      </div>

      <FadeIn>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '40px', marginTop: '24px' }}>
          {categories.map(cat => {
            const catTools = TOOLS.filter(t => t.category === cat.id);
            if (catTools.length === 0) return null;

            return (
              <section key={cat.id} aria-labelledby={`cat-title-${cat.id}`}>
                <h2 
                  id={`cat-title-${cat.id}`}
                  style={{ 
                    fontSize: '1.25rem', 
                    fontWeight: 700, 
                    marginBottom: '16px',
                    color: 'var(--text)',
                    borderBottom: '1px solid var(--border)',
                    paddingBottom: '8px'
                  }}
                >
                  {cat.label}
                </h2>
                
                <div className="grid-2">
                  {catTools.map(tool => (
                    <Link
                      key={tool.slug}
                      to={`/${tool.slug}`}
                      style={{ display: 'block', textDecoration: 'none' }}
                      id={`card-${tool.slug}`}
                    >
                      <Card hover style={{ height: '100%', display: 'flex', alignItems: 'flex-start', gap: '16px', padding: '20px' }}>
                        <div 
                          style={{ 
                            padding: '10px', 
                            borderRadius: 'var(--radius-md)', 
                            background: 'var(--bg-hover)',
                            color: 'var(--accent)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}
                        >
                          <ToolIcon icon={tool.icon} size={20} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text)', margin: 0 }}>
                            {tool.name}
                          </h3>
                          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                            {tool.description}
                          </p>
                        </div>
                      </Card>
                    </Link>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </FadeIn>
    </PageTransition>
  );
}
