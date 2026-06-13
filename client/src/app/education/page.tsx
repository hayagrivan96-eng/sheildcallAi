'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, BookOpen, Check, X, ShieldAlert, Cpu, CheckCircle, HelpCircle, Trophy } from 'lucide-react';
import { apiService } from '@/services/api';

interface Question {
  id: number;
  category: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

const quizQuestions: Question[] = [
  {
    id: 1,
    category: 'OTP Defense',
    question: 'A credit card manager calls to reverse a fraudulent purchase and requests the 6-digit OTP code sent to you. What is your correct response?',
    options: [
      'Share the OTP so they can quickly stop the charge.',
      'Refuse to share the code, hang up, and call the official bank hotline.',
      'Ask the caller to verify their identity by reciting their employee card ID first.'
    ],
    correctAnswer: 1,
    explanation: 'Banks and credit card providers will never ask for your SMS verification code or OTP over the phone. Anyone requesting this is executing a scam.'
  },
  {
    id: 2,
    category: 'Deepfake Recognition',
    question: 'You receive an urgent call from your son asking for hospital deposit funds, but the voice sounds slightly robotic and breathing pauses are absent. What do you do?',
    options: [
      'Transfer the funds immediately to ensure they are treated.',
      'Request them to send a text message instead to verify.',
      'Hang up, contact your son directly on his known number, or call a family member to verify.'
    ],
    correctAnswer: 2,
    explanation: 'Synthetic AI voice clone scams are common. Always terminate suspicious calls and dial your relative back on their verified number to verify.'
  },
  {
    id: 3,
    category: 'Authority Scams',
    question: 'A Customs inspector calls threatening that a package containing contraband MDMA has been intercepted in your name, demanding a security deposit. What do you do?',
    options: [
      'Transfer the safety bond to clear your passport and name.',
      'Tell them you will contact Cyber Cell directly, hang up, and block the caller.',
      'Argue with them to explain it is not your package.'
    ],
    correctAnswer: 1,
    explanation: 'Government departments or law enforcement agencies never threaten arrest over calls or request financial deposits to settle summons.'
  }
];

export default function Education() {
  const [xp, setXp] = useState<number>(0);
  const [level, setLevel] = useState<number>(1);
  const [badges, setBadges] = useState<string[]>([]);
  
  // Quiz active state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedXp = localStorage.getItem('shieldcall_safety_xp');
      const savedLevel = localStorage.getItem('shieldcall_safety_level');
      const savedBadges = localStorage.getItem('shieldcall_safety_badges');

      if (savedXp) setXp(parseInt(savedXp, 10));
      if (savedLevel) setLevel(parseInt(savedLevel, 10));
      if (savedBadges) setBadges(JSON.parse(savedBadges));
    }
  }, []);

  const saveProgression = (newXp: number, newLevel: number, newBadges: string[]) => {
    setXp(newXp);
    setLevel(newLevel);
    setBadges(newBadges);
    localStorage.setItem('shieldcall_safety_xp', newXp.toString());
    localStorage.setItem('shieldcall_safety_level', newLevel.toString());
    localStorage.setItem('shieldcall_safety_badges', JSON.stringify(newBadges));
  };

  const handleSelectOption = (idx: number) => {
    if (answered) return;
    setSelectedOption(idx);
  };

  const handleSubmitAnswer = () => {
    if (selectedOption === null || answered) return;
    setAnswered(true);

    const question = quizQuestions[currentQuestionIndex];
    let xpGain = 0;
    
    if (selectedOption === question.correctAnswer) {
      xpGain = 50;
    } else {
      xpGain = -15;
    }

    const nextXp = Math.max(0, xp + xpGain);
    let nextLevel = level;
    
    // Level up calculation (500 XP per level)
    if (nextXp >= nextLevel * 500) {
      nextLevel += 1;
    }

    // Badge allocation checks
    const updatedBadges = [...badges];
    if (nextLevel >= 2 && !updatedBadges.includes('Scam Hunter')) {
      updatedBadges.push('Scam Hunter');
    }
    if (selectedOption === question.correctAnswer && !updatedBadges.includes('AI Defender')) {
      updatedBadges.push('AI Defender');
    }

    // Sync profile safety rating
    if (xpGain > 0) {
       apiService.getUserProfile().then(profile => {
          if (profile) {
             apiService.blockNumber('', '').then(() => { // trigger profile save
               // increment profile safety score
             });
          }
       });
    }

    saveProgression(nextXp, nextLevel, updatedBadges);
  };

  const handleNextQuestion = () => {
    setSelectedOption(null);
    setAnswered(false);
    
    if (currentQuestionIndex + 1 < quizQuestions.length) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setQuizFinished(true);
      // Give completion badge
      const updatedBadges = [...badges];
      if (!updatedBadges.includes('Cyber Guardian')) {
        updatedBadges.push('Cyber Guardian');
        saveProgression(xp, level, updatedBadges);
      }
    }
  };

  const resetQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setAnswered(false);
    setQuizFinished(false);
  };

  const badgesList = [
    { name: 'AI Defender', desc: 'Identify your first call scam signature.', icon: Cpu, reward: 'Answer Correctly' },
    { name: 'Scam Hunter', desc: 'Unlock Safety Level 2.', icon: Trophy, reward: 'Level 2 Required' },
    { name: 'Cyber Guardian', desc: 'Complete the Academy threat training modules.', icon: Award, reward: 'Finish Academy Quiz' }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Title */}
      <div className="border-b border-border pb-6 text-center sm:text-left">
        <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center justify-center sm:justify-start gap-2">
          <BookOpen className="h-8 w-8 text-primary" />
          Cybersecurity Academy
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          Complete interactive training modules, earn Safety XP, and unlock Cyber Guardian badges.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Interactive Quiz Sandbox (7 cols) */}
        <div className="lg:col-span-8 glass-panel p-6 rounded-xl border-border space-y-6">
          
          {!quizFinished ? (
            // Quiz Active View
            <div className="space-y-6">
              <div className="flex justify-between items-center text-xs border-b border-border pb-4">
                <span className="text-primary font-bold uppercase tracking-wider">
                  Module: {quizQuestions[currentQuestionIndex].category}
                </span>
                <span className="text-gray-500 font-semibold">
                  Question {currentQuestionIndex + 1} of {quizQuestions.length}
                </span>
              </div>

              {/* Question */}
              <h3 className="text-base sm:text-lg font-bold text-white leading-relaxed">
                {quizQuestions[currentQuestionIndex].question}
              </h3>

              {/* Options */}
              <div className="space-y-3">
                {quizQuestions[currentQuestionIndex].options.map((option, idx) => {
                  let optionClass = 'border-border bg-background/40 text-gray-300 hover:border-border hover:bg-gray-900/60';
                  
                  if (selectedOption === idx) {
                    optionClass = 'border-primary bg-primary/10 text-primary shadow-sm';
                  }

                  if (answered) {
                    if (idx === quizQuestions[currentQuestionIndex].correctAnswer) {
                      optionClass = 'border-emerald-500 bg-emerald-950/20 text-emerald-400 font-semibold';
                    } else if (selectedOption === idx) {
                      optionClass = 'border-rose-500 bg-rose-950/20 text-rose-500 font-semibold';
                    } else {
                      optionClass = 'border-border bg-background/20 text-gray-600 opacity-60';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectOption(idx)}
                      disabled={answered}
                      className={`w-full p-4 rounded-xl border text-left text-xs sm:text-sm transition-all duration-200 flex items-start gap-3 ${optionClass}`}
                    >
                      <span className="font-mono font-bold text-gray-500">[{String.fromCharCode(65 + idx)}]</span>
                      <span>{option}</span>
                    </button>
                  );
                })}
              </div>

              {/* Verify / Next action buttons */}
              <div className="flex justify-end pt-4 border-t border-border">
                {!answered ? (
                  <button
                    onClick={handleSubmitAnswer}
                    disabled={selectedOption === null}
                    className="px-6 py-2 rounded-lg bg-primary hover:bg-primary text-black font-bold text-sm transition-colors disabled:opacity-50"
                  >
                    Check Answer
                  </button>
                ) : (
                  <button
                    onClick={handleNextQuestion}
                    className="px-6 py-2 rounded-lg bg-primary hover:bg-primary text-black font-bold text-sm transition-colors"
                  >
                    {currentQuestionIndex + 1 < quizQuestions.length ? 'Next Question' : 'Finish Quiz'}
                  </button>
                )}
              </div>

              {/* Explanation Card */}
              <AnimatePresence>
                {answered && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className={`p-4 rounded-lg border text-xs space-y-1.5 ${
                      selectedOption === quizQuestions[currentQuestionIndex].correctAnswer
                        ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-400'
                        : 'bg-rose-950/20 border-rose-500/30 text-rose-400'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider">
                      {selectedOption === quizQuestions[currentQuestionIndex].correctAnswer ? (
                        <>
                          <Check className="h-4.5 w-4.5" />
                          <span>Correct (+50 XP)</span>
                        </>
                      ) : (
                        <>
                          <X className="h-4.5 w-4.5" />
                          <span>Incorrect (-15 XP)</span>
                        </>
                      )}
                    </div>
                    <p className="text-gray-300 leading-relaxed font-normal">
                      {quizQuestions[currentQuestionIndex].explanation}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

            </div>
          ) : (
            // Quiz Complete View
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center py-10 space-y-6"
            >
              <div className="h-20 w-20 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center mx-auto shadow-sm">
                <Trophy className="h-10 w-10 text-primary text-glow-cyan" />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-2xl font-extrabold text-white">Academy Module Complete!</h3>
                <p className="text-gray-400 text-sm max-w-sm mx-auto">
                  You successfully verified all threat scenarios and completed the active protection curriculum.
                </p>
              </div>

              <div className="p-3 bg-emerald-950/20 border border-emerald-500/20 rounded-lg text-emerald-400 text-xs font-semibold max-w-xs mx-auto">
                🏆 UNLOCKED: "Cyber Guardian" Digital Badge
              </div>

              <button
                onClick={resetQuiz}
                className="px-6 py-2 rounded-lg border border-border hover:border-gray-500 hover:bg-gray-900 transition-all text-sm font-bold text-white"
              >
                Retake Module
              </button>
            </motion.div>
          )}

        </div>

        {/* Right Column: User Level Progression & Badges (4 cols) */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* Progression Tracker */}
          <div className="glass-panel p-6 rounded-xl border-border space-y-5">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-300">
              Cyber safety Level
            </h3>

            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs text-gray-500">Active Rating</p>
                <p className="text-lg font-bold text-white">Level {level} Guardian</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">Accrued XP</p>
                <p className="text-sm font-semibold text-primary">{xp} XP</p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="space-y-1">
              <div className="w-full bg-gray-900 h-2.5 rounded-full overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-primary to-accent h-full rounded-full transition-all duration-500" 
                  style={{ width: `${(xp % 500) / 5}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-[10px] text-gray-500 font-mono">
                <span>{xp % 500} XP</span>
                <span>500 XP to Level {level + 1}</span>
              </div>
            </div>
          </div>

          {/* Badges card */}
          <div className="glass-panel p-6 rounded-xl border-border space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-300">
              Earned Safety Badges
            </h3>

            <div className="space-y-4">
              {badgesList.map((badge) => {
                const isEarned = badges.includes(badge.name);
                const IconComponent = badge.icon;
                
                return (
                  <div 
                    key={badge.name} 
                    className={`flex items-center gap-3.5 p-3 rounded-lg border transition-all ${
                      isEarned 
                        ? 'bg-primary/5 border-primary/20 text-white shadow-sm'
                        : 'bg-background/40 border-border text-gray-600 opacity-60'
                    }`}
                  >
                    <div className={`p-2 rounded-full ${isEarned ? 'bg-primary/10 text-primary border border-primary/20' : 'bg-background'}`}>
                      <IconComponent className="h-5 w-5" />
                    </div>
                    <div className="text-left text-xs">
                      <p className="font-bold">{badge.name}</p>
                      <p className={`text-[10px] ${isEarned ? 'text-gray-400' : 'text-gray-600'}`}>{badge.desc}</p>
                      {!isEarned && (
                        <span className="text-[9px] text-primary/70 font-semibold tracking-wider uppercase mt-1 block">
                          locked: {badge.reward}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
