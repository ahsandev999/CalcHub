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

const gradeToPoints: Record<string, number> = {
  'A': 4,
  'A-': 3.7,
  'B+': 3.3,
  'B': 3,
  'B-': 2.7,
  'C+': 2.3,
  'C': 2,
  'C-': 1.7,
  'D+': 1.3,
  'D': 1,
  'F': 0,
};

export default function GPACalculator() {
  useToolTracking('gpa-calculator', 'GPA Calculator');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [courses, setCourses] = useState([{ grade: 'A', credits: '3' }]);
  const [result, setResult] = useState<{ gpa: number; totalCredits: number } | null>(null);

  const addCourse = () => setCourses([...courses, { grade: 'A', credits: '1' }]);
  const removeCourse = (index: number) => setCourses(courses.filter((_, i) => i !== index));
  const updateCourse = (index: number, field: 'grade' | 'credits', value: string) => {
    const next = [...courses];
    next[index][field] = value;
    setCourses(next);
    setValidationError(null);
  };

  const calculate = () => {
    const valid = courses.map((course) => ({
      grade: gradeToPoints[course.grade] ?? 0,
      credits: Number(course.credits),
    }));

    if (!valid.length || valid.some((course) => !course.credits || course.credits <= 0)) {
      setValidationError('Enter valid credit hours for each course.');
      return;
    }

    setValidationError(null);

    const totalCredits = valid.reduce((sum, course) => sum + course.credits, 0);
    const weighted = valid.reduce((sum, course) => sum + course.grade * course.credits, 0);
    const gpa = weighted / totalCredits;

    const nextResult = { gpa: Number(gpa.toFixed(2)), totalCredits };
    setResult(nextResult);
    addHistory({
      tool: 'GPA Calculator',
      toolSlug: 'gpa-calculator',
      expression: `${courses.length} courses`,
      result: `${nextResult.gpa.toFixed(2)} GPA`,
    });
  };

  return (
    <PageTransition className="page-medium">
      <SEO title="GPA Calculator" description="Calculate GPA from a dynamic list of course grades and credit hours." path="/gpa-calculator" />
      <Link to="/" className="back-link">← Back to tools</Link>
      <div className="tool-header">
        <div className="eyebrow">Education</div>
        <h1 className="page-title">GPA Calculator</h1>
        <p className="page-lede">Add course rows, set grades, and calculate a weighted GPA on a 4.0 scale.</p>
      </div>
      <Card padding="lg">
        {courses.map((course, index) => (
          <div key={index} className="grid-2" style={{ marginBottom: 12 }}>
            <div className="input-group">
              <label className="input-label">Grade</label>
              <select className="input-select" value={course.grade} onChange={(e) => updateCourse(index, 'grade', e.target.value)}>
                {Object.keys(gradeToPoints).map((grade) => <option key={grade}>{grade}</option>)}
              </select>
            </div>
            <Input label="Credit Hours" type="number" value={course.credits} onChange={(e) => updateCourse(index, 'credits', e.target.value)} min="1" />
            <Button variant="ghost" onClick={() => removeCourse(index)} style={{ marginTop: 8 }}>Remove</Button>
          </div>
        ))}
        <Button variant="secondary" onClick={addCourse} style={{ width: '100%', marginBottom: 12 }}>Add Course</Button>
        {validationError && <p className="input-message input-message-error" role="alert">{validationError}</p>}
        <Button onClick={calculate} magnetic style={{ width: '100%' }}>Calculate GPA</Button>
        <ResultDisplay
          visible={!!result}
          highlight={result ? `${result.gpa.toFixed(2)} / 4.0` : undefined}
          subtitle="Weighted GPA"
          slots={result ? [
            { label: 'Total Credits', value: result.totalCredits },
            { label: 'GPA', value: result.gpa.toFixed(2) },
          ] : []}
        />
      </Card>
    </PageTransition>
  );
}
