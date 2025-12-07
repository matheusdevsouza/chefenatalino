'use client'

import React from 'react'
import Link from 'next/link'
import { 
  ChefHat, ArrowRight, Sparkles, Brain, ShoppingCart, Clock, 
  Users, Zap, TrendingUp, FileText, Calendar, Settings2, 
  Wand2, ListChecks, Check, Shield, AlertCircle, 
  Gift, Users2, Heart, Snowflake, PartyPopper, 
  CheckCircle2, Headphones, RefreshCw, Lock, Award, Mail,
  MessageSquare, Download, PlayCircle
} from 'lucide-react'
import { Button } from '@/components/Button'
import { UserProfile } from '@/components/UserProfile'
import { PlansSection } from '@/components/PlansSection'
import { TestimonialsSection } from '@/components/TestimonialsSection'
import { DemoButton } from '@/components/DemoButton'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import {
  DemoProvider,
  BrainDemo,
  ShoppingListDemo,
  ScheduleDemo,
  GuestsDemo,
  GiftSuggestionsDemo,
  SecretSantaDemo
} from '@/components/DemoCards'

export default function Home() {

  const features = [
    {
      icon: Brain,
      title: 'O Cérebro do Natal',
      description: 'Uma inteligência artificial treinada com milhares de combinações natalinas. Ela entende "sem uva passa" ou "vovó diabética" instantaneamente.',
      tags: ['Sem Glúten', 'Baixo Custo', 'Harmonização'],
    },
    {
      icon: ShoppingCart,
      title: 'Lista Automática',
      description: 'Gera a lista exata de ingredientes baseada no número de convidados. Zero desperdício, quantidades precisas.',
    },
    {
      icon: Clock,
      title: 'Cronograma Inteligente',
      description: 'Saiba exatamente quando colocar o peru no forno para servir às 00:00. Planejamento minuto-a-minuto.',
    },
    {
      icon: Users,
      title: 'Gestão de Convidados',
      description: 'Confirme presenças e calcule quantidades automaticamente. Adapta-se às mudanças em tempo real.',
    },
  ]

  const steps = [
    {
      number: '1',
      icon: Settings2,
      title: 'Defina o Cenário em Segundos',
      description: 'Conte quantas pessoas virão, informe seu orçamento disponível e todas as restrições alimentares. Nossa IA inteligente entende desde "sem glúten" até "vovó diabética". Você só precisa responder algumas perguntas simples - a tecnologia faz o resto.',
      details: 'Sem formulários complicados. Interface intuitiva que guia você passo a passo.',
      color: 'vermelho-vibrante',
    },
    {
      number: '2',
      icon: Wand2,
      title: 'A IA Gera 3 Opções Completas',
      description: 'Em menos de 30 segundos, você recebe 3 cardápios completos e personalizados. Cada opção inclui entrada, prato principal, acompanhamentos, sobremesas e bebidas. Todas as receitas são adaptadas às suas necessidades e preferências. Escolha a que mais te agrada!',
      details: 'Cada menu é único, balanceado nutricionalmente e respeita seu orçamento.',
      color: 'vermelho-vibrante',
    },
    {
      number: '3',
      icon: ShoppingCart,
      title: 'Receba Lista de Compras Automática',
      description: 'A IA calcula automaticamente as quantidades exatas de cada ingrediente baseado no número de convidados. Receba uma lista organizada por seção do supermercado (hortifrúti, açougue, padaria...). Zero desperdício, quantidades precisas para evitar faltas ou sobras.',
      details: 'Lista pode ser exportada para WhatsApp, email ou impressa. Inclui marcas sugeridas e valores estimados.',
      color: 'vermelho-vibrante',
    },
    {
      number: '4',
      icon: Clock,
      title: 'Cronograma Minuto a Minuto',
      description: 'Saiba exatamente quando colocar cada prato no forno, quando começar a preparar cada receita e em qual ordem fazer tudo. O cronograma inteligente garante que todos os pratos fiquem prontos na hora certa, quentinhos e perfeitos. Nunca mais perca a hora do peru!',
      details: 'Notificações no celular para você não perder nenhum passo. Tudo sincronizado com horários reais.',
      color: 'vermelho-vibrante',
    },
    {
      number: '5',
      icon: ListChecks,
      title: 'Modo de Preparo Detalhado',
      description: 'Cada receita vem com passo a passo completo, fotos ilustrativas (quando aplicável), temperatura exata do forno, tempo de preparo, dicas de execução e truques de chef. Mesmo iniciantes na cozinha conseguem preparar pratos incríveis seguindo nosso guia detalhado.',
      details: 'Acesso no celular durante o preparo. Modo offline disponível. Dicas de apresentação incluídas.',
      color: 'vermelho-vibrante',
    },
  ]

  const benefits = [
    {
      icon: Zap,
      title: 'Rápido e Eficiente',
      description: 'Planejamento completo do Natal em segundos, não em horas.',
    },
    {
      icon: TrendingUp,
      title: 'Economia Inteligente',
      description: 'Otimiza seu orçamento para ceia e presentes sem comprometer a qualidade.',
    },
    {
      icon: FileText,
      title: 'Tudo Organizado',
      description: 'Ceia, presentes, amigo secreto e mensagens em um só lugar.',
    },
    {
      icon: Calendar,
      title: 'Sem Estresse',
      description: 'Nunca mais se perca na preparação do Natal completo.',
    },
  ]

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-vermelho-vibrante selection:text-white">
      <Header />

      <section id="hero-section" className="relative w-full overflow-hidden flex items-center justify-center bg-slate-50/50 pt-20 sm:pt-24 md:pt-28 pb-12 sm:pb-16 md:pb-20">
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center py-6 sm:py-8 md:py-10">
          
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 mb-4 sm:mb-6 rounded-full bg-white border border-red-100 shadow-sm">
            <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-red-600 animate-pulse"></span>
            <span className="text-[10px] sm:text-xs font-semibold tracking-wide text-red-600 uppercase whitespace-nowrap">Seu Natal completo planejado por IA</span>
          </div>
          
          <h1 className="font-serif text-4xl sm:text-5xl md:text-7xl lg:text-8xl xl:text-9xl font-medium leading-[1.1] text-slate-900 text-center tracking-tight relative mb-4 sm:mb-6 px-2">
            <span className="block mb-1 sm:mb-2">O Natal perfeito,</span>
            <span className="block">planejado em</span>
            <span className="block mt-1 sm:mt-2 text-red-600 italic font-bold">
              segundos.
            </span>
          </h1>
          
          <div className="mt-4 sm:mt-6 space-y-4 sm:space-y-6 text-center max-w-2xl mx-auto w-full px-4">
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-slate-600 leading-relaxed font-light">
              Diga adeus ao estresse das compras e do cronograma. Nossa <strong className="text-red-600 font-medium">Ceia Inteligente</strong> cria o cardápio completo personalizado para sua família. Além disso, organize amigo secreto e descubra os presentes perfeitos com IA.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center pt-2 sm:pt-4">
              <a href="#demo">
                <Button size="lg" className="group text-base sm:text-lg w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white shadow-xl">
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  Ver Demo Interativa
              </Button>
              </a>
            </div>
            <p className="text-sm text-slate-500 mt-2">Experimente todas as funcionalidades • Sem cadastro necessário</p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 text-xs sm:text-sm text-slate-400 pt-4 sm:pt-6 px-4">
              <div className="flex -space-x-2">
                 <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-slate-200 border-2 border-white"></div>
                 <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-slate-300 border-2 border-white"></div>
                 <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-slate-400 border-2 border-white"></div>
              </div>
              <p className="whitespace-nowrap">+2.000 famílias já organizaram seu Natal</p>
            </div>
          </div>
        </div>
      </section>

      <div className="relative z-30 bg-slate-50/50">
        
        <section id="ceia-inteligente" className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8 bg-slate-50/50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12 md:mb-16">
              <span className="text-red-600 font-semibold tracking-wider text-xs sm:text-sm uppercase">Funcionalidades</span>
              <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl mt-3 mb-4 sm:mb-6 text-slate-900 px-2">Por que é "Inteligente"?</h2>
              <p className="text-slate-600 text-base sm:text-lg px-2">Nossa IA não apenas sugere receitas. Ela orquestra todo o evento, considerando gostos, alergias, orçamento e tempo disponível. Além disso, facilita a organização do Natal completo: desde a ceia até os presentes e amigo secreto.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 auto-rows-[auto] md:auto-rows-[250px]">
              
              <div className="md:col-span-2 lg:col-span-2 md:row-span-2 bg-red-50 rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-red-100 flex flex-col justify-between overflow-hidden relative group hover:shadow-xl transition-all duration-300 min-h-[280px] md:min-h-0">
                <div className="relative z-10">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-600 text-white rounded-xl flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform">
                    <Brain className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <h3 className="font-serif text-2xl sm:text-3xl mb-2 text-slate-900">O Cérebro do Natal</h3>
                  <p className="text-slate-700 max-w-md text-sm sm:text-base">Uma inteligência artificial treinada com milhares de combinações natalinas. Ela entende "sem uva passa" ou "vovó diabética" instantaneamente e gera <strong>modo de preparo completo</strong> para cada receita.</p>
                </div>
                <div className="absolute bottom-0 right-0 w-48 h-48 sm:w-64 sm:h-64 bg-red-600/5 rounded-full blur-3xl group-hover:bg-red-600/10 transition-all duration-500"></div>
                
                <div className="flex flex-wrap gap-2 mt-4 sm:mt-6">
                  {features[0].tags?.map((tag, idx) => (
                    <span key={idx} className="bg-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-full shadow-sm text-xs sm:text-sm text-slate-700 border border-slate-100">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-slate-200 hover:border-red-200 hover:shadow-lg transition-all duration-300 flex flex-col justify-center group min-h-[200px] md:min-h-0">
                <div className="w-10 h-10 bg-red-50 text-red-600 rounded-lg flex items-center justify-center mb-3 sm:mb-4 group-hover:bg-red-100 group-hover:scale-110 transition-all">
                  <ShoppingCart className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-base sm:text-lg mb-1 text-slate-900">Lista Automática</h4>
                <p className="text-xs sm:text-sm text-slate-600">Gera a lista exata de ingredientes baseada no número de convidados. Zero desperdício.</p>
              </div>

              <div className="bg-red-600 text-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 flex flex-col justify-center relative overflow-hidden group hover:shadow-xl transition-all duration-300 min-h-[200px] md:min-h-0">
                <div className="relative z-10">
                  <div className="w-10 h-10 bg-white/20 text-white rounded-lg flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform">
                    <Clock className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-base sm:text-lg mb-1">Cronograma</h4>
                  <p className="text-xs sm:text-sm text-white/90">Saiba exatamente quando colocar o peru no forno para servir às 00:00.</p>
                </div>
                <Clock className="absolute -bottom-4 -right-4 w-24 h-24 sm:w-32 sm:h-32 text-white/10 group-hover:w-40 group-hover:h-40 sm:group-hover:w-48 sm:group-hover:h-48 transition-all duration-300 ease-out" />
              </div>

              <div className="md:col-span-2 bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-slate-200 hover:border-red-200 hover:shadow-lg transition-all duration-300 flex flex-col sm:flex-row items-start sm:items-center justify-between group gap-4">
                <div>
                  <div className="w-10 h-10 bg-red-50 text-red-600 rounded-lg flex items-center justify-center mb-3 sm:mb-4 group-hover:bg-red-100 group-hover:scale-110 transition-all">
                    <Users className="w-5 h-5" />
                  </div>
                  <h4 className="font-serif text-xl sm:text-2xl mb-2 text-slate-900">Gestão de Convidados</h4>
                  <p className="text-sm sm:text-base text-slate-600">Confirme presenças e calcule quantidades automaticamente.</p>
                </div>
                <div className="hidden sm:flex -space-x-3">
                  <div className="w-12 h-12 rounded-full bg-slate-100 border-4 border-white"></div>
                  <div className="w-12 h-12 rounded-full bg-slate-200 border-4 border-white"></div>
                  <div className="w-12 h-12 rounded-full bg-red-600 text-white flex items-center justify-center font-bold border-4 border-white text-sm">+12</div>
                </div>
              </div>

              {/* Funcionalidades futuras */}
              <div className="md:col-span-2 lg:col-span-2 bg-gradient-to-br from-red-50 to-red-50/50 rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-red-100 hover:shadow-xl transition-all duration-300 group min-h-[240px] md:min-h-0 flex flex-col">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-red-600 to-red-700 text-white rounded-lg flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform">
                  <Gift className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <h3 className="font-serif text-xl sm:text-2xl mb-2 text-slate-900">Sugestões de Presentes com IA</h3>
                <p className="text-slate-700 text-sm sm:text-base">Descreva uma pessoa e seus gostos pessoais. Nossa IA analisa e sugere uma lista personalizada de presentes que ela vai adorar. Nunca mais fique sem ideias!</p>
              </div>

              <div className="bg-gradient-to-br from-red-50 to-red-50/50 rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-red-100 hover:shadow-xl transition-all duration-300 flex flex-col justify-center group min-h-[200px] md:min-h-0">
                <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-red-700 text-white rounded-lg flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform">
                  <Users2 className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-base sm:text-lg mb-1 text-slate-900">Gerador de Amigo Secreto</h4>
                <p className="text-xs sm:text-sm text-slate-700">Sorteia automaticamente quem dá presente para quem. Configure restrições, envie convites e gerencie tudo em um só lugar. Fim da confusão!</p>
              </div>

              <div className="bg-gradient-to-br from-red-50 to-red-50/50 rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-red-100 hover:shadow-xl transition-all duration-300 flex flex-col justify-center group min-h-[200px] md:min-h-0">
                <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-red-700 text-white rounded-lg flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform">
                  <Heart className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-base sm:text-lg mb-1 text-slate-900">Mensagens de Natal</h4>
                <p className="text-xs sm:text-sm text-slate-700">Gere mensagens personalizadas e calorosas para cartões, WhatsApp e redes sociais. Deixe a IA criar textos únicos para cada pessoa.</p>
              </div>
            </div>
          </div>
        </section>

        <section id="como-funciona" className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8 bg-red-50/50 relative">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-10 sm:mb-12 md:mb-16">
              <span className="text-red-600 font-semibold tracking-wider text-xs sm:text-sm uppercase">Como Funciona</span>
              <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl mt-3 mb-4 text-slate-900 px-2">Do caos à celebração perfeita em 5 passos simples</h2>
              <p className="text-slate-600 text-base sm:text-lg max-w-2xl mx-auto px-2">
                Veja como nossa IA inteligente transforma o planejamento da ceia em algo simples, rápido e sem estresse
              </p>
            </div>
            
            <div className="relative">
              <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-red-200 via-red-300 to-red-200 md:-ml-px"></div>

              {steps.map((step, idx) => {
                const Icon = step.icon
                const isEven = idx % 2 === 1
                return (
                  <div key={idx} className="relative flex flex-col md:flex-row items-center justify-between mb-12 last:mb-0 group">
                    <div className={`md:w-[48%] order-2 ${isEven ? 'md:order-3' : 'md:order-1'} p-6 md:p-8 bg-white rounded-2xl shadow-sm border-2 border-slate-100 hover:border-red-300 hover:shadow-lg transition-all duration-300 ${isEven ? 'text-left' : 'text-left'}`}>
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-red-600 text-white rounded-lg flex items-center justify-center font-bold text-lg flex-shrink-0">
                          {step.number}
                    </div>
                        <h3 className="font-bold text-xl text-red-600">{step.title}</h3>
                      </div>
                      <p className="text-slate-700 mb-3 leading-relaxed">{step.description}</p>
                      <div className="flex items-start gap-2 mt-4 pt-4 border-t border-slate-100">
                        <Sparkles className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-slate-600 italic">{step.details}</p>
                      </div>
                    </div>
                    <div className="absolute left-8 md:left-1/2 -ml-4 w-8 h-8 rounded-full bg-red-600 border-4 border-white shadow-lg z-10 order-1 md:order-2 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                    <div className={`md:w-[48%] order-3 ${isEven ? 'md:order-1' : 'md:order-3'} pl-16 md:pl-0 flex justify-start md:justify-center`}>
                      <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-red-200 rounded-2xl flex items-center justify-center text-red-600 group-hover:from-red-200 group-hover:to-red-300 group-hover:scale-110 transition-all duration-300 shadow-md">
                        <Icon className="w-10 h-10" />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Botão de ação após os passos */}
            <div className="mt-16 text-center">
              <div className="inline-block rounded-2xl p-6">
                <p className="text-slate-700 mb-4 font-medium">
                  Pronto para começar? Todo o processo leva menos de 2 minutos!
                </p>
                <div className="flex justify-center">
                  <Link href="#precos">
                    <Button size="lg" className="bg-red-600 hover:bg-red-700 text-white">
                      <PlayCircle className="w-5 h-5 mr-2" />
                      Ver Planos e Preços
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Seção de Demo - Preview das funcionalidades */}
        <section id="demo" className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8 bg-slate-50/50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-10 sm:mb-12 md:mb-16">
              <span className="text-red-600 font-semibold tracking-wider text-xs sm:text-sm uppercase">Demo Interativa</span>
              <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl mt-3 mb-4 sm:mb-6 text-slate-900 px-2">Veja o que você terá acesso</h2>
              <p className="text-slate-600 text-base sm:text-lg max-w-2xl mx-auto px-2">
                Explore as funcionalidades que estarão disponíveis na sua assinatura. Complete cada demo para desbloquear a próxima.
              </p>
            </div>

            <DemoProvider>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <BrainDemo />
                <ShoppingListDemo />
                <ScheduleDemo />
                <GuestsDemo />
                <GiftSuggestionsDemo />
                <SecretSantaDemo />
              </div>
            </DemoProvider>
          </div>
        </section>

        <section id="vantagens" className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8 bg-red-50/50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-10 sm:mb-12 md:mb-16">
              <span className="text-red-600 font-semibold tracking-wider text-xs sm:text-sm uppercase">Por que você precisa disso AGORA</span>
              <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl mt-3 mb-4 sm:mb-6 text-slate-900 px-2">Economize tempo, dinheiro e estresse</h2>
              <p className="text-slate-600 text-base sm:text-lg max-w-2xl mx-auto px-2">
                O Natal está chegando e cada dia que passa é menos tempo para planejar. Comece agora e tenha tudo pronto com calma.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              <div className="bg-white rounded-2xl p-6 border-2 border-red-200 hover:border-red-300 hover:shadow-xl transition-all duration-300 group">
                <div className="w-12 h-12 bg-red-600 text-white rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Clock className="w-6 h-6" />
                </div>
                <div className="text-4xl font-bold text-red-600 mb-2">8h</div>
                <h3 className="font-bold text-lg mb-2 text-slate-900">Economize de Tempo</h3>
                <p className="text-slate-600 text-sm">Planejamento completo em 30 segundos vs. 8 horas fazendo manualmente.</p>
              </div>

              <div className="bg-white rounded-2xl p-6 border-2 border-red-200 hover:border-red-300 hover:shadow-xl transition-all duration-300 group">
                <div className="w-12 h-12 bg-red-600 text-white rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div className="text-4xl font-bold text-red-600 mb-2">30%</div>
                <h3 className="font-bold text-lg mb-2 text-slate-900">Menos Desperdício</h3>
                <p className="text-slate-600 text-sm">Quantidades precisas calculadas automaticamente evitam compras desnecessárias.</p>
              </div>

              <div className="bg-white rounded-2xl p-6 border-2 border-red-200 hover:border-red-300 hover:shadow-xl transition-all duration-300 group">
                <div className="w-12 h-12 bg-red-600 text-white rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Zap className="w-6 h-6" />
                </div>
                <div className="text-4xl font-bold text-red-600 mb-2">0%</div>
                <h3 className="font-bold text-lg mb-2 text-slate-900">Zero Estresse</h3>
                <p className="text-slate-600 text-sm">Aproveite o Natal de verdade enquanto nossa IA cuida de todos os detalhes.</p>
              </div>

              <div className="bg-white rounded-2xl p-6 border-2 border-red-200 hover:border-red-300 hover:shadow-xl transition-all duration-300 group">
                <div className="w-12 h-12 bg-red-600 text-white rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <FileText className="w-6 h-6" />
                </div>
                <div className="text-4xl font-bold text-red-600 mb-2">100%</div>
                <h3 className="font-bold text-lg mb-2 text-slate-900">Tudo Incluído</h3>
                <p className="text-slate-600 text-sm">Ceia, presentes, amigo secreto e mensagens - tudo em um só lugar.</p>
              </div>
            </div>

            <div className="mt-12">
              <h3 className="font-serif text-2xl md:text-3xl mb-8 text-center text-slate-900">ROI Real do Seu Investimento</h3>
              <div className="grid md:grid-cols-3 gap-4 md:gap-6">
                <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-2xl p-6 md:p-8 border border-red-200 hover:shadow-lg transition-shadow">
                  <div className="text-4xl md:text-5xl font-bold text-red-600 mb-2">R$ 39,99</div>
                  <p className="text-slate-700 text-sm md:text-base">por mês</p>
                </div>
                <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-2xl p-6 md:p-8 border border-red-200 hover:shadow-lg transition-shadow">
                  <div className="text-4xl md:text-5xl font-bold text-red-600 mb-2">R$ 200+</div>
                  <p className="text-slate-700 text-sm md:text-base">Economizado em desperdício</p>
                </div>
                <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-2xl p-6 md:p-8 border border-red-200 hover:shadow-lg transition-shadow">
                  <div className="text-4xl md:text-5xl font-bold text-red-600 mb-2">8 horas</div>
                  <p className="text-slate-700 text-sm md:text-base">De tempo economizado</p>
                </div>
              </div>
              <p className="text-slate-600 text-sm md:text-base text-center mt-6">Economia mensal garantida com os limites do seu plano.</p>
            </div>
          </div>
        </section>

        <section id="depoimentos" className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8 bg-slate-50/50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-10 sm:mb-12 md:mb-16">
              <span className="text-red-600 font-semibold tracking-wider text-xs sm:text-sm uppercase">Depoimentos</span>
              <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl mt-3 mb-4 sm:mb-6 text-slate-900 px-2">O que as famílias estão dizendo</h2>
              <p className="text-slate-600 text-base sm:text-lg max-w-2xl mx-auto px-2">
                Mais de 2.000 famílias já transformaram seu Natal com a Ceia Inteligente. Veja o que elas estão dizendo:
              </p>
            </div>

            <TestimonialsSection />
          </div>
        </section>

        <section id="precos" className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8 bg-red-50/50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-10 sm:mb-12 md:mb-16">
              <span className="text-red-600 font-semibold tracking-wider text-xs sm:text-sm uppercase">Preços</span>
              <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl mt-3 mb-4 sm:mb-6 text-slate-900 px-2">Planos mensais para cada necessidade</h2>
              <p className="text-slate-600 text-base sm:text-lg max-w-2xl mx-auto px-2">
                Escolha o plano ideal para você. Todos incluem acesso completo às funcionalidades com limites mensais que se renovam todo mês.
              </p>
            </div>

            <PlansSection />

            <div className="text-center mt-8">
              <p className="text-slate-600 text-sm">
                <Shield className="w-4 h-4 inline mr-1 text-red-600" />
                Todos os planos incluem garantia de satisfação • Cancele quando quiser
              </p>
            </div>
          </div>
        </section>

        <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8 bg-slate-50/50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-10 sm:mb-12 md:mb-16">
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-red-700 rounded-xl flex items-center justify-center shadow-lg">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <span className="text-red-600 font-semibold tracking-wider text-sm uppercase">Garantia Total</span>
              </div>
              <h2 className="font-serif text-4xl md:text-5xl mb-6 text-slate-900">Compromisso com sua Satisfação</h2>
              <p className="text-slate-600 text-lg max-w-3xl mx-auto">
                Estamos tão confiantes na qualidade do Chefe Natalino que oferecemos garantias abrangentes para você experimentar com tranquilidade total. Sua satisfação é nossa prioridade absoluta.
              </p>
                    </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              <div className="bg-white rounded-3xl p-8 border-2 border-red-100 hover:border-red-300 hover:shadow-xl transition-all duration-300">
                <div className="w-14 h-14 bg-gradient-to-br from-red-600 to-red-700 rounded-2xl flex items-center justify-center mb-6">
                  <CheckCircle2 className="w-7 h-7 text-white" />
                    </div>
                <h3 className="font-serif text-2xl mb-3 text-slate-900">Garantia de Satisfação</h3>
                <p className="text-slate-600 mb-4">
                  Se por qualquer motivo você não ficar satisfeito com o Chefe Natalino, oferecemos garantia total. Não importa se você já usou uma vez ou várias vezes.
                </p>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                    <span>Reembolso integral em caso de insatisfação</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                    <span>Sem perguntas complicadas</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                    <span>Processo rápido e simples</span>
                  </li>
                </ul>
                    </div>

              <div className="bg-white rounded-3xl p-8 border-2 border-red-100 hover:border-red-300 hover:shadow-xl transition-all duration-300">
                <div className="w-14 h-14 bg-gradient-to-br from-red-600 to-red-700 rounded-2xl flex items-center justify-center mb-6">
                  <Headphones className="w-7 h-7 text-white" />
                  </div>
                <h3 className="font-serif text-2xl mb-3 text-slate-900">Suporte Dedicado</h3>
                <p className="text-slate-600 mb-4">
                  Nossa equipe está sempre pronta para ajudar você. Não importa o problema ou dúvida, estamos aqui para resolver.
                </p>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                    <span>Resposta em até 24 horas</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                    <span>Suporte via email especializado</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                    <span>Atendimento personalizado e humano</span>
                  </li>
                </ul>
                </div>

              <div className="bg-white rounded-3xl p-8 border-2 border-red-100 hover:border-red-300 hover:shadow-xl transition-all duration-300">
                <div className="w-14 h-14 bg-gradient-to-br from-red-600 to-red-700 rounded-2xl flex items-center justify-center mb-6">
                  <RefreshCw className="w-7 h-7 text-white" />
              </div>
                <h3 className="font-serif text-2xl mb-3 text-slate-900">Atualizações Contínuas</h3>
                <p className="text-slate-600 mb-4">
                  O Chefe Natalino está em constante evolução. Você recebe todas as melhorias e novas funcionalidades automaticamente, sem custo adicional.
                </p>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                    <span>Novas funcionalidades regularmente</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                    <span>Melhorias baseadas no seu feedback</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                    <span>Atualizações contínuas durante a assinatura</span>
                  </li>
                </ul>
            </div>

              <div className="bg-white rounded-3xl p-8 border-2 border-red-100 hover:border-red-300 hover:shadow-xl transition-all duration-300">
                <div className="w-14 h-14 bg-gradient-to-br from-red-600 to-red-700 rounded-2xl flex items-center justify-center mb-6">
                  <Lock className="w-7 h-7 text-white" />
          </div>
                <h3 className="font-serif text-2xl mb-3 text-slate-900">Segurança Total</h3>
                <p className="text-slate-600 mb-4">
                  Seus dados estão protegidos com os mais altos padrões de segurança. Garantimos privacidade e confidencialidade total.
                </p>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                    <span>Dados criptografados e seguros</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                    <span>Não compartilhamos suas informações</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                    <span>Conformidade com LGPD</span>
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-3xl p-8 border-2 border-red-100 hover:border-red-300 hover:shadow-xl transition-all duration-300">
                <div className="w-14 h-14 bg-gradient-to-br from-red-600 to-red-700 rounded-2xl flex items-center justify-center mb-6">
                  <Award className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-serif text-2xl mb-3 text-slate-900">Compromisso com Qualidade</h3>
                <p className="text-slate-600 mb-4">
                  Nossa IA é constantemente treinada e aprimorada para garantir que cada sugestão seja a melhor possível para você.
                </p>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                    <span>IA treinada com milhares de receitas</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                    <span>Testes contínuos de qualidade</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                    <span>Resultados validados por especialistas</span>
                  </li>
                </ul>
                </div>

              <div className="bg-white rounded-3xl p-8 border-2 border-red-100 hover:border-red-300 hover:shadow-xl transition-all duration-300">
                <div className="w-14 h-14 bg-gradient-to-br from-red-600 to-red-700 rounded-2xl flex items-center justify-center mb-6">
                  <Mail className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-serif text-2xl mb-3 text-slate-900">Canais de Comunicação</h3>
                <p className="text-slate-600 mb-4">
                  Fique à vontade para entrar em contato conosco a qualquer momento. Estamos aqui para ajudar e ouvir suas sugestões.
                </p>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                    <span>Email dedicado para suporte</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                    <span>Feedback sempre bem-vindo</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                    <span>Resposta rápida garantida</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="bg-gradient-to-br from-red-600 to-red-700 rounded-3xl p-10 md:p-12 text-white relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-2xl"></div>
              
              <div className="relative z-10 max-w-4xl mx-auto text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-2xl mb-6">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-serif text-3xl md:text-4xl mb-4">Nossa Promessa para Você</h3>
                <p className="text-white/90 text-lg md:text-xl mb-8 max-w-2xl mx-auto leading-relaxed">
                  Estamos comprometidos em fazer do seu Natal o melhor possível. Se por qualquer razão você não estiver completamente satisfeito, 
                  simplesmente entre em contato conosco e resolveremos juntos. Sua felicidade é nossa prioridade número um.
                </p>
                
                <div className="grid md:grid-cols-3 gap-6 mt-10">
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                    <div className="text-3xl font-bold mb-2">100%</div>
                    <div className="text-white/90">Reembolso Garantido</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                    <div className="text-3xl font-bold mb-2">24h</div>
                    <div className="text-white/90">Tempo de Resposta</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                    <div className="text-3xl font-bold mb-2">∞</div>
                    <div className="text-white/90">Atualizações Vitalícias</div>
                  </div>
                </div>

                <div className="mt-10 pt-8 border-t border-white/20">
                  <p className="text-white/80 text-sm mb-4">
                    Não hesite em nos contatar. Estamos aqui para garantir que você tenha a melhor experiência possível.
                  </p>
                  <div className="flex flex-wrap justify-center gap-4 text-sm">
                    <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Sem complicações</span>
                    </div>
                    <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Processo rápido</span>
                    </div>
                    <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Atendimento humano</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="faq" className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8 bg-red-50/50">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-10 sm:mb-12 md:mb-16">
              <span className="text-red-600 font-semibold tracking-wider text-xs sm:text-sm uppercase">FAQ</span>
              <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl mt-3 mb-4 sm:mb-6 text-slate-900 px-2">Perguntas Frequentes</h2>
            </div>

            <div className="space-y-4">
              {[
                {
                  question: 'O que está incluído no plano?',
                  answer: 'Você recebe acesso completo a todas as funcionalidades com limites mensais que se renovam todo mês: cardápio personalizado, lista de compras automática, cronograma minuto-a-minuto, modo de preparo detalhado, sugestões de presentes com IA, gerador de amigo secreto, mensagens personalizadas de Natal, gestão de restrições alimentares e suporte por email. Os limites variam conforme o plano escolhido.',
                },
                {
                  question: 'Como funciona a sugestão de presentes com IA?',
                  answer: 'Basta descrever a pessoa (idade, gostos, hobbies, interesses) e a IA analisa essas informações para sugerir uma lista personalizada de presentes adequados ao perfil e ao orçamento definido. Quanto mais detalhes você fornecer, melhores serão as sugestões!',
                },
                {
                  question: 'O gerador de amigo secreto é realmente automático?',
                  answer: 'Sim! Você adiciona os participantes, define restrições (como evitar que pessoas da mesma família tirem umas às outras), e a IA faz o sorteio automaticamente. Você pode enviar os resultados por email ou WhatsApp, e tudo fica organizado em um só lugar.',
                },
                {
                  question: 'Como funcionam os planos mensais?',
                  answer: 'Sim, nossos planos são mensais e começam a partir de R$ 19,99/mês. Cada plano tem limites de uso que se renovam todo mês. Você pode cancelar a qualquer momento sem multa ou fidelidade. Os limites são: Básico (3 ceias, 5 presentes, 2 amigo secreto, 10 mensagens), Popular (10 ceias, 20 presentes, 5 amigo secreto, 50 mensagens) e Premium (30 ceias, 100 presentes, 15 amigo secreto, mensagens ilimitadas).',
                },
                {
                  question: 'A IA realmente entende restrições alimentares?',
                  answer: 'Sim! Nossa IA foi treinada com milhares de combinações e entende desde "sem glúten" até "vovó diabética". Ela adapta todo o cardápio, lista de compras e modo de preparo às suas necessidades.',
                },
                {
                  question: 'O modo de preparo é realmente detalhado?',
                  answer: 'Absolutamente! Cada receita inclui passo a passo completo, tempo de preparo, dicas de execução, temperatura do forno, e até quando começar cada prato para servir tudo na hora certa.',
                },
                {
                  question: 'As sugestões de presentes são realmente personalizadas?',
                  answer: 'Absolutamente! Quanto mais informações você fornecer sobre a pessoa (idade, gostos, hobbies, estilo, orçamento), mais precisas serão as sugestões. A IA aprende com cada descrição para recomendar presentes que realmente fazem sentido.',
                },
                {
                  question: 'O gerador de amigo secreto permite restrições?',
                  answer: 'Sim! Você pode definir várias restrições: evitar que pessoas da mesma família tirem umas às outras, definir limites de gastos, evitar duplicatas em rodadas anteriores, e muito mais. A IA garante que todos os sorteios sejam justos e respeitem suas regras.',
                },
                {
                  question: 'Posso usar para outras ocasiões além do Natal?',
                  answer: 'Sim! Embora seja otimizado para Natal, você pode usar para planejar qualquer celebração: jantares especiais, festas familiares, aniversários ou qualquer evento gastronômico. As funcionalidades de presentes e amigo secreto também funcionam para outras ocasiões!',
                },
                {
                  question: 'O que acontece se eu atingir o limite do meu plano?',
                  answer: 'Quando você atingir o limite de alguma funcionalidade, você pode fazer upgrade para um plano superior ou comprar créditos extras. Os limites se renovam automaticamente no início de cada mês. Você sempre será notificado quando estiver próximo do limite.',
                },
                {
                  question: 'Posso mudar de plano a qualquer momento?',
                  answer: 'Sim! Você pode fazer upgrade ou downgrade do seu plano a qualquer momento. Se fizer upgrade, o novo plano entra em vigor imediatamente e você paga a diferença proporcional. Se fizer downgrade, as mudanças entram em vigor no próximo ciclo de cobrança.',
                },
                {
                  question: 'Os limites não utilizados acumulam?',
                  answer: 'Não, os limites são mensais e se renovam todo mês. Isso garante que você sempre tenha acesso às funcionalidades durante sua assinatura. Usos não utilizados não são transferidos para o próximo mês.',
                },
                {
                  question: 'E se eu não gostar?',
                  answer: 'Estamos comprometidos com sua satisfação. Você pode cancelar sua assinatura a qualquer momento sem multa ou fidelidade. Se tiver qualquer problema ou dúvida, nossa equipe de suporte está disponível para ajudar e resolver qualquer questão.',
                },
              ].map((faq, idx) => (
                <details 
                  key={idx} 
                  className="faq-item bg-white rounded-2xl border border-slate-200 hover:border-red-200 hover:shadow-lg transition-all duration-300 group overflow-hidden"
                  style={{ animationDelay: `${idx * 0.05}s` }}
                >
                  <summary className="p-6 cursor-pointer font-semibold text-slate-900 flex items-center justify-between list-none hover:text-red-600 transition-colors duration-300">
                    <span>{faq.question}</span>
                    <span className="text-2xl font-bold text-red-600 transition-all duration-300 ease-out flex-shrink-0 ml-4 transform">
                      <span className="inline-block transition-transform duration-300">+</span>
                    </span>
                  </summary>
                  <div className="faq-content text-slate-600 border-t border-slate-100">
                    <p className="leading-relaxed">{faq.answer}</p>
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Seção final de chamada para ação */}
        <section className="py-16 sm:py-20 md:py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-red-600 to-red-700 relative overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff12_1px,transparent_1px),linear-gradient(to_bottom,#ffffff12_1px,transparent_1px)] bg-[size:24px_24px]"></div>

          <div className="max-w-4xl mx-auto text-center relative z-10">
            <h2 className="font-serif text-4xl sm:text-5xl md:text-6xl text-white mb-6 px-2">
              Pronto para transformar seu Natal?
            </h2>
            <p className="text-white/90 text-lg sm:text-xl mb-8 max-w-2xl mx-auto px-2">
              Mais de 2.000 famílias já usaram o Chefe Natalino para planejar o Natal perfeito. Junte-se a elas e tenha um Natal sem estresse, com tudo organizado e planejado pela IA.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Link href="#precos">
                <Button size="lg" variant="ghost" className="bg-white text-red-600 hover:bg-white/90 text-lg px-10 py-6 font-semibold rounded-xl shadow-2xl">
                  <Sparkles className="w-5 h-5 mr-2" />
                  Ver Planos e Preços
                </Button>
              </Link>
            </div>
            
            <div className="flex flex-wrap justify-center gap-6 text-white/90 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                <span>Teste grátis - Sem cartão</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                <span>100% de garantia</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                <span>Atualizações durante assinatura</span>
              </div>
            </div>
            
            <p className="text-white/70 text-xs mt-8">
              O Natal está chegando. Não deixe para a última hora! Planeje agora e aproveite com tranquilidade.
            </p>
          </div>
        </section>

        <Footer />
      </div>
    </div>
  )
}