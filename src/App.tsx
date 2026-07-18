import { lazy, Suspense, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Layout from './components/layout/Layout';
import PageLoader from './components/ui/PageLoader';
import CustomCursor from './components/ui/CustomCursor';
import Background from './components/ui/Background';

const Home = lazy(() => import('./pages/Home'));
const ScientificCalculator = lazy(() => import('./pages/ScientificCalculator'));
const AgeCalculator = lazy(() => import('./pages/AgeCalculator'));
const SleepCalculator = lazy(() => import('./pages/SleepCalculator'));
const BMICalculator = lazy(() => import('./pages/BMICalculator'));
const PercentageCalculator = lazy(() => import('./pages/PercentageCalculator'));
const UnitConverter = lazy(() => import('./pages/UnitConverter'));
const DateDifference = lazy(() => import('./pages/DateDifference'));
const Stopwatch = lazy(() => import('./pages/Stopwatch'));
const Timer = lazy(() => import('./pages/Timer'));
const Pomodoro = lazy(() => import('./pages/Pomodoro'));
const RandomNumber = lazy(() => import('./pages/RandomNumber'));
const PasswordGenerator = lazy(() => import('./pages/PasswordGenerator'));
const ColorConverter = lazy(() => import('./pages/ColorConverter'));
const NumberBaseConverter = lazy(() => import('./pages/NumberBaseConverter'));
const CurrencyConverter = lazy(() => import('./pages/CurrencyConverter'));
const About = lazy(() => import('./pages/About'));
const Privacy = lazy(() => import('./pages/Privacy'));

export default function App() {
  const location = useLocation();
  const isHome = location.pathname === '/';

  // Sync body class for homepage background
  useEffect(() => {
    if (isHome) {
      document.body.classList.add('is-home');
    } else {
      document.body.classList.remove('is-home');
    }
  }, [isHome]);

  return (
    <>
      {/* Background ambient effects only on non-home pages */}
      {!isHome && <Background />}
      <CustomCursor />
      <Layout isHome={isHome}>
        <Suspense fallback={<PageLoader />}>
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<Home />} />
              <Route path="/scientific-calculator" element={<ScientificCalculator />} />
              <Route path="/age-calculator" element={<AgeCalculator />} />
              <Route path="/sleep-calculator" element={<SleepCalculator />} />
              <Route path="/bmi-calculator" element={<BMICalculator />} />
              <Route path="/percentage-calculator" element={<PercentageCalculator />} />
              <Route path="/unit-converter" element={<UnitConverter />} />
              <Route path="/date-difference" element={<DateDifference />} />
              <Route path="/stopwatch" element={<Stopwatch />} />
              <Route path="/timer" element={<Timer />} />
              <Route path="/pomodoro" element={<Pomodoro />} />
              <Route path="/random-number" element={<RandomNumber />} />
              <Route path="/password-generator" element={<PasswordGenerator />} />
              <Route path="/color-converter" element={<ColorConverter />} />
              <Route path="/number-base-converter" element={<NumberBaseConverter />} />
              <Route path="/currency-converter" element={<CurrencyConverter />} />
              <Route path="/about" element={<About />} />
              <Route path="/privacy" element={<Privacy />} />
            </Routes>
          </AnimatePresence>
        </Suspense>
      </Layout>
    </>
  );
}
