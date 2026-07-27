import { useState } from 'react';
import { Link } from 'react-router-dom';
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

const gPACalculatorFAQ: FAQItem[] = [
  {
    "question": "What is a good GPA in college?",
    "answer": "A GPA of 3.0 (B average) is generally considered satisfactory and is the minimum required by many graduate programs. A GPA of 3.5 or above is considered strong."
  },
  {
    "question": "How is cumulative GPA different from semester GPA?",
    "answer": "Semester GPA is calculated using only the courses taken in a single term. Cumulative GPA is the weighted average across all courses taken throughout your entire academic career."
  },
  {
    "question": "Does every school use the same 4.0 GPA scale?",
    "answer": "No — while the 4.0 scale is by far the most common in the United States, some schools use a 4.3 scale (where A+ = 4.3), and many international universities use entirely different systems."
  },
  {
    "question": "How much will one bad grade hurt my GPA?",
    "answer": "The impact depends on how many total credits you have already completed and how many credits the new course carries. More credits completed = more GPA stability."
  },
  {
    "question": "Can I raise my GPA after failing a class?",
    "answer": "Yes — many institutions offer grade forgiveness or course repeat policies where the new grade replaces the original. Earning high grades in subsequent semesters also steadily dilutes the impact."
  }
];

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
      <SEO title="Free GPA Calculator" description="Calculate your weighted GPA on a 4.0 scale from course grades and credit hours online for free." path="/gpa-calculator" faqSchema={gPACalculatorFAQ} />
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
            {/* ── SEO Content Sections ── */}
      <div className="seo-content">

        <section className="seo-section">
          <h2>How the GPA Calculator Works</h2>
          <p>This calculator computes a weighted Grade Point Average (GPA) on a standard 4.0 scale. You add one row per course, select the letter grade you received, and enter the number of credit hours that course carries. GPA is calculated as a weighted average.</p>
        </section>

        <section className="seo-section">
          <h2>Formula Used</h2>
          <div className="seo-formula" style={{ whiteSpace: 'pre-line' }}>
            {"GPA = Σ (Grade Points × Credit Hours) ÷ Σ (Credit Hours)"}
          </div>
          <dl className="seo-formula-vars">
            <dt>Grade Points</dt>
            <dd>— the numeric value assigned to the letter grade for each course (e.g. B+ = 3.3)</dd>
            <dt>Credit Hours</dt>
            <dd>— the number of credit hours (units) the course is worth at your institution</dd>
            <dt>Σ (sum)</dt>
            <dd>— each course's (Grade Points × Credits) is summed, then divided by the total credit hours across all courses</dd>
          </dl>
        </section>

        <section className="seo-section">
          <h2>Example Calculation</h2>
          <p>A student takes four courses in a semester: Calculus (4 credits, A), English (3 credits, B+), History (3 credits, B), and Chemistry Lab (2 credits, C+). The weighted sum = (4×4.0) + (3×3.3) + (3×3.0) + (2×2.3) = 16 + 9.9 + 9 + 4.6 = 39.5. Total credits = 12. GPA = 39.5 ÷ 12 = 3.29.</p>
        </section>

        <section className="seo-section">
          <h2>Frequently Asked Questions</h2>
          <FAQAccordion items={gPACalculatorFAQ} />
        </section>

      </div>
    </PageTransition>
  );
}
