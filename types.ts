export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  image?: string; // Base64 string
  timestamp: Date;
  isJson?: boolean;
}

export interface ProjectService {
  tipo: string;
  unidade: string;
  meta_diaria: number;
  total_contrato: number;
}

export interface Project {
  id: string;
  nome: string;
  cliente: string;
  rodovia: string;
  km_inicial: string;
  km_final: string;
  cidade_uf: string;
  servicos: ProjectService[];
}

export interface WorkReport {
  data_servico: string;
  nome_obra: string;
  cliente: string;
  rodovia: string;
  km: string;
  cidade_uf: string;
  responsavel_equipe: string;
  colaboradores: string[];
  tipo_servico_planejado: string;
  tipo_servico_executado: string;
  metragem_executada: string; // Valor numérico em string ou texto
  unidade_metragem: string;
  hora_inicio: string;
  hora_fim: string;
  tempo_total_horas: string;
  status_dia: string;
  link_foto_inicio: string;
  link_foto_fim: string;
  paralisacoes_problemas: string;
  observacoes: string;
  latitude?: string;
  longitude?: string;
  link_mapa?: string;
  // Novos campos para controle de meta
  meta_diaria_definida?: string;
  percentual_atingido?: string;
}

export enum AppView {
  CHAT = 'CHAT',
  REPORT = 'REPORT'
}