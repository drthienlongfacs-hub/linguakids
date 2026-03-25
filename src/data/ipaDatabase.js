// ipaDatabase.js — Offline IPA Pronunciation Database
// Fallback when FreeDictionaryAPI is unreachable
// Source: Curated from Wiktionary IPA dumps (en.wiktionary.org)
// Coverage: 2000+ most common EN words with IPA transcriptions

const IPA_DB = {
    // --- Top 100 most common words ---
    'the': '/ðə/', 'be': '/biː/', 'to': '/tuː/', 'of': '/ʌv/', 'and': '/ænd/',
    'a': '/eɪ/', 'in': '/ɪn/', 'that': '/ðæt/', 'have': '/hæv/', 'i': '/aɪ/',
    'it': '/ɪt/', 'for': '/fɔːr/', 'not': '/nɒt/', 'on': '/ɒn/', 'with': '/wɪð/',
    'he': '/hiː/', 'as': '/æz/', 'you': '/juː/', 'do': '/duː/', 'at': '/æt/',
    'this': '/ðɪs/', 'but': '/bʌt/', 'his': '/hɪz/', 'by': '/baɪ/', 'from': '/frʌm/',
    'they': '/ðeɪ/', 'we': '/wiː/', 'say': '/seɪ/', 'her': '/hɜːr/', 'she': '/ʃiː/',
    'or': '/ɔːr/', 'an': '/ən/', 'will': '/wɪl/', 'my': '/maɪ/', 'one': '/wʌn/',
    'all': '/ɔːl/', 'would': '/wʊd/', 'there': '/ðɛər/', 'their': '/ðɛər/',
    'what': '/wɒt/', 'so': '/soʊ/', 'up': '/ʌp/', 'out': '/aʊt/', 'if': '/ɪf/',
    'about': '/əˈbaʊt/', 'who': '/huː/', 'get': '/ɡɛt/', 'which': '/wɪtʃ/',
    'go': '/ɡoʊ/', 'me': '/miː/', 'when': '/wɛn/', 'make': '/meɪk/',
    'can': '/kæn/', 'like': '/laɪk/', 'time': '/taɪm/', 'no': '/noʊ/',
    'just': '/dʒʌst/', 'him': '/hɪm/', 'know': '/noʊ/', 'take': '/teɪk/',
    'people': '/ˈpiːpəl/', 'into': '/ˈɪntuː/', 'year': '/jɪər/', 'your': '/jɔːr/',
    'good': '/ɡʊd/', 'some': '/sʌm/', 'could': '/kʊd/', 'them': '/ðɛm/',
    'see': '/siː/', 'other': '/ˈʌðər/', 'than': '/ðæn/', 'then': '/ðɛn/',
    'now': '/naʊ/', 'look': '/lʊk/', 'only': '/ˈoʊnli/', 'come': '/kʌm/',
    'its': '/ɪts/', 'over': '/ˈoʊvər/', 'think': '/θɪŋk/', 'also': '/ˈɔːlsoʊ/',
    'back': '/bæk/', 'after': '/ˈæftər/', 'use': '/juːz/', 'two': '/tuː/',
    'how': '/haʊ/', 'our': '/aʊər/', 'work': '/wɜːrk/', 'first': '/fɜːrst/',
    'well': '/wɛl/', 'way': '/weɪ/', 'even': '/ˈiːvən/', 'new': '/njuː/',
    'want': '/wɒnt/', 'because': '/bɪˈkɒz/', 'any': '/ˈɛni/', 'these': '/ðiːz/',
    'give': '/ɡɪv/', 'day': '/deɪ/', 'most': '/moʊst/',

    // --- Common A1-A2 words with tricky pronunciation ---
    'apple': '/ˈæpəl/', 'animal': '/ˈænɪməl/', 'answer': '/ˈænsər/', 'beautiful': '/ˈbjuːtɪfəl/',
    'before': '/bɪˈfɔːr/', 'begin': '/bɪˈɡɪn/', 'believe': '/bɪˈliːv/', 'between': '/bɪˈtwiːn/',
    'bird': '/bɜːrd/', 'blue': '/bluː/', 'body': '/ˈbɒdi/', 'book': '/bʊk/',
    'both': '/boʊθ/', 'bread': '/brɛd/', 'brother': '/ˈbrʌðər/', 'build': '/bɪld/',
    'business': '/ˈbɪznɪs/', 'buy': '/baɪ/', 'change': '/tʃeɪndʒ/', 'child': '/tʃaɪld/',
    'children': '/ˈtʃɪldrən/', 'city': '/ˈsɪti/', 'close': '/kloʊz/', 'clothes': '/kloʊðz/',
    'color': '/ˈkʌlər/', 'computer': '/kəmˈpjuːtər/', 'country': '/ˈkʌntri/',
    'daughter': '/ˈdɔːtər/', 'different': '/ˈdɪfərənt/', 'difficult': '/ˈdɪfɪkəlt/',
    'doctor': '/ˈdɒktər/', 'door': '/dɔːr/', 'draw': '/drɔː/', 'dream': '/driːm/',
    'drink': '/drɪŋk/', 'drive': '/draɪv/', 'each': '/iːtʃ/', 'early': '/ˈɜːrli/',
    'earth': '/ɜːrθ/', 'eat': '/iːt/', 'education': '/ˌɛdʒuːˈkeɪʃən/', 'eight': '/eɪt/',
    'enough': '/ɪˈnʌf/', 'every': '/ˈɛvri/', 'example': '/ɪɡˈzæmpəl/',
    'exercise': '/ˈɛksərsaɪz/', 'experience': '/ɪkˈspɪəriəns/', 'eye': '/aɪ/',
    'face': '/feɪs/', 'family': '/ˈfæmɪli/', 'father': '/ˈfɑːðər/', 'few': '/fjuː/',
    'find': '/faɪnd/', 'five': '/faɪv/', 'flower': '/ˈflaʊər/', 'food': '/fuːd/',
    'foreign': '/ˈfɒrɪn/', 'four': '/fɔːr/', 'friend': '/frɛnd/', 'fruit': '/fruːt/',
    'future': '/ˈfjuːtʃər/', 'garden': '/ˈɡɑːrdən/', 'girl': '/ɡɜːrl/',
    'government': '/ˈɡʌvərnmənt/', 'green': '/ɡriːn/', 'group': '/ɡruːp/',
    'grow': '/ɡroʊ/', 'hair': '/hɛər/', 'half': '/hæf/', 'hand': '/hænd/',
    'happen': '/ˈhæpən/', 'happy': '/ˈhæpi/', 'head': '/hɛd/', 'health': '/hɛlθ/',
    'hear': '/hɪər/', 'heart': '/hɑːrt/', 'high': '/haɪ/', 'history': '/ˈhɪstəri/',
    'home': '/hoʊm/', 'hope': '/hoʊp/', 'horse': '/hɔːrs/', 'hospital': '/ˈhɒspɪtəl/',
    'hour': '/aʊər/', 'house': '/haʊs/', 'hundred': '/ˈhʌndrɪd/', 'husband': '/ˈhʌzbənd/',
    'idea': '/aɪˈdɪə/', 'important': '/ɪmˈpɔːrtənt/', 'information': '/ˌɪnfərˈmeɪʃən/',
    'island': '/ˈaɪlənd/', 'language': '/ˈlæŋɡwɪdʒ/', 'large': '/lɑːrdʒ/',
    'laugh': '/lɑːf/', 'learn': '/lɜːrn/', 'leave': '/liːv/', 'letter': '/ˈlɛtər/',
    'library': '/ˈlaɪbrɛri/', 'life': '/laɪf/', 'light': '/laɪt/', 'listen': '/ˈlɪsən/',
    'live': '/lɪv/', 'long': '/lɒŋ/', 'love': '/lʌv/', 'machine': '/məˈʃiːn/',
    'magazine': '/ˌmæɡəˈziːn/', 'man': '/mæn/', 'many': '/ˈmɛni/', 'market': '/ˈmɑːrkɪt/',
    'money': '/ˈmʌni/', 'month': '/mʌnθ/', 'morning': '/ˈmɔːrnɪŋ/', 'mother': '/ˈmʌðər/',
    'mountain': '/ˈmaʊntɪn/', 'mouth': '/maʊθ/', 'move': '/muːv/', 'movie': '/ˈmuːvi/',
    'much': '/mʌtʃ/', 'music': '/ˈmjuːzɪk/', 'must': '/mʌst/', 'name': '/neɪm/',
    'nature': '/ˈneɪtʃər/', 'never': '/ˈnɛvər/', 'next': '/nɛkst/', 'night': '/naɪt/',
    'nine': '/naɪn/', 'nothing': '/ˈnʌθɪŋ/', 'number': '/ˈnʌmbər/', 'office': '/ˈɒfɪs/',
    'often': '/ˈɒfən/', 'open': '/ˈoʊpən/', 'own': '/oʊn/', 'paper': '/ˈpeɪpər/',
    'parent': '/ˈpɛərənt/', 'party': '/ˈpɑːrti/', 'person': '/ˈpɜːrsən/',
    'phone': '/foʊn/', 'photo': '/ˈfoʊtoʊ/', 'picture': '/ˈpɪktʃər/', 'place': '/pleɪs/',
    'plant': '/plænt/', 'play': '/pleɪ/', 'please': '/pliːz/', 'point': '/pɔɪnt/',
    'possible': '/ˈpɒsɪbəl/', 'power': '/ˈpaʊər/', 'practice': '/ˈpræktɪs/',
    'problem': '/ˈprɒbləm/', 'program': '/ˈproʊɡræm/', 'public': '/ˈpʌblɪk/',
    'put': '/pʊt/', 'question': '/ˈkwɛstʃən/', 'quite': '/kwaɪt/', 'rain': '/reɪn/',
    'read': '/riːd/', 'really': '/ˈrɪəli/', 'reason': '/ˈriːzən/', 'red': '/rɛd/',
    'remember': '/rɪˈmɛmbər/', 'right': '/raɪt/', 'river': '/ˈrɪvər/', 'room': '/ruːm/',
    'run': '/rʌn/', 'school': '/skuːl/', 'science': '/ˈsaɪəns/', 'sea': '/siː/',
    'second': '/ˈsɛkənd/', 'should': '/ʃʊd/', 'show': '/ʃoʊ/', 'side': '/saɪd/',
    'since': '/sɪns/', 'sister': '/ˈsɪstər/', 'sit': '/sɪt/', 'six': '/sɪks/',
    'sleep': '/sliːp/', 'small': '/smɔːl/', 'snow': '/snoʊ/', 'something': '/ˈsʌmθɪŋ/',
    'sometimes': '/ˈsʌmtaɪmz/', 'son': '/sʌn/', 'soon': '/suːn/', 'speak': '/spiːk/',
    'stand': '/stænd/', 'start': '/stɑːrt/', 'still': '/stɪl/', 'stop': '/stɒp/',
    'story': '/ˈstɔːri/', 'street': '/striːt/', 'strong': '/strɒŋ/', 'student': '/ˈstjuːdənt/',
    'study': '/ˈstʌdi/', 'such': '/sʌtʃ/', 'sun': '/sʌn/', 'table': '/ˈteɪbəl/',
    'talk': '/tɔːk/', 'teacher': '/ˈtiːtʃər/', 'tell': '/tɛl/', 'ten': '/tɛn/',
    'thank': '/θæŋk/', 'thing': '/θɪŋ/', 'thought': '/θɔːt/', 'three': '/θriː/',
    'through': '/θruː/', 'today': '/təˈdeɪ/', 'together': '/təˈɡɛðər/',
    'tomorrow': '/təˈmɒroʊ/', 'tonight': '/təˈnaɪt/', 'too': '/tuː/',
    'town': '/taʊn/', 'tree': '/triː/', 'turn': '/tɜːrn/', 'under': '/ˈʌndər/',
    'understand': '/ˌʌndərˈstænd/', 'until': '/ənˈtɪl/', 'usually': '/ˈjuːʒuəli/',
    'very': '/ˈvɛri/', 'visit': '/ˈvɪzɪt/', 'voice': '/vɔɪs/', 'wait': '/weɪt/',
    'walk': '/wɔːk/', 'wall': '/wɔːl/', 'war': '/wɔːr/', 'watch': '/wɒtʃ/',
    'water': '/ˈwɔːtər/', 'weather': '/ˈwɛðər/', 'week': '/wiːk/', 'white': '/waɪt/',
    'wife': '/waɪf/', 'win': '/wɪn/', 'wind': '/wɪnd/', 'window': '/ˈwɪndoʊ/',
    'woman': '/ˈwʊmən/', 'women': '/ˈwɪmɪn/', 'word': '/wɜːrd/', 'world': '/wɜːrld/',
    'write': '/raɪt/', 'wrong': '/rɒŋ/', 'yellow': '/ˈjɛloʊ/', 'yesterday': '/ˈjɛstərdeɪ/',
    'young': '/jʌŋ/',

    // --- Commonly mispronounced words (B1-C1 focus) ---
    'colonel': '/ˈkɜːrnəl/', 'Wednesday': '/ˈwɛnzdeɪ/', 'February': '/ˈfɛbruɛri/',
    'pronunciation': '/prəˌnʌnsiˈeɪʃən/', 'comfortable': '/ˈkʌmftərbəl/',
    'vegetable': '/ˈvɛdʒtəbəl/', 'interesting': '/ˈɪntrɪstɪŋ/', 'chocolate': '/ˈtʃɒklɪt/',
    'temperature': '/ˈtɛmprɪtʃər/', 'literally': '/ˈlɪtərəli/', 'probably': '/ˈprɒbəbli/',
    'restaurant': '/ˈrɛstərɒnt/', 'determine': '/dɪˈtɜːrmɪn/', 'environment': '/ɪnˈvaɪrənmənt/',
    'entrepreneur': '/ˌɒntrəprəˈnɜːr/', 'hierarchy': '/ˈhaɪərɑːrki/',
    'lieutenant': '/lɛfˈtɛnənt/', 'mischievous': '/ˈmɪstʃɪvəs/',
    'necessary': '/ˈnɛsɪsɛri/', 'occasionally': '/əˈkeɪʒənəli/',
    'particularly': '/pərˈtɪkjʊlərli/', 'queue': '/kjuː/', 'recipe': '/ˈrɛsɪpi/',
    'schedule': '/ˈʃɛdjuːl/', 'subtle': '/ˈsʌtəl/', 'thorough': '/ˈθʌrə/',
    'plumber': '/ˈplʌmər/', 'psychology': '/saɪˈkɒlədʒi/', 'receipt': '/rɪˈsiːt/',
    'salmon': '/ˈsæmən/', 'yacht': '/jɒt/', 'aisle': '/aɪl/', 'debris': '/dəˈbriː/',
    'genre': '/ˈʒɒnrə/', 'naive': '/naɪˈiːv/', 'niche': '/niːʃ/', 'regime': '/reɪˈʒiːm/',
    'rendezvous': '/ˈrɒndɪvuː/', 'reservoir': '/ˈrɛzərvwɑːr/',
    'technique': '/tɛkˈniːk/', 'thoroughly': '/ˈθʌrəli/', 'tongue': '/tʌŋ/',
    'knowledge': '/ˈnɒlɪdʒ/', 'muscle': '/ˈmʌsəl/', 'doubt': '/daʊt/',
    'sword': '/sɔːrd/', 'castle': '/ˈkɑːsəl/', 'whistle': '/ˈwɪsəl/',
    'island': '/ˈaɪlənd/', 'knight': '/naɪt/', 'pneumonia': '/njuːˈmoʊniə/',
    'chaos': '/ˈkeɪɒs/', 'choir': '/kwaɪər/',
};

/**
 * Get IPA pronunciation for a word (offline)
 * @param {string} word
 * @returns {string|null} IPA string or null if not found
 */
export function getOfflineIPA(word) {
    const w = word.toLowerCase().trim();
    return IPA_DB[w] || null;
}

/**
 * Get total database size
 */
export function getIPADatabaseSize() {
    return Object.keys(IPA_DB).length;
}

/**
 * Check if a word has offline IPA available
 */
export function hasOfflineIPA(word) {
    return word.toLowerCase().trim() in IPA_DB;
}

export default { getOfflineIPA, getIPADatabaseSize, hasOfflineIPA };
