// cefrData.js — CEFR Word Level Classification
// Source: github.com/Maximax67/Words-CEFR-Dataset (simplified)
// Provides O(1) lookup of English words → CEFR level (A1-C2)
// ~2000 most common words covered

const CEFR_LEVELS = {
    // A1 — Beginner (most basic words)
    A1: new Set([
        'a', 'about', 'after', 'all', 'also', 'an', 'and', 'any', 'are', 'as', 'at', 'back', 'be', 'because',
        'big', 'but', 'by', 'can', 'come', 'could', 'day', 'do', 'down', 'eat', 'find', 'first', 'for', 'from',
        'get', 'give', 'go', 'good', 'great', 'had', 'has', 'have', 'he', 'her', 'here', 'him', 'his', 'hot',
        'house', 'how', 'i', 'if', 'in', 'into', 'is', 'it', 'its', 'just', 'know', 'last', 'let', 'like', 'little',
        'long', 'look', 'make', 'man', 'many', 'may', 'me', 'more', 'much', 'must', 'my', 'name', 'new', 'no',
        'not', 'now', 'of', 'off', 'old', 'on', 'one', 'only', 'or', 'other', 'our', 'out', 'over', 'own', 'part',
        'people', 'place', 'put', 'read', 'right', 'run', 'said', 'same', 'say', 'see', 'she', 'should', 'show',
        'small', 'so', 'some', 'still', 'such', 'take', 'tell', 'than', 'that', 'the', 'their', 'them', 'then',
        'there', 'these', 'they', 'thing', 'think', 'this', 'time', 'to', 'too', 'two', 'under', 'up', 'us',
        'use', 'very', 'want', 'was', 'water', 'way', 'we', 'well', 'were', 'what', 'when', 'where', 'which',
        'who', 'why', 'will', 'with', 'woman', 'word', 'work', 'world', 'would', 'write', 'year', 'you', 'your',
        'boy', 'girl', 'mother', 'father', 'brother', 'sister', 'teacher', 'student', 'friend', 'family',
        'school', 'book', 'pen', 'table', 'chair', 'door', 'window', 'room', 'food', 'milk', 'bread', 'rice',
        'apple', 'cat', 'dog', 'bird', 'fish', 'car', 'bus', 'train', 'color', 'red', 'blue', 'green', 'white',
        'black', 'yellow', 'number', 'zero', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
        'hello', 'goodbye', 'please', 'thank', 'sorry', 'yes', 'morning', 'night', 'today', 'tomorrow',
    ]),

    // A2 — Elementary
    A2: new Set([
        'able', 'accept', 'across', 'act', 'age', 'ago', 'agree', 'air', 'allow', 'already', 'always',
        'among', 'animal', 'another', 'answer', 'appear', 'area', 'arm', 'around', 'art', 'ask',
        'away', 'baby', 'bad', 'bag', 'ball', 'bank', 'bar', 'base', 'become', 'bed', 'before', 'begin',
        'behind', 'believe', 'below', 'best', 'better', 'between', 'beyond', 'bit', 'body', 'born',
        'both', 'box', 'break', 'bring', 'brother', 'build', 'business', 'buy', 'call', 'car', 'card',
        'care', 'carry', 'case', 'catch', 'cause', 'center', 'century', 'certain', 'change', 'check',
        'child', 'children', 'choose', 'city', 'class', 'clean', 'clear', 'close', 'cold', 'common',
        'computer', 'continue', 'control', 'cook', 'cool', 'copy', 'corner', 'cost', 'country', 'cover',
        'cross', 'cup', 'cut', 'dark', 'daughter', 'dead', 'deal', 'death', 'decide', 'deep', 'describe',
        'develop', 'die', 'different', 'difficult', 'dinner', 'direction', 'discover', 'doctor', 'draw',
        'dream', 'dress', 'drink', 'drive', 'drop', 'during', 'each', 'early', 'earth', 'east', 'easy',
        'education', 'either', 'else', 'end', 'enough', 'enter', 'even', 'evening', 'ever', 'every',
        'everyone', 'everything', 'example', 'excite', 'exercise', 'expect', 'experience', 'explain',
        'eye', 'face', 'fact', 'fall', 'fast', 'feel', 'few', 'field', 'fill', 'final', 'finish', 'fire',
        'fly', 'follow', 'foot', 'force', 'foreign', 'forget', 'form', 'free', 'full', 'fun', 'future',
        'game', 'garden', 'general', 'glass', 'gold', 'gone', 'ground', 'group', 'grow', 'guess', 'hair',
        'half', 'hand', 'happen', 'happy', 'hard', 'head', 'health', 'hear', 'heart', 'heavy', 'help',
        'high', 'hit', 'hold', 'hole', 'home', 'hope', 'horse', 'hospital', 'hour', 'huge', 'human',
        'hundred', 'hurry', 'hurt', 'idea', 'important', 'include', 'increase', 'information', 'inside',
        'instead', 'interest', 'international', 'island', 'job', 'join', 'keep', 'key', 'kid', 'kill',
        'kind', 'king', 'land', 'language', 'large', 'late', 'laugh', 'law', 'lay', 'lead', 'learn',
        'leave', 'left', 'less', 'letter', 'level', 'lie', 'life', 'light', 'line', 'list', 'listen',
        'live', 'local', 'lose', 'lot', 'love', 'low', 'lunch', 'main', 'market', 'matter', 'mean',
        'meet', 'member', 'middle', 'might', 'mind', 'minute', 'miss', 'modern', 'moment', 'money',
        'month', 'move', 'movie', 'music', 'national', 'natural', 'near', 'need', 'never', 'next',
        'nice', 'north', 'note', 'nothing', 'notice', 'offer', 'office', 'often', 'oil', 'open',
        'order', 'outside', 'page', 'paint', 'pair', 'paper', 'parent', 'pass', 'past', 'pay',
        'perhaps', 'person', 'phone', 'pick', 'picture', 'piece', 'plan', 'play', 'point', 'police',
        'political', 'poor', 'popular', 'position', 'possible', 'power', 'practice', 'prepare',
        'present', 'president', 'pretty', 'price', 'problem', 'produce', 'program', 'protect',
        'provide', 'public', 'pull', 'push', 'queen', 'question', 'quick', 'quite', 'rain', 'raise',
        'rather', 'reach', 'real', 'reason', 'receive', 'record', 'relate', 'remember', 'report',
        'require', 'rest', 'result', 'return', 'rich', 'rise', 'road', 'rock', 'role', 'save',
        'science', 'sea', 'season', 'second', 'section', 'seem', 'sell', 'send', 'sense', 'serious',
        'serve', 'service', 'set', 'several', 'share', 'ship', 'short', 'side', 'simple', 'since',
        'sing', 'sit', 'situation', 'skin', 'sleep', 'slow', 'social', 'society', 'son', 'song',
        'soon', 'sort', 'sound', 'south', 'space', 'speak', 'special', 'spend', 'sport', 'stand',
        'star', 'start', 'state', 'stay', 'step', 'stop', 'store', 'story', 'street', 'strong',
        'study', 'subject', 'success', 'support', 'sure', 'table', 'team', 'test', 'travel', 'tree',
        'trouble', 'true', 'try', 'turn', 'type', 'understand', 'unit', 'until', 'usually', 'view',
        'visit', 'voice', 'wait', 'walk', 'wall', 'war', 'watch', 'wear', 'week', 'west', 'whether',
        'wide', 'wife', 'win', 'without', 'wonder', 'wrong', 'young',
    ]),

    // B1 — Intermediate
    B1: new Set([
        'absorb', 'abstract', 'abuse', 'access', 'accident', 'accompany', 'accomplish', 'account',
        'accurate', 'accuse', 'achieve', 'acknowledge', 'acquire', 'actual', 'adapt', 'add', 'address',
        'adequate', 'adjust', 'admire', 'admit', 'adopt', 'adult', 'advance', 'advantage', 'advertise',
        'advice', 'affect', 'afford', 'aggressive', 'aim', 'aircraft', 'alarm', 'alive', 'alternative',
        'amaze', 'amount', 'analyze', 'ancient', 'announce', 'annual', 'anticipate', 'anxiety', 'apart',
        'appeal', 'appropriate', 'approve', 'argue', 'arrange', 'arrest', 'arrive', 'aspect', 'assign',
        'assist', 'associate', 'assume', 'atmosphere', 'attach', 'attack', 'attempt', 'attend',
        'attitude', 'attract', 'audience', 'authority', 'automatic', 'available', 'average', 'avoid',
        'award', 'aware', 'background', 'balance', 'ban', 'basic', 'basis', 'battle', 'bear', 'beat',
        'beauty', 'behalf', 'behave', 'benefit', 'beside', 'bet', 'blame', 'blind', 'block', 'blow',
        'board', 'bomb', 'bone', 'border', 'boring', 'borrow', 'boss', 'bottom', 'bound', 'brain',
        'branch', 'brave', 'breath', 'bridge', 'brief', 'bright', 'broad', 'budget', 'bunch', 'burn',
        'burst', 'Cabinet', 'calculate', 'camera', 'campaign', 'capable', 'capture', 'career',
        'category', 'celebrate', 'challenge', 'champion', 'channel', 'chapter', 'character', 'charge',
        'chart', 'cheap', 'chemical', 'chief', 'circumstance', 'citizen', 'civil', 'claim', 'climate',
        'climb', 'coach', 'code', 'colleague', 'collect', 'column', 'combination', 'combine', 'comfort',
        'command', 'comment', 'commercial', 'commission', 'commit', 'communicate', 'community',
        'compare', 'compete', 'complain', 'complete', 'complex', 'concentrate', 'concept', 'concern',
        'conclude', 'concrete', 'condition', 'conduct', 'conference', 'confidence', 'confirm',
        'conflict', 'confuse', 'connect', 'conscious', 'consequence', 'conservative', 'consider',
        'consist', 'constant', 'construct', 'consult', 'consume', 'contact', 'contain', 'content',
        'context', 'contract', 'contrast', 'contribute', 'conversation', 'convince', 'corporate',
        'correct', 'court', 'crash', 'crazy', 'create', 'credit', 'crew', 'crime', 'crisis', 'critic',
        'critical', 'crowd', 'cultural', 'culture', 'currency', 'current', 'customer', 'cycle',
        'damage', 'danger', 'data', 'database', 'debate', 'debt', 'decade', 'decline', 'defeat',
        'defend', 'define', 'degree', 'delay', 'deliver', 'demand', 'democracy', 'demonstrate',
        'department', 'depend', 'deposit', 'depression', 'derive', 'deserve', 'design', 'desire',
        'despite', 'destroy', 'detail', 'detect', 'determine', 'device', 'digital', 'discipline',
        'discuss', 'disease', 'display', 'distance', 'distinct', 'distribute', 'district', 'diverse',
        'divide', 'document', 'domestic', 'doubt', 'draft', 'drama', 'dramatic', 'due', 'duty',
        'earn', 'economy', 'edge', 'edition', 'editor', 'educational', 'effective', 'efficient',
        'effort', 'elect', 'element', 'eliminate', 'emerge', 'emergency', 'emotion', 'emphasis',
        'employ', 'enable', 'encounter', 'encourage', 'enemy', 'engage', 'engineer', 'enormous',
        'ensure', 'enterprise', 'entire', 'environment', 'episode', 'equal', 'equipment', 'era',
        'error', 'escape', 'essay', 'essential', 'establish', 'estate', 'estimate', 'ethnic',
        'evaluate', 'eventually', 'evidence', 'evil', 'evolution', 'exact', 'examine', 'exceed',
        'excellent', 'exception', 'exchange', 'executive', 'exist', 'expand', 'experiment', 'expert',
        'explore', 'expose', 'extend', 'extra', 'extraordinary', 'extreme', 'facility', 'factor',
        'fail', 'fair', 'faith', 'familiar', 'famous', 'fan', 'fantasy', 'fate', 'fault', 'favor',
        'feature', 'feed', 'fiction', 'figure', 'finance', 'firm', 'fit', 'fix', 'flag', 'flat',
        'flight', 'float', 'flow', 'focus', 'folk', 'formal', 'former', 'formula', 'fortune', 'found',
        'foundation', 'frame', 'freedom', 'frequency', 'frequent', 'fuel', 'function', 'fund',
        'fundamental', 'gain', 'gap', 'gas', 'gate', 'gather', 'generation', 'genetic', 'genuine',
        'giant', 'gift', 'global', 'grade', 'grand', 'grant', 'guide', 'guilty',
    ]),

    // B2 — Upper Intermediate
    B2: new Set([
        'abolish', 'absence', 'abundant', 'academic', 'accelerate', 'accommodate', 'accumulate',
        'acute', 'adjacent', 'administer', 'advocate', 'aesthetic', 'aggregate', 'allocate', 'ambiguous',
        'amendment', 'analogy', 'apparatus', 'approximate', 'arbitrary', 'archive', 'articulate',
        'assertion', 'assurance', 'authentic', 'autonomous', 'bizarre', 'breach', 'bureaucracy',
        'casualty', 'chronic', 'civic', 'coalition', 'cognitive', 'coherent', 'coincide', 'commodity',
        'compensate', 'complement', 'compliance', 'comprehensive', 'comprise', 'compulsory', 'conceive',
        'concurrent', 'confine', 'consensus', 'consolidate', 'constitute', 'constraint', 'contemplate',
        'contradict', 'controversy', 'conventional', 'conversion', 'corrupt', 'counsel', 'countless',
        'credible', 'cumulative', 'curriculum', 'custody', 'cynical', 'database', 'decisive',
        'demographic', 'denounce', 'depict', 'deploy', 'derive', 'designate', 'deteriorate',
        'devote', 'dimension', 'dilemma', 'diminish', 'diplomacy', 'disclose', 'discourse', 'discrete',
        'discrimination', 'displace', 'dispose', 'disrupt', 'dissolve', 'distort', 'doctrine',
        'domain', 'dominant', 'draft', 'duration', 'dynamic', 'elaborate', 'eligible', 'embrace',
        'empirical', 'endorse', 'enforce', 'enhance', 'entity', 'entrepreneur', 'envision', 'equity',
        'erode', 'escalate', 'essence', 'ethical', 'evaluate', 'evolve', 'exaggerate', 'exclusive',
        'execute', 'exempt', 'exert', 'exhibit', 'exploit', 'extract', 'facade', 'facilitate',
        'faculty', 'feasible', 'fertile', 'fiscal', 'flexible', 'fluctuate', 'forecast', 'formulate',
        'forthcoming', 'fraction', 'fragment', 'framework', 'friction', 'fulfill', 'generous',
        'genocide', 'geography', 'gesture', 'glimpse', 'governance', 'grave', 'guarantee', 'guideline',
        'halt', 'harassment', 'harmony', 'harsh', 'hierarchy', 'highlight', 'horizon', 'hostile',
        'hypothesis', 'ideology', 'illusion', 'immense', 'implement', 'implicit', 'impose', 'impulse',
        'incentive', 'incidence', 'incorporate', 'index', 'indigenous', 'induce', 'inevitable',
        'infrastructure', 'inherent', 'inhibit', 'initiate', 'innovative', 'insight', 'inspect',
        'instance', 'integral', 'integrate', 'integrity', 'intellectual', 'intensify', 'intercept',
        'interfere', 'intermediate', 'intervene', 'intimate', 'intrinsic', 'invade', 'invoke',
        'isolate', 'jurisdiction', 'justify', 'keen', 'kinetic', 'landmark', 'layer', 'legacy',
        'legitimate', 'leverage', 'liberal', 'likewise', 'literacy', 'logical', 'magnitude',
        'mainstream', 'manipulate', 'manifest', 'marginal', 'mature', 'mechanism', 'medieval',
        'medium', 'merit', 'methodology', 'migrate', 'minimal', 'ministry', 'minority', 'mode',
        'moderate', 'modify', 'momentum', 'monitor', 'monopoly', 'moreover', 'mortality', 'motive',
        'municipal', 'mutual', 'narrative', 'navigate', 'negotiate', 'nonetheless', 'norm',
        'notion', 'nuclear', 'numerous', 'nurture', 'objective', 'oblige', 'obscure', 'obstacle',
        'offset', 'ongoing', 'opt', 'oral', 'orient', 'orthodox', 'outbreak', 'outlook', 'output',
        'overall', 'overlap', 'overturn', 'parallel', 'partial', 'paradox', 'parameter', 'passive',
        'patent', 'patron', 'peak', 'perceive', 'persistent', 'perspective', 'petition', 'pioneer',
        'plausible', 'plunge', 'portion', 'pose', 'postpone', 'potent', 'precede', 'precise',
        'predecessor', 'predominant', 'preliminary', 'premise', 'prescribe', 'presume', 'prevalent',
        'principal', 'priority', 'privilege', 'probe', 'proceed', 'proclaim', 'profound', 'prohibit',
        'project', 'prolong', 'prominent', 'prompt', 'propaganda', 'proportion', 'prosecute',
        'prospect', 'protocol', 'provoke', 'province', 'publication', 'pursue', 'quota', 'radical',
        'rational', 'realm', 'reconcile', 'refine', 'reform', 'regime', 'regulate', 'reinforce',
        'release', 'reluctant', 'rely', 'render', 'replicate', 'reside', 'resist', 'resolve',
        'resource', 'restore', 'restrain', 'retain', 'retreat', 'reveal', 'revenue', 'reverse',
        'revise', 'revolution', 'rhetoric', 'rigid', 'rival', 'robust', 'route', 'rural', 'sanction',
        'saturate', 'scenario', 'scope', 'secular', 'segment', 'seize', 'sequence', 'series',
        'severe', 'shelter', 'shift', 'shortage', 'significant', 'simulate', 'skeptic', 'solidarity',
        'sophisticated', 'source', 'span', 'specify', 'spectrum', 'sphere', 'spontaneous', 'stable',
        'stake', 'stance', 'statistic', 'stereotype', 'stimulus', 'straightforward', 'strategy',
        'stress', 'structural', 'subordinate', 'subsequent', 'subsidy', 'substitute', 'subtle',
        'successive', 'sufficient', 'summit', 'supplement', 'suppress', 'surplus', 'surveillance',
        'survey', 'suspend', 'sustain', 'symbolic', 'syndrome', 'tactic', 'target', 'temporary',
        'tendency', 'terminate', 'territory', 'testimony', 'theme', 'theoretical', 'therapy',
        'thereby', 'thesis', 'threat', 'threshold', 'tolerate', 'trace', 'tradition', 'trait',
        'transform', 'transition', 'transparent', 'trigger', 'ultimate', 'undergo', 'underlie',
        'undertake', 'uniform', 'unify', 'universal', 'unprecedented', 'utilize', 'vague', 'valid',
        'variable', 'venture', 'verify', 'version', 'vertical', 'viable', 'violation', 'virtue',
        'visible', 'visual', 'vital', 'voluntary', 'vulnerable', 'welfare', 'whereby', 'widespread',
    ]),
};

/**
 * Get CEFR level for a word
 * @param {string} word
 * @returns {string} 'A1' | 'A2' | 'B1' | 'B2' | 'C1' (default for unknown)
 */
export function getCEFRLevel(word) {
    const w = word.toLowerCase().trim();
    if (CEFR_LEVELS.A1.has(w)) return 'A1';
    if (CEFR_LEVELS.A2.has(w)) return 'A2';
    if (CEFR_LEVELS.B1.has(w)) return 'B1';
    if (CEFR_LEVELS.B2.has(w)) return 'B2';
    return 'C1'; // Unknown words assumed advanced
}

/**
 * Get color scheme for a CEFR level
 */
export function getCEFRColor(level) {
    const colors = {
        A1: { bg: '#10B98115', text: '#10B981', label: 'Beginner' },
        A2: { bg: '#3B82F615', text: '#3B82F6', label: 'Elementary' },
        B1: { bg: '#F59E0B15', text: '#F59E0B', label: 'Intermediate' },
        B2: { bg: '#8B5CF615', text: '#8B5CF6', label: 'Upper-Int' },
        C1: { bg: '#EF444415', text: '#EF4444', label: 'Advanced' },
        C2: { bg: '#EC489915', text: '#EC4899', label: 'Proficiency' },
    };
    return colors[level] || colors.C1;
}

/**
 * Classify difficulty of a passage (array of words)
 * Returns average CEFR level and distribution
 */
export function classifyPassageDifficulty(words) {
    const levels = { A1: 0, A2: 0, B1: 0, B2: 0, C1: 0 };
    const uniqueWords = [...new Set(words.map(w => w.toLowerCase().replace(/[^a-z'-]/g, '')).filter(w => w.length > 1))];

    for (const w of uniqueWords) {
        const level = getCEFRLevel(w);
        levels[level]++;
    }

    const total = uniqueWords.length || 1;
    const score = (levels.A1 * 1 + levels.A2 * 2 + levels.B1 * 3 + levels.B2 * 4 + levels.C1 * 5) / total;

    let overall = 'A1';
    if (score > 4) overall = 'C1';
    else if (score > 3.2) overall = 'B2';
    else if (score > 2.5) overall = 'B1';
    else if (score > 1.8) overall = 'A2';

    return { levels, total, score: Math.round(score * 10) / 10, overall };
}

export default { getCEFRLevel, getCEFRColor, classifyPassageDifficulty };
