import { HashRouter, Routes, Route } from 'react-router-dom';
import { GameStateProvider, useGame } from './context/GameStateContext';
import NavBar from './components/NavBar';
import Home from './pages/Home';
import LearnEnglish from './pages/LearnEnglish';
import LearnChinese from './pages/LearnChinese';
import Games from './pages/Games';
import Progress from './pages/Progress';
import Lesson from './pages/Lesson';
import LessonChinese from './pages/LessonChinese';
import MemoryGame from './pages/MemoryGame';
import QuizGame from './pages/QuizGame';
import Conversation from './pages/Conversation';
import ConversationList from './pages/ConversationList';
import SentenceBuilder from './pages/SentenceBuilder';
import StoryMode from './pages/StoryMode';
import StoryList from './pages/StoryList';
import StrokeWriter from './pages/StrokeWriter';
import PhrasePractice from './pages/PhrasePractice';
import PhraseTopicList from './pages/PhraseTopicList';
import DailyReview from './pages/DailyReview';
import Achievements from './pages/Achievements';
import ListeningHub from './modules/listening/ListeningHub';
import ListeningLesson from './modules/listening/ListeningLesson';
import SpeakingHub from './modules/speaking/SpeakingHub';
import ListeningCnHub from './modules/listening_cn/ListeningCnHub';
import SpeakingCnHub from './modules/speaking_cn/SpeakingCnHub';
import ReadingHub from './modules/reading/ReadingHub';
import WritingHub from './modules/writing/WritingHub';
import GrammarHub from './modules/grammar/GrammarHub';
import GrammarCnHub from './modules/grammar_cn/GrammarCnHub';
import RoadmapHub from './modules/roadmap/RoadmapHub';
import MockTestHub from './modules/exam/MockTestHub';
import IELTSSimulator from './modules/exam/IELTSSimulator';
import HSKSimulator from './modules/exam/HSKSimulator';
import { isAdultMode } from './utils/userMode';
import './index.css';

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
        <Route path="/listening-cn" element={<ListeningCnHub />} />
        <Route path="/speaking" element={<SpeakingHub />} />
        <Route path="/speaking-cn" element={<SpeakingCnHub />} />
        <Route path="/reading" element={<ReadingHub />} />
        <Route path="/writing" element={<WritingHub />} />
        <Route path="/grammar" element={<GrammarHub />} />
        <Route path="/grammar-cn" element={<GrammarCnHub />} />
        <Route path="/roadmap" element={<RoadmapHub />} />
        <Route path="/exam-prep" element={<MockTestHub />} />
        <Route path="/ielts-sim" element={<IELTSSimulator />} />
        <Route path="/hsk-sim" element={<HSKSimulator />} />
      </Routes>

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

