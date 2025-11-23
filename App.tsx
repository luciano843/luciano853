import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { ReportCard } from './components/ReportCard';
import { initializeChat, sendMessageToGemini, extractJsonFromResponse } from './services/geminiService';
import { Message, WorkReport, AppView } from './types';

// Default empty report state
const initialReport: WorkReport = {
  data_servico: "",
  nome_obra: "",
  cliente: "",
  rodovia: "",
  km: "",
  cidade_uf: "",
  responsavel_equipe: "",
  colaboradores: [],
  tipo_servico_planejado: "",
  tipo_servico_executado: "",
  metragem_executada: "",
  unidade_metragem: "",
  hora_inicio: "",
  hora_fim: "",
  tempo_total_horas: "",
  status_dia: "EM ABERTO",
  link_foto_inicio: "",
  link_foto_fim: "",
  paralisacoes_problemas: "",
  observacoes: "",
  latitude: "",
  longitude: "",
  link_mapa: "",
  meta_diaria_definida: "",
  percentual_atingido: ""
};

export default function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [report, setReport] = useState<WorkReport>(initialReport);
  const [activeView, setActiveView] = useState<AppView>(AppView.CHAT);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize Chat on Mount
  useEffect(() => {
    startNewSession();
  }, []);

  // Scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const startNewSession = async () => {
    setMessages([]);
    setReport(initialReport);
    setIsLoading(true);
    try {
      initializeChat();
      // We don't send an initial message to Gemini, we wait for the user.
      const welcomeMsg: Message = {
        id: 'welcome',
        role: 'model',
        text: 'Olá! Sou o Medidor LSS. Vamos iniciar o registro da obra de hoje? Por favor, me informe onde você vai trabalhar ou envie sua localização.',
        timestamp: new Date()
      };
      setMessages([welcomeMsg]);
    } catch (error) {
      console.error("Error starting session", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (overrideText?: string) => {
    const textToSend = overrideText || inputValue;
    if ((!textToSend.trim() && !selectedImage) || isLoading) return;

    const userText = textToSend;
    const userImage = selectedImage;
    
    // Clear inputs immediately
    setInputValue('');
    setSelectedImage(null);

    // Add User Message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: userText,
      image: userImage || undefined,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const responseText = await sendMessageToGemini(userText, userImage || undefined);
      
      if (responseText) {
        // Check for JSON data
        const extractedData = extractJsonFromResponse(responseText);
        const isJson = !!extractedData;

        // If JSON is found, update the report
        if (extractedData) {
          setReport(prev => ({ ...prev, ...extractedData }));
          // If completed, maybe switch view or show notification
          if (extractedData.status_dia === "CONCLUÍDO") {
             setActiveView(AppView.REPORT);
          }
        }

        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'model',
          text: isJson ? "Registro atualizado com sucesso! Veja o painel ao lado (ou clique na aba Relatório)." : responseText,
          timestamp: new Date(),
          isJson
        };
        setMessages(prev => [...prev, aiMessage]);
      }
    } catch (error) {
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: "Desculpe, tive um problema de conexão. Tente novamente.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocalização não é suportada pelo seu navegador.');
      return;
    }

    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const long = position.coords.longitude;
        const locationUrl = `https://www.google.com/maps?q=${lat},${long}`;
        const message = `Minha localização atual: ${locationUrl}\n(Lat: ${lat}, Long: ${long})`;
        setIsGettingLocation(false);
        handleSendMessage(message);
      },
      (error) => {
        console.error("Error getting location", error);
        alert('Erro ao obter localização. Verifique as permissões.');
        setIsGettingLocation(false);
      }
    );
  };

  return (
    <div className="flex flex-col h-full bg-slate-100">
      <Header onReset={startNewSession} />

      {/* Mobile Tab Navigation */}
      <div className="md:hidden flex border-b border-slate-200 bg-white">
        <button 
          onClick={() => setActiveView(AppView.CHAT)}
          className={`flex-1 py-3 text-sm font-semibold ${activeView === AppView.CHAT ? 'text-orange-600 border-b-2 border-orange-600' : 'text-slate-500'}`}
        >
          Chat
        </button>
        <button 
          onClick={() => setActiveView(AppView.REPORT)}
          className={`flex-1 py-3 text-sm font-semibold ${activeView === AppView.REPORT ? 'text-orange-600 border-b-2 border-orange-600' : 'text-slate-500'}`}
        >
          Relatório
        </button>
      </div>

      <main className="flex-1 overflow-hidden relative max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 h-full md:gap-6 md:p-6">
          
          {/* Chat Column */}
          <section className={`md:col-span-2 flex flex-col h-full bg-white md:rounded-2xl shadow-sm overflow-hidden ${activeView === AppView.CHAT ? 'block' : 'hidden md:flex'}`}>
            
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide bg-[url('https://www.transparenttextures.com/patterns/subtle-white-feathers.png')]">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] md:max-w-[70%] p-3 rounded-2xl shadow-sm ${
                    msg.role === 'user' 
                      ? 'bg-orange-600 text-white rounded-tr-none' 
                      : 'bg-white border border-slate-100 text-slate-800 rounded-tl-none'
                  }`}>
                    {msg.image && (
                      <img src={msg.image} alt="Upload" className="rounded-lg mb-2 max-h-48 object-cover" />
                    )}
                    <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.text}</p>
                    <span className={`text-[10px] mt-1 block opacity-70 ${msg.role === 'user' ? 'text-orange-100' : 'text-slate-400'}`}>
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start w-full">
                   <div className="bg-white border border-slate-100 p-3 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2">
                     <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
                     <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-100"></span>
                     <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-200"></span>
                   </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-3 bg-slate-50 border-t border-slate-200">
               {selectedImage && (
                  <div className="mb-2 relative inline-block">
                    <img src={selectedImage} alt="Preview" className="h-16 w-16 object-cover rounded-lg border border-slate-300" />
                    <button 
                      onClick={() => setSelectedImage(null)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600 shadow-sm"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                        <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                      </svg>
                    </button>
                  </div>
               )}
              <div className="flex items-center gap-2">
                <button 
                  onClick={handleGetLocation}
                  disabled={isLoading || isGettingLocation}
                  className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                  title="Enviar localização atual"
                >
                   {isGettingLocation ? (
                     <svg className="animate-spin w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                       <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                       <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                     </svg>
                   ) : (
                     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                       <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                       <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                     </svg>
                   )}
                </button>

                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 text-slate-500 hover:text-orange-600 hover:bg-orange-50 rounded-full transition-colors"
                  title="Adicionar foto"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
                  </svg>
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </button>
                
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Digite uma mensagem..."
                  className="flex-1 bg-white border border-slate-300 text-slate-900 text-sm rounded-full focus:ring-orange-500 focus:border-orange-500 block w-full p-2.5 pl-4 outline-none"
                  disabled={isLoading}
                />
                
                <button 
                  onClick={() => handleSendMessage()}
                  disabled={(!inputValue.trim() && !selectedImage) || isLoading}
                  className="p-2 bg-orange-600 hover:bg-orange-700 disabled:bg-slate-300 text-white rounded-full transition-colors shadow-sm"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 transform rotate-0 pl-0.5">
                    <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
                  </svg>
                </button>
              </div>
            </div>
          </section>

          {/* Dashboard/Report Column */}
          <section className={`md:col-span-1 h-full overflow-hidden ${activeView === AppView.REPORT ? 'block h-[calc(100vh-120px)] p-4' : 'hidden md:block'}`}>
            <ReportCard report={report} />
          </section>
        </div>
      </main>
    </div>
  );
}