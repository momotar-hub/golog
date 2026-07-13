import React, { useState } from 'react';
import { PartOfSpeech } from '../types';
import { Plus, Check, Info } from 'lucide-react';

interface WordFormProps {
  onAddWord: (spelling: string, meaning: string, partsOfSpeech: PartOfSpeech[]) => void;
}

const PARTS_OF_SPEECH_LIST: PartOfSpeech[] = [
  'Noun',
  'Verb',
  'Adjective',
  'Adverb',
  'Pronoun',
  'Preposition',
  'Conjunction',
  'Interjection'
];

export const WordForm: React.FC<WordFormProps> = ({ onAddWord }) => {
  const [spelling, setSpelling] = useState('');
  const [meaning, setMeaning] = useState('');
  const [selectedParts, setSelectedParts] = useState<PartOfSpeech[]>([]);
  const [error, setError] = useState('');

  const togglePart = (part: PartOfSpeech) => {
    if (selectedParts.includes(part)) {
      setSelectedParts(selectedParts.filter((p) => p !== part));
    } else {
      setSelectedParts([...selectedParts, part]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!spelling.trim()) {
      setError('単語のスペルを入力してください。');
      return;
    }
    if (!meaning.trim()) {
      setError('意味を入力してください。');
      return;
    }
    if (selectedParts.length === 0) {
      setError('品詞を少なくとも1つ選択してください。');
      return;
    }

    onAddWord(spelling.trim(), meaning.trim(), selectedParts);
    
    // Reset form states
    setSpelling('');
    setMeaning('');
    setSelectedParts([]);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 bg-[#FCFAF7] p-5 rounded-2xl border border-[#E9E4DB] shadow-xs">
      <div className="flex items-center gap-1.5 border-b border-[#EBE6DC] pb-3">
        <Plus className="w-4 h-4 text-[#9E1B32]" />
        <h3 className="text-xs font-bold tracking-wider text-[#5C4F41] uppercase">
          新しい単語の登録 / ADD WORD
        </h3>
      </div>

      {error && (
        <div className="text-xs bg-[#E87A90]/10 border border-[#E87A90]/20 text-[#D34E6C] px-3 py-2 rounded-xl font-semibold">
          ⚠️ {error}
        </div>
      )}

      {/* Word spelling input */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[9px] font-bold text-[#8A8074] tracking-wider uppercase">
          単語のスペル / SPELLING
        </label>
        <input
          type="text"
          value={spelling}
          onChange={(e) => setSpelling(e.target.value)}
          placeholder="e.g. Gravity"
          className="w-full px-3.5 py-2.5 bg-[#FAF9F5] border border-[#E9E4DB] rounded-xl text-xs text-[#5C4F41] placeholder-[#A09587] focus:outline-none focus:border-[#9E1B32] transition-all"
        />
      </div>

      {/* Word meaning input */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[9px] font-bold text-[#8A8074] tracking-wider uppercase">
          日本語の意味 / MEANING
        </label>
        <input
          type="text"
          value={meaning}
          onChange={(e) => setMeaning(e.target.value)}
          placeholder="e.g. 重力、引力"
          className="w-full px-3.5 py-2.5 bg-[#FAF9F5] border border-[#E9E4DB] rounded-xl text-xs text-[#5C4F41] placeholder-[#A09587] focus:outline-none focus:border-[#9E1B32] transition-all"
        />
      </div>

      {/* Multi-select Parts of Speech list */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[9px] font-bold text-[#8A8074] tracking-wider uppercase">
          品詞選択 / PARTS OF SPEECH (複数選択可)
        </label>
        <div className="grid grid-cols-2 gap-1.5">
          {PARTS_OF_SPEECH_LIST.map((part) => {
            const isSelected = selectedParts.includes(part);
            
            // Map selected state to sweet pastel background colors (Matching Canvas)
            let selectedClass = 'bg-[#FAF9F5] border-[#E9E4DB] text-[#8A8074] hover:bg-[#F2EFE9]';
            if (isSelected) {
              if (part === 'Noun') selectedClass = 'bg-[#FFECEF] border-[#FFC2CC] text-[#d34e6c]';
              else if (part === 'Verb') selectedClass = 'bg-[#EAFCF1] border-[#B7F2CB] text-[#2d8a4e]';
              else if (part === 'Adjective') selectedClass = 'bg-[#F3EEFF] border-[#DDD0FF] text-[#6a52c0]';
              else if (part === 'Adverb') selectedClass = 'bg-[#FFF9E6] border-[#FFE9A6] text-[#9E1B32]';
              else selectedClass = 'bg-blue-50 border-blue-200 text-blue-600';
            }

            return (
              <button
                key={part}
                type="button"
                onClick={() => togglePart(part)}
                className={`flex items-center justify-between px-3 py-2 rounded-xl text-[11px] font-bold border transition-all cursor-pointer select-none ${selectedClass}`}
              >
                <span>{part}</span>
                {isSelected && <Check className="w-3 h-3 stroke-[2.5]" />}
              </button>
            );
          })}
        </div>
      </div>

      <button
        type="submit"
        className="w-full mt-2 flex items-center justify-center gap-1.5 py-3 px-4 bg-[#9E1B32] hover:bg-[#7D1124] text-white text-xs font-bold rounded-xl shadow-xs hover:shadow-md active:scale-[0.98] transition-all cursor-pointer"
      >
        <Plus className="w-4 h-4 stroke-[2.5]" />
        単語を登録する
      </button>

      <div className="flex items-start gap-1.5 mt-1 text-[9px] text-[#8A8074] bg-[#FAF9F5] p-3 rounded-xl border border-[#E9E4DB]/50">
        <Info className="w-3.5 h-3.5 text-[#9E1B32] shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          登録された単語は物理オブジェクトとしてCanvas上に即座にスポーンします。
        </p>
      </div>
    </form>
  );
};
