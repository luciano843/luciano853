import { Project } from "../types";

// Estes dados simulam a importação da planilha da empresa.
// O encarregado não precisa decorar, a IA vai buscar aqui.
export const ACTIVE_PROJECTS: Project[] = [
  {
    id: "OB-001",
    nome: "Castelo Branco - Km 34",
    cliente: "CCR ViaOeste",
    rodovia: "SP-280",
    km_inicial: "32",
    km_final: "36",
    cidade_uf: "Itapevi - SP",
    servicos: [
      { tipo: "Defensa Metálica H1 - Implantação", unidade: "m", meta_diaria: 200, total_contrato: 5000 },
      { tipo: "Remoção de Defensa", unidade: "m", meta_diaria: 300, total_contrato: 5000 },
      { tipo: "Terminal Absorvedor de Energia", unidade: "unid", meta_diaria: 2, total_contrato: 20 }
    ]
  },
  {
    id: "OB-002",
    nome: "Rodoanel Norte - Lote 2",
    cliente: "SPMAR",
    rodovia: "SP-021",
    km_inicial: "10",
    km_final: "15",
    cidade_uf: "São Paulo - SP",
    servicos: [
      { tipo: "Instalação de Placas de Sinalização", unidade: "m2", meta_diaria: 15, total_contrato: 500 },
      { tipo: "Barreira New Jersey", unidade: "m", meta_diaria: 80, total_contrato: 2000 }
    ]
  },
  {
    id: "OB-003",
    nome: "Raposo Tavares - Recuperação",
    cliente: "DER-SP",
    rodovia: "SP-270",
    km_inicial: "45",
    km_final: "60",
    cidade_uf: "São Roque - SP",
    servicos: [
      { tipo: "Roçada Manual", unidade: "m2", meta_diaria: 1500, total_contrato: 50000 },
      { tipo: "Limpeza de Drenagem", unidade: "m", meta_diaria: 400, total_contrato: 10000 }
    ]
  }
];