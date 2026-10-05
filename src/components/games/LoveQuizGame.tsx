import React, { useState, useEffect } from 'react';
import { Sparkles, Eye, Plus, ChevronLeft, ChevronRight, Heart, Lock, CheckCircle2, RotateCcw } from 'lucide-react';
import { QuizQuestion, CoupleSpace } from '../../types';
import { StorageService } from '../../services/storage';
import { sound } from '../../services/sound';
import confetti from 'canvas-confetti';

interface LoveQuizGameProps {
  space: CoupleSpace;
  activeUserId: 'partner1' | 'partner2';
}

export const LoveQuizGame: React.FC<LoveQuizGameProps> = ({
  space,
  activeUserId,
}) => {
  const [questions, setQuestions] = useState<QuizQuestion[]>(() =>
    StorageService.getQuiz()
  );
  const [selectedCategory, setSelectedCategory] = useState<string>('Tous');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [myAnswerInput, setMyAnswerInput] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newQuestionText, setNewQuestionText] = useState('');
  const [newQuestionCategory, setNewQuestionCategory] = useState<QuizQuestion['category']>('Complicité');

  const filteredQuestions = selectedCategory === 'Tous'
    ? questions
    : questions.filter((q) => q.category === selectedCategory);

  const safeIndex = Math.min(currentIndex, Math.max(0, filteredQuestions.length - 1));
  const currentQ = filteredQuestions[safeIndex] || questions[0];
  const isMeP1 = activeUserId === 'partner1';

  const answeredCount = questions.filter((q) => q.isRevealed).length;

  useEffect(() => {
    const unsubscribe = StorageService.subscribeSync((event) => {
      if (event.type === 'QUIZ_UPDATED') {
        setQuestions(event.payload as QuizQuestion[]);
      }
    });
    return unsubscribe;
  }, []);

  // Synchronize text input if user already answered current question
  useEffect(() => {
    if (currentQ) {
      const existing = isMeP1 ? currentQ.partner1Answer : currentQ.partner2Answer;
      setMyAnswerInput(existing || '');
    }
  }, [currentIndex, activeUserId, currentQ]);

  const handleSaveMyAnswer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!myAnswerInput.trim() || !currentQ) return;

    sound.playTap();
    const updated = questions.map((q) => {
      if (q.id === currentQ.id) {
        return {
          ...q,
          partner1Answer: isMeP1 ? myAnswerInput.trim() : q.partner1Answer,
          partner2Answer: !isMeP1 ? myAnswerInput.trim() : q.partner2Answer,
        };
      }
      return q;
    });

    setQuestions(updated);
    StorageService.saveQuiz(updated);
  };

  const handleReveal = () => {
    if (!currentQ) return;
    sound.playWin();
    try {
      confetti({
        particleCount: 25,
        spread: 60,
        origin: { y: 0.65 },
        colors: ['#fda4af', '#f472b6', '#ec4899', '#c084fc'],
      });
    } catch {
      // Ignore
    }

    const updated = questions.map((q) =>
      q.id === currentQ.id ? { ...q, isRevealed: true } : q
    );
    setQuestions(updated);
    StorageService.saveQuiz(updated);
  };

  const handleResetCurrentAnswers = () => {
    if (!currentQ) return;
    sound.playTap();
    const updated = questions.map((q) =>
      q.id === currentQ.id
        ? {
            ...q,
            partner1Answer: undefined,
            partner2Answer: undefined,
            isRevealed: false,
          }
        : q
    );
    setQuestions(updated);
    StorageService.saveQuiz(updated);
    setMyAnswerInput('');
  };

  const handleCreateNewQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestionText.trim()) return;

    sound.playTap();
    const newQ: QuizQuestion = {
      id: 'q_custom_' + Date.now(),
      question: newQuestionText.trim(),
      category: newQuestionCategory,
      isRevealed: false,
    };

    const updated = [...questions, newQ];
    setQuestions(updated);
    StorageService.saveQuiz(updated);
    setNewQuestionText('');
    setShowAddModal(false);
    setCurrentIndex(updated.length - 1);
  };

  const p1HasAnswered = Boolean(currentQ.partner1Answer);
  const p2HasAnswered = Boolean(currentQ.partner2Answer);
  const bothAnswered = p1HasAnswered && p2HasAnswered;

  return (
    <div className="space-y-4">
      {/* Category Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-1">
        {['Tous', 'Souvenirs', 'Complicité', 'Intimité', 'Futur', 'Petits secrets'].map((cat) => (
          <button
            key={cat}
            onClick={() => {
              sound.playTap();
              setSelectedCategory(cat);
              setCurrentIndex(0);
            }}
            className={`whitespace-nowrap px-2.5 py-1 rounded-full text-[11px] font-medium transition-all ${
              selectedCategory === cat
                ? 'bg-rose-500/25 text-rose-200 border border-rose-400/40 shadow-sm'
                : 'bg-white/[0.04] text-white/50 hover:text-white/80 border border-white/[0.04]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Quiz Header & Index Navigation */}
      <div className="flex items-center justify-between p-4 rounded-2xl bg-[#140f26] border border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-medium text-rose-300">
              {currentQ.category}
            </span>
            <span className="text-white/30 text-xs">·</span>
            <span className="text-[11px] text-white/50">
              Question {safeIndex + 1} sur {filteredQuestions.length} ({answeredCount} complétées)
            </span>
          </div>
          <div className="text-xs text-white/70 mt-0.5">
            {currentQ.isRevealed
              ? 'Réponses révélées ✨'
              : bothAnswered
              ? 'Prêts à révéler ! 💖'
              : 'En attente des réponses secrètes'}
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              sound.playTap();
              setCurrentIndex((prev) => (prev > 0 ? prev - 1 : filteredQuestions.length - 1));
            }}
            className="p-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-white/80 active:scale-95 transition-all"
            aria-label="Question précédente"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              sound.playTap();
              setCurrentIndex((prev) => (prev < filteredQuestions.length - 1 ? prev + 1 : 0));
            }}
            className="p-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-white/80 active:scale-95 transition-all"
            aria-label="Question suivante"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Question Card */}
      <div className="p-6 rounded-3xl bg-gradient-to-b from-[#181233] to-[#120e24] border border-white/[0.1] shadow-2xl space-y-6">
        <h3 className="font-serif text-xl sm:text-2xl text-rose-100 font-medium leading-snug text-center">
          « {currentQ.question} »
        </h3>

        {/* Answers Zone */}
        {currentQ.isRevealed ? (
          /* Revealed State: Both answers side by side */
          <div className="space-y-3 pt-2">
            {/* Partner 1 Answer */}
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 space-y-1">
              <div className="flex items-center justify-between text-[11px] text-rose-300 font-medium">
                <span>{space.partner1.name} (💖)</span>
                <span>Réponse</span>
              </div>
              <p className="text-sm text-white/90 italic">
                {currentQ.partner1Answer || 'Pas encore de réponse enregistrée.'}
              </p>
            </div>

            {/* Partner 2 Answer */}
            <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20 space-y-1">
              <div className="flex items-center justify-between text-[11px] text-purple-300 font-medium">
                <span>{space.partner2.name} (💜)</span>
                <span>Réponse</span>
              </div>
              <p className="text-sm text-white/90 italic">
                {currentQ.partner2Answer || 'Pas encore de réponse enregistrée.'}
              </p>
            </div>

            <div className="flex justify-end pt-1">
              <button
                onClick={handleResetCurrentAnswers}
                className="text-[11px] text-white/40 hover:text-white/70 flex items-center gap-1 transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Recommencer cette question</span>
              </button>
            </div>
          </div>
        ) : (
          /* Hidden State: Answer input and readiness status */
          <div className="space-y-4">
            {/* Status pills for both partners */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div
                className={`p-3 rounded-2xl border text-center transition-all ${
                  p1HasAnswered
                    ? 'bg-rose-500/15 border-rose-500/30 text-rose-200'
                    : 'bg-white/[0.03] border-white/[0.06] text-white/40'
                }`}
              >
                <div className="text-[11px] font-medium">{space.partner1.name}</div>
                <div className="text-[10px] mt-0.5 flex items-center justify-center gap-1">
                  {p1HasAnswered ? (
                    <>
                      <CheckCircle2 className="w-3 h-3 text-rose-400" />
                      <span>Réponse prête</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-3 h-3 text-white/30" />
                      <span>En attente...</span>
                    </>
                  )}
                </div>
              </div>

              <div
                className={`p-3 rounded-2xl border text-center transition-all ${
                  p2HasAnswered
                    ? 'bg-purple-500/15 border-purple-500/30 text-purple-200'
                    : 'bg-white/[0.03] border-white/[0.06] text-white/40'
                }`}
              >
                <div className="text-[11px] font-medium">{space.partner2.name}</div>
                <div className="text-[10px] mt-0.5 flex items-center justify-center gap-1">
                  {p2HasAnswered ? (
                    <>
                      <CheckCircle2 className="w-3 h-3 text-purple-400" />
                      <span>Réponse prête</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-3 h-3 text-white/30" />
                      <span>En attente...</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Answer Input form for current user */}
            <form onSubmit={handleSaveMyAnswer} className="space-y-2">
              <label className="block text-[11px] text-white/60">
                Ta réponse secrète ({isMeP1 ? space.partner1.name : space.partner2.name}) :
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={myAnswerInput}
                  onChange={(e) => setMyAnswerInput(e.target.value)}
                  placeholder="Écris ton sentiment avec sincérité..."
                  className="flex-1 px-3.5 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.1] text-xs text-white focus:outline-none focus:border-rose-400"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.15] text-xs font-semibold text-rose-200 border border-white/[0.1] transition-all"
                >
                  Valider
                </button>
              </div>
            </form>

            {/* Reveal Button */}
            <button
              onClick={handleReveal}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-rose-500 via-rose-600 to-purple-600 hover:from-rose-400 hover:to-purple-500 text-white font-medium text-xs flex items-center justify-center gap-2 shadow-lg shadow-rose-950/40 active:scale-[0.98] transition-all"
            >
              <Eye className="w-4 h-4" />
              <span>Révéler nos réponses ensemble</span>
            </button>
          </div>
        )}
      </div>

      {/* Action Footer: Add custom question */}
      <div className="flex items-center justify-between px-1">
        <button
          onClick={() => setShowAddModal(true)}
          className="text-xs text-rose-300/80 hover:text-rose-200 flex items-center gap-1.5 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Ajouter notre propre question</span>
        </button>

        <span className="text-[11px] text-white/40">
          Chiffrement privé de couple
        </span>
      </div>

      {/* Add Custom Question Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <div className="w-full max-w-md bg-[#130f24] border border-white/[0.1] rounded-3xl p-6 text-white shadow-2xl">
            <h3 className="font-serif text-xl font-semibold text-rose-100 mb-2">
              Nouvelle question d’amoureux
            </h3>
            <p className="text-xs text-white/60 mb-4">
              Pose une question intime, douce ou drôle pour votre prochain tête-à-tête.
            </p>

            <form onSubmit={handleCreateNewQuestion} className="space-y-4">
              <div>
                <label className="block text-[11px] text-white/60 mb-1">Catégorie</label>
                <select
                  value={newQuestionCategory}
                  onChange={(e) =>
                    setNewQuestionCategory(
                      e.target.value as QuizQuestion['category']
                    )
                  }
                  className="w-full px-3 py-2 rounded-xl bg-white/[0.05] border border-white/[0.1] text-xs text-white focus:outline-none focus:border-rose-400"
                >
                  <option value="Complicité" className="bg-[#130f24]">Complicité</option>
                  <option value="Souvenirs" className="bg-[#130f24]">Souvenirs</option>
                  <option value="Intimité" className="bg-[#130f24]">Intimité</option>
                  <option value="Futur" className="bg-[#130f24]">Futur</option>
                  <option value="Petits secrets" className="bg-[#130f24]">Petits secrets</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-white/60 mb-1">Ta question</label>
                <textarea
                  rows={3}
                  value={newQuestionText}
                  onChange={(e) => setNewQuestionText(e.target.value)}
                  placeholder="Ex: Quel souvenir ensemble te donne le sourire le plus sincère ?"
                  className="w-full px-3 py-2 rounded-xl bg-white/[0.05] border border-white/[0.1] text-xs text-white focus:outline-none focus:border-rose-400"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-xs text-white/70"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-xs font-semibold text-white shadow-md shadow-rose-950"
                >
                  Ajouter au quiz
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
