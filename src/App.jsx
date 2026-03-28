import { lazy, Suspense } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { GameStateProvider, useGame } from './context/GameStateContext';
import NavBar from './components/NavBar';
import InstallPrompt from './components/InstallPrompt';
import ErrorBoundary from './components/ErrorBoundary';
import ScrollToTop from './components/ScrollToTop';
import StudyReminder from './components/StudyReminder';
import CopyrightSeal from './components/CopyrightSeal';
import Home from './pages/Home';
import { isAdultMode } from './utils/userMode';
import './index.css';

// Lazy load all route components for code splitting
const LearnEnglish = lazy(() => import('./pages/LearnEnglish'));
const LearnChinese = lazy(() => import('./pages/LearnChinese'));
const StandardLexicon = lazy(() => import('./pages/StandardLexicon'));
const Games = lazy(() => import('./pages/Games'));
const Progress = lazy(() => import('./pages/Progress'));
const Lesson = lazy(() => import('./pages/Lesson'));
const LessonChinese = lazy(() => import('./pages/LessonChinese'));
const MemoryGame = lazy(() => import('./pages/MemoryGame'));
const QuizGame = lazy(() => import('./pages/QuizGame'));
const Conversation = lazy(() => import('./pages/Conversation'));
const ConversationList = lazy(() => import('./pages/ConversationList'));
// SentenceBuilderOld removed — dead code (audit 27/03/2026)
const StoryMode = lazy(() => import('./pages/StoryMode'));
const StoryList = lazy(() => import('./pages/StoryList'));
const StrokeWriter = lazy(() => import('./pages/StrokeWriter'));
const PhrasePractice = lazy(() => import('./pages/PhrasePractice'));
const PhraseTopicList = lazy(() => import('./pages/PhraseTopicList'));
const DailyReview = lazy(() => import('./pages/DailyReview'));
const Achievements = lazy(() => import('./pages/Achievements'));
const VocabularyDashboard = lazy(() => import('./pages/VocabularyDashboard'));
const ListeningHub = lazy(() => import('./modules/listening/ListeningHub'));
const ListeningLesson = lazy(() => import('./modules/listening/ListeningLesson'));
const SpeakingHub = lazy(() => import('./modules/speaking/SpeakingHub'));
const ListeningCnHub = lazy(() => import('./modules/listening_cn/ListeningCnHub'));
const ListeningCnLesson = lazy(() => import('./modules/listening_cn/ListeningCnLesson'));
const SpeakingCnHub = lazy(() => import('./modules/speaking_cn/SpeakingCnHub'));
const SpeakingCnExercise = lazy(() => import('./modules/speaking_cn/SpeakingCnExercise'));
const ReadingHub = lazy(() => import('./modules/reading/ReadingHub'));
const WritingHub = lazy(() => import('./modules/writing/WritingHub'));
const GrammarHub = lazy(() => import('./modules/grammar/GrammarHub'));
const GrammarCnHub = lazy(() => import('./modules/grammar_cn/GrammarCnHub'));
const RoadmapHub = lazy(() => import('./modules/roadmap/RoadmapHub'));
const MockTestHub = lazy(() => import('./modules/exam/MockTestHub'));
const IELTSSimulator = lazy(() => import('./modules/exam/IELTSSimulator'));
const HSKSimulator = lazy(() => import('./modules/exam/HSKSimulator'));
const PlacementTest = lazy(() => import('./modules/exam/PlacementTest'));
const ClozeExercise = lazy(() => import('./modules/exercises/ClozeExercise'));
const ConversationAI = lazy(() => import('./modules/conversation/ConversationAI'));
const Leaderboard = lazy(() => import('./pages/Leaderboard'));
const Settings = lazy(() => import('./pages/Settings'));
const TypingPractice = lazy(() => import('./pages/TypingPractice'));
const MatchingGame = lazy(() => import('./pages/MatchingGame'));
const DailyChallenge = lazy(() => import('./pages/DailyChallenge'));
const PronunciationLab = lazy(() => import('./pages/PronunciationLab'));
const GrammarExplainer = lazy(() => import('./pages/GrammarExplainer'));
const DictationExercise = lazy(() => import('./pages/DictationExercise'));
const ReadingComprehension = lazy(() => import('./pages/ReadingComprehension'));
const StudyStats = lazy(() => import('./pages/StudyStats'));
const AccentPractice = lazy(() => import('./pages/AccentPractice'));
const ShadowingSpeaker = lazy(() => import('./pages/ShadowingSpeaker'));
const SituationalDialogue = lazy(() => import('./pages/SituationalDialogue'));
const ErrorCorrection = lazy(() => import('./pages/ErrorCorrection'));
const IdiomTrainer = lazy(() => import('./pages/IdiomTrainer'));
const ListeningComprehension = lazy(() => import('./pages/ListeningComprehension'));
const SentenceTranslation = lazy(() => import('./pages/SentenceTranslation'));
const ChineseToneDrill = lazy(() => import('./pages/ChineseToneDrill'));
const ConversationTree = lazy(() => import('./pages/ConversationTree'));
const VocabInContext = lazy(() => import('./pages/VocabInContext'));
const PhrasalVerbTrainer = lazy(() => import('./pages/PhrasalVerbTrainer'));
const MinimalPairDrill = lazy(() => import('./pages/MinimalPairDrill'));
const WordFormation = lazy(() => import('./pages/WordFormation'));
const SpellingBee = lazy(() => import('./pages/SpellingBee'));
const SentenceBuilder = lazy(() => import('./pages/SentenceBuilder'));
const TenseQuiz = lazy(() => import('./pages/TenseQuiz'));
const PrepositionTrainer = lazy(() => import('./pages/PrepositionTrainer'));
const ArticleTrainer = lazy(() => import('./pages/ArticleTrainer'));
const ConditionalTrainer = lazy(() => import('./pages/ConditionalTrainer'));
const PassiveVoiceTrainer = lazy(() => import('./pages/PassiveVoiceTrainer'));
const CollocationTrainer = lazy(() => import('./pages/CollocationTrainer'));
const LegalNotice = lazy(() => import('./pages/LegalNotice'));

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
  const { state } = useGame();
  const adultClass = isAdultMode(state.userMode) ? 'adult-mode' : '';

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

      <InstallPrompt />
      <ScrollToTop />
      <StudyReminder />
      <CopyrightSeal />
      <ErrorBoundary>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/legal-notice" element={<LegalNotice />} />
            <Route path="/review" element={<DailyReview />} />
            <Route path="/achievements" element={<Achievements />} />
            <Route path="/vocabulary" element={<VocabularyDashboard />} />
            <Route path="/english" element={<LearnEnglish />} />
            <Route path="/chinese" element={<LearnChinese />} />
            <Route path="/lexicon/:lang" element={<StandardLexicon />} />
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
            <Route path="/listening-cn" element={<ListeningCnHub />} />
            <Route path="/listening-cn/:lessonId" element={<ListeningCnLesson />} />
            <Route path="/speaking" element={<SpeakingHub />} />
            <Route path="/speaking-cn" element={<SpeakingCnHub />} />
            <Route path="/speaking-cn/:lessonId" element={<SpeakingCnExercise />} />
            <Route path="/reading" element={<ReadingHub />} />
            <Route path="/writing" element={<WritingHub />} />
            <Route path="/grammar" element={<GrammarHub />} />
            <Route path="/grammar-cn" element={<GrammarCnHub />} />
            <Route path="/roadmap" element={<RoadmapHub />} />
            <Route path="/exam-prep" element={<MockTestHub />} />
            <Route path="/ielts-sim" element={<IELTSSimulator />} />
            <Route path="/hsk-sim" element={<HSKSimulator />} />
            <Route path="/cloze/:lang" element={<ClozeExercise />} />
            <Route path="/cloze/:lang/:level" element={<ClozeExercise />} />
            <Route path="/placement" element={<PlacementTest />} />
            <Route path="/conversation-ai" element={<ConversationAI />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/typing/:lang" element={<TypingPractice />} />
            <Route path="/matching" element={<MatchingGame />} />
            <Route path="/daily-challenge" element={<DailyChallenge />} />
            <Route path="/pronunciation/:lang" element={<PronunciationLab />} />
            <Route path="/grammar-explainer" element={<GrammarExplainer />} />
            <Route path="/dictation/:lang" element={<DictationExercise />} />
            <Route path="/reading-practice" element={<ReadingComprehension />} />
            <Route path="/study-stats" element={<StudyStats />} />
            <Route path="/accent-practice" element={<AccentPractice />} />
            <Route path="/shadowing" element={<ShadowingSpeaker />} />
            <Route path="/roleplay" element={<SituationalDialogue />} />
            <Route path="/error-correction" element={<ErrorCorrection />} />
            <Route path="/idiom-trainer" element={<IdiomTrainer />} />
            <Route path="/listening-practice" element={<ListeningComprehension />} />
            <Route path="/translation" element={<SentenceTranslation />} />
            <Route path="/tone-drill" element={<ChineseToneDrill />} />
            <Route path="/conversation-tree" element={<ConversationTree />} />
            <Route path="/vocab-context" element={<VocabInContext />} />
            <Route path="/phrasal-verbs" element={<PhrasalVerbTrainer />} />
            <Route path="/minimal-pairs" element={<MinimalPairDrill />} />
            <Route path="/word-formation" element={<WordFormation />} />
            <Route path="/spelling-bee" element={<SpellingBee />} />
            <Route path="/sentence-builder" element={<SentenceBuilder />} />
            <Route path="/tense-quiz" element={<TenseQuiz />} />
            <Route path="/prepositions" element={<PrepositionTrainer />} />
            <Route path="/articles" element={<ArticleTrainer />} />
            <Route path="/conditionals" element={<ConditionalTrainer />} />
            <Route path="/passive-voice" element={<PassiveVoiceTrainer />} />
            <Route path="/collocations" element={<CollocationTrainer />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>

      <NavBar />
    </div>
  );
}

export default function App() {
  return (
    <GameStateProvider>
      <HashRouter>
        <AppContent />
      </HashRouter>
    </GameStateProvider>
  );
}
