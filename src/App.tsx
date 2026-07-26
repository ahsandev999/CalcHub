import { lazy, Suspense, useEffect, useRef, useLayoutEffect } from 'react';
import { Routes, Route, useLocation, useNavigationType } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Layout from './components/layout/Layout';
import PageLoader from './components/ui/PageLoader';
import CustomCursor from './components/ui/CustomCursor';
import Background from './components/ui/Background';
import { TOOLS } from './lib/tools';

const getScrollKey = (path: string) => `calchub:scroll:${path || '/'}`;
const isCalculatorRoute = (pathname: string) => TOOLS.some((tool) => pathname === `/${tool.slug}` || pathname.endsWith(`/${tool.slug}`));

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
const LoanCalculator = lazy(() => import('./pages/LoanCalculator'));
const MortgageCalculator = lazy(() => import('./pages/MortgageCalculator'));
const CompoundInterestCalculator = lazy(() => import('./pages/CompoundInterestCalculator'));
const SimpleInterestCalculator = lazy(() => import('./pages/SimpleInterestCalculator'));
const SalaryCalculator = lazy(() => import('./pages/SalaryCalculator'));
const CalorieCalculator = lazy(() => import('./pages/CalorieCalculator'));
const BodyFatCalculator = lazy(() => import('./pages/BodyFatCalculator'));
const BMRCalculator = lazy(() => import('./pages/BMRCalculator'));
const IdealWeightCalculator = lazy(() => import('./pages/IdealWeightCalculator'));
const FractionCalculator = lazy(() => import('./pages/FractionCalculator'));
const TriangleCalculator = lazy(() => import('./pages/TriangleCalculator'));
const StandardDeviationCalculator = lazy(() => import('./pages/StandardDeviationCalculator'));
const GPACalculator = lazy(() => import('./pages/GPACalculator'));
const GradeCalculator = lazy(() => import('./pages/GradeCalculator'));
const HoursCalculator = lazy(() => import('./pages/HoursCalculator'));
const About = lazy(() => import('./pages/About'));
const Privacy = lazy(() => import('./pages/Privacy'));

export default function App() {
  const location = useLocation();
  const navType = useNavigationType();
  const isHome = location.pathname === '/';
  const previousPathRef = useRef(location.pathname);

  /**
   * Scroll tracking ref — updated continuously via scroll listener so we always
   * have the true last scroll position even when the effect fires after a paint.
   */
  const scrollYRef = useRef(window.scrollY);

  // Keep scrollYRef up-to-date at all times
  useEffect(() => {
    const onScroll = () => { scrollYRef.current = window.scrollY; };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.history.scrollRestoration = 'manual';
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.history.scrollRestoration = 'auto';
    };
  }, []);

  /**
   * On every pathname change:
   * 1. Save the scroll position of the PREVIOUS route (using scrollYRef which was
   *    continuously updated, so it reflects the pre-navigation scroll).
   * 2. Restore scroll for the new route.
   *
   * WHY THIS WORKS WHERE THE PREVIOUS IMPL FAILED:
   * The old code read window.scrollY in the effect — but by the time React fires
   * the effect after a navigation, the browser may have already reset scroll to 0
   * (via the prior navigation's requestAnimationFrame call). scrollYRef is updated
   * synchronously on every scroll event, so its value is captured BEFORE the
   * browser resets it, giving us the correct pre-navigation position.
   */
  useLayoutEffect(() => {
    const previousPath = previousPathRef.current;
    const currentPath = location.pathname;

    if (previousPath && previousPath !== currentPath) {
      // Save the live scroll position from our continuously-updated ref
      const savedY = Math.max(scrollYRef.current, 0);
      sessionStorage.setItem(getScrollKey(previousPath), String(savedY));

      // Mark that we genuinely navigated AWAY from the homepage to a calculator.
      // This is the ONLY reliable signal for "user is coming back" — navType alone
      // cannot distinguish F5 refresh from real back-navigation because React Router
      // returns 'POP' for both in BrowserRouter.
      if (previousPath === '/' && isCalculatorRoute(currentPath)) {
        sessionStorage.setItem('calchub_navigated_away', '1');
      }
    }

    previousPathRef.current = currentPath;

    if (currentPath === '/') {
      // Only restore if the user actually navigated away from the homepage earlier
      // in THIS session. A fresh load or F5 refresh will never have this flag set.
      const didNavigateAway = sessionStorage.getItem('calchub_navigated_away') === '1';

      if (didNavigateAway) {
        sessionStorage.removeItem('calchub_navigated_away');
        const lastClickedId = sessionStorage.getItem('calchub_last_clicked');

        let attempts = 0;
        const maxAttempts = 30;
        const poll = () => {
          attempts++;
          const el = lastClickedId ? document.getElementById(lastClickedId) : null;

          if (el) {
            const headerOffset = 100;
            const top = el.getBoundingClientRect().top + window.scrollY - headerOffset;
            window.scrollTo({ top, left: 0, behavior: 'instant' as ScrollBehavior });
            sessionStorage.removeItem('calchub_last_clicked');
            return;
          }

          if (attempts < maxAttempts) {
            setTimeout(poll, 100);
          } else {
            const saved = Number(sessionStorage.getItem(getScrollKey(currentPath)) || '0');
            window.scrollTo({ top: saved, left: 0, behavior: 'instant' as ScrollBehavior });
          }
        };
        poll();
      } else {
        // Fresh load, F5 refresh, or direct URL visit — scroll to top, clean up
        sessionStorage.removeItem('calchub_last_clicked');
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
      }
      return;
    }

    if (isCalculatorRoute(currentPath)) {
      requestAnimationFrame(() => {
        const main = document.querySelector('main');
        const target = main?.querySelector('.tool-header, .calc-wrapper, .card') as HTMLElement | null;
        const topOffset = target ? target.getBoundingClientRect().top + window.scrollY - 88 : 0;
        window.scrollTo({ top: topOffset, left: 0, behavior: 'instant' as ScrollBehavior });
      });
      return;
    }

    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, navType]);

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
              <Route path="/loan-calculator" element={<LoanCalculator />} />
              <Route path="/mortgage-calculator" element={<MortgageCalculator />} />
              <Route path="/compound-interest-calculator" element={<CompoundInterestCalculator />} />
              <Route path="/simple-interest-calculator" element={<SimpleInterestCalculator />} />
              <Route path="/salary-calculator" element={<SalaryCalculator />} />
              <Route path="/calorie-calculator" element={<CalorieCalculator />} />
              <Route path="/body-fat-calculator" element={<BodyFatCalculator />} />
              <Route path="/bmr-calculator" element={<BMRCalculator />} />
              <Route path="/ideal-weight-calculator" element={<IdealWeightCalculator />} />
              <Route path="/fraction-calculator" element={<FractionCalculator />} />
              <Route path="/triangle-calculator" element={<TriangleCalculator />} />
              <Route path="/standard-deviation-calculator" element={<StandardDeviationCalculator />} />
              <Route path="/gpa-calculator" element={<GPACalculator />} />
              <Route path="/grade-calculator" element={<GradeCalculator />} />
              <Route path="/hours-calculator" element={<HoursCalculator />} />
              <Route path="/about" element={<About />} />
              <Route path="/privacy" element={<Privacy />} />
            </Routes>
          </AnimatePresence>
        </Suspense>
      </Layout>
    </>
  );
}
