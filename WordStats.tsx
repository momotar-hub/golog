import React, { useState } from 'react';
import { Word } from '../types';
import { isWordLocked } from './WordCanvas';
import { Trash2, Award, ShieldAlert, Sparkles, SlidersHorizontal, Search, Lock } from 'lucide-react';

interface WordStatsProps {
  words: Word[];
  totalMemorizedCount: number;
  onDeleteWord: (id: string) => void;
  onWordSelect: (word: Word) => void;
}

export const WordStats: React.FC<WordStatsProps> = ({
  words,
  totalMemorizedCount,
  onDeleteWord,
  onWordSelect,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPart, setFilterPart] = useState<string>('All');

  // Compute breakdown metrics
  const learningWords = words.filter((w) => w.sizeTier >= 0);
  const masteredWords = words.filter((w) => w.sizeTier < 0);
  const totalWords = words.length;
  const learningWordsCount = learningWords.length;
  const lockedCount = learningWords.filter((w) => isWordLocked(w, totalMemorizedCount)).length;
  
  const sizeBreakdown = {
    tiny: learningWords.filter((w) => w.sizeTier === 0).length,
    small: learningWords.filter((w) => w.sizeTier === 1).length,
    medium: learningWords.filter((w) => w.sizeTier === 2).length,
    large: learningWords.filter((w) => w.sizeTier === 3).length,
    huge: learningWords.filter((w) => w.sizeTier === 4).length,
  };

  // Filter and search words
  const filteredWords = words.filter((w) => {
    const matchesSearch = w.spelling.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          w.meaning.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterPart === 'All' || w.partsOfSpeech.includes(filterPart as any);
    return matchesSearch && matchesFilter;
  });

  const filteredLearning = filteredWords.filter((w) => w.sizeTier >= 0);
  const filteredMastered = filteredWords.filter((w) => w.sizeTier < 0);

  // Alphabetical sort (a -> z)
  const sortedLearning = [...filteredLearning].sort((a, b) => 
    a.spelling.localeCompare(b.spelling, 'en', { sensitivity: 'base' })
  );
  const sortedMastered = [...filteredMastered].sort((a, b) => 
    a.spelling.localeCompare(b.spelling, 'en', { sensitivity: 'base' })
  );

  return (
    <div className="flex flex-col gap-4 bg-[#FCFAF7] p-5 rounded-2xl border border-[#E9E4DB] h-auto select-none">
      
      {/* 1. Header with Global Stats */}
      <div className="grid grid-cols-3 gap-2 pb-3 border-b border-[#EBE6DC]">
        <div className="bg-[#FAF9F5] p-2.5 rounded-xl border border-[#E9E4DB]/80 flex flex-col items-center justify-center text-center">
          <span className="text-[9px] font-bold text-[#8A8074] uppercase tracking-wider">学習中</span>
          <span className="text-base font-extrabold text-[#5C4F41]">{learningWordsCount}</span>
        </div>
        <div className="bg-[#FAF9F5] p-2.5 rounded-xl border border-[#E9E4DB]/80 flex flex-col items-center justify-center text-center">
          <span className="text-[9px] font-bold text-[#8A8074] uppercase tracking-wider">マスター済</span>
          <span className="text-base font-extrabold text-[#2d8a4e]">{masteredWords.length}</span>
        </div>
        <div className="bg-[#FAF9F5] p-2.5 rounded-xl border border-[#E9E4DB]/80 flex flex-col items-center justify-center text-center">
          <span className="text-[9px] font-bold text-[#8A8074] uppercase tracking-wider">覚えた総数</span>
          <span className="text-base font-extrabold text-[#2d8a4e]">{totalMemorizedCount}</span>
        </div>
      </div>

      {/* 2. Visual Distribution Graph (Mini horizontal bar chart) */}
      {learningWordsCount > 0 && (
        <div className="flex flex-col gap-2 bg-[#FAF9F5] p-3 rounded-xl border border-[#E9E4DB]/60">
          <div className="flex justify-between items-center">
            <span className="text-[9px] font-bold text-[#5C4F41] uppercase tracking-wider flex items-center gap-1">
              <Award className="w-3.5 h-3.5 text-[#9E1B32]" />
              記憶の定着レベル分布 (LV.1〜5)
            </span>
          </div>
          <div className="h-2.5 w-full bg-[#FAF9F5] rounded-full overflow-hidden flex border border-[#E9E4DB]/80">
            <div 
              style={{ width: `${(sizeBreakdown.huge / learningWordsCount) * 100}%` }} 
              className="bg-[#9E1B32] h-full transition-all duration-300" 
              title={`LV.1 (Huge): ${sizeBreakdown.huge} words`}
            />
            <div 
              style={{ width: `${(sizeBreakdown.large / learningWordsCount) * 100}%` }} 
              className="bg-[#D49EA7] h-full transition-all duration-300" 
              title={`LV.2 (Large): ${sizeBreakdown.large} words`}
            />
            <div 
              style={{ width: `${(sizeBreakdown.medium / learningWordsCount) * 100}%` }} 
              className="bg-[#000000] h-full transition-all duration-300" 
              title={`LV.3 (Medium): ${sizeBreakdown.medium} words`}
            />
            <div 
              style={{ width: `${(sizeBreakdown.small / learningWordsCount) * 100}%` }} 
              className="bg-[#6D8CB3] h-full transition-all duration-300" 
              title={`LV.4 (Small): ${sizeBreakdown.small} words`}
            />
            <div 
              style={{ width: `${(sizeBreakdown.tiny / learningWordsCount) * 100}%` }} 
              className="bg-[#00205B] h-full transition-all duration-300" 
              title={`LV.5 (Tiny): ${sizeBreakdown.tiny} words`}
            />
          </div>
          <div className="grid grid-cols-5 gap-1 text-[8px] font-bold text-[#8A8074] text-center">
            <span className="flex items-center justify-center gap-0.5"><span className="w-1.5 h-1.5 rounded-full bg-[#9E1B32]" />LV.1</span>
            <span className="flex items-center justify-center gap-0.5"><span className="w-1.5 h-1.5 rounded-full bg-[#D49EA7]" />LV.2</span>
            <span className="flex items-center justify-center gap-0.5"><span className="w-1.5 h-1.5 rounded-full bg-[#000000]" />LV.3</span>
            <span className="flex items-center justify-center gap-0.5"><span className="w-1.5 h-1.5 rounded-full bg-[#6D8CB3]" />LV.4</span>
            <span className="flex items-center justify-center gap-0.5"><span className="w-1.5 h-1.5 rounded-full bg-[#00205B]" />LV.5</span>
          </div>
        </div>
      )}

      {/* 3. Search and Filter Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-[#A09587]" />
          <input
            type="text"
            placeholder="単語を検索..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8.5 pr-2 py-2 bg-[#FAF9F5] border border-[#E9E4DB] rounded-xl text-xs text-[#5C4F41] placeholder-[#A09587] focus:outline-none focus:border-[#9E1B32]"
          />
        </div>
        <select
          value={filterPart}
          onChange={(e) => setFilterPart(e.target.value)}
          className="px-2 py-1.5 bg-[#FAF9F5] border border-[#E9E4DB] rounded-xl text-xs text-[#5C4F41] focus:outline-none focus:border-[#9E1B32] font-semibold cursor-pointer"
        >
          <option value="All">全品詞</option>
          <option value="Noun">Noun (名詞)</option>
          <option value="Verb">Verb (動詞)</option>
          <option value="Adjective">Adjective (形容詞)</option>
          <option value="Adverb">Adverb (副詞)</option>
          <option value="Pronoun">Pronoun (代名詞)</option>
          <option value="Preposition">Preposition (前置詞)</option>
          <option value="Conjunction">Conjunction (接続詞)</option>
          <option value="Interjection">Interjection (感動詞)</option>
        </select>
      </div>

      {/* 4. Registered Word List Container */}
      <div className="space-y-4 pr-1">
        {/* 学習中の単語 */}
        <div>
          <div className="flex items-center gap-1 text-[11px] font-extrabold text-[#5C4F41] mb-2 px-1 border-l-2 border-[#9E1B32] py-0.5">
            <span>学習中の単語 ({sortedLearning.length})</span>
          </div>
          {sortedLearning.length === 0 ? (
            <div className="text-center py-4 bg-[#FAF9F5] rounded-xl text-[#8A8074] text-[10px] font-semibold border border-dashed border-[#E9E4DB]">
              学習中の単語はありません
            </div>
          ) : (
            <div className="space-y-1.5">
              {sortedLearning.map((word) => {
                const isLocked = isWordLocked(word, totalMemorizedCount);
                return (
                  <div
                    key={word.id}
                    className="group flex items-center justify-between p-2.5 rounded-xl bg-[#FAF9F5] hover:bg-[#F2EFE9] border border-[#E9E4DB]/60 hover:border-[#E9E4DB] transition-all"
                  >
                    <button
                      onClick={() => onWordSelect(word)}
                      className="flex-1 text-left flex flex-col gap-0.5 cursor-pointer pr-2 overflow-hidden"
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs text-[#5C4F41] group-hover:text-[#9E1B32] transition-colors truncate">
                          {word.spelling}
                        </span>
                        {isLocked && (
                          <span className="text-[8px] px-1.5 py-0.5 bg-[#FFECEF] text-[#d34e6c] border border-[#FFC2CC] rounded font-bold flex items-center gap-0.5 animate-pulse">
                            <Lock className="w-2.5 h-2.5 shrink-0" />
                            LOCK
                          </span>
                        )}
                        <span className="text-[9px] font-bold text-[#8A8074] ml-auto">
                          LV.{5 - word.sizeTier}
                        </span>
                      </div>
                      <span className="text-[10px] text-[#8A8074] truncate font-medium">
                        {word.meaning}
                      </span>
                    </button>

                    <button
                      onClick={() => onDeleteWord(word.id)}
                      className="p-1.5 text-[#A09587] hover:text-[#D34E6C] hover:bg-[#FFECEF] rounded-lg transition-all cursor-pointer"
                      title="Delete word from sandbox"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* マスターした単語 */}
        <div>
          <div className="flex items-center gap-1 text-[11px] font-extrabold text-[#2d8a4e] mb-2 px-1 border-l-2 border-[#2d8a4e] py-0.5">
            <span>マスターした単語 ({sortedMastered.length})</span>
          </div>
          {sortedMastered.length === 0 ? (
            <div className="text-center py-4 bg-[#FAF9F5] rounded-xl text-[#8A8074] text-[10px] font-semibold border border-dashed border-[#E9E4DB]">
              マスターした単語はまだありません
            </div>
          ) : (
            <div className="space-y-1.5">
              {sortedMastered.map((word) => (
                <div
                  key={word.id}
                  className="group flex items-center justify-between p-2.5 rounded-xl bg-[#F0FDF4] hover:bg-[#DCFCE7] border border-[#BCF0DA]/60 hover:border-[#86EFAC] transition-all"
                >
                  <button
                    onClick={() => onWordSelect(word)}
                    className="flex-1 text-left flex flex-col gap-0.5 cursor-pointer pr-2 overflow-hidden"
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-xs text-[#2A5E35] group-hover:text-[#15803D] transition-colors truncate line-through decoration-[#86EFAC] decoration-2">
                        {word.spelling}
                      </span>
                      <span className="text-[8px] px-1.5 py-0.5 bg-[#DCFCE7] text-[#15803D] border border-[#86EFAC] rounded font-bold">
                        MASTERED
                      </span>
                    </div>
                    <span className="text-[10px] text-[#15803D]/80 truncate font-medium">
                      {word.meaning}
                    </span>
                  </button>

                  <button
                    onClick={() => onDeleteWord(word.id)}
                    className="p-1.5 text-[#A09587] hover:text-[#D34E6C] hover:bg-[#FFECEF] rounded-lg transition-all cursor-pointer"
                    title="Delete word from sandbox"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
