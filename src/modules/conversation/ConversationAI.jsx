// ConversationAI.jsx — Voice-First AI Conversation Practice
// Phase 1: Voice Engine (Web Speech API) + Phase 3: Real-time Coaching
// Benchmarked against Loora AI, Elsa Speak, Practice Me
// Features: push-to-talk, waveform, AI voice response, inline coaching,
//           pronunciation scoring, "say it better", session summary

import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../../context/GameStateContext';
import { isAdultMode } from '../../utils/userMode';
import CapabilityNotice from '../../components/CapabilityNotice';
import { useDeviceCapabilities } from '../../hooks/useDeviceCapabilities';
import { speakText } from '../../utils/speakText';
import TutorSelector, { TUTORS } from '../../components/TutorSelector';
import CelebrationOverlay from '../../components/CelebrationOverlay';

// ============ SCENARIOS ============
const SCENARIOS = [
    {
        id: 'restaurant', emoji: '🍽️', title: 'At a Restaurant', titleVi: 'Tại nhà hàng', lang: 'en',
        systemPrompt: 'You are a friendly waiter at a popular restaurant.',
        starter: "Welcome! I'll be your server today. Would you like to see the menu or do you already know what you'd like?",
        vocabulary: ['menu', 'order', 'appetizer', 'main course', 'dessert', 'bill', 'tip', 'reservation', 'recommend', 'vegetarian'],
        responses: [
            { triggers: ['menu', 'see'], reply: "Of course! Here's our menu. We have pasta, steak, grilled salmon, and a wonderful Caesar salad. Any allergies I should know about?" },
            { triggers: ['recommend', 'suggest', 'what do you'], reply: "I'd recommend our grilled salmon — it's our chef's special today! It comes with roasted vegetables and lemon butter sauce." },
            { triggers: ['order', 'like', 'have', 'want', 'get'], reply: "Great choice! Would you like anything to drink with that? We have fresh juices, coffee, and a selection of wines." },
            { triggers: ['drink', 'water', 'juice', 'coffee', 'wine'], reply: "Perfect! I'll bring that right out. Would you also like to start with an appetizer? Our soup of the day is tomato bisque." },
            { triggers: ['bill', 'check', 'pay'], reply: "Of course! Your total comes to $35.50. Would you like to pay by card or cash?" },
            { triggers: ['dessert', 'sweet'], reply: "We have tiramisu, chocolate lava cake, and fresh fruit. The tiramisu is absolutely delicious!" },
            { triggers: ['thank', 'thanks'], reply: "You're welcome! It was my pleasure serving you. Have a wonderful evening! 😊" },
            { triggers: ['allerg', 'vegetarian', 'vegan', 'gluten'], reply: "Absolutely, we can accommodate that! We have several vegetarian options, and our chef can modify most dishes. Let me highlight those for you." },
            { triggers: ['wait', 'long', 'time'], reply: "I apologize for the wait. Your food should be ready in about 10 minutes. Can I get you some bread while you wait?" },
            { triggers: ['reservation', 'book', 'table'], reply: "I can help with that! For how many people and what date? We have availability this Friday evening." },
        ],
    },
    {
        id: 'airport', emoji: '✈️', title: 'At the Airport', titleVi: 'Tại sân bay', lang: 'en',
        systemPrompt: 'You are a helpful airport check-in agent.',
        starter: "Good morning! Welcome to the check-in counter. May I see your passport and booking confirmation, please?",
        vocabulary: ['boarding pass', 'gate', 'luggage', 'carry-on', 'delay', 'terminal', 'customs', 'immigration', 'aisle seat', 'window seat'],
        responses: [
            { triggers: ['passport', 'booking', 'here', 'yes'], reply: "Thank you! I can see your flight to London, departing at 2:30 PM from Gate B12. Would you like an aisle seat or window seat?" },
            { triggers: ['window', 'aisle', 'seat'], reply: "Done! I've assigned you seat 14A by the window. Do you have any checked luggage today?" },
            { triggers: ['luggage', 'bag', 'suitcase', 'check'], reply: "Please place your bag on the scale. It's 22 kg — within the limit. Here's your luggage tag. Anything else?" },
            { triggers: ['gate', 'where', 'terminal'], reply: "Your gate is B12, in Terminal 2. Go through security, turn right, and it's about a 10-minute walk. Boarding starts at 2:00 PM." },
            { triggers: ['delay', 'late', 'cancel', 'time'], reply: "Let me check... Your flight is currently on schedule. However, I'd recommend being at the gate by 2:00 PM for boarding." },
            { triggers: ['upgrade', 'business', 'first'], reply: "Let me check availability... There is one business class seat available for an additional $350. Would you like to upgrade?" },
            { triggers: ['wifi', 'lounge', 'food'], reply: "Free Wi-Fi is available throughout the terminal. There's a food court near Gate B10, and the business lounge is on the upper level." },
            { triggers: ['thank', 'thanks'], reply: "You're welcome! Have a wonderful flight. Your gate is B12 — enjoy! ✈️" },
        ],
    },
    {
        id: 'doctor', emoji: '🏥', title: 'Doctor Visit', titleVi: 'Khám bệnh', lang: 'en',
        systemPrompt: 'You are a friendly doctor at a clinic.',
        starter: "Hello! I'm Dr. Smith. Please have a seat. What brings you in today?",
        vocabulary: ['symptoms', 'headache', 'fever', 'prescription', 'medicine', 'appointment', 'check-up', 'blood test', 'diagnosis', 'recovery'],
        responses: [
            { triggers: ['headache', 'head', 'pain', 'hurt'], reply: "I see. How long have you been having these headaches? Are they on one side or both sides? Any other symptoms like nausea or sensitivity to light?" },
            { triggers: ['fever', 'temperature', 'hot', 'cold', 'chill'], reply: "Let me take your temperature... It's 38.2°C — a mild fever. Have you been feeling any body aches or fatigue along with it?" },
            { triggers: ['cough', 'throat', 'sore'], reply: "Open your mouth and say 'aah'. Your throat looks a bit red. How long has the cough been going on? Is it dry or productive?" },
            { triggers: ['stomach', 'nausea', 'vomit', 'digest'], reply: "I understand. Have you eaten anything unusual recently? Let me examine your abdomen. Any pain when I press here?" },
            { triggers: ['medicine', 'prescri', 'drug', 'pill'], reply: "I'll prescribe some ibuprofen for the pain and recommend rest. Take it twice daily with food. If symptoms persist after 3 days, come back." },
            { triggers: ['test', 'blood', 'check'], reply: "I think a blood test would be helpful. I'll order a complete blood count. You can go to the lab on the 2nd floor. Results will be ready tomorrow." },
            { triggers: ['day', 'week', 'long', 'since', 'yesterday'], reply: "I see. Given the duration, I'd like to run a few tests to be thorough. It's likely nothing serious, but better to be safe." },
            { triggers: ['thank', 'thanks'], reply: "You're welcome! Remember to drink plenty of fluids and rest. I'll see you for a follow-up next week. Take care! 😊" },
        ],
    },
    {
        id: 'interview', emoji: '💼', title: 'Job Interview', titleVi: 'Phỏng vấn xin việc', lang: 'en',
        systemPrompt: 'You are a hiring manager conducting a job interview.',
        starter: "Hello! Thank you for coming in today. Please, have a seat. Shall we begin? Could you tell me a little about yourself?",
        vocabulary: ['experience', 'qualifications', 'teamwork', 'leadership', 'salary', 'strengths', 'weaknesses', 'motivated', 'deadline', 'responsibilities'],
        responses: [
            { triggers: ['experience', 'work', 'job', 'year', 'company'], reply: "Interesting background! What would you say was your biggest achievement in your previous role?" },
            { triggers: ['achieve', 'accomplish', 'success', 'project'], reply: "That's impressive! Can you tell me about a time you faced a challenge at work and how you handled it?" },
            { triggers: ['challenge', 'difficult', 'problem', 'solve'], reply: "Great problem-solving approach! What are your greatest strengths that you'd bring to this position?" },
            { triggers: ['strength', 'good at', 'skill', 'best'], reply: "Those are valuable qualities! Now, what would you say is an area you're working on improving?" },
            { triggers: ['weakness', 'improve', 'working on', 'learn'], reply: "I appreciate your honesty! Where do you see yourself in five years?" },
            { triggers: ['five year', 'future', 'goal', 'career', 'grow'], reply: "That's a great vision! Do you have any questions about the position or our company?" },
            { triggers: ['salary', 'pay', 'compensation', 'benefit'], reply: "The salary range for this position is $55,000-$70,000, depending on experience. We also offer health insurance, 20 vacation days, and a 401(k) match." },
            { triggers: ['question', 'ask', 'know', 'curious'], reply: "Great questions! We'll be in touch within a week. Thank you so much for your time today — it was wonderful meeting you!" },
            { triggers: ['team', 'collaborat', 'together'], reply: "Teamwork is very important here! We work in cross-functional teams. How would you describe your collaboration style?" },
            { triggers: ['thank', 'thanks', 'pleasure'], reply: "The pleasure is mine! We'll review all candidates this week and get back to you. Best of luck! 🤝" },
        ],
    },
    {
        id: 'hotel', emoji: '🏨', title: 'Hotel Check-in', titleVi: 'Nhận phòng khách sạn', lang: 'en',
        systemPrompt: 'You are a hotel receptionist.',
        starter: "Good evening! Welcome to the Grand Hotel. Do you have a reservation with us?",
        vocabulary: ['reservation', 'check-in', 'check-out', 'room service', 'suite', 'single', 'double', 'breakfast', 'wake-up call', 'parking'],
        responses: [
            { triggers: ['reservation', 'book', 'yes', 'name'], reply: "Let me look that up... Yes, I found it! A double room for 3 nights. Your room is 507 on the 5th floor. Here's your key card." },
            { triggers: ['no reserv', 'walk-in', 'available', 'room'], reply: "Let me check availability. We have a deluxe double room available at $120/night, and a suite at $200/night. Which would you prefer?" },
            { triggers: ['breakfast', 'meal', 'food', 'restaurant'], reply: "Breakfast is included! It's served in the restaurant on the ground floor from 6:30 to 10:00 AM. We also have 24-hour room service." },
            { triggers: ['wifi', 'internet', 'password'], reply: "Free WiFi is available throughout the hotel. The network is 'GrandHotel' and the password is on your key card holder." },
            { triggers: ['check-out', 'leave', 'time'], reply: "Check-out is at 11:00 AM. If you need a late check-out, we can extend to 1:00 PM for a small fee. Just let us know!" },
            { triggers: ['pool', 'gym', 'spa', 'facility'], reply: "The pool and gym are on the 2nd floor, open 6 AM to 10 PM. The spa offers massages by appointment. Shall I book one?" },
            { triggers: ['thank', 'thanks'], reply: "You're welcome! Enjoy your stay. If you need anything, dial 0 on the room phone. Have a wonderful evening! ✨" },
        ],
    },
];

// ============ GRAMMAR CHECKER (lightweight) ============
const GRAMMAR_RULES = [
    { pattern: /\bi (am|was|have|had|will|would|can|could|should|want|need|like|think|know|go|went|see|saw)\b/g, fix: (m) => m.replace(/^i\b/, 'I'), label: "Capitalize 'I'", labelVi: "Viết hoa 'I'" },
    { pattern: /\b(he|she|it) (go|have|do|want|need|like|come|make|take|say)\b/gi, fix: (m) => { const w = m.split(' '); return `${w[0]} ${w[1]}s`; }, label: 'Subject-verb agreement · 3rd person -s', labelVi: 'Chia động từ ngôi 3 +s' },
    { pattern: /\b(yesterday|last week|last month|ago) .*(go|come|have|make|take|do|see|get|say|tell|give|find)\b/gi, fix: null, label: 'Use past tense with time markers', labelVi: 'Dùng thì quá khứ với dấu hiệu thời gian' },
    { pattern: /\bdoes ('nt|not) \w+s\b/gi, fix: null, label: "Don't add -s after does/doesn't", labelVi: "Không thêm -s sau does/doesn't" },
];

function checkGrammar(text) {
    const issues = [];
    for (const rule of GRAMMAR_RULES) {
        const matches = text.match(rule.pattern);
        if (matches) {
            for (const match of matches) {
                const fixed = rule.fix ? rule.fix(match) : null;
                if (fixed && fixed !== match) {
                    issues.push({
                        original: match,
                        suggestion: fixed,
                        label: rule.label,
                        labelVi: rule.labelVi,
                    });
                } else if (!rule.fix) {
                    issues.push({
                        original: match,
                        suggestion: null,
                        label: rule.label,
                        labelVi: rule.labelVi,
                    });
                }
            }
        }
    }
    return issues;
}

// ============ VOCABULARY SCORING ============
function scoreVocabUsage(text, vocabulary) {
    const lower = text.toLowerCase();
    const used = vocabulary.filter(v => lower.includes(v.toLowerCase()));
    return { used, total: vocabulary.length, pct: Math.round((used.length / vocabulary.length) * 100) };
}

// ============ NATIVE REPHRASE (rule-based) ============
function suggestNativeRephrase(text) {
    let better = text;
    // Common rephrase patterns
    const patterns = [
        [/\bi want to\b/gi, "I'd like to"],
        [/\bcan you\b/gi, "Could you"],
        [/\bgive me\b/gi, "Could I have"],
        [/\bi think it is\b/gi, "I believe it's"],
        [/\bi need\b/gi, "I'd need"],
        [/\btell me about\b/gi, "Could you tell me about"],
        [/\bi don't know\b/gi, "I'm not sure"],
        [/\bwhat is\b/gi, "What's"],
        [/\bvery good\b/gi, "excellent"],
        [/\bvery bad\b/gi, "terrible"],
        [/\bvery big\b/gi, "enormous"],
        [/\bvery small\b/gi, "tiny"],
    ];
    for (const [rx, rep] of patterns) {
        better = better.replace(rx, rep);
    }
    return better !== text ? better : null;
}

function findBestResponse(userInput, scenario) {
    const input = userInput.toLowerCase();
    let best = null;
    let bestScore = 0;

    for (const r of scenario.responses) {
        const score = r.triggers.reduce((acc, t) => acc + (input.includes(t) ? 1 : 0), 0);
        if (score > bestScore) { bestScore = score; best = r; }
    }

    if (best && bestScore > 0) return best.reply;

    const fallbacks = [
        "That's interesting! Could you tell me more?",
        "I understand. Is there anything else I can help you with?",
        "Sure! Let me help you with that.",
        "Great question! Let me think about that for a moment...",
    ];
    return fallbacks[Math.floor(Math.random() * fallbacks.length)];
}

// ============ MAIN COMPONENT ============
export default function ConversationAI() {
    const navigate = useNavigate();
    const { state, dispatch } = useGame();
    const adult = isAdultMode(state.userMode);
    const { readiness } = useDeviceCapabilities();

    // Core state
    const [selectedScenario, setSelectedScenario] = useState(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);

    // Voice state
    const [voiceMode, setVoiceMode] = useState(false);
    const [recState, setRecState] = useState('idle'); // idle | listening | processing
    const [interimText, setInterimText] = useState('');
    const [waveAmplitude, setWaveAmplitude] = useState(0);
    const [aiSpeaking, setAiSpeaking] = useState(false);
    const [speechSpeed, setSpeechSpeed] = useState(0.85);

    // Coaching state
    const [expandedCoaching, setExpandedCoaching] = useState(null); // message index
    const [showSummary, setShowSummary] = useState(false);

    // Tutor state (Track D)
    const [selectedTutor, setSelectedTutor] = useState(TUTORS[0]);
    const [celebration, setCelebration] = useState(null); // { type, message }

    // Refs
    const chatEndRef = useRef(null);
    const inputRef = useRef(null);
    const recognitionRef = useRef(null);
    const timeoutRef = useRef(null);
    const analyserRef = useRef(null);
    const frameRef = useRef(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Cleanup
    useEffect(() => {
        return () => {
            recognitionRef.current?.abort();
            clearTimeout(timeoutRef.current);
            cancelAnimationFrame(frameRef.current);
            window.speechSynthesis.cancel();
            if (analyserRef.current) {
                analyserRef.current.stream?.getTracks().forEach(t => t.stop());
                analyserRef.current.ctx?.close();
            }
        };
    }, []);

    // Session stats
    const sessionStats = useMemo(() => {
        const userMsgs = messages.filter(m => m.role === 'user');
        const allGrammar = userMsgs.flatMap(m => m.grammar || []);
        const allVocab = [...new Set(userMsgs.flatMap(m => m.vocabUsed || []))];
        const rephrases = userMsgs.filter(m => m.rephrase).length;
        return {
            turns: userMsgs.length,
            grammarIssues: allGrammar.length,
            grammarItems: allGrammar.slice(0, 8),
            vocabUsed: allVocab,
            vocabTotal: selectedScenario?.vocabulary?.length || 10,
            rephraseOpps: rephrases,
        };
    }, [messages, selectedScenario]);

    // ============ WAVEFORM ============
    const startWaveform = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const source = ctx.createMediaStreamSource(stream);
            const analyser = ctx.createAnalyser();
            analyser.fftSize = 256;
            source.connect(analyser);
            analyserRef.current = { analyser, ctx, stream };
            const data = new Uint8Array(analyser.frequencyBinCount);
            const tick = () => {
                analyser.getByteFrequencyData(data);
                setWaveAmplitude(data.reduce((a, b) => a + b, 0) / data.length / 128);
                frameRef.current = requestAnimationFrame(tick);
            };
            tick();
        } catch { /* fail silently */ }
    }, []);

    const stopWaveform = useCallback(() => {
        cancelAnimationFrame(frameRef.current);
        setWaveAmplitude(0);
        if (analyserRef.current) {
            analyserRef.current.stream?.getTracks().forEach(t => t.stop());
            analyserRef.current.ctx?.close();
            analyserRef.current = null;
        }
    }, []);

    // ============ SPEAK AI RESPONSE ============
    const speakAiResponse = useCallback((text) => {
        if (!voiceMode) return;
        setAiSpeaking(true);
        speakText(text, {
            lang: 'en-US',
            rate: speechSpeed,
            onEnd: () => setAiSpeaking(false),
        });
    }, [voiceMode, speechSpeed]);

    // ============ START SCENARIO ============
    const startScenario = useCallback((scenario) => {
        setSelectedScenario(scenario);
        const starterMsg = { role: 'ai', text: scenario.starter, time: new Date() };
        setMessages([starterMsg]);
        setShowSummary(false);
        setExpandedCoaching(null);
        setTimeout(() => inputRef.current?.focus(), 300);
    }, []);

    // ============ PROCESS USER INPUT ============
    const processUserInput = useCallback((text) => {
        if (!text.trim() || !selectedScenario) return;

        const grammar = checkGrammar(text);
        const vocab = scoreVocabUsage(text, selectedScenario.vocabulary);
        const rephrase = suggestNativeRephrase(text);

        const userMsg = {
            role: 'user',
            text: text.trim(),
            time: new Date(),
            grammar,
            vocabUsed: vocab.used,
            rephrase,
            hasCoaching: grammar.length > 0 || rephrase,
        };

        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);

        const delay = 600 + Math.random() * 800;
        setTimeout(() => {
            const reply = findBestResponse(userMsg.text, selectedScenario);
            const aiMsg = { role: 'ai', text: reply, time: new Date() };
            setMessages(prev => [...prev, aiMsg]);
            setIsTyping(false);
            dispatch({ type: 'ADD_XP', payload: 5 });
            speakAiResponse(reply);
        }, delay);
    }, [selectedScenario, dispatch, speakAiResponse]);

    // ============ SEND TEXT MESSAGE ============
    const sendMessage = useCallback(() => {
        processUserInput(input);
    }, [input, processUserInput]);

    // ============ VOICE RECORDING ============
    const startRecording = useCallback(async () => {
        setInterimText('');
        setRecState('listening');

        const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SR) {
            setVoiceMode(false);
            return;
        }

        try {
            await navigator.mediaDevices.getUserMedia({ audio: true });
        } catch {
            setRecState('idle');
            return;
        }

        const rec = new SR();
        rec.lang = 'en-US';
        rec.interimResults = true;
        rec.continuous = true;
        rec.maxAlternatives = 3;

        let fullTranscript = '';

        rec.onresult = (e) => {
            let interim = '';
            let final = '';
            for (let i = 0; i < e.results.length; i++) {
                if (e.results[i].isFinal) final += e.results[i][0].transcript;
                else interim += e.results[i][0].transcript;
            }
            if (final) {
                fullTranscript = final;
                setInterimText('');
            } else {
                setInterimText(interim);
            }
        };

        rec.onerror = (e) => {
            clearTimeout(timeoutRef.current);
            stopWaveform();
            if (e.error !== 'aborted') {
                setRecState('idle');
            }
        };

        rec.onend = () => {
            clearTimeout(timeoutRef.current);
            stopWaveform();
            if (fullTranscript.trim()) {
                setRecState('processing');
                setTimeout(() => {
                    processUserInput(fullTranscript.trim());
                    setRecState('idle');
                }, 200);
            } else {
                setRecState('idle');
            }
        };

        recognitionRef.current = rec;
        try {
            rec.start();
            startWaveform();
            timeoutRef.current = setTimeout(() => recognitionRef.current?.stop(), 15000);
        } catch {
            setRecState('idle');
        }
    }, [processUserInput, startWaveform, stopWaveform]);

    const stopRecording = useCallback(() => {
        clearTimeout(timeoutRef.current);
        recognitionRef.current?.stop();
    }, []);

    // ============ SCENARIO SELECTION ============
    if (!selectedScenario) {
        return (
            <div className="page">
                <div className="page-header">
                    <button className="page-header__back" onClick={() => navigate(-1)}>←</button>
                    <h2 className="page-header__title">💬 {adult ? 'AI Conversation' : 'Hội thoại AI'}</h2>
                </div>

                {/* Track D: Tutor Selector */}
                <div style={{ marginBottom: '14px' }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--color-text-light)', marginBottom: '6px' }}>
                        {adult ? 'Your Tutor' : 'Gia sư của bạn'}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <TutorSelector currentTutorId={selectedTutor.id} onSelect={setSelectedTutor} isAdult={adult} />
                        <span style={{ fontSize: '0.7rem', color: 'var(--color-text-light)', fontStyle: 'italic' }}>
                            {adult ? selectedTutor.personality : selectedTutor.personalityVi}
                        </span>
                    </div>
                </div>

                <p style={{ color: 'var(--color-text-light)', fontSize: '0.85rem', marginBottom: '20px' }}>
                    {adult ? 'Choose a real-life scenario to practice speaking:' : 'Chọn tình huống thực tế để luyện nói:'}
                </p>
                <CapabilityNotice
                    icon="🧭"
                    title="Conversation engine status"
                    badge={readiness.conversation.badge}
                    tone="info"
                    summary={readiness.conversation.summary}
                />
                <div style={{ display: 'grid', gap: '10px' }}>
                    {SCENARIOS.map(s => (
                        <div key={s.id} className="glass-card" onClick={() => startScenario(s)}
                            style={{ padding: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '14px', transition: 'transform 0.2s' }}>
                            <div style={{ fontSize: '2rem' }}>{s.emoji}</div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{adult ? s.title : s.titleVi}</div>
                                <div style={{ fontSize: '0.72rem', color: 'var(--color-text-light)', marginTop: '2px' }}>
                                    {s.vocabulary.slice(0, 5).join(' · ')}
                                </div>
                            </div>
                            <span style={{ fontSize: '1.2rem', color: 'var(--color-primary)' }}>▶</span>
                        </div>
                    ))}
                </div>

                {celebration && <CelebrationOverlay type={celebration.type} message={celebration.message} onDone={() => setCelebration(null)} />}
            </div>
        );
    }

    // ============ CHAT INTERFACE ============
    const hasSpeech = typeof window !== 'undefined' && !!(window.SpeechRecognition || window.webkitSpeechRecognition);

    return (
        <div className="page" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 60px)', padding: '0' }}>
            {/* Header */}
            <div style={{
                padding: '10px 16px', background: 'var(--color-card)', backdropFilter: 'blur(8px)',
                display: 'flex', alignItems: 'center', gap: '10px',
                borderBottom: '1px solid var(--color-border)', boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            }}>
                <button onClick={() => { setSelectedScenario(null); setMessages([]); setShowSummary(false); window.speechSynthesis.cancel(); }}
                    style={{ background: 'none', border: 'none', color: 'var(--color-text)', fontSize: '1.2rem', cursor: 'pointer' }}>←</button>
                <div style={{ fontSize: '1.5rem' }}>{selectedScenario.emoji}</div>
                <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--color-text)' }}>{adult ? selectedScenario.title : selectedScenario.titleVi}</div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--color-text-light)' }}>{selectedScenario.systemPrompt}</div>
                </div>
                {/* Voice toggle */}
                {hasSpeech && (
                    <button onClick={() => { setVoiceMode(!voiceMode); window.speechSynthesis.cancel(); setAiSpeaking(false); }}
                        style={{
                            padding: '6px 12px', borderRadius: '16px', border: 'none', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer',
                            background: voiceMode ? 'linear-gradient(135deg, #4F46E5, #6366F1)' : 'var(--color-bg)',
                            color: voiceMode ? '#fff' : 'var(--color-text-light)',
                            transition: 'all 0.2s',
                        }}>
                        {voiceMode ? '🎙️ Voice ON' : '⌨️ Text'}
                    </button>
                )}
                {/* Summary button */}
                {messages.filter(m => m.role === 'user').length >= 2 && (
                    <button onClick={() => setShowSummary(!showSummary)}
                        style={{
                            padding: '6px 10px', borderRadius: '16px', border: 'none', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer',
                            background: showSummary ? 'rgba(34,197,94,0.15)' : 'var(--color-bg)',
                            color: showSummary ? '#059669' : 'var(--color-text-light)',
                        }}>
                        📊
                    </button>
                )}
            </div>

            {/* Voice speed control (when voice mode active) */}
            {voiceMode && (
                <div style={{
                    padding: '6px 16px', borderBottom: '1px solid var(--color-border)', background: 'var(--color-bg)',
                    display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center',
                }}>
                    <span style={{ fontSize: '0.68rem', color: 'var(--color-text-light)' }}>AI speed:</span>
                    {[0.7, 0.85, 1.0].map(s => (
                        <button key={s} onClick={() => setSpeechSpeed(s)}
                            style={{
                                padding: '2px 8px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                                fontSize: '0.65rem', fontWeight: speechSpeed === s ? 700 : 400,
                                background: speechSpeed === s ? 'var(--color-primary)' : 'transparent',
                                color: speechSpeed === s ? '#fff' : 'var(--color-text-light)',
                            }}>{s}x</button>
                    ))}
                    {aiSpeaking && <span style={{ fontSize: '0.68rem', color: '#6366F1', animation: 'pulse 1.5s infinite' }}>🔊 Speaking...</span>}
                </div>
            )}

            {/* Vocabulary helper */}
            <div style={{
                padding: '8px 16px', borderBottom: '1px solid var(--color-border)',
                display: 'flex', gap: '6px', flexWrap: 'wrap', overflowX: 'auto', background: 'var(--color-bg)',
            }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--color-text-light)', whiteSpace: 'nowrap', fontWeight: 600 }}>Key words:</span>
                {selectedScenario.vocabulary.map((v, i) => {
                    const isUsed = sessionStats.vocabUsed.includes(v);
                    return (
                        <button key={i} onClick={() => !voiceMode && setInput(prev => prev + (prev ? ' ' : '') + v)}
                            style={{
                                padding: '3px 10px', borderRadius: '8px', fontSize: '0.7rem', fontWeight: 600,
                                background: isUsed ? 'rgba(34,197,94,0.15)' : 'var(--color-primary)',
                                border: isUsed ? '1px solid rgba(34,197,94,0.3)' : 'none',
                                color: isUsed ? '#059669' : '#FFFFFF', cursor: 'pointer', whiteSpace: 'nowrap',
                                opacity: 0.85, transition: 'all 0.2s',
                            }}>
                            {isUsed && '✓ '}{v}
                        </button>
                    );
                })}
            </div>

            {/* ============ SESSION SUMMARY PANEL ============ */}
            {showSummary && (
                <div style={{
                    padding: '16px', background: 'var(--color-bg)', borderBottom: '1px solid var(--color-border)',
                    maxHeight: '300px', overflowY: 'auto',
                }}>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        📊 {adult ? 'Session Summary' : 'Tổng kết phiên'}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '12px' }}>
                        <div style={{ background: 'var(--color-card)', padding: '10px', borderRadius: '10px', textAlign: 'center', border: '1px solid var(--color-border)' }}>
                            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#4F46E5' }}>{sessionStats.turns}</div>
                            <div style={{ fontSize: '0.68rem', color: 'var(--color-text-light)' }}>{adult ? 'Turns' : 'Lượt nói'}</div>
                        </div>
                        <div style={{ background: 'var(--color-card)', padding: '10px', borderRadius: '10px', textAlign: 'center', border: '1px solid var(--color-border)' }}>
                            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: sessionStats.grammarIssues > 0 ? '#F59E0B' : '#22C55E' }}>{sessionStats.grammarIssues}</div>
                            <div style={{ fontSize: '0.68rem', color: 'var(--color-text-light)' }}>{adult ? 'Grammar' : 'Ngữ pháp'}</div>
                        </div>
                        <div style={{ background: 'var(--color-card)', padding: '10px', borderRadius: '10px', textAlign: 'center', border: '1px solid var(--color-border)' }}>
                            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#059669' }}>
                                {sessionStats.vocabUsed.length}/{sessionStats.vocabTotal}
                            </div>
                            <div style={{ fontSize: '0.68rem', color: 'var(--color-text-light)' }}>{adult ? 'Vocab' : 'Từ vựng'}</div>
                        </div>
                    </div>
                    {sessionStats.grammarItems.length > 0 && (
                        <div style={{ marginBottom: '8px' }}>
                            <div style={{ fontSize: '0.75rem', fontWeight: 700, marginBottom: '4px' }}>
                                {adult ? '⚠️ Grammar issues found:' : '⚠️ Lỗi ngữ pháp phát hiện:'}
                            </div>
                            {sessionStats.grammarItems.map((g, i) => (
                                <div key={i} style={{
                                    padding: '6px 10px', borderRadius: '8px', fontSize: '0.72rem', marginBottom: '4px',
                                    background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)',
                                }}>
                                    <span style={{ textDecoration: 'line-through', color: '#DC2626' }}>{g.original}</span>
                                    {g.suggestion && <span> → <strong style={{ color: '#059669' }}>{g.suggestion}</strong></span>}
                                    <div style={{ fontSize: '0.65rem', color: 'var(--color-text-light)', marginTop: '2px' }}>
                                        {g.label} · {g.labelVi}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    {sessionStats.vocabUsed.length > 0 && (
                        <div>
                            <div style={{ fontSize: '0.75rem', fontWeight: 700, marginBottom: '4px' }}>
                                {adult ? '✅ Vocabulary used:' : '✅ Từ vựng đã dùng:'}
                            </div>
                            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                                {sessionStats.vocabUsed.map(v => (
                                    <span key={v} style={{ padding: '2px 8px', borderRadius: '6px', fontSize: '0.68rem', background: 'rgba(34,197,94,0.1)', color: '#059669', fontWeight: 600 }}>{v}</span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* ============ MESSAGES ============ */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
                {messages.map((msg, i) => (
                    <div key={i} style={{ marginBottom: '12px' }}>
                        <div style={{
                            display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                        }}>
                            <div style={{
                                maxWidth: '80%', padding: '10px 14px', borderRadius: '16px',
                                background: msg.role === 'user'
                                    ? 'linear-gradient(135deg, #4F46E5, #6366F1)'
                                    : 'var(--color-card)',
                                color: msg.role === 'user' ? '#FFFFFF' : 'var(--color-text)',
                                fontSize: '0.88rem', lineHeight: 1.6,
                                borderBottomRightRadius: msg.role === 'user' ? '4px' : '16px',
                                borderBottomLeftRadius: msg.role === 'ai' ? '4px' : '16px',
                                border: msg.role === 'ai' ? '1px solid var(--color-border)' : 'none',
                                boxShadow: msg.role === 'ai' ? '0 1px 4px rgba(0,0,0,0.06)' : '0 2px 8px rgba(79,70,229,0.25)',
                                cursor: msg.hasCoaching ? 'pointer' : 'default',
                            }}
                                onClick={() => msg.hasCoaching && setExpandedCoaching(expandedCoaching === i ? null : i)}
                            >
                                {msg.text}
                                {msg.hasCoaching && (
                                    <span style={{ marginLeft: '6px', fontSize: '0.65rem', opacity: 0.7 }}>
                                        {expandedCoaching === i ? '▲' : '💡 tap to improve · nhấn để cải thiện'}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* ============ INLINE COACHING CARD ============ */}
                        {expandedCoaching === i && msg.hasCoaching && (
                            <div style={{
                                marginTop: '6px', marginLeft: 'auto', maxWidth: '85%', padding: '12px',
                                borderRadius: '12px', background: 'rgba(99,102,241,0.06)',
                                border: '1px solid rgba(99,102,241,0.15)',
                            }}>
                                {/* Grammar fixes */}
                                {msg.grammar?.length > 0 && (
                                    <div style={{ marginBottom: '8px' }}>
                                        <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#F59E0B', marginBottom: '4px' }}>
                                            ✏️ {adult ? 'Grammar correction' : 'Sửa ngữ pháp'}
                                        </div>
                                        {msg.grammar.map((g, gi) => (
                                            <div key={gi} style={{ fontSize: '0.78rem', marginBottom: '3px', lineHeight: 1.4 }}>
                                                <span style={{ textDecoration: 'line-through', color: '#EF4444' }}>{g.original}</span>
                                                {g.suggestion && <span> → <strong style={{ color: '#22C55E' }}>{g.suggestion}</strong></span>}
                                                <div style={{ fontSize: '0.65rem', color: 'var(--color-text-light)' }}>
                                                    {g.label} · {g.labelVi}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {/* Native rephrase */}
                                {msg.rephrase && (
                                    <div>
                                        <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#6366F1', marginBottom: '4px' }}>
                                            🗣️ {adult ? 'Say it like a native' : 'Nói như người bản xứ'}
                                        </div>
                                        <div style={{
                                            padding: '8px 10px', borderRadius: '8px', fontSize: '0.82rem',
                                            background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)',
                                            fontStyle: 'italic', lineHeight: 1.5,
                                        }}>
                                            "{msg.rephrase}"
                                        </div>
                                        {voiceMode && (
                                            <button onClick={(e) => { e.stopPropagation(); speakText(msg.rephrase, { lang: 'en-US', rate: 0.85 }); }}
                                                style={{
                                                    marginTop: '6px', padding: '4px 12px', borderRadius: '8px', border: '1px solid rgba(99,102,241,0.2)',
                                                    background: 'transparent', fontSize: '0.68rem', color: '#6366F1', cursor: 'pointer', fontWeight: 600,
                                                }}>
                                                🔊 {adult ? 'Listen' : 'Nghe mẫu'}
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ))}
                {isTyping && (
                    <div style={{ display: 'flex', marginBottom: '10px' }}>
                        <div style={{
                            padding: '10px 18px', borderRadius: '16px', borderBottomLeftRadius: '4px',
                            background: 'var(--color-card)', border: '1px solid var(--color-border)',
                            fontSize: '0.88rem',
                        }}>
                            <span className="typing-dots">
                                <span style={{ animationDelay: '0s' }}>•</span>
                                <span style={{ animationDelay: '0.2s' }}>•</span>
                                <span style={{ animationDelay: '0.4s' }}>•</span>
                            </span>
                        </div>
                    </div>
                )}
                <div ref={chatEndRef} />
            </div>

            {/* ============ VOICE RECORDING AREA ============ */}
            {voiceMode && recState === 'listening' && (
                <div style={{
                    padding: '8px 16px', background: 'rgba(239,68,68,0.05)', borderTop: '1px solid rgba(239,68,68,0.15)',
                    textAlign: 'center',
                }}>
                    {/* Waveform */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2px', height: '32px', marginBottom: '4px' }}>
                        {Array.from({ length: 16 }, (_, i) => {
                            const h = Math.max(3, waveAmplitude * 20 * (0.5 + Math.sin(i * 0.7 + Date.now() * 0.003) * 0.5));
                            return (
                                <div key={i} style={{
                                    width: '3px', borderRadius: '2px', height: `${h}px`,
                                    background: `hsl(${220 + i * 8}, 80%, 60%)`, transition: 'height 0.1s',
                                }} />
                            );
                        })}
                    </div>
                    {interimText && (
                        <div style={{ fontSize: '0.8rem', color: '#6366F1', fontStyle: 'italic', marginBottom: '4px' }}>
                            ✏️ {interimText}...
                        </div>
                    )}
                    <div style={{ fontSize: '0.7rem', color: '#EF4444', fontWeight: 600, animation: 'pulse 1.5s infinite' }}>
                        🔴 {adult ? 'Listening... Tap ⏹ when done' : 'Đang nghe... Nhấn ⏹ khi xong'}
                    </div>
                </div>
            )}

            {/* ============ INPUT BAR ============ */}
            <div style={{
                padding: '10px 16px', background: 'var(--color-card)', backdropFilter: 'blur(8px)',
                borderTop: '1px solid var(--color-border)', display: 'flex', gap: '8px', alignItems: 'center',
                boxShadow: '0 -2px 8px rgba(0,0,0,0.04)',
            }}>
                {voiceMode ? (
                    <>
                        {recState === 'idle' ? (
                            <button onClick={startRecording}
                                disabled={aiSpeaking}
                                style={{
                                    flex: 1, padding: '12px', borderRadius: '24px', border: 'none', cursor: aiSpeaking ? 'default' : 'pointer',
                                    background: aiSpeaking ? 'var(--color-border)' : 'linear-gradient(135deg, #EF4444, #DC2626)',
                                    color: '#fff', fontSize: '0.9rem', fontWeight: 700,
                                    boxShadow: aiSpeaking ? 'none' : '0 4px 12px rgba(239,68,68,0.3)',
                                    opacity: aiSpeaking ? 0.5 : 1, transition: 'all 0.2s',
                                }}>
                                🎙️ {adult ? 'Hold to Speak' : 'Nhấn để Nói'}
                            </button>
                        ) : (
                            <button onClick={stopRecording}
                                style={{
                                    flex: 1, padding: '12px', borderRadius: '24px', border: 'none', cursor: 'pointer',
                                    background: '#1F2937', color: '#fff', fontSize: '0.9rem', fontWeight: 700,
                                    animation: 'pulse 1.5s infinite',
                                }}>
                                ⏹️ {adult ? 'Stop Recording' : 'Dừng ghi'}
                            </button>
                        )}
                        {/* Quick-switch to text */}
                        <button onClick={() => { setVoiceMode(false); setTimeout(() => inputRef.current?.focus(), 100); }}
                            style={{
                                padding: '12px', borderRadius: '50%', border: '1px solid var(--color-border)',
                                background: 'var(--color-bg)', cursor: 'pointer', fontSize: '0.9rem',
                            }}>⌨️</button>
                    </>
                ) : (
                    <>
                        <input
                            ref={inputRef}
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && sendMessage()}
                            placeholder={adult ? 'Type your response...' : 'Nhập câu trả lời...'}
                            style={{
                                flex: 1, padding: '10px 16px', borderRadius: '12px',
                                border: '1px solid var(--color-input-border)', background: 'var(--color-input-bg)',
                                color: 'var(--color-input-text)', fontSize: '0.9rem', outline: 'none',
                            }}
                        />
                        <button onClick={sendMessage}
                            disabled={!input.trim()}
                            style={{
                                padding: '10px 18px', borderRadius: '12px', border: 'none',
                                background: input.trim() ? 'var(--color-primary)' : 'var(--color-border)',
                                color: '#fff', fontSize: '1rem', cursor: input.trim() ? 'pointer' : 'default',
                                transition: 'all 0.2s',
                                boxShadow: input.trim() ? '0 2px 8px rgba(108,99,255,0.3)' : 'none',
                            }}>➤</button>
                        {/* Quick-switch to voice */}
                        {hasSpeech && (
                            <button onClick={() => setVoiceMode(true)}
                                style={{
                                    padding: '10px', borderRadius: '50%', border: '1px solid var(--color-border)',
                                    background: 'var(--color-bg)', cursor: 'pointer', fontSize: '0.9rem',
                                }}>🎙️</button>
                        )}
                    </>
                )}
            </div>

            <style>{`
                .typing-dots span {
                    display: inline-block;
                    animation: typingBounce 1.2s infinite;
                    color: var(--color-text-light);
                    font-size: 1.2rem;
                }
                @keyframes typingBounce {
                    0%, 80%, 100% { transform: translateY(0); }
                    40% { transform: translateY(-4px); }
                }
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }
            `}</style>
        </div>
    );
}
