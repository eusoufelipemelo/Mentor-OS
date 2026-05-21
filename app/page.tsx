'use client';

import React, { useState, useEffect } from 'react';
import { INITIAL_STEPS, StepData, MenteeData, FinalStatus, Status } from '@/lib/data';
import { Play, CheckCircle2, ChevronRight, AlertCircle, FileText, Download, UserPlus, Info, Sparkles } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { motion } from 'motion/react';

type MainView = 'menteeForm' | 'stepForm' | 'report';

export default function Page() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isPrintMode, setIsPrintMode] = useState(false);
  const [mentee, setMentee] = useState<MenteeData>({
    name: '',
    company: '',
    segment: '',
    date: new Date().toISOString().split('T')[0],
  });
  const [steps, setSteps] = useState<StepData[]>(INITIAL_STEPS);
  const [currentView, setCurrentView] = useState<MainView>('menteeForm');
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  // Load from LocalStorage
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const isPrint = typeof window !== 'undefined' && window.location.search.includes('print=true');
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsPrintMode(isPrint);

    const savedMentee = localStorage.getItem('mentoria_mentee');
    const savedSteps = localStorage.getItem('mentoria_steps');
    const savedView = localStorage.getItem('mentoria_view');
    const savedIndex = localStorage.getItem('mentoria_index');

    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (savedMentee) setMentee(JSON.parse(savedMentee));
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (savedSteps) setSteps(JSON.parse(savedSteps));
    
    if (isPrint) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCurrentView('report');
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsLoaded(true);
      setTimeout(() => {
        window.print();
      }, 1500); // give time for recharts to render
      return;
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (savedView) setCurrentView(savedView as MainView);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (savedIndex) setCurrentStepIndex(parseInt(savedIndex, 10));
    }
    
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsLoaded(true);
  }, []);

  // Autosave to LocalStorage
  useEffect(() => {
    if (isLoaded && !isPrintMode) {
      localStorage.setItem('mentoria_mentee', JSON.stringify(mentee));
      localStorage.setItem('mentoria_steps', JSON.stringify(steps));
      localStorage.setItem('mentoria_view', currentView);
      localStorage.setItem('mentoria_index', currentStepIndex.toString());
    }
  }, [mentee, steps, currentView, currentStepIndex, isLoaded, isPrintMode]);

  const updateMentee = (field: keyof MenteeData, value: string) => {
    setMentee(prev => ({ ...prev, [field]: value }));
  };

  const updateStep = (field: keyof StepData, value: any) => {
    setSteps(prev => {
      const newSteps = [...prev];
      newSteps[currentStepIndex] = { ...newSteps[currentStepIndex], [field]: value };
      return newSteps;
    });
  };

  const toggleChecklist = (checklistId: string) => {
    setSteps(prev => {
      const newSteps = [...prev];
      const step = newSteps[currentStepIndex];
      const newChecklist = step.checklist.map(item =>
        item.id === checklistId ? { ...item, checked: !item.checked } : item
      );
      newSteps[currentStepIndex] = { ...step, checklist: newChecklist };
      return newSteps;
    });
  };

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentView('stepForm');
    setCurrentStepIndex(0);
  };

  const resetSession = () => {
    if (window.confirm('Tem certeza que deseja apagar todos os dados e iniciar uma nova sessão?')) {
      setMentee({ name: '', company: '', segment: '', date: new Date().toISOString().split('T')[0] });
      setSteps(INITIAL_STEPS);
      setCurrentView('menteeForm');
      setCurrentStepIndex(0);
      localStorage.removeItem('mentoria_mentee');
      localStorage.removeItem('mentoria_steps');
      localStorage.removeItem('mentoria_view');
      localStorage.removeItem('mentoria_index');
    }
  };

  const currentStep = steps[currentStepIndex];

  if (!isLoaded) return <div className="min-h-screen flex items-center justify-center bg-zinc-50"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-900"></div></div>;

  return (
    <div className="min-h-screen flex bg-zinc-50 font-sans text-zinc-900">
      
      {/* Sidebar - Hidden on print */}
      {!isPrintMode && (
      <aside className="w-72 border-r border-zinc-200 bg-white flex-col hidden lg:flex print:hidden sticky top-0 h-screen">
        <div className="p-6 border-b border-zinc-200">
          <h1 className="font-display font-bold text-xl tracking-tight text-zinc-900 flex items-center gap-2">
            <div className="w-8 h-8 bg-zinc-900 text-white rounded-lg flex items-center justify-center">
              <CheckCircle2 size={18} />
            </div>
            MentorOS
          </h1>
          {mentee.name && (
            <div className="mt-4 p-3 bg-zinc-50 rounded-lg border border-zinc-100">
              <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">Mentorado</p>
              <p className="text-sm font-medium truncate">{mentee.name}</p>
              <p className="text-xs text-zinc-500 truncate">{mentee.company}</p>
            </div>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          <button
            onClick={() => setCurrentView('menteeForm')}
            className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              currentView === 'menteeForm' ? 'bg-zinc-100 text-zinc-900' : 'text-zinc-600 hover:bg-zinc-50'
            }`}
          >
            Cadastro Inicial
          </button>
          
          <div className="pt-4 pb-2">
            <p className="px-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Etapas</p>
          </div>
          
          {steps.map((step, index) => {
            const isCurrent = currentView === 'stepForm' && currentStepIndex === index;
            let statusColor = 'bg-zinc-100 text-zinc-400';
            if (step.finalStatus === 'Crítico') statusColor = 'bg-red-100 text-red-600';
            if (step.finalStatus === 'Atenção') statusColor = 'bg-yellow-100 text-yellow-600';
            if (step.finalStatus === 'Adequado') statusColor = 'bg-green-100 text-green-600';

            return (
              <button
                key={step.id}
                onClick={() => {
                  setCurrentView('stepForm');
                  setCurrentStepIndex(index);
                }}
                className={`w-full text-left px-3 py-2 rounded-md transition-colors flex items-center justify-between group ${
                  isCurrent ? 'bg-zinc-100' : 'hover:bg-zinc-50'
                }`}
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <div className={`flex-shrink-0 w-2 h-2 rounded-full ${statusColor.split(' ')[0].replace('100', '500')}`} />
                  <span className={`text-sm truncate ${isCurrent ? 'font-medium text-zinc-900' : 'text-zinc-600'}`}>
                    {step.id}. {step.name}
                  </span>
                </div>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-zinc-200">
          <button
            onClick={() => setCurrentView('report')}
            className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors border ${
              currentView === 'report'
                ? 'bg-zinc-900 text-white border-zinc-900'
                : 'bg-white text-zinc-900 border-zinc-200 hover:bg-zinc-50'
            }`}
          >
            <FileText size={16} />
            Gerar Relatório
          </button>
        </div>
      </aside>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto w-full print:overflow-visible">
        
        {/* VIEW: MENTEE FORM */}
        {currentView === 'menteeForm' && (
          <div className="max-w-3xl mx-auto px-6 py-12 md:py-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-10">
               <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-100 mb-6">
                 <UserPlus className="h-6 w-6 text-zinc-600" />
               </div>
              <h2 className="text-3xl font-display font-bold tracking-tight mb-2">Nova Sessão de Mentoria</h2>
              <p className="text-zinc-500 text-lg">Preencha os dados do mentorado para iniciar o diagnóstico.</p>
            </div>

            <form onSubmit={handleStart} className="space-y-6 bg-white p-8 rounded-2xl border border-zinc-200 shadow-sm">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">Nome do Mentorado</label>
                  <input
                    required
                    type="text"
                    value={mentee.name}
                    onChange={(e) => updateMentee('name', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-zinc-300 focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900 outline-none transition-shadow"
                    placeholder="Ex: João da Silva"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">Nome da Empresa</label>
                  <input
                    required
                    type="text"
                    value={mentee.company}
                    onChange={(e) => updateMentee('company', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-zinc-300 focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900 outline-none transition-shadow"
                    placeholder="Ex: ACME Móveis Planejados"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-1">Segmento</label>
                    <input
                      required
                      type="text"
                      value={mentee.segment}
                      onChange={(e) => updateMentee('segment', e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg border border-zinc-300 focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900 outline-none transition-shadow"
                      placeholder="Ex: Marcenaria / Arquitetura"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-1">Data da Sessão</label>
                    <input
                      required
                      type="date"
                      value={mentee.date}
                      onChange={(e) => updateMentee('date', e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg border border-zinc-300 focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900 outline-none transition-shadow"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-6 flex items-center justify-between border-t border-zinc-100">
                <button type="button" onClick={resetSession} className="text-sm font-medium text-red-600 hover:text-red-700">
                  Limpar tudo
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg font-medium transition-colors"
                >
                  Iniciar Diagnóstico
                  <Play size={18} />
                </button>
              </div>
            </form>
          </div>
        )}

        {/* VIEW: STEP FORM */}
        {currentView === 'stepForm' && currentStep && (
          <div className="max-w-4xl mx-auto px-6 py-12 pb-32 animate-in fade-in duration-300">
            <div className="mb-8">
              <div className="inline-flex text-sm font-semibold tracking-wide text-zinc-500 uppercase mb-2">
                Etapa {currentStep.id} de 10
              </div>
              <h2 className="text-3xl font-display font-bold tracking-tight mb-2">{currentStep.name}</h2>
              <p className="text-zinc-600 text-lg">{currentStep.description}</p>
            </div>

            <div className="space-y-8">
              {/* Mentoring Inputs */}
              <div className="bg-white p-6 md:p-8 rounded-2xl border border-zinc-200 shadow-sm space-y-6">
                
                {/* Visual indicator for common gap */}
                <div className="p-4 bg-amber-50 rounded-lg border border-amber-100 flex gap-3 text-amber-800">
                  <Info className="flex-shrink-0 mt-0.5" size={20} />
                  <div>
                    <span className="font-semibold block mb-1">Gap mais comum a investigar:</span>
                    <span className="text-amber-700/90 text-sm">{currentStep.commonGap}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="col-span-1">
                    <label className="block text-sm font-semibold text-zinc-900 mb-2">Status Atual Estruturado?</label>
                    <div className="flex gap-3">
                      {['Sim', 'Parcial', 'Não'].map((status) => (
                        <button
                          key={status}
                          onClick={() => updateStep('status', status as Status)}
                          className={`flex-1 py-2 text-sm font-medium rounded-lg border transition-colors ${
                            currentStep.status === status
                              ? 'bg-zinc-900 border-zinc-900 text-white'
                              : 'bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50'
                          }`}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="col-span-1 md:col-span-2">
                    <label className="block text-sm font-semibold text-zinc-900 mb-2">Como está hoje (Anotações)</label>
                    <textarea
                      value={currentStep.howItIsToday}
                      onChange={(e) => updateStep('howItIsToday', e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 rounded-lg border border-zinc-300 focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900 outline-none transition-shadow resize-none"
                      placeholder="Anote o que o mentorado relata sobre o cenário atual..."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div>
                    <label className="block text-sm font-semibold text-zinc-900 mb-2">Gap Identificado</label>
                    <textarea
                      value={currentStep.gap}
                      onChange={(e) => updateStep('gap', e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 rounded-lg border border-zinc-300 focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900 outline-none transition-shadow resize-none"
                      placeholder="O que falta ou está errado?"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-zinc-900 mb-2">Ação Recomendada</label>
                    <textarea
                      value={currentStep.recommendedAction}
                      onChange={(e) => updateStep('recommendedAction', e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 rounded-lg border border-zinc-300 focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900 outline-none transition-shadow resize-none"
                      placeholder="O que precisa ser implementado?"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-zinc-900 mb-2">Responsável pela Ação</label>
                    <input
                      type="text"
                      value={currentStep.responsible}
                      onChange={(e) => updateStep('responsible', e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border border-zinc-300 focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900 outline-none transition-shadow"
                      placeholder="Nome / Cargo"
                    />
                  </div>
                   <div>
                    <label className="block text-sm font-semibold text-zinc-900 mb-2">Prazo / Estimativa</label>
                    <input
                      type="text"
                      value={currentStep.deadline}
                      onChange={(e) => updateStep('deadline', e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border border-zinc-300 focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900 outline-none transition-shadow"
                      placeholder="Ex: 30 dias, ou 15/05/2026"
                    />
                  </div>
                </div>
              </div>

              {/* Checklist & Resources */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-6 md:p-8 rounded-2xl border border-zinc-200 shadow-sm">
                  <h3 className="text-lg font-display font-semibold mb-4">Checklist da Etapa</h3>
                  <div className="space-y-3">
                    {currentStep.checklist.map((item) => (
                      <label key={item.id} className="flex items-start gap-3 cursor-pointer group">
                        <div className="relative flex items-center justify-center mt-0.5">
                          <input
                            type="checkbox"
                            checked={item.checked}
                            onChange={() => toggleChecklist(item.id)}
                            className="peer appearance-none w-5 h-5 border-2 border-zinc-300 rounded cursor-pointer checked:bg-zinc-900 checked:border-zinc-900 transition-colors"
                          />
                          <CheckCircle2 className="absolute w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" />
                        </div>
                        <span className={`text-sm select-none transition-colors ${item.checked ? 'text-zinc-500 line-through' : 'text-zinc-700 group-hover:text-zinc-900'}`}>
                          {item.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
                    <label className="block text-sm font-semibold text-zinc-900 mb-2">Documentos Necessários</label>
                    <textarea
                      value={currentStep.documents}
                      onChange={(e) => updateStep('documents', e.target.value)}
                      rows={2}
                      className="w-full px-4 py-3 rounded-lg border border-zinc-300 focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900 outline-none transition-shadow resize-none text-sm"
                      placeholder="Listar documentos a criar ou ajustar..."
                    />
                  </div>

                  <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
                    <label className="block text-sm font-semibold text-zinc-900 mb-2">Mensagem / Template</label>
                    <textarea
                      value={currentStep.suggestedMessage}
                      onChange={(e) => updateStep('suggestedMessage', e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 rounded-lg border border-zinc-300 focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900 outline-none transition-shadow resize-none text-sm font-mono"
                      placeholder="Template de email ou whatsapp..."
                    />
                  </div>
                </div>
              </div>

              {/* Final Status */}
              <div className="bg-white p-6 md:p-8 rounded-2xl border border-zinc-200 shadow-sm">
                <label className="block text-base font-semibold text-zinc-900 mb-4">Marcação Final da Etapa</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {(['Crítico', 'Atenção', 'Adequado'] as FinalStatus[]).map((status) => {
                    let colorClasses = 'border-zinc-200 bg-white hover:bg-zinc-50';
                    if (currentStep.finalStatus === status) {
                      if (status === 'Crítico') colorClasses = 'border-red-500 bg-red-50 text-red-900 ring-1 ring-red-500';
                      if (status === 'Atenção') colorClasses = 'border-yellow-500 bg-yellow-50 text-yellow-900 ring-1 ring-yellow-500';
                      if (status === 'Adequado') colorClasses = 'border-green-500 bg-green-50 text-green-900 ring-1 ring-green-500';
                    }

                    return (
                      <button
                        key={status}
                        onClick={() => updateStep('finalStatus', status)}
                        className={`px-6 py-4 rounded-xl border-2 font-medium transition-all ${colorClasses}`}
                      >
                         <div className="flex items-center gap-2 justify-center">
                           <div className={`w-3 h-3 rounded-full ${status === 'Crítico' ? 'bg-red-500' : status === 'Atenção' ? 'bg-yellow-500' : status === 'Adequado' ? 'bg-green-500' : 'hidden'}`} />
                           {status}
                         </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Navigation Footer */}
              <div className="pt-8 flex flex-col-reverse md:flex-row justify-between items-center border-t border-zinc-200 gap-4 md:gap-0">
                <button
                  onClick={() => {
                    window.scrollTo(0, 0);
                    currentStepIndex > 0 ? setCurrentStepIndex(currentStepIndex - 1) : setCurrentView('menteeForm')
                  }}
                  className="w-full md:w-auto px-6 py-3 text-sm font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors border border-transparent hover:border-zinc-200"
                >
                  Voltar
                </button>
                
                {currentStepIndex < steps.length - 1 ? (
                  <button
                    onClick={() => {
                      window.scrollTo(0, 0);
                      setCurrentStepIndex(currentStepIndex + 1);
                    }}
                    className="w-full md:w-auto inline-flex justify-center items-center gap-2 px-6 py-3 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg font-medium transition-colors"
                  >
                    Próxima Etapa
                    <ChevronRight size={18} />
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      window.scrollTo(0, 0);
                      setCurrentView('report');
                    }}
                    className="w-full md:w-auto inline-flex justify-center items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-sm"
                  >
                    Encerrar e Gerar Relatório
                    <FileText size={18} />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* VIEW: REPORT */}
        {currentView === 'report' && (
          <motion.div 
            initial={!isPrintMode ? { opacity: 0, y: 20 } : undefined}
            animate={!isPrintMode ? { opacity: 1, y: 0 } : undefined}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className={`max-w-5xl mx-auto px-6 py-12 ${isPrintMode ? 'print:py-0 print:px-0 w-full max-w-none' : ''}`}
          >
            
            {/* Action Bar (No Print) */}
            {!isPrintMode && (
              <motion.div 
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="print:hidden flex justify-between items-center mb-8 bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-zinc-200 shadow-lg sticky top-4 z-50"
              >
                <button
                  onClick={() => {
                    window.scrollTo(0, 0);
                    setCurrentView('stepForm')
                  }}
                  className="text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors px-4 py-2"
                >
                  Voltar à edição
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    // Update localStorage one last time to be sure
                    localStorage.setItem('mentoria_mentee', JSON.stringify(mentee));
                    localStorage.setItem('mentoria_steps', JSON.stringify(steps));
                    window.open('?print=true', '_blank');
                  }}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-sm font-medium transition-shadow shadow-md hover:shadow-xl"
                >
                  <Download size={16} />
                  Exportar / Imprimir PDF
                </motion.button>
              </motion.div>
            )}

            {/* Print Area Container */}
            <div className={`bg-white print:border-none rounded-3xl print:p-0 relative overflow-hidden ${!isPrintMode ? 'p-10 md:p-14 border border-zinc-200 shadow-2xl shadow-zinc-200/50' : 'p-6 md:p-14'}`}>
              
              {!isPrintMode && (
                <>
                  <motion.div 
                    animate={{ scale: [1, 1.1, 1], rotate: [0, 5, 0] }}
                    transition={{ repeat: Infinity, duration: 20, ease: 'linear' }}
                    className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-blue-50/50 rounded-full blur-3xl pointer-events-none"
                  />
                  <motion.div 
                    animate={{ scale: [1, 1.2, 1], rotate: [0, -5, 0] }}
                    transition={{ repeat: Infinity, duration: 25, ease: 'linear' }}
                    className="absolute top-1/2 -left-40 w-[500px] h-[500px] bg-emerald-50/50 rounded-full blur-3xl pointer-events-none"
                  />
                  <motion.div 
                    animate={{ scale: [1, 1.5, 1], y: [0, -50, 0] }}
                    transition={{ repeat: Infinity, duration: 15, ease: 'easeInOut' }}
                    className="absolute -bottom-20 right-1/4 w-[400px] h-[400px] bg-purple-50/40 rounded-full blur-3xl pointer-events-none"
                  />
                  <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none"></div>
                </>
              )}

              <div className="relative z-10">
              
              {/* Header */}
              <div className="border-b-[3px] border-zinc-900 pb-6 mb-8 flex flex-col md:flex-row md:justify-between items-start md:items-end gap-4">
                <div>
                  <h1 className="text-3xl font-display font-bold text-zinc-900 mb-1">Diagnóstico de Processos</h1>
                  <p className="text-zinc-500 uppercase tracking-widest text-sm font-semibold">Mentoria Estratégica</p>
                </div>
                <div className="text-left md:text-right">
                  <p className="text-sm text-zinc-500 mb-1">Data: <span className="font-medium text-zinc-900">{new Date(mentee.date).toLocaleDateString('pt-BR')}</span></p>
                </div>
              </div>

              {/* Mentee Data */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-y-6 gap-x-8 mb-10 bg-zinc-50 p-6 rounded-xl border border-zinc-100">
                <div className="md:col-span-1">
                  <p className="text-xs text-zinc-500 uppercase font-semibold mb-1">Mentorado</p>
                  <p className="font-medium text-lg leading-tight">{mentee.name || '-'}</p>
                </div>
                <div className="md:col-span-1">
                  <p className="text-xs text-zinc-500 uppercase font-semibold mb-1">Empresa</p>
                  <p className="font-medium text-lg leading-tight">{mentee.company || '-'}</p>
                </div>
                <div className="md:col-span-1">
                  <p className="text-xs text-zinc-500 uppercase font-semibold mb-1">Segmento</p>
                  <p className="font-medium leading-tight">{mentee.segment || '-'}</p>
                </div>
              </div>

              {/* Maturity Index */}
              <motion.div 
                initial={!isPrintMode ? { opacity: 0, y: 20 } : undefined}
                whileInView={!isPrintMode ? { opacity: 1, y: 0 } : undefined}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="mb-12"
              >
                <h2 className="text-lg font-display font-bold border-b border-zinc-200 pb-2 mb-4">Índice de Maturidade Geral</h2>
                
                {(() => {
                  const totalItems = steps.reduce((acc, step) => acc + step.checklist.length, 0);
                  const checkedItems = steps.reduce((acc, step) => acc + step.checklist.filter(i => i.checked).length, 0);
                  const percentage = totalItems > 0 ? Math.round((checkedItems / totalItems) * 100) : 0;
                  
                  const radarData = steps.map(step => ({
                    subject: step.name,
                    A: step.checklist.filter(i => i.checked).length,
                    fullMark: step.checklist.length,
                  }));

                  const barData = [
                    { name: 'Crítico', value: steps.filter(s => s.finalStatus === 'Crítico').length, color: '#ef4444' },
                    { name: 'Atenção', value: steps.filter(s => s.finalStatus === 'Atenção').length, color: '#eab308' },
                    { name: 'Adequado', value: steps.filter(s => s.finalStatus === 'Adequado').length, color: '#22c55e' },
                  ];

                  return (
                    <div className="mb-6 space-y-8">
                      <div>
                        <div className="flex justify-between items-end mb-2">
                          <span className="text-3xl font-display font-bold text-zinc-900">{percentage}%</span>
                          <span className="text-sm font-medium text-zinc-500">{checkedItems} de {totalItems} itens estruturados</span>
                        </div>
                        <div className="w-full bg-zinc-100 rounded-full h-4 overflow-hidden border border-zinc-200/50">
                          <div className="h-full bg-zinc-900 transition-all rounded-full" style={{ width: `${percentage}%` }} />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 print:block print:space-y-8">
                        <motion.div 
                          animate={!isPrintMode ? { y: [0, -5, 0] } : undefined}
                          transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                          className="bg-white border-2 border-zinc-100 rounded-2xl p-6 flex flex-col items-center print:break-inside-avoid shadow-lg shadow-zinc-200/30 print:shadow-none print:border-zinc-200"
                        >
                          <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-4">Maturidade por Etapa</h3>
                          <div className="w-full h-64">
                            <ResponsiveContainer width="100%" height="100%">
                              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                                <PolarGrid stroke="#e4e4e7" />
                                <PolarAngleAxis dataKey="subject" tick={{ fill: '#71717a', fontSize: 10 }} />
                                <PolarRadiusAxis angle={30} domain={[0, 8]} tick={false} axisLine={false} />
                                <Radar name="Maturidade" dataKey="A" stroke="#18181b" fill="#18181b" fillOpacity={0.2} isAnimationActive={!isPrintMode} />
                                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e4e4e7' }} />
                              </RadarChart>
                            </ResponsiveContainer>
                          </div>
                        </motion.div>

                        <motion.div 
                          animate={!isPrintMode ? { y: [0, -5, 0] } : undefined}
                          transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }}
                          className="bg-white border-2 border-zinc-100 rounded-2xl p-6 flex flex-col items-center print:break-inside-avoid shadow-lg shadow-zinc-200/30 print:shadow-none print:border-zinc-200"
                        >
                          <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-4">Status Final das Etapas</h3>
                          <div className="w-full h-64">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={barData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                                <XAxis dataKey="name" tick={{ fill: '#71717a', fontSize: 12 }} axisLine={false} tickLine={false} />
                                <YAxis allowDecimals={false} tick={{ fill: '#71717a', fontSize: 12 }} axisLine={false} tickLine={false} />
                                <Tooltip cursor={{ fill: '#f4f4f5' }} contentStyle={{ borderRadius: '8px', border: '1px solid #e4e4e7' }} />
                                <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={60} isAnimationActive={!isPrintMode}>
                                  {barData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                  ))}
                                </Bar>
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        </motion.div>
                      </div>
                    </div>
                  );
                })()}

                <motion.div 
                   variants={{
                     hidden: { opacity: 0 },
                     show: { opacity: 1, transition: { staggerChildren: 0.1 } }
                   }}
                   initial={!isPrintMode ? "hidden" : undefined}
                   whileInView={!isPrintMode ? "show" : undefined}
                   viewport={{ once: true }}
                   className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 print:break-inside-avoid"
                >
                  {['Crítico', 'Atenção', 'Adequado'].map((status) => {
                    const statusSteps = steps.filter(s => s.finalStatus === status);
                    let color = 'bg-zinc-50';
                    let dot = 'bg-zinc-500';
                    if (status === 'Crítico') { color = 'bg-red-50 border-red-100'; dot = 'bg-red-500'; }
                    if (status === 'Atenção') { color = 'bg-yellow-50 border-yellow-100'; dot = 'bg-yellow-500'; }
                    if (status === 'Adequado') { color = 'bg-green-50 border-green-100'; dot = 'bg-green-500'; }

                    return (
                      <motion.div 
                        variants={!isPrintMode ? { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } } : undefined}
                        key={status} 
                        className={`p-5 rounded-2xl border-2 ${color} transition-all hover:scale-[1.02]`}
                      >
                        <p className="text-sm font-semibold mb-3 flex items-center gap-2 text-zinc-900">
                          <span className={`w-2.5 h-2.5 rounded-full shadow-sm ${dot}`} />
                          Status: {status}
                        </p>
                        <p className="text-xs text-zinc-600 leading-relaxed font-medium">
                          {statusSteps.length > 0
                            ? statusSteps.map(s => `${s.id}. ${s.name}`).join(' • ')
                            : 'Nenhuma etapa.'}
                        </p>
                      </motion.div>
                    )
                  })}
                </motion.div>
              </motion.div>

              {/* Action Plan (Tables) */}
              <motion.div 
                initial={!isPrintMode ? { opacity: 0, y: 20 } : undefined}
                whileInView={!isPrintMode ? { opacity: 1, y: 0 } : undefined}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5 }}
                className="mb-14 print:break-inside-avoid w-full"
              >
                <div className="flex items-center gap-3 border-b-2 border-zinc-100 pb-3 mb-8">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                    <Sparkles size={16} />
                  </div>
                  <h2 className="text-xl font-display font-bold text-zinc-900">Plano de Ação Consolidado</h2>
                </div>
                
                {/* Critical Actions */}
                <div className="mb-8">
                  <h3 className="text-sm font-semibold text-red-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <AlertCircle size={16} className="text-red-600" /> Prioridade 1 — Ações Críticas (Imediatas)
                  </h3>
                  <div className="overflow-x-auto w-full">
                    <table className="w-full text-left text-sm border-collapse min-w-[600px]">
                      <thead>
                        <tr className="bg-red-50/70 border-y border-red-100 text-red-900 text-xs uppercase tracking-wider">
                          <th className="py-3 px-4 font-semibold w-[20%]">Etapa</th>
                          <th className="py-3 px-4 font-semibold w-[50%]">Ação de Correção</th>
                          <th className="py-3 px-4 font-semibold w-[15%]">Responsável</th>
                          <th className="py-3 px-4 font-semibold w-[15%]">Prazo</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100 text-zinc-700">
                        {steps.filter(s => s.finalStatus === 'Crítico').length > 0 ? (
                          steps.filter(s => s.finalStatus === 'Crítico').map(step => (
                            <tr key={step.id} className="hover:bg-zinc-50/50 print:break-inside-avoid">
                              <td className="py-3 px-4 font-medium text-zinc-900 align-top">{step.id}. {step.name}</td>
                              <td className="py-3 px-4 align-top">{step.recommendedAction || <span className="text-zinc-400 italic">Não definida</span>}</td>
                              <td className="py-3 px-4 align-top">{step.responsible || '-'}</td>
                              <td className="py-3 px-4 align-top">{step.deadline || '-'}</td>
                            </tr>
                          ))
                        ) : (
                          <tr><td colSpan={4} className="py-6 px-4 text-center text-zinc-500 italic">Nenhuma ação crítica pendente.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Attention Actions */}
                <div className="print:break-inside-avoid">
                  <h3 className="text-sm font-semibold text-yellow-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <AlertCircle size={16} className="text-yellow-600" /> Prioridade 2 — Ações de Melhoria
                  </h3>
                  <div className="overflow-x-auto w-full">
                    <table className="w-full text-left text-sm border-collapse min-w-[600px]">
                      <thead>
                        <tr className="bg-yellow-50/70 border-y border-yellow-100 text-yellow-900 text-xs uppercase tracking-wider">
                          <th className="py-3 px-4 font-semibold w-[20%]">Etapa</th>
                          <th className="py-3 px-4 font-semibold w-[50%]">Ação Recomendada</th>
                          <th className="py-3 px-4 font-semibold w-[15%]">Responsável</th>
                          <th className="py-3 px-4 font-semibold w-[15%]">Prazo</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100 text-zinc-700">
                        {steps.filter(s => s.finalStatus === 'Atenção').length > 0 ? (
                          steps.filter(s => s.finalStatus === 'Atenção').map(step => (
                            <tr key={step.id} className="hover:bg-zinc-50/50 print:break-inside-avoid">
                              <td className="py-3 px-4 font-medium text-zinc-900 align-top">{step.id}. {step.name}</td>
                              <td className="py-3 px-4 align-top">{step.recommendedAction || <span className="text-zinc-400 italic">Não definida</span>}</td>
                              <td className="py-3 px-4 align-top">{step.responsible || '-'}</td>
                              <td className="py-3 px-4 align-top">{step.deadline || '-'}</td>
                            </tr>
                          ))
                        ) : (
                          <tr><td colSpan={4} className="py-6 px-4 text-center text-zinc-500 italic">Nenhuma ação de melhoria pendente.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>

               {/* Step by step diagnostic (Page break before conceptually) */}
              <motion.div 
                initial={!isPrintMode ? { opacity: 0, y: 20 } : undefined}
                whileInView={!isPrintMode ? { opacity: 1, y: 0 } : undefined}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5 }}
                className="print:break-before-page pt-8"
              >
                 <div className="flex items-center gap-3 border-b-2 border-zinc-100 pb-3 mb-8">
                   <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                     <FileText size={16} />
                   </div>
                   <h2 className="text-xl font-display font-bold text-zinc-900">Diagnóstico Detalhado por Etapa</h2>
                 </div>
                 <div className="space-y-8">
                   {steps.map(step => {
                     const bgHeader = step.finalStatus === 'Crítico' ? 'bg-red-50 text-red-900 border-red-200' : 
                                    step.finalStatus === 'Atenção' ? 'bg-yellow-50 text-yellow-900 border-yellow-200' :
                                    step.finalStatus === 'Adequado' ? 'bg-green-50 text-green-900 border-green-200' :
                                    'bg-zinc-50 text-zinc-800 border-zinc-200';

                     return (
                       <motion.div 
                         initial={!isPrintMode ? { opacity: 0, scale: 0.98 } : undefined}
                         whileInView={!isPrintMode ? { opacity: 1, scale: 1 } : undefined}
                         viewport={{ once: true, margin: "-50px" }}
                         transition={{ duration: 0.4 }}
                         whileHover={!isPrintMode ? { y: -2, boxShadow: "0px 10px 30px -10px rgba(0,0,0,0.1)" } : undefined}
                         key={step.id} 
                         className="border-2 border-zinc-100 rounded-2xl overflow-hidden print:break-inside-avoid shadow-sm print:shadow-none bg-white transition-all flex flex-col"
                       >
                         <div className={`px-6 py-4 border-b flex justify-between items-center ${bgHeader}`}>
                           <h3 className="font-semibold text-base">{step.id}. {step.name}</h3>
                           <span className="text-[10px] font-bold uppercase tracking-wider bg-white px-2 py-1.5 rounded-md shadow-sm">
                             {step.finalStatus}
                           </span>
                         </div>
                         <div className="p-5 text-sm grid grid-cols-1 md:grid-cols-2 gap-6 relative">
                           <div className="space-y-5">
                             <div>
                               <p className="font-semibold text-zinc-900 mb-1 flex items-center gap-1.5">
                                 <span className="text-blue-500 font-bold text-lg">•</span> Status Atual
                               </p>
                               <p className="text-zinc-600 leading-relaxed">{step.howItIsToday || 'Sem anotações preenchidas.'}</p>
                             </div>
                             <div>
                               <p className="font-semibold text-zinc-900 mb-1 flex items-center gap-1.5">
                                 <span className="text-amber-500 font-bold text-lg">•</span> Gap Identificado
                               </p>
                               <p className="text-zinc-600 leading-relaxed">{step.gap || 'Nenhum gap relatado.'}</p>
                             </div>
                           </div>
                           
                           <div className="space-y-4 bg-zinc-50 p-4 rounded-xl border border-zinc-200/60">
                             <div>
                               <p className="font-semibold text-zinc-900 mb-1 flex items-center gap-1.5">
                                 <CheckCircle2 size={16} className="text-green-600" /> Ação Recomendada
                               </p>
                               <p className="text-zinc-700 leading-relaxed font-medium">{step.recommendedAction || <span className="text-zinc-400 font-normal italic">-</span>}</p>
                             </div>
                             <div className="grid grid-cols-2 gap-4 pt-3 border-t border-zinc-200/60">
                               <div>
                                 <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 mb-1">Responsável</p>
                                 <p className="text-zinc-900 font-medium">{step.responsible || '-'}</p>
                               </div>
                               <div>
                                 <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 mb-1">Prazo / Est.</p>
                                 <p className="text-zinc-900 font-medium">{step.deadline || '-'}</p>
                               </div>
                             </div>
                           </div>
                         </div>
                         
                         {/* Checklist condensed summary */}
                         <div className="px-5 py-3 bg-zinc-50 border-t border-zinc-200 text-xs flex justify-between items-center">
                            <span className="font-medium text-zinc-600">
                              Checklist estruturado: {step.checklist.filter(c => c.checked).length} de {step.checklist.length} itens implementados
                            </span>
                         </div>
                       </motion.div>
                     )
                   })}
                 </div>
              </motion.div>

              </div> {/* Close internal relative div for print background */}
            </div>
          </motion.div>
        )}

      </main>
    </div>
  );
}
