import { HashRouter, Routes, Route } from 'react-router-dom';
import { GameStateProvider } from './context/GameStateContext';
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
import './index.css';

export default function App() {
  return (
    <GameStateProvider>
      <HashRouter>
        <div className="app-layout">
          {/* Animated background */}
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
          </Routes>

          <NavBar />
        </div>
      </HashRouter>
    </GameStateProvider>
  );
}
