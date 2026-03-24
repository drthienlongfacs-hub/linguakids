import { lazy, Suspense } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { useGameStore } from './store/useGameStore';
import NavBar from './components/NavBar';
import Home from './pages/Home';
import { isAdultMode } from './utils/userMode';
import './index.css';

// Lazy load heavy modules for code splitting
const LearnEnglish = lazy(() => import('./pages/LearnEnglish'));
const LearnChinese = lazy(() => import('./pages/LearnChinese'));
const Games = lazy(() => import('./pages/Games'));
const Progress = lazy(() => import('./pages/Progress'));
const Lesson = lazy(() => import('./pages/Lesson'));
const LessonChinese = lazy(() => import('./pages/LessonChinese'));
const MemoryGame = lazy(() => import('./pages/MemoryGame'));
const QuizGame = lazy(() => import('./pages/QuizGame'));
const Conversation = lazy(() => import('./pages/Conversation'));
const ConversationList = lazy(() => import('./pages/ConversationList'));
const SentenceBuilder = lazy(() => import('./pages/SentenceBuilder'));
const StoryMode = lazy(() => import('./pages/StoryMode'));
const StoryList = lazy(() => import('./pages/StoryList'));
const StrokeWriter = lazy(() => import('./pages/StrokeWriter'));
const PhrasePractice = lazy(() => import('./pages/PhrasePractice'));
const PhraseTopicList = lazy(() => import('./pages/PhraseTopicList'));
const DailyReview = lazy(() => import('./pages/DailyReview'));
const Achievements = lazy(() => import('./pages/Achievements'));
const ListeningHub = lazy(() => import('./modules/listening/ListeningHub'));
const ListeningLesson = lazy(() => import('./modules/listening/ListeningLesson'));
const SpeakingHub = lazy(() => import('./modules/speaking/SpeakingHub'));
const ReadingHub = lazy(() => import('./modules/reading/ReadingHub'));
const WritingHub = lazy(() => import('./modules/writing/WritingHub'));
const GrammarHub = lazy(() => import('./modules/grammar/GrammarHub'));
const MockTestHub = lazy(() => import('./modules/exam/MockTestHub'));

// Loading fallback with spinner
function LoadingFallback() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      minHeight: '60vh', flexDirection: 'column', gap: '12px',
    }}>
      <div style={{
        width: '40px', height: '40px', borderRadius: '50%',
        border: '4px solid #E5E7EB',
        borderTopColor: 'var(--color-primary)',
        animation: 'spin 0.8s linear infinite',
      }} />
      <span style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text-light)', fontSize: '0.9rem' }}>
        Đang tải...
      </span>
    </div>
  );
}

function AppContent() {
  const userMode = useGameStore(state => state.userMode);
  const adultClass = isAdultMode(userMode) ? 'adult-mode' : '';

  return (
    <div className={`app-layout ${adultClass}`}>
      {/* Animated background — hidden in adult mode via CSS */}
      <div className="bg-sky" />
      <div className="bg-clouds">
        <div className="cloud" />
        <div className="cloud" />
        <div className="cloud" />
      </div>
      <div className="floating-shapes">
        <div className="shape" />
        <div className="shape" />
        <div className="shape" />
        <div className="shape" />
      </div>

      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/review" element={<DailyReview />} />
          <Route path="/achievements" element={<Achievements />} />
          <Route path="/english" element={<LearnEnglish />} />
          <Route path="/chinese" element={<LearnChinese />} />
          <Route path="/games" element={<Games />} />
          <Route path="/progress" element={<Progress />} />
          <Route path="/lesson/:lang/:topicId" element={<Lesson />} />
          <Route path="/lesson-cn/:topicId" element={<LessonChinese />} />
          <Route path="/game/memory/:lang" element={<MemoryGame />} />
          <Route path="/game/quiz/:lang" element={<QuizGame />} />
          <Route path="/game/sentence/:lang" element={<SentenceBuilder />} />
          <Route path="/game/stroke" element={<StrokeWriter />} />
          <Route path="/conversations/:lang" element={<ConversationList />} />
          <Route path="/conversation/:lang/:convId" element={<Conversation />} />
          <Route path="/stories/:lang" element={<StoryList />} />
          <Route path="/story/:lang/:storyId" element={<StoryMode />} />
          <Route path="/phrases/:lang" element={<PhraseTopicList />} />
          <Route path="/phrases/:lang/:topicId" element={<PhrasePractice />} />
          <Route path="/listening" element={<ListeningHub />} />
          <Route path="/listening/:lessonId" element={<ListeningLesson />} />
          <Route path="/speaking" element={<SpeakingHub />} />
          <Route path="/reading" element={<ReadingHub />} />
          <Route path="/writing" element={<WritingHub />} />
          <Route path="/grammar" element={<GrammarHub />} />
          <Route path="/exam-prep" element={<MockTestHub />} />
        </Routes>
      </Suspense>

      <NavBar />
    </div>
  );
}

export default function App() {
  return (
    <HashRouter>
      <AppContent />
    </HashRouter>
  );
}
