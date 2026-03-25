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

    // C1 — Advanced
    C1: new Set([
        'aberration', 'abridge', 'abstain', 'accentuate', 'accolade', 'acquiesce', 'adept', 'adversary',
        'affluent', 'allegation', 'alleviate', 'amalgamate', 'ambivalent', 'amend', 'amiable', 'annihilate',
        'anomaly', 'antagonist', 'apathy', 'appease', 'apprehend', 'arduous', 'assert', 'astute',
        'atrocity', 'augment', 'auspicious', 'avert', 'avid', 'belligerent', 'benevolent', 'blatant',
        'bolster', 'brazen', 'brevity', 'candid', 'capitulate', 'catalyst', 'cede', 'censure',
        'circumvent', 'clandestine', 'coerce', 'cogent', 'commemorate', 'commensurate', 'compassion',
        'compel', 'complacent', 'concede', 'conciliatory', 'condone', 'confiscate', 'congenial',
        'connive', 'conscientious', 'consensus', 'construe', 'contentious', 'contrite', 'conundrum',
        'converge', 'conviction', 'copious', 'corollary', 'corroborate', 'culminate', 'curtail',
        'dearth', 'debilitate', 'decimate', 'decree', 'defer', 'defunct', 'delegate', 'deliberate',
        'deluge', 'demeanor', 'deplore', 'depose', 'deprive', 'deride', 'despondent', 'detrimental',
        'deviate', 'devise', 'diatribe', 'dichotomy', 'diffuse', 'digress', 'diligent', 'dire',
        'discern', 'discrepancy', 'discretion', 'disdain', 'dismantle', 'disparage', 'disparity',
        'dispatch', 'dispel', 'disseminate', 'dissent', 'diverge', 'dormant', 'dubious', 'duplicity',
        'eclectic', 'edify', 'efficacy', 'effusive', 'egregious', 'elicit', 'eloquent', 'elude',
        'emancipate', 'embark', 'eminent', 'empathy', 'emulate', 'encumber', 'endeavor', 'enigma',
        'enmity', 'ensue', 'entail', 'enumerate', 'envoy', 'ephemeral', 'epitome', 'equate',
        'equitable', 'eradicate', 'erratic', 'esteem', 'evade', 'exacerbate', 'exasperate', 'exemplary',
        'exemplify', 'exonerate', 'expedient', 'expedite', 'explicit', 'extort', 'extraneous',
        'fabricate', 'facet', 'fallacy', 'fathom', 'fervent', 'fickle', 'flaunt', 'fledgling',
        'flounder', 'flout', 'foment', 'forfeit', 'formidable', 'fortify', 'foster', 'frivolous',
        'frugal', 'futile', 'galvanize', 'garner', 'germane', 'grapple', 'gratuitous', 'grievance',
        'guise', 'hamper', 'haphazard', 'hasten', 'hegemony', 'heresy', 'hinder', 'holistic',
        'homogeneous', 'hubris', 'hypothetical', 'iconoclast', 'illuminate', 'imminent', 'impeach',
        'impede', 'impending', 'imperative', 'impervious', 'impetuous', 'implausible', 'implicate',
        'impoverish', 'impromptu', 'impunity', 'inadvertent', 'inception', 'incite', 'incoherent',
        'incur', 'indignant', 'indiscriminate', 'indispensable', 'inept', 'inexorable', 'infamous',
        'infatuate', 'infer', 'influx', 'infringe', 'ingenious', 'ingrained', 'inherently', 'innate',
        'innocuous', 'insinuate', 'instigate', 'intrepid', 'intricate', 'inundate', 'invoke',
        'irrevocable', 'jeopardize', 'judicious', 'jurisdiction', 'juxtapose', 'kindle', 'kinship',
        'labyrinth', 'lackluster', 'languish', 'lavish', 'legitimate', 'lenient', 'lethal', 'lethargic',
        'levity', 'liaison', 'liberate', 'linger', 'loathe', 'lucid', 'ludicrous', 'magnanimous',
        'malicious', 'mandate', 'mar', 'meager', 'mediate', 'mercenary', 'meticulous', 'milieu',
        'mitigate', 'monotonous', 'morbid', 'mundane', 'nefarious', 'negligent', 'niche', 'nomadic',
        'nonchalant', 'notorious', 'novice', 'nullify', 'oblivious', 'obnoxious', 'obscene', 'obsolete',
        'ominous', 'opaque', 'opportune', 'oppress', 'orthodox', 'ostentatious', 'oust', 'outlandish',
        'overhaul', 'oversight', 'overt', 'pacify', 'panacea', 'paradigm', 'paramount', 'paraphrase',
        'parity', 'partisan', 'pathological', 'patronize', 'paucity', 'pedagogy', 'pedestrian',
        'penchant', 'pensive', 'peripheral', 'permeate', 'perpetuate', 'pervasive', 'pilfer',
        'pinnacle', 'placate', 'platitude', 'plight', 'pragmatic', 'precarious', 'preclude',
        'preeminent', 'premise', 'prevalent', 'pristine', 'prodigious', 'proficient', 'prognosis',
        'proliferate', 'propensity', 'proprietary', 'proscribe', 'prototype', 'provenance', 'prudent',
        'purport', 'quandary', 'quarantine', 'quash', 'quintessential', 'ramification', 'rampant',
        'ratify', 'rebuke', 'recluse', 'redeem', 'redundant', 'refute', 'reiterate', 'relegate',
        'relinquish', 'remedial', 'remnant', 'remorse', 'renounce', 'repeal', 'repercussion',
        'replenish', 'reprehensible', 'reprimand', 'reproach', 'repudiate', 'resent', 'resilient',
        'restitution', 'restive', 'resurrect', 'retaliate', 'retract', 'retribution', 'retrograde',
        'revere', 'rhetoric', 'rigorous', 'riveting', 'rudimentary', 'ruthless', 'sacrosanct',
        'sagacious', 'salient', 'satire', 'scant', 'scathing', 'scrupulous', 'scrutinize', 'seclude',
        'sedentary', 'sentinel', 'serendipity', 'servile', 'shrewd', 'skeptical', 'slander',
        'solace', 'solicit', 'somber', 'sovereign', 'sparse', 'sporadic', 'spurious', 'stagnant',
        'staunch', 'stigma', 'stipulate', 'stoic', 'stringent', 'subversive', 'succinct', 'succumb',
        'superficial', 'supplant', 'surpass', 'surreptitious', 'susceptible', 'sycophant', 'tangible',
        'tantamount', 'tedious', 'temper', 'tenacious', 'tentative', 'tenure', 'terse', 'theological',
        'thorough', 'thwart', 'tirade', 'tranquil', 'transcend', 'transgress', 'transient', 'traverse',
        'trepidation', 'trivial', 'tumultuous', 'ubiquitous', 'undermine', 'underscore', 'unilateral',
        'unprecedented', 'unscrupulous', 'uphold', 'usurp', 'utilitarian', 'utopia', 'vacillate',
        'vehement', 'venerate', 'verbose', 'versatile', 'vex', 'vindicate', 'virulent', 'visceral',
        'volatile', 'volition', 'voracious', 'wane', 'warrant', 'wield', 'zealous',
    ]),

    // C2 — Proficiency (Mastery level)
    C2: new Set([
        'abate', 'abnegate', 'abrogate', 'abstemious', 'acerbic', 'acrimony', 'admonish', 'adroit',
        'aggrandize', 'alacrity', 'anachronism', 'anathema', 'antithesis', 'apotheosis', 'approbation',
        'arcane', 'ardor', 'assiduous', 'attrition', 'avarice', 'axiom', 'beatitude', 'bifurcate',
        'blandish', 'blighted', 'bombastic', 'bucolic', 'byzantine', 'cabal', 'cacophony', 'calumny',
        'captious', 'capricious', 'castigate', 'caustic', 'chicanery', 'circumlocution', 'clairvoyant',
        'cloister', 'coagulate', 'commencement', 'compendium', 'concomitant', 'conflagration',
        'connoisseur', 'consternation', 'contiguous', 'contravene', 'contumacious', 'convivial',
        'coruscate', 'countenance', 'craven', 'crucible', 'curmudgeon', 'debacle', 'decorum',
        'deference', 'delineate', 'deleterious', 'demagogue', 'denigrate', 'denouement', 'derelict',
        'desultory', 'dexterous', 'didactic', 'dilatory', 'dilettante', 'dirge', 'disabuse',
        'discursive', 'disingenuous', 'disquisition', 'dissolution', 'ebullience', 'edification',
        'effete', 'effrontery', 'egalitarian', 'elegiac', 'elegy', 'elucidate', 'embellish',
        'empiricism', 'encomium', 'endemic', 'enervate', 'ennui', 'ephemeron', 'equanimity',
        'equivocate', 'erudite', 'estimable', 'ethereal', 'evanescent', 'excoriate', 'exculpate',
        'execrable', 'exhort', 'existential', 'exorbitant', 'expatiate', 'expiate', 'expunge',
        'extirpate', 'extricate', 'facetious', 'fastidious', 'fatuous', 'feign', 'felicitous',
        'fetid', 'filigree', 'filibuster', 'flagrant', 'fulminate', 'garrulous', 'grandiloquent',
        'gregarious', 'harangue', 'harbinger', 'hermetic', 'histrionics', 'ignominious', 'imbroglio',
        'implacable', 'impute', 'incandescent', 'inchoate', 'incorrigible', 'indefatigable',
        'indelible', 'indigent', 'ineffable', 'ineluctable', 'inexplicable', 'inscrutable',
        'insipid', 'intransigent', 'inveterate', 'irascible', 'laconic', 'lassitude', 'laud',
        'litigious', 'loquacious', 'lucrative', 'machiavellian', 'maelstrom', 'magniloquent',
        'malapropism', 'malleable', 'mendacious', 'mercurial', 'miscreant', 'mollify', 'moribund',
        'munificent', 'nascent', 'nebulous', 'nefarious', 'nihilism', 'obdurate', 'obfuscate',
        'objurgate', 'obloquy', 'obstinate', 'opprobrium', 'panegyric', 'paragon', 'pariah',
        'parsimonious', 'peccadillo', 'pejorative', 'penurious', 'perdition', 'perfidious',
        'perfunctory', 'peripatetic', 'pernicious', 'perspicacious', 'pertinacious', 'philistine',
        'phlegmatic', 'polemic', 'portentous', 'precipitous', 'precocious', 'predilection',
        'preponderance', 'prerogative', 'prescient', 'prestidigitation', 'prevaricate', 'probity',
        'proclivity', 'prodigal', 'promulgate', 'propitiate', 'puerile', 'pugilistic', 'punctilious',
        'pusillanimous', 'quagmire', 'querulous', 'quiescent', 'quixotic', 'raconteur', 'recalcitrant',
        'recapitulate', 'recidivism', 'recondite', 'recrimination', 'redolent', 'remonstrate',
        'repartee', 'reprobate', 'requite', 'sacrilege', 'salubrious', 'sardonic', 'sartorial',
        'scintillate', 'seditious', 'soporific', 'specious', 'stolid', 'supercilious', 'supplicate',
        'sycophantic', 'tautology', 'tendentious', 'torpid', 'trenchant', 'turgid', 'umbrage',
        'unconscionable', 'unctuous', 'venal', 'verisimilitude', 'vicissitude', 'vituperate',
        'voluble', 'wanton', 'winsome', 'zeitgeist',
    ]),
};

/**
 * Get CEFR level for a word
 * @param {string} word
 * @returns {string} 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'
 */
export function getCEFRLevel(word) {
    const w = word.toLowerCase().trim();
    if (CEFR_LEVELS.A1.has(w)) return 'A1';
    if (CEFR_LEVELS.A2.has(w)) return 'A2';
    if (CEFR_LEVELS.B1.has(w)) return 'B1';
    if (CEFR_LEVELS.B2.has(w)) return 'B2';
    if (CEFR_LEVELS.C1.has(w)) return 'C1';
    if (CEFR_LEVELS.C2.has(w)) return 'C2';
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
 * Get total classified word count
 */
export function getCEFRStats() {
    return {
        A1: CEFR_LEVELS.A1.size,
        A2: CEFR_LEVELS.A2.size,
        B1: CEFR_LEVELS.B1.size,
        B2: CEFR_LEVELS.B2.size,
        C1: CEFR_LEVELS.C1.size,
        C2: CEFR_LEVELS.C2.size,
        total: Object.values(CEFR_LEVELS).reduce((sum, s) => sum + s.size, 0),
    };
}

/**
 * Classify difficulty of a passage (array of words)
 * Returns average CEFR level and distribution
 */
export function classifyPassageDifficulty(words) {
    const levels = { A1: 0, A2: 0, B1: 0, B2: 0, C1: 0, C2: 0 };
    const uniqueWords = [...new Set(words.map(w => w.toLowerCase().replace(/[^a-z'-]/g, '')).filter(w => w.length > 1))];

    for (const w of uniqueWords) {
        const level = getCEFRLevel(w);
        levels[level]++;
    }

    const total = uniqueWords.length || 1;
    const score = (levels.A1 * 1 + levels.A2 * 2 + levels.B1 * 3 + levels.B2 * 4 + levels.C1 * 5 + levels.C2 * 6) / total;

    let overall = 'A1';
    if (score > 5) overall = 'C2';
    else if (score > 4) overall = 'C1';
    else if (score > 3.2) overall = 'B2';
    else if (score > 2.5) overall = 'B1';
    else if (score > 1.8) overall = 'A2';

    return { levels, total, score: Math.round(score * 10) / 10, overall };
}

export default { getCEFRLevel, getCEFRColor, getCEFRStats, classifyPassageDifficulty };
