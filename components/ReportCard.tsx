import React from 'react';
import { WorkReport } from '../types';
import { REPORT_EMAIL } from '../constants';

interface ReportCardProps {
  report: WorkReport;
}

export const ReportCard: React.FC<ReportCardProps> = ({ report }) => {
  const isComplete = report.status_dia === 'CONCLUÍDO';
  
  // Helper para calcular cor da meta
  const getMetaColor = (percentStr?: string) => {
    if (!percentStr) return 'bg-slate-200';
    const val = parseInt(percentStr.replace('%', ''));
    if (isNaN(val)) return 'bg-slate-200';
    if (val >= 100) return 'bg-green-500';
    if (val >= 80) return 'bg-blue-500';
    if (val >= 50) return 'bg-yellow-400';
    return 'bg-red-500';
  };

  const metaColor = getMetaColor(report.percentual_atingido);
  const percentVal = report.percentual_atingido ? parseInt(report.percentual_atingido.replace('%', '')) : 0;

  const handleSendEmail = () => {
    const subject = encodeURIComponent(`Relatório Diário de Obra - ${report.nome_obra || 'Sem Nome'} - ${report.data_servico}`);
    
    const bodyContent = `
RELATÓRIO DE OBRA - LSS ENGENHARIA

--- DADOS GERAIS ---
OBRA: ${report.nome_obra || '-'}
DATA: ${report.data_servico || '-'}
CLIENTE: ${report.cliente || '-'}
RODOVIA: ${report.rodovia || '-'} ${report.km ? `- KM ${report.km}` : ''}
CIDADE/UF: ${report.cidade_uf || '-'}

--- EQUIPE ---
RESPONSÁVEL: ${report.responsavel_equipe || '-'}
COLABORADORES: ${report.colaboradores?.length ? report.colaboradores.join(', ') : '-'}

--- PRODUÇÃO E META ---
SERVIÇO: ${report.tipo_servico_executado || '-'}
EXECUTADO: ${report.metragem_executada || '0'} ${report.unidade_metragem || ''}
META DIÁRIA: ${report.meta_diaria_definida || 'Não definida'}
PERFORMANCE: ${report.percentual_atingido || '-'}

--- TEMPO ---
HORÁRIO: ${report.hora_inicio || '?'} às ${report.hora_fim || '?'} (${report.tempo_total_horas || '0'}h)

--- OCORRÊNCIAS E OBSERVAÇÕES ---
${report.paralisacoes_problemas ? `[PROBLEMAS]: ${report.paralisacoes_problemas}` : '[PROBLEMAS]: Nenhuma'}
${report.observacoes ? `[OBS]: ${report.observacoes}` : '[OBS]: Nenhuma'}

--- LOCALIZAÇÃO ---
${report.link_mapa || (report.latitude ? `GPS: ${report.latitude}, ${report.longitude}` : 'Não informada')}
    `.trim();

    const body = encodeURIComponent(bodyContent);
    window.open(`mailto:${REPORT_EMAIL}?subject=${subject}&body=${body}`);
  };

  const handleExportJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(report, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `relatorio_${report.nome_obra || 'obra'}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden h-full flex flex-col">
      <div className={`p-4 border-b ${isComplete ? 'bg-green-50 border-green-100' : 'bg-yellow-50 border-yellow-100'} flex justify-between items-center`}>
        <h2 className="font-bold text-slate-800">Relatório da Frente</h2>
        <span className={`px-3 py-1 rounded-full text-xs font-bold ${isComplete ? 'bg-green-500 text-white' : 'bg-yellow-400 text-yellow-900'}`}>
          {report.status_dia || 'EM ABERTO'}
        </span>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase">Obra / Contrato</label>
            <p className="text-sm font-medium text-slate-800 border-b border-slate-100 pb-1 min-h-[1.5rem]">
              {report.nome_obra || '-'}
            </p>
          </div>
          <div className="space-y-1">
             <label className="text-xs font-bold text-slate-400 uppercase">Data</label>
            <p className="text-sm font-medium text-slate-800 border-b border-slate-100 pb-1 min-h-[1.5rem]">
              {report.data_servico || '-'}
            </p>
          </div>
          <div className="space-y-1">
             <label className="text-xs font-bold text-slate-400 uppercase">Cliente</label>
            <p className="text-sm font-medium text-slate-800 border-b border-slate-100 pb-1 min-h-[1.5rem]">
              {report.cliente || '-'}
            </p>
          </div>
           <div className="space-y-1">
             <label className="text-xs font-bold text-slate-400 uppercase">Rodovia / Km</label>
            <p className="text-sm font-medium text-slate-800 border-b border-slate-100 pb-1 min-h-[1.5rem]">
              {report.rodovia} {report.km ? `- ${report.km}` : ''}
            </p>
          </div>
        </div>
        
        {/* Location / Maps Link */}
        {(report.link_mapa || (report.latitude && report.longitude)) && (
           <div className="bg-blue-50 p-3 rounded border border-blue-100 flex items-center gap-3">
              <div className="bg-blue-200 p-2 rounded-full text-blue-700">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                  <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1 overflow-hidden">
                <label className="text-xs font-bold text-blue-700 uppercase block">Localização GPS</label>
                {report.link_mapa ? (
                  <a href={report.link_mapa} target="_blank" rel="noreferrer" className="text-xs text-blue-600 underline truncate block hover:text-blue-800">
                    Abrir no Google Maps
                  </a>
                ) : (
                   <span className="text-xs text-blue-900">{report.latitude}, {report.longitude}</span>
                )}
              </div>
           </div>
        )}

        {/* Service & Targets */}
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 relative overflow-hidden">
          <h3 className="text-sm font-bold text-slate-700 mb-3 relative z-10">Produção Diária</h3>
          
          <div className="space-y-4 relative z-10">
            <div>
              <span className="text-xs text-slate-500 block">Serviço Executado:</span>
              <span className="text-sm text-slate-800 font-medium">{report.tipo_servico_executado || '-'}</span>
            </div>
            
            <div className="flex justify-between items-end border-b border-slate-200 pb-2">
              <div>
                 <span className="text-xs text-slate-500 block">Realizado</span>
                 <span className="text-xl font-bold text-slate-900">
                   {report.metragem_executada || '0'} <span className="text-sm font-normal text-slate-500">{report.unidade_metragem}</span>
                 </span>
              </div>
              <div className="text-right">
                 <span className="text-xs text-slate-500 block">Meta Diária</span>
                 <span className="text-sm font-bold text-slate-600">
                   {report.meta_diaria_definida || '-'}
                 </span>
              </div>
            </div>

            {/* Progress Bar */}
            {report.meta_diaria_definida && (
                <div>
                    <div className="flex justify-between text-xs mb-1">
                        <span className="font-bold text-slate-600">Atingimento</span>
                        <span className={`font-bold ${percentVal >= 100 ? 'text-green-600' : percentVal < 50 ? 'text-red-600' : 'text-blue-600'}`}>
                            {report.percentual_atingido || '0%'}
                        </span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2.5">
                        <div 
                            className={`h-2.5 rounded-full transition-all duration-500 ${metaColor}`} 
                            style={{ width: `${Math.min(percentVal, 100)}%` }}
                        ></div>
                    </div>
                    {percentVal < 80 && percentVal > 0 && (
                        <p className="text-[10px] text-red-500 mt-1 font-medium">Atenção: Produção abaixo do esperado.</p>
                    )}
                </div>
            )}

            <div className="pt-1">
                 <span className="text-xs text-slate-500 block">Horas Trabalhadas:</span>
                 <span className="text-sm font-bold text-slate-900">
                   {report.tempo_total_horas || '0'}h
                 </span>
            </div>
          </div>
        </div>

        {/* Team */}
        <div>
            <h3 className="text-sm font-bold text-slate-700 mb-2">Equipe</h3>
            <div className="text-sm text-slate-600 bg-slate-50 p-3 rounded border border-slate-100">
                <p><strong className="text-slate-800">Resp:</strong> {report.responsavel_equipe || '-'}</p>
                <div className="mt-2">
                    <strong className="text-slate-800 block mb-1">Colaboradores:</strong>
                    <ul className="list-disc list-inside pl-1">
                        {report.colaboradores?.length > 0 ? report.colaboradores.map((c, i) => (
                            <li key={i}>{c}</li>
                        )) : <span className="text-slate-400 italic">Nenhum registrado</span>}
                    </ul>
                </div>
            </div>
        </div>

        {/* Logs */}
        {(report.paralisacoes_problemas || report.observacoes) && (
            <div className="space-y-3">
                {report.paralisacoes_problemas && (
                    <div className="bg-red-50 p-3 rounded border border-red-100">
                        <h4 className="text-xs font-bold text-red-700 uppercase mb-1">Paralisações / Problemas</h4>
                        <p className="text-sm text-red-900">{report.paralisacoes_problemas}</p>
                    </div>
                )}
                {report.observacoes && (
                    <div className="bg-blue-50 p-3 rounded border border-blue-100">
                        <h4 className="text-xs font-bold text-blue-700 uppercase mb-1">Observações</h4>
                        <p className="text-sm text-blue-900">{report.observacoes}</p>
                    </div>
                )}
            </div>
        )}
      </div>
      
      {/* Footer Action */}
      <div className="p-4 border-t bg-slate-50 space-y-3">
        <button 
            onClick={handleSendEmail}
            disabled={!report.nome_obra}
            className="w-full bg-orange-600 hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded flex items-center justify-center gap-2 transition-colors shadow-sm"
        >
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
            </svg>
            Enviar por E-mail
        </button>

        <button 
            onClick={handleExportJson}
            disabled={!report.nome_obra}
            className="w-full bg-white hover:bg-slate-50 border border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed text-slate-700 font-medium py-2 px-4 rounded flex items-center justify-center gap-2 transition-colors text-sm"
        >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            Baixar JSON
        </button>
      </div>
    </div>
  );
};