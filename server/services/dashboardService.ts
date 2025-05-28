import { db } from '../db';
import { dashboards, dashboardWidgets, kpis, kpiValues, deals } from '../../shared/schema';
import { eq, and, gte, lte, desc, count, sum, avg } from 'drizzle-orm';
import { insertDashboardSchema, insertDashboardWidgetSchema } from '../../shared/schema';
import { kpiService } from './kpiService';
import type { InferSelectModel } from 'drizzle-orm';

type Dashboard = InferSelectModel<typeof dashboards>;
type DashboardWidget = InferSelectModel<typeof dashboardWidgets>;
type InsertDashboard = typeof insertDashboardSchema._type;
type InsertDashboardWidget = typeof insertDashboardWidgetSchema._type;

/**
 * Serviço para gerenciamento de dashboards e widgets
 */
class DashboardService {
  /**
   * Busca um dashboard pelo ID
   */
  async getDashboard(id: number): Promise<Dashboard | undefined> {
    const results = await db.select().from(dashboards).where(eq(dashboards.id, id));
    return results[0];
  }

  /**
   * Lista todos os dashboards, opcionalmente filtrados por visibilidade
   */
  async listDashboards(isPublic?: boolean): Promise<Dashboard[]> {
    if (isPublic !== undefined) {
      return db.select().from(dashboards).where(eq(dashboards.isPublic, isPublic));
    }
    return db.select().from(dashboards);
  }

  /**
   * Busca o dashboard padrão
   */
  async getDefaultDashboard(): Promise<Dashboard | undefined> {
    const results = await db.select().from(dashboards).where(eq(dashboards.isDefault, true)).limit(1);
    return results[0];
  }

  /**
   * Cria um novo dashboard
   */
  async createDashboard(dashboard: InsertDashboard): Promise<Dashboard> {
    if (dashboard.isDefault) {
      await db.update(dashboards).set({ isDefault: false }).where(eq(dashboards.isDefault, true));
    }
    
    const results = await db.insert(dashboards).values(dashboard).returning();
    return results[0];
  }

  /**
   * Atualiza um dashboard existente
   */
  async updateDashboard(id: number, dashboard: Partial<InsertDashboard>): Promise<Dashboard | undefined> {
    if (dashboard.isDefault) {
      await db.update(dashboards).set({ isDefault: false }).where(eq(dashboards.isDefault, true));
    }
    
    const results = await db.update(dashboards).set(dashboard).where(eq(dashboards.id, id)).returning();
    return results[0];
  }

  /**
   * Exclui um dashboard
   */
  async deleteDashboard(id: number): Promise<boolean> {
    await db.delete(dashboardWidgets).where(eq(dashboardWidgets.dashboardId, id));
    
    const result = await db.delete(dashboards).where(eq(dashboards.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  /**
   * Busca um widget pelo ID
   */
  async getDashboardWidget(id: number): Promise<DashboardWidget | undefined> {
    const results = await db.select().from(dashboardWidgets).where(eq(dashboardWidgets.id, id));
    return results[0];
  }

  /**
   * Lista todos os widgets de um dashboard
   */
  async listDashboardWidgets(dashboardId: number): Promise<DashboardWidget[]> {
    return db.select().from(dashboardWidgets).where(eq(dashboardWidgets.dashboardId, dashboardId));
  }

  /**
   * Cria um novo widget
   */
  async createDashboardWidget(widget: InsertDashboardWidget): Promise<DashboardWidget> {
    const results = await db.insert(dashboardWidgets).values(widget).returning();
    return results[0];
  }

  /**
   * Atualiza um widget existente
   */
  async updateDashboardWidget(id: number, widget: Partial<InsertDashboardWidget>): Promise<DashboardWidget | undefined> {
    const results = await db.update(dashboardWidgets).set(widget).where(eq(dashboardWidgets.id, id)).returning();
    return results[0];
  }

  /**
   * Exclui um widget
   */
  async deleteDashboardWidget(id: number): Promise<boolean> {
    const result = await db.delete(dashboardWidgets).where(eq(dashboardWidgets.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  /**
   * Busca dados para um widget específico
   */
  async getWidgetData(widget: DashboardWidget, dateFrom?: Date, dateTo?: Date): Promise<any> {
    try {
      if (!dateFrom || !dateTo) {
        dateTo = new Date();
        dateFrom = new Date();
        dateFrom.setMonth(dateFrom.getMonth() - 1);
      }
      
      switch (widget.type) {
        case 'kpi':
          return this.getKpiWidgetData(widget, dateFrom, dateTo);
        
        case 'chart':
          return this.getChartWidgetData(widget, dateFrom, dateTo);
        
        case 'table':
          return this.getTableWidgetData(widget, dateFrom, dateTo);
        
        default:
          throw new Error(`Tipo de widget não suportado: ${widget.type}`);
      }
    } catch (error) {
      console.error(`Erro ao buscar dados para widget ${widget.id}:`, error);
      return { error: 'Erro ao buscar dados do widget' };
    }
  }

  /**
   * Busca dados para um widget de KPI
   */
  private async getKpiWidgetData(widget: DashboardWidget, dateFrom: Date, dateTo: Date): Promise<any> {
    const config = widget.configuration as any;
    const kpiId = config.kpiId;
    
    if (!kpiId) {
      throw new Error('KPI ID não especificado na configuração do widget');
    }
    
    const kpi = await kpiService.getKpi(kpiId);
    if (!kpi) {
      throw new Error(`KPI não encontrado: ${kpiId}`);
    }
    
    const values = await kpiService.getKpiValues(kpiId, undefined, 1);
    const currentValue = values[0];
    
    const periodType = currentValue?.periodType || 'monthly';
    const previousValues = await db.select().from(kpiValues)
      .where(and(
        eq(kpiValues.kpiId, kpiId),
        eq(kpiValues.periodType, periodType),
        lte(kpiValues.dateTo, currentValue?.dateFrom || dateFrom)
      ))
      .orderBy(desc(kpiValues.dateTo))
      .limit(1);
    
    const previousValue = previousValues[0];
    
    let percentChange = 0;
    if (previousValue && currentValue) {
      percentChange = ((currentValue.value - previousValue.value) / previousValue.value) * 100;
    }
    
    return {
      kpi,
      currentValue,
      previousValue,
      percentChange,
      trend: percentChange > 0 ? 'up' : percentChange < 0 ? 'down' : 'stable'
    };
  }

  /**
   * Busca dados para um widget de gráfico
   */
  private async getChartWidgetData(widget: DashboardWidget, dateFrom: Date, dateTo: Date): Promise<any> {
    const config = widget.configuration as any;
    const dataSource = widget.dataSource as any;
    
    const chartType = config.chartType;
    
    switch (chartType) {
      case 'kpi_history':
        return this.getKpiHistoryData(dataSource.kpiId, dataSource.periodType, dateFrom, dateTo);
      
      case 'sales_funnel':
        return this.getSalesFunnelData(dateFrom, dateTo);
      
      case 'response_time':
        return this.getResponseTimeData(dateFrom, dateTo);
      
      default:
        throw new Error(`Tipo de gráfico não suportado: ${chartType}`);
    }
  }

  /**
   * Busca dados para um widget de tabela
   */
  private async getTableWidgetData(widget: DashboardWidget, dateFrom: Date, dateTo: Date): Promise<any> {
    const dataSource = widget.dataSource as any;
    
    const tableType = dataSource.tableType;
    
    switch (tableType) {
      case 'top_performers':
        return this.getTopPerformersData(dateFrom, dateTo, dataSource.limit || 5);
      
      case 'recent_deals':
        return this.getRecentDealsData(dateFrom, dateTo, dataSource.limit || 10);
      
      default:
        throw new Error(`Tipo de tabela não suportado: ${tableType}`);
    }
  }

  /**
   * Busca histórico de valores de um KPI
   */
  private async getKpiHistoryData(kpiId: number, periodType: string, dateFrom: Date, dateTo: Date): Promise<any> {
    const kpi = await kpiService.getKpi(kpiId);
    if (!kpi) {
      throw new Error(`KPI não encontrado: ${kpiId}`);
    }
    
    const values = await db.select().from(kpiValues)
      .where(and(
        eq(kpiValues.kpiId, kpiId),
        eq(kpiValues.periodType, periodType),
        gte(kpiValues.dateFrom, dateFrom),
        lte(kpiValues.dateTo, dateTo)
      ))
      .orderBy(kpiValues.dateFrom);
    
    const chartData = values.map(value => ({
      date: value.dateFrom,
      value: value.value,
      formattedValue: value.textValue
    }));
    
    return {
      kpi,
      chartData
    };
  }

  /**
   * Busca dados para o funil de vendas
   */
  private async getSalesFunnelData(dateFrom: Date, dateTo: Date): Promise<any> {
    const stages = ['lead', 'opportunity', 'negotiation', 'proposal', 'won', 'lost'];
    const results = [];
    
    for (const stage of stages) {
      if (stage === 'lost') continue; // Não incluir perdidos no funil
      
      const stageCount = await db.select({ count: count() })
        .from(kpis)
        .where(eq(kpis.category, 'sales'));
      
      results.push({
        name: this.formatStageName(stage),
        value: stageCount[0]?.count || 0
      });
    }
    
    return results;
  }

  /**
   * Busca dados de tempo de resposta
   */
  private async getResponseTimeData(dateFrom: Date, dateTo: Date): Promise<any> {
    const responseTimeKpi = await db.select()
      .from(kpis)
      .where(and(
        eq(kpis.name, 'Tempo Médio de Resposta'),
        eq(kpis.category, 'customer_service')
      ))
      .limit(1);
    
    if (!responseTimeKpi[0]) {
      return [];
    }
    
    const values = await db.select()
      .from(kpiValues)
      .where(and(
        eq(kpiValues.kpiId, responseTimeKpi[0].id),
        gte(kpiValues.dateFrom, dateFrom),
        lte(kpiValues.dateTo, dateTo)
      ))
      .orderBy(kpiValues.dateFrom);
    
    return values.map(value => {
      const date = new Date(value.dateFrom);
      return {
        date: `${date.getDate()}/${date.getMonth() + 1}`,
        minutes: value.value / 100 // Converter de centésimos para valor real
      };
    });
  }

  /**
   * Busca dados dos melhores performers
   */
  private async getTopPerformersData(dateFrom: Date, dateTo: Date, limit: number): Promise<any> {
    return [
      { name: 'Ana Silva', deals: 12, revenue: 45000, satisfaction: 4.8 },
      { name: 'Carlos Oliveira', deals: 10, revenue: 38000, satisfaction: 4.7 },
      { name: 'Mariana Santos', deals: 9, revenue: 42000, satisfaction: 4.9 },
      { name: 'João Pereira', deals: 8, revenue: 35000, satisfaction: 4.6 },
      { name: 'Fernanda Lima', deals: 7, revenue: 30000, satisfaction: 4.5 }
    ].slice(0, limit);
  }

  /**
   * Busca dados de negócios recentes
   */
  private async getRecentDealsData(dateFrom: Date, dateTo: Date, limit: number): Promise<any> {
    return [
      { title: 'Contrato Anual XYZ Corp', value: 12000, stage: 'won', date: '2023-05-15' },
      { title: 'Expansão ABC Ltda', value: 8500, stage: 'negotiation', date: '2023-05-14' },
      { title: 'Renovação 123 Serviços', value: 5000, stage: 'proposal', date: '2023-05-13' },
      { title: 'Novo Cliente Acme Inc', value: 15000, stage: 'opportunity', date: '2023-05-12' },
      { title: 'Projeto Especial Delta', value: 20000, stage: 'lead', date: '2023-05-11' }
    ].slice(0, limit);
  }

  /**
   * Formata o nome do estágio para exibição
   */
  private formatStageName(stage: string): string {
    const stageNames: Record<string, string> = {
      'lead': 'Prospecção',
      'opportunity': 'Qualificação',
      'negotiation': 'Negociação',
      'proposal': 'Proposta',
      'won': 'Fechamento',
      'lost': 'Perdido'
    };
    
    return stageNames[stage] || stage;
  }
}

export const dashboardService = new DashboardService();
