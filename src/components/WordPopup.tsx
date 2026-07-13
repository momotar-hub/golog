import React, { useEffect, useState } from 'react';
import { Word, PartOfSpeech } from '../types';
import { Check, X, AlertCircle, Clock, Edit } from 'lucide-react';

interface WordPopupProps {
  word: Word;
  isLocked?: boolean;
  onClose: () => void;
  onMemorized: (wordId: string) => void;
  onUnsure: (wordId: string) => void;
  isEditable?: boolean;
  onUpdateWord?: (wordId: string, updatedFields: Partial<Word>) => void;
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

export const WordPopup: React.FC<WordPopupProps> = ({
  word,
  isLocked = false,
  onClose,
  onMemorized,
  onUnsure,
  isEditable = false,
  onUpdateWord,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editSpelling, setEditSpelling] = useState(word.spelling);
  const [editMeaning, setEditMeaning] = useState(word.meaning);
  const [editParts, setEditParts] = useState<PartOfSpeech[]>(word.partsOfSpeech);
  const [error, setError] = useState('');

  // Reset edit states if the selected word changes
  useEffect(() => {
    setEditSpelling(word.spelling);
    setEditMeaning(word.meaning);
    setEditParts(word.partsOfSpeech);
    setIsEditing(false);
    setError('');
  }, [word]);

  // Lock body scroll when popup is open so background canvas won't scroll
  useEffect(() => {
    const originalStyle = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, []);

  const levelRequiredCount = word.sizeTier + 1;
  const currentLevelClicks = word.memorizedCount || 0;
  const remainingCount = Math.max(0, levelRequiredCount - currentLevelClicks);

  const togglePart = (part: PartOfSpeech) => {
    if (editParts.includes(part)) {
      setEditParts(editParts.filter((p) => p !== part));
    } else {
      setEditParts([...editParts, part]);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!editSpelling.trim()) {
      setError('単語のスペルを入力してください。');
      return;
    }
    if (!editMeaning.trim()) {
      setError('意味を入力してください。');
      return;
    }
    if (editParts.length === 0) {
      setError('品詞を少なくとも1つ選択してください。');
      return;
    }

    if (onUpdateWord) {
      onUpdateWord(word.id, {
        spelling: editSpelling.trim(),
        meaning: editMeaning.trim(),
        partsOfSpeech: editParts,
      });
    }
    setIsEditing(false);
  };

  return (
    <div 
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#8A8074]/30 backdrop-blur-md animate-fade-in cursor-pointer"
    >
      <div className="relative w-full max-w-md max-h-[92vh] overflow-y-auto bg-[#FCFAF7] border border-[#E9E4DB] rounded-3xl shadow-2xl flex flex-col scrollbar-thin cursor-default">
        {/* Soft pastel aesthetic bar */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-[#9E1B32]" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-[#8A8074] hover:text-[#5C4F41] bg-[#FAF9F5] hover:bg-[#F2EFE9] rounded-full border border-[#E9E4DB]/60 transition-colors cursor-pointer z-10"
        >
          <X className="w-4 h-4 stroke-[2.5]" />
        </button>

        {/* Edit Button (Shown only when editable and not already editing) */}
        {isEditable && !isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="absolute top-5 right-16 p-2 text-[#9E1B32] hover:text-[#7D1124] bg-[#FFECEF] hover:bg-[#FFD2D9] rounded-full border border-[#FFC2CC] transition-colors cursor-pointer flex items-center gap-1 px-3 z-10"
          >
            <Edit className="w-3.5 h-3.5" />
            <span className="text-[10px] font-bold">編集</span>
          </button>
        )}

        {isEditing ? (
          /* EDITING STATE FORM */
          <form onSubmit={handleSave} className="p-7 pt-9 flex flex-col gap-4">
            <div className="flex items-center gap-1.5 border-b border-[#EBE6DC] pb-3 mb-1">
              <Edit className="w-4 h-4 text-[#9E1B32]" />
              <h3 className="text-xs font-bold tracking-wider text-[#5C4F41] uppercase">
                単語情報の編集 / EDIT WORD
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
                value={editSpelling}
                onChange={(e) => setEditSpelling(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#FAF9F5] border border-[#E9E4DB] rounded-xl text-xs text-[#5C4F41] focus:outline-none focus:border-[#9E1B32] transition-all font-sans font-bold"
              />
            </div>

            {/* Word meaning input */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[9px] font-bold text-[#8A8074] tracking-wider uppercase">
                日本語の意味 / MEANING
              </label>
              <input
                type="text"
                value={editMeaning}
                onChange={(e) => setEditMeaning(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#FAF9F5] border border-[#E9E4DB] rounded-xl text-xs text-[#5C4F41] focus:outline-none focus:border-[#9E1B32] transition-all font-bold"
              />
            </div>

            {/* Multi-select Parts of Speech list */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[9px] font-bold text-[#8A8074] tracking-wider uppercase">
                品詞選択 / PARTS OF SPEECH (複数選択可)
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {PARTS_OF_SPEECH_LIST.map((part) => {
                  const isSelected = editParts.includes(part);
                  
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

            {/* Save / Cancel buttons */}
            <div className="flex gap-2.5 mt-4">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="flex-1 py-3 px-4 bg-[#F2EFE9] hover:bg-[#E9E4DB] border border-[#E9E4DB] text-[#5C4F41] text-xs font-bold rounded-xl transition-all cursor-pointer active:scale-95 text-center"
              >
                キャンセル
              </button>
              <button
                type="submit"
                className="flex-1 py-3 px-4 bg-[#9E1B32] hover:bg-[#7D1124] text-white text-xs font-bold rounded-xl shadow-xs hover:shadow-md transition-all cursor-pointer active:scale-95 text-center"
              >
                変更を保存する
              </button>
            </div>
          </form>
        ) : (
          /* STANDARD VIEW DETAILS */
          <>
            {/* Word Presentation Card */}
            <div className="p-7 pb-4 pt-9">
              <div className="flex flex-wrap gap-1.5 mb-4 mt-2 max-w-[82%]">
                {word.partsOfSpeech.map((pos) => {
                  let tagColor = 'bg-[#FAF9F5] text-[#8A8074] border-[#E9E4DB]';
                  if (pos === 'Noun') tagColor = 'bg-[#FFECEF] text-[#d34e6c] border-[#FFC2CC]';
                  if (pos === 'Verb') tagColor = 'bg-[#EAFCF1] text-[#2d8a4e] border-[#B7F2CB]';
                  if (pos === 'Adjective') tagColor = 'bg-[#F3EEFF] text-[#6a52c0] border-[#DDD0FF]';
                  if (pos === 'Adverb') tagColor = 'bg-[#FFF9E6] text-[#9E1B32] border-[#FFE9A6]';

                  return (
                    <span
                      key={pos}
                      className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full border ${tagColor}`}
                    >
                      {pos}
                    </span>
                  );
                })}
                <span className="px-3 py-1 text-[10px] font-bold bg-[#EAFCF1] text-[#2d8a4e] border border-[#B7F2CB] rounded-full">
                  {word.sizeTier === 0 ? `マスターまであと ${remainingCount} 回` : `レベルアップまであと ${remainingCount} 回`}
                </span>
                <span className="px-3 py-1 text-[10px] font-bold bg-[#FAF9F5] text-[#8A8074] border border-[#E9E4DB] rounded-full">
                  LV.{5 - word.sizeTier}/5
                </span>
              </div>

              <h2 className="text-3.5xl font-black text-[#5C4F41] tracking-tight break-all mb-2 select-all font-sans">
                {word.spelling}
              </h2>
              
              <div className="h-[1px] bg-[#E9E4DB] my-4" />

              <p className="text-[9px] font-bold text-[#8A8074] tracking-wider uppercase mb-1">
                日本語の意味 / MEANING
              </p>
              <p className="text-lg font-bold text-[#5C4F41] leading-relaxed mb-4">
                {word.meaning}
              </p>
            </div>

            {/* Cooldown lock details banner */}
            <div className="mx-7 px-4.5 py-4 bg-[#FAF9F5] border border-[#E9E4DB] rounded-2xl mb-7 flex gap-3 text-xs leading-normal">
              <Clock className="w-5 h-5 text-[#9E1B32] shrink-0 mt-0.5" />
              <div className="text-[#5C4F41] font-medium w-full">
                <span className="font-bold text-[#5C4F41] block mb-0.5">🧠 記憶定着クールダウンシステム</span>
                「覚えた！」を選択すると、この単語は一時的にロックされます。
                {isLocked && (
                  <span className="text-[#9E1B32] font-extrabold block mt-2 bg-[#FFECEF] border border-[#FFC2CC] px-3 py-1.5 rounded-lg text-[10px] animate-pulse">
                    ⚠️ 現在この単語はロック中のため、判定操作（ボタン）は行えません。
                  </span>
                )}
                <div className="mt-1.5 flex flex-col gap-1 text-[10px] text-[#8A8074]">
                  <span>• あと {remainingCount} 回「覚えた！」をマークすると、{word.sizeTier === 0 ? 'この単語は習得（卒業）となりフィールドから消えます。' : `次のレベル（LV.${6 - word.sizeTier}）へレベルアップします。`}</span>
                  <span>• ロック解除条件①: 他の単語を合計5回「覚えた」とマークする</span>
                  <span>• ロック解除条件②: 判定してから1時間が経過する</span>
                </div>
              </div>
            </div>

            {/* Action button bar */}
            <div className="mt-auto p-5 bg-[#FAF9F5] border-t border-[#E9E4DB] flex gap-3">
              {/* Unsure option */}
              <button
                onClick={() => !isLocked && onUnsure(word.id)}
                disabled={isLocked}
                className={`flex-1 flex items-center justify-center gap-2 py-3.5 px-4 text-xs font-bold rounded-xl transition-all shadow-xs ${
                  isLocked
                    ? 'bg-[#EAEAEA] border border-[#DCDCD7] text-[#A0A09A] cursor-not-allowed opacity-60'
                    : 'bg-[#F2EFE9] hover:bg-[#E9E4DB] border border-[#E9E4DB] text-[#5C4F41] hover:text-[#3E352B] active:scale-95 cursor-pointer'
                }`}
              >
                <AlertCircle className="w-4 h-4 text-[#D34E6C] shrink-0" />
                <span>未習得 / 苦手かも</span>
              </button>

              {/* Memorized option */}
              <button
                onClick={() => !isLocked && onMemorized(word.id)}
                disabled={isLocked}
                className={`flex-1 flex items-center justify-center gap-2 py-3.5 px-4 text-xs font-bold rounded-xl transition-all shadow-xs ${
                  isLocked
                    ? 'bg-[#EAEAEA] border border-[#DCDCD7] text-[#A0A09A] cursor-not-allowed opacity-60'
                    : 'bg-[#9E1B32] hover:bg-[#7D1124] text-white active:scale-95 cursor-pointer'
                }`}
              >
                <Check className="w-4 h-4 shrink-0 stroke-[2.5]" />
                <span>覚えた！</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
