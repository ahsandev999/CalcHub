import { useState } from 'react';
import { Link } from 'react-router-dom';
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

export default function GradeCalculator() {
  useToolTracking('grade-calculator', 'Grade Calculator');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [assignments, setAssignments] = useState([{ score: '90', weight: '20' }]);
  const [result, setResult] = useState<{ percentage: number; letter: string } | null>(null);

  const addAssignment = () => setAssignments([...assignments, { score: '100', weight: '10' }]);
  const removeAssignment = (index: number) => setAssignments(assignments.filter((_, i) => i !== index));
  const updateAssignment = (index: number, field: 'score' | 'weight', value: string) => {
    const next = [...assignments];
    next[index][field] = value;
    setAssignments(next);
    setValidationError(null);
  };

  const calculate = () => {
    const totalWeight = assignments.reduce((sum, item) => sum + Number(item.weight || 0), 0);
    if (!assignments.length || totalWeight <= 0) {
      setValidationError('Enter valid weights for the assignments.');
      return;
    }

    setValidationError(null);
    const weighted = assignments.reduce((sum, item) => sum + Number(item.score || 0) * Number(item.weight || 0), 0);
    const finalPercent = weighted / totalWeight;
    const nextResult = { percentage: Number(finalPercent.toFixed(2)), letter: letterGrade(finalPercent) };
    setResult(nextResult);
    addHistory({
      tool: 'Grade Calculator',
      toolSlug: 'grade-calculator',
      expression: `${assignments.length} assignments`,
      result: `${nextResult.percentage}%`,
    });
  };

  return (
    <PageTransition className="page-medium">
      <SEO title="Grade Calculator" description="Calculate a final weighted grade percentage and letter grade." path="/grade-calculator" />
      <Link to="/" className="back-link">← Back to tools</Link>
      <div className="tool-header">
        <div className="eyebrow">Education</div>
        <h1 className="page-title">Grade Calculator</h1>
        <p className="page-lede">Enter assignment scores and weights to calculate a final weighted grade.</p>
      </div>
      <Card padding="lg">
        {assignments.map((item, index) => (
          <div key={index} className="grid-2" style={{ marginBottom: 12 }}>
            <Input label="Score (%)" type="number" value={item.score} onChange={(e) => updateAssignment(index, 'score', e.target.value)} min="0" max="100" />
            <Input label="Weight (%)" type="number" value={item.weight} onChange={(e) => updateAssignment(index, 'weight', e.target.value)} min="0" />
            <Button variant="ghost" onClick={() => removeAssignment(index)} style={{ marginTop: 8 }}>Remove</Button>
          </div>
        ))}
        <Button variant="secondary" onClick={addAssignment} style={{ width: '100%', marginBottom: 12 }}>Add Assignment</Button>
        {validationError && <p className="input-message input-message-error" role="alert">{validationError}</p>}
        <Button onClick={calculate} magnetic style={{ width: '100%' }}>Calculate Grade</Button>
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
    </PageTransition>
  );
}
