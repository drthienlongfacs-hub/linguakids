import { useEffect, useState } from 'react';
import { loadStandardLexicon } from '../services/standardLexiconService';

export function usePracticeLexicon({
    lang,
    adult,
    fallbackEnglish,
    fallbackChinese,
}) {
    const isEnglish = lang !== 'cn' && lang !== 'zh';
    const fallbackItems = isEnglish ? fallbackEnglish : fallbackChinese;

    const [remoteItems, setRemoteItems] = useState(null);
    const [loading, setLoading] = useState(adult);
    const [sourceLabel, setSourceLabel] = useState(adult ? 'standard' : 'curriculum');

    useEffect(() => {
        let cancelled = false;

        if (!adult) return () => {
            cancelled = true;
        };

        loadStandardLexicon(lang, { practice: true })
            .then((entries) => {
                if (cancelled) return;
                setRemoteItems(entries);
                setSourceLabel('standard');
                setLoading(false);
            })
            .catch(() => {
                if (cancelled) return;
                setRemoteItems(null);
                setSourceLabel('fallback');
                setLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [adult, fallbackItems, lang]);

    const items = adult ? (remoteItems || fallbackItems) : fallbackItems;
    const resolvedSourceLabel = adult ? sourceLabel : 'curriculum';

    return { items, loading: adult ? loading : false, sourceLabel: resolvedSourceLabel };
}

export default usePracticeLexicon;
