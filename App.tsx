import { useState, useEffect } from 'react';
import { PartOfSpeech, Word } from './types';
import { WordCanvas, isWordLocked, getRequiredCount } from './components/WordCanvas';
import { WordForm } from './components/WordForm';
import { WordStats } from './components/WordStats';
import { WordPopup } from './components/WordPopup';
import { 
  Sparkles, 
  RotateCw, 
  Trash2, 
  HelpCircle, 
  RotateCw as ResetIcon, 
  Info, 
  ChevronLeft, 
  ChevronRight,
  BookOpen,
  Zap,
  Gauge,
  RefreshCw
} from 'lucide-react';
import {
  isSupabaseConfigured,
  fetchSupabaseWords,
  upsertSupabaseWord,
  deleteSupabaseWord,
  fetchSupabaseStats,
  saveSupabaseStats
} from './lib/supabase';

const INITIAL_DEFAULT_WORDS: Word[] = [
  {
    id: 'w1',
    spelling: 'Gravity',
    meaning: '重力、引力（質量が互いに引き合う物理的な力）',
    partsOfSpeech: ['Noun'],
    sizeTier: 2,
    lockedUntil: 0,
    lockedAtCount: 0,
    createdAt: Date.now() - 15000,
  },
  {
    id: 'w2',
    spelling: 'Velocity',
    meaning: '速度、速さ（方向を考慮した単位時間あたりの位置変化）',
    partsOfSpeech: ['Noun'],
    sizeTier: 2,
    lockedUntil: 0,
    lockedAtCount: 0,
    createdAt: Date.now() - 14000,
  },
  {
    id: 'w3',
    spelling: 'Elasticity',
    meaning: '弾力性、伸縮性（変形した物体が元に戻ろうとする性質）',
    partsOfSpeech: ['Noun'],
    sizeTier: 2,
    lockedUntil: 0,
    lockedAtCount: 0,
    createdAt: Date.now() - 13000,
  },
  {
    id: 'w4',
    spelling: 'Momentum',
    meaning: '運動量、勢い（物体の質量と速度の積で表される物理量）',
    partsOfSpeech: ['Noun'],
    sizeTier: 2,
    lockedUntil: 0,
    lockedAtCount: 0,
    createdAt: Date.now() - 12000,
  },
  {
    id: 'w5',
    spelling: 'Collision',
    meaning: '衝突、激突（２つの物体が極めて短い時間に力を及ぼし合う現象）',
    partsOfSpeech: ['Noun'],
    sizeTier: 2,
    lockedUntil: 0,
    lockedAtCount: 0,
    createdAt: Date.now() - 11000,
  },
  {
    id: 'w6',
    spelling: 'Friction',
    meaning: '摩擦、抵抗（接触している２つの面の間の滑りを妨げる力）',
    partsOfSpeech: ['Noun'],
    sizeTier: 2,
    lockedUntil: 0,
    lockedAtCount: 0,
    createdAt: Date.now() - 10000,
  },
  {
    id: 'w7',
    spelling: 'Inertia',
    meaning: '慣性、惰性（物体が現在の運動状態を維持しようとする性質）',
    partsOfSpeech: ['Noun'],
    sizeTier: 2,
    lockedUntil: 0,
    lockedAtCount: 0,
    createdAt: Date.now() - 9000,
  },
  {
    id: 'w8',
    spelling: 'Resonance',
    meaning: '共鳴、共振（特定の周波数の振動が加わったときに大きく揺れること）',
    partsOfSpeech: ['Noun'],
    sizeTier: 2,
    lockedUntil: 0,
    lockedAtCount: 0,
    createdAt: Date.now() - 8000,
  },
  {
    id: 'w9',
    spelling: 'Entropy',
    meaning: 'エントロピー（物理系や情報系における無秩序度・乱雑さ）',
    partsOfSpeech: ['Noun'],
    sizeTier: 2,
    lockedUntil: 0,
    lockedAtCount: 0,
    createdAt: Date.now() - 7000,
  },
  {
    id: 'w10',
    spelling: 'Accelerate',
    meaning: '加速する、促進する（運動の速度を増加させる、または物事を急ぐ）',
    partsOfSpeech: ['Verb'],
    sizeTier: 2,
    lockedUntil: 0,
    lockedAtCount: 0,
    createdAt: Date.now() - 6000,
  },
  {
    id: 'w11',
    spelling: 'Oscillate',
    meaning: '振動する、振り子のように揺れる（一定の２点間を規則的に往復する）',
    partsOfSpeech: ['Verb'],
    sizeTier: 2,
    lockedUntil: 0,
    lockedAtCount: 0,
    createdAt: Date.now() - 5000,
  },
  {
    id: 'w12',
    spelling: 'Kinetic',
    meaning: '運動による、動的な（静的なものに対して、動いている性質）',
    partsOfSpeech: ['Adjective'],
    sizeTier: 2,
    lockedUntil: 0,
    lockedAtCount: 0,
    createdAt: Date.now() - 4000,
  },
  {
    id: 'w13',
    spelling: 'Vortex',
    meaning: '渦、旋風（水や空気が螺旋を描いて回転し中心に引き込む流れ）',
    partsOfSpeech: ['Noun'],
    sizeTier: 2,
    lockedUntil: 0,
    lockedAtCount: 0,
    createdAt: Date.now() - 3000,
  },
  {
    id: 'w14',
    spelling: 'Absorb',
    meaning: '吸収する、吸い込む（外部の水分・熱・衝撃や知識などを取り入れる）',
    partsOfSpeech: ['Verb'],
    sizeTier: 2,
    lockedUntil: 0,
    lockedAtCount: 0,
    createdAt: Date.now() - 2000,
  },
  {
    id: 'w15',
    spelling: 'Dynamic',
    meaning: '動的な、活力にあふれた（絶えず変化し、強いエネルギーを持つ様子）',
    partsOfSpeech: ['Adjective'],
    sizeTier: 2,
    lockedUntil: 0,
    lockedAtCount: 0,
    createdAt: Date.now() - 1000,
  },
  {
    id: 'w16',
    spelling: 'Spectrum',
    meaning: 'スペクトル、電磁波の分布（光などの成分を波長順に配列した連続的な帯）',
    partsOfSpeech: ['Noun'],
    sizeTier: 2,
    lockedUntil: 0,
    lockedAtCount: 0,
    createdAt: Date.now() - 950,
  },
  {
    id: 'w17',
    spelling: 'Photon',
    meaning: '光子、光量子（光を構成する最小単位のエネルギーを持つ粒子）',
    partsOfSpeech: ['Noun'],
    sizeTier: 2,
    lockedUntil: 0,
    lockedAtCount: 0,
    createdAt: Date.now() - 900,
  },
  {
    id: 'w18',
    spelling: 'Refract',
    meaning: '屈折させる（光や音などの波が、異なる媒質の境界を斜めに通る際に進路が曲がる現象）',
    partsOfSpeech: ['Verb'],
    sizeTier: 2,
    lockedUntil: 0,
    lockedAtCount: 0,
    createdAt: Date.now() - 850,
  },
  {
    id: 'w19',
    spelling: 'Diffraction',
    meaning: '回折（波が障害物の背後に回り込んで伝播していく現象）',
    partsOfSpeech: ['Noun'],
    sizeTier: 2,
    lockedUntil: 0,
    lockedAtCount: 0,
    createdAt: Date.now() - 800,
  },
  {
    id: 'w20',
    spelling: 'Frequency',
    meaning: '周波数、振動数（波や振動が１秒間に繰り返される回数）',
    partsOfSpeech: ['Noun'],
    sizeTier: 2,
    lockedUntil: 0,
    lockedAtCount: 0,
    createdAt: Date.now() - 750,
  },
  {
    id: 'w21',
    spelling: 'Amplitude',
    meaning: '振幅（波の振動における、基準位置から最大に振れたときの大きさや幅）',
    partsOfSpeech: ['Noun'],
    sizeTier: 2,
    lockedUntil: 0,
    lockedAtCount: 0,
    createdAt: Date.now() - 700,
  },
  {
    id: 'w22',
    spelling: 'Electromagnetic',
    meaning: '電磁気の（電気的作用と磁気的作用の両方に関連する物理現象）',
    partsOfSpeech: ['Adjective'],
    sizeTier: 2,
    lockedUntil: 0,
    lockedAtCount: 0,
    createdAt: Date.now() - 650,
  },
  {
    id: 'w23',
    spelling: 'Thermodynamics',
    meaning: '熱力学（熱エネルギーと、機械的仕事や他のエネルギーとの変換・力学的関係を扱う学問）',
    partsOfSpeech: ['Noun'],
    sizeTier: 2,
    lockedUntil: 0,
    lockedAtCount: 0,
    createdAt: Date.now() - 600,
  },
  {
    id: 'w24',
    spelling: 'Superconductivity',
    meaning: '超伝導（極低温状態で金属などの電気抵抗が完全にゼロになり、磁界を排除する現象）',
    partsOfSpeech: ['Noun'],
    sizeTier: 2,
    lockedUntil: 0,
    lockedAtCount: 0,
    createdAt: Date.now() - 550,
  },
  {
    id: 'w25',
    spelling: 'Radiation',
    meaning: '放射、輻射（高エネルギーの電磁波や粒子が空間を伝播して放出されること）',
    partsOfSpeech: ['Noun'],
    sizeTier: 2,
    lockedUntil: 0,
    lockedAtCount: 0,
    createdAt: Date.now() - 500,
  },
  {
    id: 'w26',
    spelling: 'Quantum',
    meaning: '量子（エネルギーなどの物理量が、連続的ではなく不連続な不分的な最小単位で存在する概念）',
    partsOfSpeech: ['Noun'],
    sizeTier: 2,
    lockedUntil: 0,
    lockedAtCount: 0,
    createdAt: Date.now() - 450,
  },
  {
    id: 'w27',
    spelling: 'Conduction',
    meaning: '伝導、熱伝導（物質内を構成粒子を介して熱や電気が直接伝播・移動していく現象）',
    partsOfSpeech: ['Noun'],
    sizeTier: 2,
    lockedUntil: 0,
    lockedAtCount: 0,
    createdAt: Date.now() - 400,
  },
  {
    id: 'w28',
    spelling: 'Induction',
    meaning: '電磁誘導、誘導（磁界が変化することによって、導体に起電力や電流が発生する作用）',
    partsOfSpeech: ['Noun'],
    sizeTier: 2,
    lockedUntil: 0,
    lockedAtCount: 0,
    createdAt: Date.now() - 350,
  },
  {
    id: 'w29',
    spelling: 'Magnetic',
    meaning: '磁気の、磁性を持つ（磁石や電流によって生じる吸着力や反発力に関する力学的性質）',
    partsOfSpeech: ['Adjective'],
    sizeTier: 2,
    lockedUntil: 0,
    lockedAtCount: 0,
    createdAt: Date.now() - 300,
  },
  {
    id: 'w30',
    spelling: 'Thermal',
    meaning: '熱の、熱的な（物質の温度変化、分子運動 of 活発さ、熱膨張などに関する状態）',
    partsOfSpeech: ['Adjective'],
    sizeTier: 2,
    lockedUntil: 0,
    lockedAtCount: 0,
    createdAt: Date.now() - 250,
  }
];

export default function App() {
  const [supabaseStatus, setSupabaseStatus] = useState<'not_configured' | 'syncing' | 'connected' | 'error'>(
    isSupabaseConfigured ? 'syncing' : 'not_configured'
  );

  // Load words & scores from persistent localStorage or default to rich list
  const [words, setWords] = useState<Word[]>(() => {
    let parsed: Word[] = [];
    try {
      const saved = localStorage.getItem('physics_words');
      if (saved) {
        parsed = JSON.parse(saved);
      } else {
        parsed = INITIAL_DEFAULT_WORDS;
      }
    } catch (e) {
      console.error('Failed to parse words from localStorage', e);
      parsed = INITIAL_DEFAULT_WORDS;
    }
    // Ensure initialSizeTier is populated for all words
    return parsed.map((w) => ({
      ...w,
      initialSizeTier: w.initialSizeTier !== undefined ? w.initialSizeTier : w.sizeTier,
    }));
  });

  const [totalMemorizedCount, setTotalMemorizedCount] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('physics_memorized_count');
      if (saved) {
        return parseInt(saved, 10);
      }
    } catch (e) {
      console.error('Failed to parse score count from localStorage', e);
    }
    return 0;
  });

  // Sync Supabase data on mount
  useEffect(() => {
    if (!isSupabaseConfigured) return;

    async function syncData() {
      setSupabaseStatus('syncing');
      try {
        const dbWords = await fetchSupabaseWords();
        if (dbWords !== null) {
          if (dbWords.length === 0) {
            // Seed Supabase with default initial words if empty in the cloud
            for (const word of INITIAL_DEFAULT_WORDS) {
              await upsertSupabaseWord(word);
            }
            setWords(INITIAL_DEFAULT_WORDS);
          } else {
            setWords(dbWords);
          }

          // Fetch stats/score if exist
          const dbStats = await fetchSupabaseStats();
          if (dbStats !== null) {
            setTotalMemorizedCount(dbStats);
          } else {
            // Seed stats with current
            await saveSupabaseStats(totalMemorizedCount);
          }

          setSupabaseStatus('connected');
        } else {
          setSupabaseStatus('error');
        }
      } catch (err) {
        console.error('Error syncing with Supabase:', err);
        setSupabaseStatus('error');
      }
    }

    syncData();
  }, []);

  const [selectedWord, setSelectedWord] = useState<Word | null>(null);
  const [selectedWordFromDictionary, setSelectedWordFromDictionary] = useState<boolean>(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Default closed as requested by the user
  const [shuffleTriggerCount, setShuffleTriggerCount] = useState(0);
  const [showHints, setShowHints] = useState(false);
  
  // Track device orientation for helpful notification overlays
  const [isPortrait, setIsPortrait] = useState(false);

  useEffect(() => {
    const checkOrientation = () => {
      setIsPortrait(window.innerHeight > window.innerWidth);
    };
    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    return () => window.removeEventListener('resize', checkOrientation);
  }, []);

  // Save changes to localStorage whenever words state updates
  useEffect(() => {
    localStorage.setItem('physics_words', JSON.stringify(words));
  }, [words]);

  // Save score changes
  useEffect(() => {
    localStorage.setItem('physics_memorized_count', totalMemorizedCount.toString());
  }, [totalMemorizedCount]);

  // Add new word
  const handleAddWord = (spelling: string, meaning: string, partsOfSpeech: PartOfSpeech[]) => {
    const newWord: Word = {
      id: `w-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      spelling,
      meaning,
      partsOfSpeech,
      sizeTier: 3, // Default starting size tier is Level 4 (out of 5)
      initialSizeTier: 3, // Set initial size tier for mastery calculation
      lockedUntil: 0,
      lockedAtCount: 0,
      createdAt: Date.now(),
    };
    setWords((prev) => [newWord, ...prev]);
    if (isSupabaseConfigured) {
      upsertSupabaseWord(newWord).catch((err) => {
        console.error('Supabase save error:', err);
        setSupabaseStatus('error');
      });
    }
  };

  // Delete existing word
  const handleDeleteWord = (id: string) => {
    setWords((prev) => prev.filter((w) => w.id !== id));
    if (selectedWord?.id === id) {
      setSelectedWord(null);
    }
    if (isSupabaseConfigured) {
      deleteSupabaseWord(id).catch((err) => {
        console.error('Supabase delete error:', err);
        setSupabaseStatus('error');
      });
    }
  };

  // Update existing word
  const handleUpdateWord = (wordId: string, updatedFields: Partial<Word>) => {
    setWords((prev) => {
      const updated = prev.map((w) => (w.id === wordId ? { ...w, ...updatedFields } : w));
      const target = updated.find((w) => w.id === wordId);
      if (target && isSupabaseConfigured) {
        upsertSupabaseWord(target).catch((err) => {
          console.error('Supabase update error:', err);
          setSupabaseStatus('error');
        });
      }
      return updated;
    });
    setSelectedWord((prev) => {
      if (prev && prev.id === wordId) {
        return { ...prev, ...updatedFields };
      }
      return prev;
    });
  };

  // Triggered when "覚えた" (Memorized) is tapped
  const handleMemorized = (wordId: string) => {
    const nextScore = totalMemorizedCount + 1;
    setTotalMemorizedCount(nextScore);
    if (isSupabaseConfigured) {
      saveSupabaseStats(nextScore).catch((err) => {
        console.error('Supabase stats save error:', err);
      });
    }

    setWords((prev) =>
      prev.map((word) => {
        if (word.id === wordId) {
          const currentCount = word.memorizedCount || 0;
          const nextCount = currentCount + 1;
          const requiredCount = word.sizeTier + 1; // Level 1 is sizeTier 0 -> requiredCount 1, Level 2 is sizeTier 1 -> requiredCount 2...

          let updatedWord: Word;
          if (nextCount >= requiredCount) {
            // Level cleared!
            if (word.sizeTier === 0) {
              // If it was already Level 1 (sizeTier 0) and cleared, it gets mastered/retired.
              // We return sizeTier = -1 so it can be filtered out.
              updatedWord = {
                ...word,
                sizeTier: -1,
                memorizedCount: nextCount,
              };
            } else {
              // Move to next easier level (decrease tier) and reset memorizedCount to 0 for the new level
              const nextTier = word.sizeTier - 1;
              const oneHourLater = Date.now() + 3600000;
              updatedWord = {
                ...word,
                sizeTier: nextTier,
                lockedUntil: oneHourLater,
                lockedAtCount: nextScore, // Stores the count at moment of lock
                incorrectCount: 0,
                memorizedCount: 0, // Reset click count for the new level
              };
            }
          } else {
            // Same level, just increment current level click count
            // Still lock the word temporarily on click (as requested by existing cool-down feature)
            const oneHourLater = Date.now() + 3600000;
            updatedWord = {
              ...word,
              lockedUntil: oneHourLater,
              lockedAtCount: nextScore,
              incorrectCount: 0,
              memorizedCount: nextCount,
            };
          }

          if (isSupabaseConfigured) {
            upsertSupabaseWord(updatedWord).catch((err) => {
              console.error('Supabase update word error:', err);
              setSupabaseStatus('error');
            });
          }
          return updatedWord;
        }
        return word;
      })
    );
    setSelectedWord(null);
  };

  // Triggered when "覚えていない" (Not memorized) is tapped
  const handleUnsure = (wordId: string) => {
    setWords((prev) =>
      prev.map((word) => {
        if (word.id === wordId) {
          // One step larger (Tier limits 0 to 4)
          const nextTier = Math.min(4, word.sizeTier + 1);
          const currentIncorrect = word.incorrectCount || 0;
          const updatedWord: Word = {
            ...word,
            sizeTier: nextTier,
            lockedUntil: 0, // No cooldown for unsure items
            lockedAtCount: 0,
            incorrectCount: currentIncorrect + 1, // Increment incorrect attempts count
            memorizedCount: 0, // Reset the "覚えた" click count to 0 since they moved to a new level!
          };

          if (isSupabaseConfigured) {
            upsertSupabaseWord(updatedWord).catch((err) => {
              console.error('Supabase unsure update error:', err);
              setSupabaseStatus('error');
            });
          }
          return updatedWord;
        }
        return word;
      })
    );
    setSelectedWord(null);
  };

  // Developer / Prototyping Cheats (Makes testing cooldowns & locks instantly accessible!)
  const cheatFastForwardHour = () => {
    // Subtracts 1 hour from current word locks to simulate time passing
    setWords((prev) =>
      prev.map((word) => {
        if (word.lockedUntil > 0) {
          return {
            ...word,
            lockedUntil: Math.max(0, word.lockedUntil - 3600000),
          };
        }
        return word;
      })
    );
  };

  const cheatIncrementMemorized = () => {
    // Simulated increment to hit the "5 total memorized" bypass
    setTotalMemorizedCount((prev) => prev + 1);
  };

  const handleResetToDefault = () => {
    if (window.confirm('単語の登録状態を初期の物理用語セット（15語）にリセットしますか？')) {
      const withInitial = INITIAL_DEFAULT_WORDS.map((w) => ({
        ...w,
        initialSizeTier: w.initialSizeTier !== undefined ? w.initialSizeTier : w.sizeTier,
      }));
      setWords(withInitial);
      setTotalMemorizedCount(0);
      setSelectedWord(null);
    }
  };

  const handleClearAll = () => {
    if (window.confirm('全ての単語を削除しますか？')) {
      setWords([]);
      setTotalMemorizedCount(0);
      setSelectedWord(null);
    }
  };

  return (
    <div className="h-screen h-[100dvh] w-screen w-[100dvw] bg-[#FAF7F2] text-[#5C4F41] font-sans flex flex-col relative overflow-hidden select-none">
      
      {/* 1. Dynamic Portrait orientation guidance banner */}
      {isPortrait && (
        <div className="w-full bg-[#FAF9F5] border-b border-[#E9E4DB] text-[#5C4F41] text-xs px-4 py-2.5 flex items-center justify-between z-50 text-center animate-pulse shadow-xs shrink-0">
          <div className="flex items-center gap-2 mx-auto font-bold text-[#9E1B32]">
            <RotateCw className="w-4 h-4 animate-spin-slow shrink-0" />
            <span>スマホを横向き（横画面）に回転させると、最適な物理配置で遊べます！</span>
          </div>
        </div>
      )}

      {/* 2. Beautiful Latte/Beige Header (Compact for landscape mobile) */}
      <header className="px-3.5 py-2 sm:px-6 sm:py-3.5 bg-[#FCFAF7]/95 border-b border-[#EBE6DC] backdrop-blur-md flex items-center justify-between z-10 shadow-xs shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="h-7.5 w-7.5 sm:h-9 sm:w-9 rounded-lg sm:rounded-xl bg-[#9E1B32] flex items-center justify-center shadow-md shadow-[#9E1B32]/20">
            <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xs sm:text-base font-extrabold tracking-tight text-[#5C4F41] flex items-center gap-1.5 font-sans">
              Word Cloud Sandbox
              <span className="text-[8px] sm:text-[9px] py-0.5 px-1.5 bg-[#FAF9F5] text-[#9E1B32] border border-[#E9E4DB] rounded-full font-bold">
                v1.3
              </span>
            </h1>
          </div>
        </div>

        {/* Header Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Elegant Floating Hint Button */}
          <button
            onClick={() => setShowHints(true)}
            className="flex items-center gap-1 px-2.5 py-1.5 sm:px-3 sm:py-2 bg-[#FCFAF7] hover:bg-[#F2EFE9] border border-[#E3DDD4] text-[#5C4F41] font-extrabold text-[10px] sm:text-xs rounded-full shadow-xs hover:shadow-md active:scale-95 transition-all cursor-pointer select-none"
            title="フィールドの操作方法（ヘルプ）"
          >
            <HelpCircle className="w-3.5 h-3.5 text-[#9E1B32]" />
            <span className="hidden xs:inline">ヒント</span>
          </button>

          {/* Active stats counter */}
          <div className="flex items-center gap-1 bg-[#FAF9F5] border border-[#E9E4DB] px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-full text-[10px] sm:text-xs text-[#8A8074] font-bold">
            <span className="h-1.5 w-1.5 bg-[#2d8a4e] rounded-full animate-pulse" />
            <span>単語数: {words.length}語</span>
          </div>

          {/* Supabase Connection Status Badge */}
          <div className={`flex items-center gap-1 bg-[#FAF9F5] border border-[#E9E4DB] px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-full text-[10px] sm:text-xs font-bold ${
            supabaseStatus === 'connected'
              ? 'bg-[#EAFCF1] border-[#B7F2CB] text-[#2d8a4e]'
              : supabaseStatus === 'syncing'
              ? 'bg-[#F2EEFF] border-[#DDD0FF] text-[#6a52c0]'
              : supabaseStatus === 'error'
              ? 'bg-[#FFECEF] border-[#FFC2CC] text-[#d34e6c]'
              : 'bg-[#FAF9F5] border-[#E9E4DB] text-[#8A8074]'
          }`} title={
            supabaseStatus === 'connected' ? 'Supabaseと同期中' :
            supabaseStatus === 'syncing' ? '同期しています...' :
            supabaseStatus === 'error' ? 'Supabase同期エラー（ローカルで保存中）' :
            'ローカル保存（Supabase未設定）'
          }>
            <span className={`h-1.5 w-1.5 rounded-full ${
              supabaseStatus === 'connected' ? 'bg-[#2d8a4e]' :
              supabaseStatus === 'syncing' ? 'bg-[#6a52c0] animate-pulse' :
              supabaseStatus === 'error' ? 'bg-[#d34e6c]' : 'bg-[#8A8074]'
            }`} />
            <span className="hidden xs:inline">Supabase:</span>
            <span>{
              supabaseStatus === 'connected' ? '接続中' :
              supabaseStatus === 'syncing' ? '同期中' :
              supabaseStatus === 'error' ? 'エラー' : 'ローカル'
            }</span>
          </div>

          {/* Quick-Shuffle Button - Icon only */}
          <button
            onClick={() => setShuffleTriggerCount((prev) => prev + 1)}
            className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-[#FCFAF7] hover:bg-[#F2EFE9] border border-[#E3DDD4] text-[#5C4F41] rounded-full shadow-md hover:shadow-lg active:scale-95 transition-all cursor-pointer select-none shrink-0"
            title="単語の配置をシャッフル"
          >
            <RefreshCw className="w-4 h-4 text-[#9E1B32]" />
          </button>

          {/* Dictionary & Registration Drawer Toggle Button - Book mark only */}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className={`flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer shrink-0 ${
              isSidebarOpen ? 'bg-[#5C4F41] text-white' : 'bg-[#9E1B32] text-white hover:bg-[#7D1124]'
            }`}
            title={isSidebarOpen ? '辞書を閉じる' : '辞書・単語登録を開く'}
          >
            <BookOpen className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* 3. Main Dashboard Workspace (Left sidebar drawer, Right canvas) */}
      <main className="flex-1 flex relative w-full overflow-hidden">
        
        {/* Left Side Drawer: Slide-out panel for registration & dictionary */}
        <div 
          className={`absolute left-0 top-0 bottom-0 z-30 flex flex-col gap-4 p-5 border-r border-[#EBE6DC] bg-[#FCFAF7]/98 backdrop-blur-lg select-none transition-all duration-300 overflow-y-auto ${
            isSidebarOpen 
              ? 'w-full md:w-[380px] opacity-100 translate-x-0 shadow-2xl' 
              : 'w-0 p-0 opacity-0 -translate-x-full overflow-hidden border-r-0'
          }`}
        >
          {/* Drawer Title & Quick Close */}
          <div className="flex items-center justify-between border-b border-[#EBE6DC] pb-3">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#9E1B32]" />
              <span className="font-extrabold text-sm text-[#5C4F41]">辞書 ＆ 新規登録</span>
            </div>
            <button 
              onClick={() => setIsSidebarOpen(false)}
              className="text-xs font-bold text-[#8A8074] hover:text-[#5C4F41] px-2 py-1 bg-[#FAF9F5] border border-[#E9E4DB] rounded-lg"
            >
              閉じる
            </button>
          </div>

          {/* Form to Register Words */}
          <WordForm onAddWord={handleAddWord} />

          {/* Word List and Retention Level Metrics */}
          <WordStats 
            words={words} 
            totalMemorizedCount={totalMemorizedCount} 
            onDeleteWord={handleDeleteWord}
            onWordSelect={(word) => {
              setSelectedWord(word);
              setSelectedWordFromDictionary(true);
            }}
          />


        </div>

        {/* Backdrop for mobile drawer */}
        {isSidebarOpen && (
          <div 
            onClick={() => setIsSidebarOpen(false)}
            className="absolute inset-0 bg-[#8A8074]/15 z-20 md:hidden animate-fade-in"
          />
        )}

        {/* Right Side: Interactive Physics Playground Canvas */}
        <div className="flex-1 h-full p-1 sm:p-4 flex flex-col relative overflow-hidden min-w-[320px]">
          
          <WordCanvas
            words={words.filter((w) => w.sizeTier >= 0)}
            totalMemorizedCount={totalMemorizedCount}
            onWordTap={(word) => {
              setSelectedWord(word);
              setSelectedWordFromDictionary(false);
            }}
            isSidebarOpen={isSidebarOpen}
            shuffleTriggerCount={shuffleTriggerCount}
          />
        </div>
      </main>

      {/* 4. Overlay Learning Action Modal */}
      {selectedWord && (
        <WordPopup
          word={selectedWord}
          isLocked={isWordLocked(selectedWord, totalMemorizedCount)}
          onClose={() => {
            setSelectedWord(null);
            setSelectedWordFromDictionary(false);
          }}
          onMemorized={handleMemorized}
          onUnsure={handleUnsure}
          isEditable={selectedWordFromDictionary}
          onUpdateWord={handleUpdateWord}
        />
      )}

      {/* Interactive Help/Hint Modal */}
      {showHints && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[#FCFAF7] border border-[#E9E4DB] rounded-3xl p-6 max-w-xs w-full shadow-2xl relative text-center overflow-hidden">
            {/* Cute decor tag */}
            <div className="absolute top-0 inset-x-0 h-1.5 bg-[#9E1B32]" />
            
            <h3 className="text-sm font-extrabold text-[#5C4F41] mb-3.5 flex items-center justify-center gap-1.5 font-sans">
              <span>💡</span> フィールドの操作方法
            </h3>
            <div className="text-[11px] text-[#8A8074] space-y-3.5 text-left mb-5 font-semibold leading-relaxed">
              <div>
                <p className="text-[#5C4F41] text-xs flex items-center gap-1 font-bold">
                  <span>✊</span> ドラッグして移動
                </p>
                <p className="pl-5 text-[10px] mt-0.5 text-[#8A8074]">
                  何もない場所をドラッグ（またはスワイプ）すると、フィールド全体を自在にスクロールできます。
                </p>
              </div>
              <div>
                <p className="text-[#5C4F41] text-xs flex items-center gap-1 font-bold">
                  <span>👆</span> 文字をタップ
                </p>
                <p className="pl-5 text-[10px] mt-0.5 text-[#8A8074]">
                  ふわふわ漂う単語をタップすると、日本語の意味を確認でき、「覚えた！」判定をチェックできます。
                </p>
              </div>
              <div>
                <p className="text-[#5C4F41] text-xs flex items-center gap-1 font-bold">
                  <span>🌀</span> ゆったりスピード
                </p>
                <p className="pl-5 text-[10px] mt-0.5 text-[#8A8074]">
                  言葉たちは非常にゆっくりと優雅に漂い、衝突するとプルプル跳ね返ります。
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowHints(false)}
              className="w-full py-2 bg-[#9E1B32] hover:bg-[#7D1124] text-white font-bold text-xs rounded-xl shadow-xs hover:shadow-md transition-all cursor-pointer active:scale-95"
            >
              閉じる
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
