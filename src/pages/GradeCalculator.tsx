import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { getBreadcrumbsForTool } from '@/lib/tools';
import { useState } from 'react';

import FAQAccordion, { type FAQItem } from '@/components/ui/FAQAccordion';
import PageTransition from '@/components/ui/PageTransition';
import SEO from '@/components/ui/SEO';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import ResultDisplay from '@/components/ui/ResultDisplay';
import { useToolTracking } from '@/hooks/useScroll';
import { addHistory } from '@/lib/storage';
import '@/styles/components.css';

const letterGrade = (percentage: number) => {
  if (percentage >= 90) return 'A';
  if (percentage >= 80) return 'B';
  if (percentage >= 70) return 'C';
  if (percentage >= 60) return 'D';
  return 'F';
};

const gradeCalculatorFAQ: FAQItem[] = [
  {
    "question": "How does a weighted grade work?",
    "answer": "A weighted grade means different assessments have different impacts on your final score. For example, a final exam worth 50% affects your grade as much as five homework assignments worth 10% each."
  },
  {
    "question": "What does it mean if my weights don't sum to 100%?",
    "answer": "If your category weights do not sum to 100%, the calculator normalises the weights so they proportionally sum to 100% based on the relative weights you entered."
  },
  {
    "question": "How do I calculate what I need on my final exam?",
    "answer": "Subtract your current weighted grade from your target course grade, and divide by the weight of the final exam. This tells you the minimum exam score required to achieve your goal."
  },
  {
    "question": "What is a GP / grade point?",
    "answer": "A grade point is a numeric value (usually 0 to 4.0) assigned to your final letter grade, which is then used to calculate your overall Grade Point Average (GPA)."
  },
  {
    "question": "How do I input a category grade that is not out of 100?",
    "answer": "Convert the score to a percentage first. For example, if you scored 18 out of 25 on a quiz, enter the score as 72% (18 ÷ 25 × 100)."
  }
];

export default function GradeCalculator() {
  const breadcrumbs = getBreadcrumbsForTool('grade-calculator');
  useToolTracking('grade-calculator', 'Grade Calculator');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [assignments, setAssignments] = useState([{ score: '', weight: '' }]);
  const [result, setResult] = useState<{ percentage: number; letter: string } | null>(null);

  const addAssignment = () => setAssignments([...assignments, { score: '', weight: '' }]);
  const removeAssignment = (index: number) => {
    const next = assignments.filter((_, i) => i !== index);
    setAssignments(next);
    setResult(null);
  };
  const updateAssignment = (index: number, field: 'score' | 'weight', value: string) => {
    const next = [...assignments];
    next[index][field] = value;
    setAssignments(next);
    setValidationError(null);
  };

  const calculate = (overrideAssignments?: typeof assignments) => {
    const list = overrideAssignments !== undefined ? overrideAssignments : assignments;
    const totalWeight = list.reduce((sum, item) => sum + Number(item.weight || 0), 0);
    if (!list.length || totalWeight <= 0) {
      setValidationError('Enter valid weights for the assignments.');
      return;
    }

    setValidationError(null);
    const weighted = list.reduce((sum, item) => sum + Number(item.score || 0) * Number(item.weight || 0), 0);
    const finalPercent = weighted / totalWeight;
    const nextResult = { percentage: Number(finalPercent.toFixed(2)), letter: letterGrade(finalPercent) };
    setResult(nextResult);
    addHistory({
      tool: 'Grade Calculator',
      toolSlug: 'grade-calculator',
      expression: `${list.length} assignments`,
      result: `${nextResult.percentage}%`,
    });
  };

  const fillExample = () => {
    const exAssignments = [
      { score: '90', weight: '20' },
      { score: '85', weight: '30' },
      { score: '95', weight: '50' },
    ];
    setAssignments(exAssignments);
    setValidationError(null);
    calculate(exAssignments);
  };

  return (
    <PageTransition className="page-medium">
      <SEO
        title="Free Grade Calculator" description="Calculate your weighted class grade percentage and target final exam score with this free online tool." path="/grade-calculator" faqSchema={gradeCalculatorFAQ} 
        breadcrumbSchema={breadcrumbs?.schema}
      />
      <Breadcrumbs items={breadcrumbs?.visual || []} />
      <div className="tool-header">
        <div className="eyebrow">Education</div>
        <h1 className="page-title">Grade Calculator</h1>
        <p className="page-lede">Enter assignment scores and weights to calculate a final weighted grade.</p>
      </div>
      <Card padding="lg">
        {assignments.map((item, index) => (
          <div key={index} className="grid-2" style={{ marginBottom: 12 }}>
            <Input label="Score (%)" type="number" value={item.score} onChange={(e) => updateAssignment(index, 'score', e.target.value)} min="0" max="100" placeholder="e.g. 90" />
            <Input label="Weight (%)" type="number" value={item.weight} onChange={(e) => updateAssignment(index, 'weight', e.target.value)} min="0" placeholder="e.g. 20" />
            <Button variant="ghost" onClick={() => removeAssignment(index)} style={{ marginTop: 8 }}>Remove</Button>
          </div>
        ))}
        <Button variant="secondary" onClick={addAssignment} style={{ width: '100%', marginBottom: 12 }}>Add Assignment</Button>
        {validationError && <p className="input-message input-message-error" role="alert">{validationError}</p>}
        <Button onClick={() => calculate()} magnetic style={{ width: '100%' }}>Calculate Grade</Button>
        <button className="btn-demo-fill" onClick={fillExample}>Try Example</button>
        <ResultDisplay
          visible={!!result}
          highlight={result ? `${result.percentage}%` : undefined}
          subtitle={result ? result.letter : undefined}
          slots={result ? [
            { label: 'Final Weighted Grade', value: `${result.percentage}%` },
            { label: 'Letter Grade', value: result.letter },
          ] : []}
        />
      </Card>
          {/* ── SEO Content Sections ── */}
      <div className="seo-content">

        <section className="seo-section">
          <h2>How the Grade Calculator Works</h2>
          <p>This grade calculator computes your overall course grade by calculating a weighted average of your scores across different assessment categories (such as assignments, exams, and quizzes). Select the weight percentage for each category and input your score.</p>
        </section>

        <section className="seo-section">
          <h2>Formula Used</h2>
          <div className="seo-formula" style={{ whiteSpace: 'pre-line' }}>
            {"Weighted Grade = Σ (Score × Weight) ÷ Σ (Weight)"}
          </div>
          <dl className="seo-formula-vars">
            <dt>Score</dt>
            <dd>— the score received in a grading category (expressed as a percentage)</dd>
            <dt>Weight</dt>
            <dd>— the percentage weight the category contributes to the final grade (e.g. 40%)</dd>
            <dt>Σ (sum)</dt>
            <dd>— the sum of all weighted scores, divided by the total active weights</dd>
          </dl>
        </section>

        <section className="seo-section">
          <h2>Example Calculation</h2>
          <p>Suppose a student has an Exam score of 85 (weighted at 40%) and a Homework score of 90 (weighted at 60%). Weighted Grade = (85 × 0.40) + (90 × 0.60) = 34 + 54 = 88%.</p>
        </section>

        <section className="seo-section">
          <h2>Frequently Asked Questions</h2>
          <FAQAccordion items={gradeCalculatorFAQ} />
        </section>

      </div>
    </PageTransition>
  );
}
