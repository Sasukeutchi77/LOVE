import React, { useState, useEffect } from 'react';
import {
  Compass,
  ShieldCheck,
  CheckCircle2,
  Circle,
  Plus,
  Sparkles,
  Heart,
  Calendar,
  Lock,
  Mail,
  Award,
  BookOpen,
  ArrowRight,
  TrendingUp,
  X,
  Smile,
  Sliders,
  Feather,
  Quote,
  Trash2,
  Check,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  CoupleSpace,
  CoupleProject,
  RelationshipCheckIn,
  PactRule,
  DeepLetter,
} from '../types';
import { StorageService } from '../services/storage';
import { sound } from '../services/sound';

interface SeriousSectionProps {
  space: CoupleSpace;
  activeUserId: 'partner1' | 'partner2';
  onOpenChat?: () => void;
}

type SubTab = 'projects' | 'pact' | 'checkin' | 'letters';

export const SeriousSection: React.FC<SeriousSectionProps> = ({
  space,
  activeUserId,
  onOpenChat,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('projects');

  // Data states
  const [projects, setProjects] = useState<CoupleProject[]>(() =>
    StorageService.getProjects()
  );
  const [pactRules, setPactRules] = useState<PactRule[]>(() =>
    StorageService.getPactRules()
  );
  const [checkIns, setCheckIns] = useState<RelationshipCheckIn[]>(() =>
    StorageService.getCheckIns()
  );
  const [letters, setLetters] = useState<DeepLetter[]>(() =>
    StorageService.getDeepLetters()
  );

  // Modals & form states
  const [showAddProjectModal, setShowAddProjectModal] = useState(false);
  const [showAddPactModal, setShowAddPactModal] = useState(false);
  const [showNewCheckInModal, setShowNewCheckInModal] = useState(false);
  const [showAddLetterModal, setShowAddLetterModal] = useState(false);
  const [selectedLetter, setSelectedLetter] = useState<DeepLetter | null>(null);

  // Cross-tab real-time sync
  useEffect(() => {
    const unsub = StorageService.subscribeSync((e) => {
      if (e.type === 'PROJECTS_UPDATED') {
        setProjects(e.payload as CoupleProject[]);
      } else if (e.type === 'PACT_UPDATED') {
        setPactRules(e.payload as PactRule[]);
      } else if (e.type === 'CHECKINS_UPDATED') {
        setCheckIns(e.payload as RelationshipCheckIn[]);
      } else if (e.type === 'LETTERS_UPDATED') {
        setLetters(e.payload as DeepLetter[]);
      }
    });
    return unsub;
  }, []);

  const isMeP1 = activeUserId === 'partner1';
  const myName = isMeP1 ? space.partner1.name : space.partner2.name;
  const partnerName = isMeP1 ? space.partner2.name : space.partner1.name;

  // Global project stats
  const totalMilestones = projects.reduce(
    (acc, p) => acc + (p.milestones ? p.milestones.length : 1),
    0
  );
  const completedMilestones = projects.reduce(
    (acc, p) =>
      acc +
      (p.milestones
        ? p.milestones.filter((m) => m.done).length
        : p.completed
        ? 1
        : 0),
    0
  );
  const overallProgress =
    totalMilestones > 0
      ? Math.round((completedMilestones / totalMilestones) * 100)
      : 0;

  // Handlers for Projects
  const handleToggleMilestone = (projId: string, milestoneId: string) => {
    sound.playTap();
    StorageService.toggleProjectMilestone(projId, milestoneId);
    setProjects(StorageService.getProjects());
  };

  const handleToggleProjectCompleted = (projId: string) => {
    sound.playWin();
    confetti({ particleCount: 50, spread: 60 });
    StorageService.toggleProjectCompleted(projId);
    setProjects(StorageService.getProjects());
  };

  const handleDeleteProject = (projId: string) => {
    sound.playTap();
    StorageService.deleteProject(projId);
    setProjects(StorageService.getProjects());
  };

  // Handlers for Pact
  const handleToggleSignPact = (ruleId: string) => {
    sound.playHeartbeat();
    StorageService.toggleSignPactRule(ruleId, activeUserId);
    setPactRules(StorageService.getPactRules());
  };

  // Handlers for Letters
  const handleOpenLetter = (letter: DeepLetter) => {
    sound.playVoiceNoteChime();
    StorageService.openDeepLetter(letter.id);
    setLetters(StorageService.getDeepLetters());
    setSelectedLetter(letter);
  };

  return (
    <div className="space-y-6 pb-24 animate-in fade-in duration-300">
      {/* Editorial Header - Le Côté Sérieux */}
      <div className="relative p-6 sm:p-7 rounded-3xl bg-gradient-to-b from-[#191336] via-[#140e2b] to-[#0f0a21] border border-white/[0.08] shadow-2xl overflow-hidden space-y-4">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="p-1.5 rounded-lg bg-amber-400/10 border border-amber-400/20 text-amber-300">
                <Compass className="w-4 h-4" />
              </span>
              <span className="text-xs uppercase tracking-widest text-amber-200 font-semibold">
                Espace Mature & Avenir
              </span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl text-white font-semibold tracking-tight">
              Nos Projets & Engagements
            </h1>
            <p className="text-xs sm:text-sm text-white/60 font-light mt-1 max-w-xl leading-relaxed">
              Le sanctuaire de notre couple pour bâtir du concret, désamorcer les doutes avec bienveillance et se promettre l'essentiel.
            </p>
          </div>

          {/* Overall Progress Indicator */}
          <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-md flex items-center gap-3.5 shrink-0">
            <div className="relative w-12 h-12 flex items-center justify-center">
              <svg className="w-12 h-12 -rotate-90">
                <circle
                  cx="24"
                  cy="24"
                  r="20"
                  className="stroke-white/10"
                  strokeWidth="4"
                  fill="transparent"
                />
                <circle
                  cx="24"
                  cy="24"
                  r="20"
                  className="stroke-amber-400 transition-all duration-700"
                  strokeWidth="4"
                  strokeDasharray={125.6}
                  strokeDashoffset={125.6 - (125.6 * overallProgress) / 100}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>
              <span className="absolute text-[11px] font-bold text-white">
                {overallProgress}%
              </span>
            </div>
            <div>
              <div className="text-[11px] text-white/50 uppercase font-medium tracking-wider">
                Nos Projets
              </div>
              <div className="text-xs font-semibold text-rose-200">
                {completedMilestones} / {totalMilestones} étapes
              </div>
            </div>
          </div>
        </div>

        {/* Saint-Exupéry quote badge */}
        <div className="pt-2 flex items-start gap-2.5 text-[11px] sm:text-xs text-white/50 italic border-t border-white/[0.06]">
          <Quote className="w-3.5 h-3.5 text-amber-300 shrink-0 mt-0.5" />
          <span>
            « Aimer, ce n’est pas se regarder l’un l’autre, c’est regarder ensemble dans la même direction. »
          </span>
        </div>
      </div>

      {/* Sub-Tabs Navigation */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {[
          {
            id: 'projects' as SubTab,
            label: 'Projets de Vie',
            sub: `${projects.length} en cours`,
            icon: TrendingUp,
          },
          {
            id: 'pact' as SubTab,
            label: 'Notre Charte',
            sub: `${pactRules.length} principes`,
            icon: ShieldCheck,
          },
          {
            id: 'checkin' as SubTab,
            label: 'Point Météo',
            sub: 'Dialogue sincère',
            icon: Sliders,
          },
          {
            id: 'letters' as SubTab,
            label: 'Lettres Scellées',
            sub: `${letters.length} déclarations`,
            icon: Feather,
          },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                sound.playTap();
                setActiveSubTab(tab.id);
              }}
              className={`p-3.5 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between ${
                isActive
                  ? 'bg-gradient-to-br from-rose-500/20 via-purple-500/20 to-indigo-500/20 border-rose-400/40 text-white shadow-lg shadow-purple-950/40'
                  : 'bg-[#130e24] border-white/[0.06] text-white/60 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <Icon
                  className={`w-4 h-4 ${
                    isActive ? 'text-rose-300' : 'text-white/40'
                  }`}
                />
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                )}
              </div>
              <div>
                <div
                  className={`text-xs font-semibold ${
                    isActive ? 'text-white' : 'text-white/80'
                  }`}
                >
                  {tab.label}
                </div>
                <div className="text-[10px] text-white/40 mt-0.5">{tab.sub}</div>
              </div>
            </button>
          );
        })}
      </div>

      {/* ========================================================
          SUB-TAB 1: PROJETS DE VIE & JALONS
          ======================================================== */}
      {activeSubTab === 'projects' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-white">
                Nos grands chantiers communs
              </h2>
              <p className="text-xs text-white/50">
                Les étapes tangibles qui construisent notre future vie commune.
              </p>
            </div>
            <button
              onClick={() => {
                sound.playTap();
                setShowAddProjectModal(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-rose-500 to-indigo-600 hover:from-rose-400 hover:to-indigo-500 text-white font-medium text-xs shadow-md shadow-rose-500/20 transition-all active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nouveau projet</span>
            </button>
          </div>

          {/* Projects List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projects.map((proj) => {
              const isDone = proj.completed;
              return (
                <div
                  key={proj.id}
                  className={`p-5 rounded-3xl border transition-all ${
                    isDone
                      ? 'bg-[#120f26]/80 border-emerald-500/30'
                      : 'bg-[#150f2b] border-white/[0.08] hover:border-white/[0.15]'
                  }`}
                >
                  {/* Category & Actions */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/[0.05] border border-white/[0.08] text-rose-300">
                      {proj.category}
                    </span>

                    <div className="flex items-center gap-1">
                      {proj.targetDate && (
                        <span className="flex items-center gap-1 text-[11px] text-white/40">
                          <Calendar className="w-3 h-3" />
                          <span>{proj.targetDate}</span>
                        </span>
                      )}
                      <button
                        onClick={() => handleDeleteProject(proj.id)}
                        className="p-1 rounded-lg hover:bg-white/[0.06] text-white/30 hover:text-rose-400 transition-all ml-1"
                        title="Supprimer ce projet"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  <h3
                    className={`font-serif text-base font-semibold mb-1 ${
                      isDone ? 'line-through text-white/60' : 'text-white'
                    }`}
                  >
                    {proj.title}
                  </h3>

                  {proj.notes && (
                    <p className="text-xs text-white/50 mb-3 leading-relaxed">
                      {proj.notes}
                    </p>
                  )}

                  {/* Progress bar */}
                  <div className="space-y-1 mb-4">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-white/40">Progression</span>
                      <span className="font-semibold text-rose-300">
                        {proj.progressPercentage || 0}%
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isDone
                            ? 'bg-emerald-400'
                            : 'bg-gradient-to-r from-rose-500 to-indigo-500'
                        }`}
                        style={{ width: `${proj.progressPercentage || 0}%` }}
                      />
                    </div>
                  </div>

                  {/* Milestones Checklist */}
                  {proj.milestones && proj.milestones.length > 0 && (
                    <div className="space-y-1.5 pt-2 border-t border-white/[0.05]">
                      <span className="text-[10px] uppercase tracking-wider font-semibold text-white/40 block mb-1">
                        Étapes clés :
                      </span>
                      {proj.milestones.map((m) => (
                        <button
                          key={m.id}
                          onClick={() => handleToggleMilestone(proj.id, m.id)}
                          className="w-full flex items-center gap-2 p-1.5 rounded-xl hover:bg-white/[0.04] text-left transition-colors group"
                        >
                          {m.done ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          ) : (
                            <Circle className="w-4 h-4 text-white/30 group-hover:text-rose-400 shrink-0" />
                          )}
                          <span
                            className={`text-xs ${
                              m.done
                                ? 'line-through text-white/40'
                                : 'text-white/80 group-hover:text-white'
                            }`}
                          >
                            {m.text}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Complete button */}
                  <div className="pt-3 mt-3 border-t border-white/[0.05] flex justify-end">
                    <button
                      onClick={() => handleToggleProjectCompleted(proj.id)}
                      className={`text-xs px-3 py-1 rounded-xl transition-all font-medium flex items-center gap-1 ${
                        isDone
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-white/[0.05] text-white/60 hover:text-white hover:bg-white/[0.1]'
                      }`}
                    >
                      <Check className="w-3 h-3" />
                      <span>
                        {isDone ? 'Projet accompli !' : 'Marquer comme accompli'}
                      </span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================
          SUB-TAB 2: LA CHARTE ET LE PACTE DE COUPLE
          ======================================================== */}
      {activeSubTab === 'pact' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-white">
                Notre Charte de Couple & Valeurs
              </h2>
              <p className="text-xs text-white/50">
                Nos engagements solennels pour préserver la confiance et la sérénité.
              </p>
            </div>
            <button
              onClick={() => {
                sound.playTap();
                setShowAddPactModal(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.1] text-xs font-medium text-white transition-all active:scale-95"
            >
              <Plus className="w-3.5 h-3.5 text-rose-400" />
              <span>Ajouter un principe</span>
            </button>
          </div>

          {/* Pact Rules List */}
          <div className="space-y-3">
            {pactRules.map((rule) => {
              const mySigned =
                activeUserId === 'partner1'
                  ? rule.signedByPartner1
                  : rule.signedByPartner2;
              const bothSigned = rule.signedByPartner1 && rule.signedByPartner2;

              return (
                <div
                  key={rule.id}
                  className={`p-4 sm:p-5 rounded-3xl border transition-all ${
                    bothSigned
                      ? 'bg-gradient-to-r from-[#171032] to-[#1a123a] border-amber-400/30 shadow-lg shadow-amber-950/20'
                      : 'bg-[#130e26] border-white/[0.08]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <ShieldCheck
                        className={`w-4 h-4 shrink-0 ${
                          bothSigned ? 'text-amber-400' : 'text-white/40'
                        }`}
                      />
                      <h3 className="font-serif text-sm sm:text-base font-semibold text-white">
                        {rule.title}
                      </h3>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-white/[0.05] text-white/50">
                      {rule.category}
                    </span>
                  </div>

                  <p className="text-xs text-white/70 font-light leading-relaxed mb-4 pl-6">
                    {rule.description}
                  </p>

                  {/* Signatures status */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-white/[0.05] pl-6">
                    <div className="flex items-center gap-3">
                      {/* Partner 1 Seal */}
                      <span
                        className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full ${
                          rule.signedByPartner1
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 font-medium'
                            : 'bg-white/[0.03] text-white/30'
                        }`}
                      >
                        <Heart
                          className={`w-3 h-3 ${
                            rule.signedByPartner1
                              ? 'fill-rose-400 text-rose-400'
                              : 'text-white/20'
                          }`}
                        />
                        <span>{space.partner1.name}</span>
                        {rule.signedByPartner1 && <span>✓</span>}
                      </span>

                      {/* Partner 2 Seal */}
                      <span
                        className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full ${
                          rule.signedByPartner2
                            ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-medium'
                            : 'bg-white/[0.03] text-white/30'
                        }`}
                      >
                        <Heart
                          className={`w-3 h-3 ${
                            rule.signedByPartner2
                              ? 'fill-indigo-400 text-indigo-400'
                              : 'text-white/20'
                          }`}
                        />
                        <span>{space.partner2.name}</span>
                        {rule.signedByPartner2 && <span>✓</span>}
                      </span>
                    </div>

                    {/* Sign toggle button */}
                    <button
                      onClick={() => handleToggleSignPact(rule.id)}
                      className={`px-3 py-1 rounded-xl text-xs font-medium transition-all ${
                        mySigned
                          ? 'bg-white/[0.05] text-white/50 hover:text-white'
                          : 'bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-md shadow-rose-500/30 animate-pulse'
                      }`}
                    >
                      {mySigned ? 'Signé par toi ✓' : 'Apposer ma signature ✍️'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================
          SUB-TAB 3: POINT MÉTÉO RELATIONNEL (CHECK-IN)
          ======================================================== */}
      {activeSubTab === 'checkin' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-white">
                Le Point Météo du Couple
              </h2>
              <p className="text-xs text-white/50">
                Un baromètre bienveillant pour se synchroniser et s'écouter avec douceur.
              </p>
            </div>
            <button
              onClick={() => {
                sound.playTap();
                setShowNewCheckInModal(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-rose-500 to-indigo-600 hover:from-rose-400 hover:to-indigo-500 text-white font-medium text-xs shadow-md shadow-rose-500/20 transition-all active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Faire mon check-in</span>
            </button>
          </div>

          {/* Past Check-ins */}
          <div className="space-y-4">
            {checkIns.map((chk) => {
              const authorName =
                chk.partnerId === 'partner1'
                  ? space.partner1.name
                  : space.partner2.name;
              return (
                <div
                  key={chk.id}
                  className="p-5 rounded-3xl bg-[#140f29] border border-white/[0.08] space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-rose-500/20 flex items-center justify-center text-xs font-bold text-rose-300">
                        {authorName[0]}
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-white">
                          Point météo partagé par {authorName}
                        </div>
                        <div className="text-[10px] text-white/40">
                          {chk.date}
                        </div>
                      </div>
                    </div>

                    <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-medium">
                      Harmonie & Écoute
                    </span>
                  </div>

                  {/* 4 Score Meters */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                    {[
                      {
                        label: 'Connexion émotionnelle',
                        val: chk.scores.emotionalConnection,
                      },
                      {
                        label: 'Communication',
                        val: chk.scores.communication,
                      },
                      {
                        label: 'Soutien & Sécurité',
                        val: chk.scores.support,
                      },
                      {
                        label: 'Désir & Avenir',
                        val: chk.scores.intimacyFuture,
                      },
                    ].map((metric, i) => (
                      <div
                        key={i}
                        className="p-2.5 rounded-2xl bg-white/[0.03] border border-white/[0.05]"
                      >
                        <div className="text-[10px] text-white/50 truncate mb-1">
                          {metric.label}
                        </div>
                        <div className="flex items-baseline gap-1">
                          <span className="text-base font-bold text-rose-300">
                            {metric.val}
                          </span>
                          <span className="text-[10px] text-white/30">/ 10</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Reflection Notes */}
                  <div className="space-y-2 pt-2 border-t border-white/[0.05] text-xs">
                    {chk.celebration && (
                      <div className="p-3 rounded-2xl bg-emerald-500/[0.06] border border-emerald-500/15">
                        <span className="font-semibold text-emerald-300 block mb-0.5">
                          Ce qui fonctionne à merveille entre nous :
                        </span>
                        <p className="text-white/80 font-light leading-relaxed">
                          {chk.celebration}
                        </p>
                      </div>
                    )}

                    {chk.gentleNeed && (
                      <div className="p-3 rounded-2xl bg-purple-500/[0.06] border border-purple-500/15">
                        <span className="font-semibold text-purple-300 block mb-0.5">
                          Un besoin ou une attention qui me ferait du bien :
                        </span>
                        <p className="text-white/80 font-light leading-relaxed">
                          {chk.gentleNeed}
                        </p>
                      </div>
                    )}

                    {chk.gratitude && (
                      <div className="p-3 rounded-2xl bg-rose-500/[0.06] border border-rose-500/15">
                        <span className="font-semibold text-rose-300 block mb-0.5">
                          Ce qui me rassure profondément chez toi :
                        </span>
                        <p className="text-white/80 font-light leading-relaxed">
                          {chk.gratitude}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================
          SUB-TAB 4: LETTRES SCELLÉES & DÉCLARATIONS PROFONDES
          ======================================================== */}
      {activeSubTab === 'letters' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-white">
                Nos Lettres Scellées
              </h2>
              <p className="text-xs text-white/50">
                Des messages intemporels écrits avec le cœur, à ouvrir dans les moments clés.
              </p>
            </div>
            <button
              onClick={() => {
                sound.playTap();
                setShowAddLetterModal(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-rose-500 to-indigo-600 hover:from-rose-400 hover:to-indigo-500 text-white font-medium text-xs shadow-md shadow-rose-500/20 transition-all active:scale-95"
            >
              <Feather className="w-3.5 h-3.5" />
              <span>Rédiger une lettre</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {letters.map((letter) => {
              const authorName =
                letter.senderId === 'partner1'
                  ? space.partner1.name
                  : space.partner2.name;
              const isOpened = Boolean(letter.openedAt);

              return (
                <div
                  key={letter.id}
                  onClick={() => handleOpenLetter(letter)}
                  className="p-5 rounded-3xl bg-[#150f2c] border border-white/[0.08] hover:border-rose-400/40 cursor-pointer transition-all duration-200 hover:-translate-y-1 shadow-lg shadow-purple-950/20 flex flex-col justify-between"
                >
                  <div>
                    {/* Seal Badge */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30">
                        {letter.triggerLabel}
                      </span>
                      <span className="text-[10px] text-white/40">
                        {letter.createdAt}
                      </span>
                    </div>

                    <h3 className="font-serif text-base font-semibold text-white mb-2 leading-snug">
                      {letter.title}
                    </h3>
                  </div>

                  <div className="pt-4 border-t border-white/[0.05] flex items-center justify-between text-xs">
                    <span className="text-white/40">Par {authorName}</span>
                    <span
                      className={`flex items-center gap-1 font-medium ${
                        isOpened ? 'text-white/60' : 'text-amber-300'
                      }`}
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>{isOpened ? 'Relire la lettre' : 'Ouvrir le sceau ✨'}</span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: ADD PROJECT
          ======================================================== */}
      {showAddProjectModal && (
        <AddProjectModal
          onClose={() => setShowAddProjectModal(false)}
          onAdd={(data) => {
            StorageService.addProject(data);
            setProjects(StorageService.getProjects());
            setShowAddProjectModal(false);
          }}
        />
      )}

      {/* ========================================================
          MODAL: ADD PACT RULE
          ======================================================== */}
      {showAddPactModal && (
        <AddPactModal
          activeUserId={activeUserId}
          onClose={() => setShowAddPactModal(false)}
          onAdd={(title, desc, cat) => {
            StorageService.addPactRule(title, desc, cat, activeUserId);
            setPactRules(StorageService.getPactRules());
            setShowAddPactModal(false);
          }}
        />
      )}

      {/* ========================================================
          MODAL: NEW CHECK-IN
          ======================================================== */}
      {showNewCheckInModal && (
        <NewCheckInModal
          activeUserId={activeUserId}
          onClose={() => setShowNewCheckInModal(false)}
          onSave={(data) => {
            StorageService.addCheckIn(data);
            setCheckIns(StorageService.getCheckIns());
            setShowNewCheckInModal(false);
          }}
        />
      )}

      {/* ========================================================
          MODAL: ADD LETTER
          ======================================================== */}
      {showAddLetterModal && (
        <AddLetterModal
          activeUserId={activeUserId}
          onClose={() => setShowAddLetterModal(false)}
          onAdd={(data) => {
            StorageService.addDeepLetter(data);
            setLetters(StorageService.getDeepLetters());
            setShowAddLetterModal(false);
          }}
        />
      )}

      {/* ========================================================
          MODAL: LETTER VIEWER
          ======================================================== */}
      {selectedLetter && (
        <div className="fixed inset-0 z-50 bg-[#080514e6] backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-[#1a1236] to-[#120c24] border border-rose-400/30 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto no-scrollbar">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <span className="text-xs uppercase tracking-wider text-rose-300 font-serif italic">
                Lettre Scellée d’Amour
              </span>
              <button
                onClick={() => setSelectedLetter(null)}
                className="p-1 rounded-xl hover:bg-white/[0.1] text-white/60 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <h3 className="font-serif text-xl sm:text-2xl font-bold text-white">
              {selectedLetter.title}
            </h3>

            <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.05] whitespace-pre-line text-sm text-white/90 leading-relaxed font-light font-serif">
              {selectedLetter.content}
            </div>

            <div className="flex items-center justify-between text-xs text-white/40 pt-2">
              <span>Date d'écriture : {selectedLetter.createdAt}</span>
              <span className="text-rose-300 font-serif italic">
                Avec tout mon amour
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Sub-modals
function AddProjectModal({
  onClose,
  onAdd,
}: {
  onClose: () => void;
  onAdd: (data: Omit<CoupleProject, 'id'>) => void;
}) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<CoupleProject['category']>('Logement');
  const [targetDate, setTargetDate] = useState('');
  const [notes, setNotes] = useState('');
  const [milestonesText, setMilestonesText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    sound.playTap();
    const milestones = milestonesText
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((text, idx) => ({
        id: `m_${idx}_${Date.now()}`,
        text,
        done: false,
      }));

    onAdd({
      title: title.trim(),
      category,
      targetDate: targetDate || undefined,
      notes: notes.trim() || undefined,
      completed: false,
      progressPercentage: 0,
      milestones,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#080514e6] backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-md p-6 rounded-3xl bg-[#171032] border border-white/[0.1] shadow-2xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-lg font-bold text-white">
            Nouveau Projet de Couple
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-xl hover:bg-white/[0.1] text-white/60"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-xs text-white/70 block mb-1">
              Titre du projet *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="ex: Trouver notre appartement, Road-trip au Japon..."
              className="w-full px-3.5 py-2 rounded-xl bg-white/[0.05] border border-white/[0.1] text-xs text-white placeholder-white/30 focus:outline-none focus:border-rose-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-white/70 block mb-1">Catégorie</label>
              <select
                value={category}
                onChange={(e) =>
                  setCategory(e.target.value as CoupleProject['category'])
                }
                className="w-full px-3.5 py-2 rounded-xl bg-[#140e29] border border-white/[0.1] text-xs text-white focus:outline-none"
              >
                <option value="Logement">Logement</option>
                <option value="Voyage">Voyage</option>
                <option value="Finances">Finances</option>
                <option value="Engagement">Engagement</option>
                <option value="Famille & Pro">Famille & Pro</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-white/70 block mb-1">
                Date cible (optionnel)
              </label>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-white/[0.05] border border-white/[0.1] text-xs text-white focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-white/70 block mb-1">
              Pourquoi ce projet compte pour nous (vision)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ce que cela va changer dans notre quotidien..."
              className="w-full px-3.5 py-2 rounded-xl bg-white/[0.05] border border-white/[0.1] text-xs text-white placeholder-white/30 focus:outline-none resize-none"
            />
          </div>

          <div>
            <label className="text-xs text-white/70 block mb-1">
              Étapes clés (1 par ligne)
            </label>
            <textarea
              rows={3}
              value={milestonesText}
              onChange={(e) => setMilestonesText(e.target.value)}
              placeholder="Étape 1 : Choisir la ville&#10;Étape 2 : Visiter des biens&#10;Étape 3 : Emballer les cartons"
              className="w-full px-3.5 py-2 rounded-xl bg-white/[0.05] border border-white/[0.1] text-xs text-white placeholder-white/30 focus:outline-none resize-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs text-white/60 hover:text-white"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-indigo-600 text-white font-medium text-xs shadow-md shadow-rose-500/30"
            >
              Créer le projet
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AddPactModal({
  activeUserId,
  onClose,
  onAdd,
}: {
  activeUserId: 'partner1' | 'partner2';
  onClose: () => void;
  onAdd: (
    title: string,
    description: string,
    category: PactRule['category']
  ) => void;
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<PactRule['category']>('Communication');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;
    sound.playTap();
    onAdd(title.trim(), description.trim(), category);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#080514e6] backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-md p-6 rounded-3xl bg-[#171032] border border-white/[0.1] shadow-2xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-lg font-bold text-white">
            Ajouter un Principe à la Charte
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-xl hover:bg-white/[0.1] text-white/60"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-xs text-white/70 block mb-1">
              Nom de la règle / engagement *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="ex: Désamorcer avant de dormir, Zéro non-dit..."
              className="w-full px-3.5 py-2 rounded-xl bg-white/[0.05] border border-white/[0.1] text-xs text-white placeholder-white/30 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs text-white/70 block mb-1">Catégorie</label>
            <select
              value={category}
              onChange={(e) =>
                setCategory(e.target.value as PactRule['category'])
              }
              className="w-full px-3.5 py-2 rounded-xl bg-[#140e29] border border-white/[0.1] text-xs text-white focus:outline-none"
            >
              <option value="Communication">Communication</option>
              <option value="Confiance">Confiance</option>
              <option value="Distance">Distance</option>
              <option value="Avenir">Avenir</option>
            </select>
          </div>

          <div>
            <label className="text-xs text-white/70 block mb-1">
              En quoi consiste cet engagement ? *
            </label>
            <textarea
              rows={3}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ce qu'on s'engage à faire pour veiller l'un sur l'autre..."
              className="w-full px-3.5 py-2 rounded-xl bg-white/[0.05] border border-white/[0.1] text-xs text-white placeholder-white/30 focus:outline-none resize-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs text-white/60 hover:text-white"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 text-white font-medium text-xs shadow-md shadow-rose-500/30"
            >
              Apposer au pacte
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function NewCheckInModal({
  activeUserId,
  onClose,
  onSave,
}: {
  activeUserId: 'partner1' | 'partner2';
  onClose: () => void;
  onSave: (data: Omit<RelationshipCheckIn, 'id'>) => void;
}) {
  const [emotionalConnection, setEmotionalConnection] = useState(9);
  const [communication, setCommunication] = useState(9);
  const [support, setSupport] = useState(10);
  const [intimacyFuture, setIntimacyFuture] = useState(9);

  const [celebration, setCelebration] = useState('');
  const [gentleNeed, setGentleNeed] = useState('');
  const [gratitude, setGratitude] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playTap();
    onSave({
      date: new Date().toISOString().slice(0, 10),
      partnerId: activeUserId,
      scores: {
        emotionalConnection,
        communication,
        support,
        intimacyFuture,
      },
      celebration: celebration.trim(),
      gentleNeed: gentleNeed.trim(),
      gratitude: gratitude.trim(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#080514e6] backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-lg p-6 sm:p-7 rounded-3xl bg-[#171032] border border-white/[0.1] shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto no-scrollbar">
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-lg font-bold text-white">
            Mon Point Météo du Couple
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-xl hover:bg-white/[0.1] text-white/60"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3">
            <span className="text-xs uppercase tracking-wider font-semibold text-white/50 block">
              Nos jauges de sérénité (1 à 10)
            </span>

            {[
              {
                label: 'Connexion émotionnelle',
                val: emotionalConnection,
                set: setEmotionalConnection,
              },
              {
                label: 'Qualité de la communication',
                val: communication,
                set: setCommunication,
              },
              {
                label: 'Soutien mutuel & Sécurité',
                val: support,
                set: setSupport,
              },
              {
                label: 'Vision du futur & Désir',
                val: intimacyFuture,
                set: setIntimacyFuture,
              },
            ].map((m, i) => (
              <div key={i} className="flex items-center justify-between gap-4">
                <span className="text-xs text-white/70 flex-1 truncate">
                  {m.label}
                </span>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={m.val}
                  onChange={(e) => m.set(Number(e.target.value))}
                  className="w-32 sm:w-44 accent-rose-400"
                />
                <span className="text-xs font-bold text-rose-300 w-6 text-right">
                  {m.val}
                </span>
              </div>
            ))}
          </div>

          <div className="space-y-3 pt-2 border-t border-white/[0.06]">
            <div>
              <label className="text-xs text-emerald-300 block mb-1 font-medium">
                Ce qui m'a rendu(e) le plus heureux(se) dans notre couple récemment :
              </label>
              <textarea
                rows={2}
                value={celebration}
                onChange={(e) => setCelebration(e.target.value)}
                placeholder="Un fou rire, un appel doux, une attention..."
                className="w-full px-3.5 py-2 rounded-xl bg-white/[0.05] border border-white/[0.1] text-xs text-white placeholder-white/30 focus:outline-none resize-none"
              />
            </div>

            <div>
              <label className="text-xs text-purple-300 block mb-1 font-medium">
                Un besoin ou une petite attention qui me ferait du bien en douceur :
              </label>
              <textarea
                rows={2}
                value={gentleNeed}
                onChange={(e) => setGentleNeed(e.target.value)}
                placeholder="Un mot le matin, un moment d'écoute calme..."
                className="w-full px-3.5 py-2 rounded-xl bg-white/[0.05] border border-white/[0.1] text-xs text-white placeholder-white/30 focus:outline-none resize-none"
              />
            </div>

            <div>
              <label className="text-xs text-rose-300 block mb-1 font-medium">
                Ce qui me rassure profondément chez toi :
              </label>
              <textarea
                rows={2}
                value={gratitude}
                onChange={(e) => setGratitude(e.target.value)}
                placeholder="Ta loyauté, ta bienveillance, ta présence..."
                className="w-full px-3.5 py-2 rounded-xl bg-white/[0.05] border border-white/[0.1] text-xs text-white placeholder-white/30 focus:outline-none resize-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs text-white/60 hover:text-white"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-indigo-600 text-white font-medium text-xs shadow-md shadow-rose-500/30"
            >
              Partager notre météo
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AddLetterModal({
  activeUserId,
  onClose,
  onAdd,
}: {
  activeUserId: 'partner1' | 'partner2';
  onClose: () => void;
  onAdd: (data: Omit<DeepLetter, 'id' | 'createdAt'>) => void;
}) {
  const [title, setTitle] = useState('');
  const [triggerLabel, setTriggerLabel] = useState('À ouvrir les jours de doute');
  const [content, setContent] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    sound.playTap();
    onAdd({
      senderId: activeUserId,
      title: title.trim(),
      triggerLabel: triggerLabel.trim(),
      content: content.trim(),
      sealTheme: 'rose',
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#080514e6] backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-lg p-6 sm:p-7 rounded-3xl bg-[#171032] border border-white/[0.1] shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto no-scrollbar">
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-lg font-bold text-white">
            Sceller une Lettre d’Amour
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-xl hover:bg-white/[0.1] text-white/60"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-xs text-white/70 block mb-1">Titre de la lettre *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="ex: Pourquoi je te choisis toi, Les soirs où la distance pèse..."
              className="w-full px-3.5 py-2 rounded-xl bg-white/[0.05] border border-white/[0.1] text-xs text-white placeholder-white/30 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs text-white/70 block mb-1">
              Occasion d'ouverture (Sceau)
            </label>
            <select
              value={triggerLabel}
              onChange={(e) => setTriggerLabel(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-[#140e29] border border-white/[0.1] text-xs text-white focus:outline-none"
            >
              <option value="À ouvrir les jours de doute">
                À ouvrir les soirs de vague à l'âme
              </option>
              <option value="Pour se rappeler notre force">
                Pour se rappeler pourquoi on s'aime
              </option>
              <option value="Avant nos prochaines retrouvailles">
                La veille de se retrouver
              </option>
              <option value="Après une petite dispute">
                Après un différend pour apaiser le cœur
              </option>
            </select>
          </div>

          <div>
            <label className="text-xs text-white/70 block mb-1">
              Contenu de la lettre *
            </label>
            <textarea
              rows={8}
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Écris avec sincérité et profondeur ce que tu ressens au plus intime..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.1] text-xs text-white placeholder-white/30 focus:outline-none resize-none leading-relaxed font-serif"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs text-white/60 hover:text-white"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-indigo-600 text-white font-medium text-xs shadow-md shadow-rose-500/30"
            >
              Sceller la lettre
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
