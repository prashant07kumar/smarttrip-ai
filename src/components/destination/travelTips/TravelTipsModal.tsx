'use client';

import { AnimatePresence, motion } from 'framer-motion';
import {
  Backpack,
  CalendarRange,
  ChevronDown,
  ChevronUp,
  Globe,
  HandCoins,
  Languages,
  RefreshCw,
  ShieldCheck,
  X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import TravelTips from './TravelTips';

export type TravelTipsResponse = {
  bestTimeToVisit: string;
  localEtiquette: string;
  safetyTips: string;
  budgetTips: string;
  mustKnowPhrases: string[];
  packingSuggestions: string[];
  style: string;
};

const categoryMeta = {
  bestTimeToVisit: {
    title: 'Best Time',
    icon: CalendarRange,
    tone: 'from-emerald-500/15 to-teal-500/10',
    border: 'border-emerald-200',
  },
  localEtiquette: {
    title: 'Local Etiquette',
    icon: Globe,
    tone: 'from-cyan-500/15 to-sky-500/10',
    border: 'border-cyan-200',
  },
  safetyTips: {
    title: 'Safety Tips',
    icon: ShieldCheck,
    tone: 'from-rose-500/15 to-orange-500/10',
    border: 'border-rose-200',
  },
  budgetTips: {
    title: 'Budget Tips',
    icon: HandCoins,
    tone: 'from-amber-500/15 to-yellow-500/10',
    border: 'border-amber-200',
  },
  mustKnowPhrases: {
    title: 'Must-Know Phrases',
    icon: Languages,
    tone: 'from-violet-500/15 to-indigo-500/10',
    border: 'border-violet-200',
  },
  packingSuggestions: {
    title: 'Packing Suggestions',
    icon: Backpack,
    tone: 'from-slate-500/15 to-slate-400/10',
    border: 'border-slate-200',
  },
} as const;

const skeletonCards = [1, 2, 3, 4, 5, 6];

type TravelTipsModalProps = {
  place: string;
  className?: string;
};

export default function TravelTipsModal({ place, className = '' }: TravelTipsModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [tips, setTips] = useState<TravelTipsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const leafletContainers = Array.from(document.querySelectorAll('.leaflet-container')) as HTMLElement[];
    const originalStyles = leafletContainers.map((element) => ({
      element,
      zIndex: element.style.zIndex,
      pointerEvents: element.style.pointerEvents,
    }));

    if (isOpen) {
      leafletContainers.forEach((element) => {
        element.style.zIndex = '0';
        element.style.pointerEvents = 'none';
      });
    } else {
      originalStyles.forEach(({ element, zIndex, pointerEvents }) => {
        if (zIndex) {
          element.style.zIndex = zIndex;
        } else {
          element.style.removeProperty('z-index');
        }

        if (pointerEvents) {
          element.style.pointerEvents = pointerEvents;
        } else {
          element.style.removeProperty('pointer-events');
        }
      });
    }

    return () => {
      originalStyles.forEach(({ element, zIndex, pointerEvents }) => {
        if (zIndex) {
          element.style.zIndex = zIndex;
        } else {
          element.style.removeProperty('z-index');
        }

        if (pointerEvents) {
          element.style.pointerEvents = pointerEvents;
        } else {
          element.style.removeProperty('pointer-events');
        }
      });
    };
  }, [isOpen]);

  const fetchTips = async () => {
    if (!place.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/travel-tips', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          place,
          style: 'budget traveler',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch travel tips');
      }

      const data = await response.json();

      const normalizedTips: TravelTipsResponse = {
        bestTimeToVisit: typeof data.bestTimeToVisit === 'string' ? data.bestTimeToVisit : '',
        localEtiquette: typeof data.localEtiquette === 'string' ? data.localEtiquette : '',
        safetyTips: typeof data.safetyTips === 'string' ? data.safetyTips : '',
        budgetTips: typeof data.budgetTips === 'string' ? data.budgetTips : '',
        mustKnowPhrases: Array.isArray(data.mustKnowPhrases)
          ? data.mustKnowPhrases.filter((item: unknown): item is string => typeof item === 'string')
          : [],
        packingSuggestions: Array.isArray(data.packingSuggestions)
          ? data.packingSuggestions.filter((item: unknown): item is string => typeof item === 'string')
          : [],
        style: typeof data.style === 'string' ? data.style : 'budget traveler',
      };

      setTips(normalizedTips);
    } catch (err) {
      console.error('Travel tips fetch failed', err);
      setTips(null);
      setError('Travel tips are unavailable right now. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    setExpandedCards({});
    void fetchTips();
  }, [isOpen, place]);

  const cards = tips
    ? [
        {
          key: 'bestTimeToVisit' as keyof typeof categoryMeta,
          description: tips.bestTimeToVisit,
        },
        {
          key: 'localEtiquette' as keyof typeof categoryMeta,
          description: tips.localEtiquette,
        },
        {
          key: 'safetyTips' as keyof typeof categoryMeta,
          description: tips.safetyTips,
        },
        {
          key: 'budgetTips' as keyof typeof categoryMeta,
          description: tips.budgetTips,
        },
        {
          key: 'mustKnowPhrases' as keyof typeof categoryMeta,
          description: tips.mustKnowPhrases.join(' • '),
          list: tips.mustKnowPhrases,
        },
        {
          key: 'packingSuggestions' as keyof typeof categoryMeta,
          description: tips.packingSuggestions.join(' • '),
          list: tips.packingSuggestions,
        },
      ]
    : [];

  return (
    <>
      <div className={`w-full ${className}`}>
        <TravelTips onOpen={() => setIsOpen(true)} />
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/70 px-4 py-6 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="AI travel tips"
              className="relative z-[10000] w-full max-w-5xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl"
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700">
                    AI-powered insights
                  </p>
                  <h2 className="mt-1 text-2xl font-bold text-slate-900">Travel Tips</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Curated recommendations for {place}.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => void fetchTips()}
                    disabled={loading}
                    className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                    Regenerate Tips
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="rounded-full border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-100"
                    aria-label="Close travel tips"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              <div className="max-h-[72vh] overflow-y-auto px-6 py-5">
                {loading ? (
                  <div className="grid gap-3 md:grid-cols-2">
                    {skeletonCards.map((item) => (
                      <div
                        key={item}
                        className="animate-pulse rounded-2xl border border-slate-200 bg-slate-50 p-4"
                      >
                        <div className="mb-3 h-4 w-24 rounded bg-slate-200" />
                        <div className="mb-2 h-3 w-full rounded bg-slate-200" />
                        <div className="h-3 w-5/6 rounded bg-slate-200" />
                      </div>
                    ))}
                  </div>
                ) : error ? (
                  <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-4 text-sm text-rose-700">
                    <p className="font-semibold">Unable to load travel tips</p>
                    <p className="mt-1">{error}</p>
                    <button
                      type="button"
                      onClick={() => void fetchTips()}
                      className="mt-3 inline-flex items-center gap-2 rounded-full bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white"
                    >
                      Try again
                    </button>
                  </div>
                ) : tips ? (
                  <div className="grid gap-3 md:grid-cols-2">
                    {cards.map((card) => {
                      const meta = categoryMeta[card.key];
                      const Icon = meta.icon;
                      const isExpanded = expandedCards[card.key] ?? false;
                      const description = card.description;
                      const isLongText = description.length > 160;
                      const list = 'list' in card ? (card.list ?? []) : [];

                      return (
                        <article
                          key={card.key}
                          className={`rounded-2xl border bg-linear-to-br ${meta.tone} p-px`}
                        >
                          <div className="h-full rounded-[15px] bg-white/95 p-4">
                            <div className="mb-3 flex items-start justify-between gap-3">
                              <div className="flex items-center gap-3">
                                <div className={`rounded-xl border ${meta.border} bg-white p-2 text-slate-700`}>
                                  <Icon size={18} />
                                </div>
                                <div>
                                  <p className="text-sm font-semibold text-slate-900">{meta.title}</p>
                                  {tips.style && (
                                    <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-slate-400">
                                      {tips.style}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>

                            {'list' in card && list.length > 0 ? (
                              <div className="space-y-2">
                                {list.map((item, index) => (
                                  <div
                                    key={`${card.key}-${item}-${index}`}
                                    className="rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-700"
                                  >
                                    {item}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div>
                                <p className="text-sm leading-6 text-slate-700">
                                  {isLongText && !isExpanded ? `${description.slice(0, 160)}...` : description}
                                </p>

                                {isLongText && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setExpandedCards((current) => ({
                                        ...current,
                                        [card.key]: !current[card.key],
                                      }))
                                    }
                                    className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-emerald-700"
                                  >
                                    {isExpanded ? 'Show less' : 'Read more'}
                                    {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </article>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
