import { Link } from 'react-router-dom';
import { getRelatedTools, CATEGORIES } from '../../lib/tools';
import { ArrowRight } from 'lucide-react';
import './RelatedTools.css';

interface RelatedToolsProps {
  currentSlug: string;
}

export default function RelatedTools({ currentSlug }: RelatedToolsProps) {
  const related = getRelatedTools(currentSlug, 3);
  if (!related || related.length === 0) return null;

  return (
    <section className="related-tools-section" aria-label="Related Calculators">
      <div className="related-tools-header">
        <div className="related-tools-title-group">
          <span className="related-tools-badge">Explore More</span>
          <h2 className="related-tools-title">Related Calculators & Tools</h2>
        </div>
        <Link to="/all-calculators" className="related-tools-see-all">
          View All 30 Tools <ArrowRight size={16} />
        </Link>
      </div>

      <div className="related-tools-grid">
        {related.map((tool) => {
          const categoryObj = CATEGORIES.find((c) => c.id === tool.category);
          const categoryLabel = categoryObj ? categoryObj.label : tool.category;

          return (
            <Link key={tool.slug} to={`/${tool.slug}`} className="related-tool-card">
              <div className="related-tool-card-header">
                <span className="related-tool-category">{categoryLabel}</span>
                <span className="related-tool-arrow" aria-hidden="true"><ArrowRight size={16} /></span>
              </div>
              <h3 className="related-tool-name">{tool.name}</h3>
              <p className="related-tool-desc">{tool.description}</p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
