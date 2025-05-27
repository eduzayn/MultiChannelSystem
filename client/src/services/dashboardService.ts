import { api } from '@/lib/api';
import { Dashboard, DashboardWidget, KpiValue } from '@/types/dashboard';

class DashboardService {
  /**
   * Busca todos os dashboards do usuário
   */
  async getDashboards(includePublic: boolean = true): Promise<Dashboard[]> {
    const response = await api.get('/api/dashboards', {
      params: { isPublic: includePublic }
    });
    return response.data;
  }

  /**
   * Busca um dashboard específico com seus widgets
   */
  async getDashboardById(id: number): Promise<Dashboard> {
    const response = await api.get(`/api/dashboards/${id}`);
    return response.data;
  }

  /**
   * Cria um novo dashboard
   */
  async createDashboard(dashboard: Partial<Dashboard>): Promise<Dashboard> {
    const response = await api.post('/api/dashboards', dashboard);
    return response.data;
  }

  /**
   * Atualiza um dashboard existente
   */
  async updateDashboard(id: number, dashboard: Partial<Dashboard>): Promise<Dashboard> {
    const response = await api.put(`/api/dashboards/${id}`, dashboard);
    return response.data;
  }

  /**
   * Exclui um dashboard
   */
  async deleteDashboard(id: number): Promise<void> {
    await api.delete(`/api/dashboards/${id}`);
  }

  /**
   * Adiciona um widget ao dashboard
   */
  async addWidget(dashboardId: number, widget: Partial<DashboardWidget>): Promise<DashboardWidget> {
    const response = await api.post(`/api/dashboards/${dashboardId}/widgets`, widget);
    return response.data;
  }

  /**
   * Atualiza um widget existente
   */
  async updateWidget(dashboardId: number, widgetId: number, widget: Partial<DashboardWidget>): Promise<DashboardWidget> {
    const response = await api.put(`/api/dashboards/${dashboardId}/widgets/${widgetId}`, widget);
    return response.data;
  }

  /**
   * Remove um widget do dashboard
   */
  async removeWidget(dashboardId: number, widgetId: number): Promise<void> {
    await api.delete(`/api/dashboards/${dashboardId}/widgets/${widgetId}`);
  }

  /**
   * Atualiza a posição dos widgets no dashboard
   */
  async updateWidgetPositions(dashboardId: number, positions: { id: number; position: { x: number; y: number; w: number; h: number } }[]): Promise<void> {
    await api.put(`/api/dashboards/${dashboardId}/widget-positions`, { positions });
  }

  /**
   * Busca valores de KPI para um widget
   */
  async getKpiValues(kpiId: number, options: {
    periodType?: string;
    limit?: number;
    from?: Date;
    to?: Date;
  }): Promise<KpiValue[]> {
    const response = await api.get(`/api/kpis/${kpiId}/values`, { params: options });
    return response.data;
  }

  /**
   * Busca dados agregados para um período
   */
  async getAggregatedData(options: {
    metrics: string[];
    groupBy: string;
    from: Date;
    to: Date;
  }): Promise<any> {
    const response = await api.get('/api/dashboards/aggregate', { params: options });
    return response.data;
  }

  /**
   * Exporta um dashboard como PDF
   */
  async exportDashboard(dashboardId: number, format: 'pdf' | 'excel' = 'pdf'): Promise<Blob> {
    const response = await api.get(`/api/dashboards/${dashboardId}/export`, {
      params: { format },
      responseType: 'blob'
    });
    return response.data;
  }
}

export const dashboardService = new DashboardService(); 