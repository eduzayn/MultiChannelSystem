import { db } from '../db';
import { dashboards, dashboardWidgets, kpis, kpiValues, deals } from '../../shared/schema';
import { eq, and, gte, lte, desc, count, sum, avg, asc } from 'drizzle-orm';
import { insertDashboardSchema, insertDashboardWidgetSchema } from '../../shared/schema';
import { kpiService } from './kpiService';
import type { InferSelectModel } from 'drizzle-orm';
import { sql } from 'drizzle-orm';
import { messages } from '../../shared/schema';
import type { SQL } from 'drizzle-orm';

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
        
        case 'map':
          return this.getMapWidgetData(widget, dateFrom, dateTo);
        
        case 'heatmap':
          return this.getHeatmapWidgetData(widget, dateFrom, dateTo);
        
        case 'gauge':
          return this.getGaugeWidgetData(widget, dateFrom, dateTo);
        
        case 'timeline':
          return this.getTimelineWidgetData(widget, dateFrom, dateTo);
        
        case 'funnel':
          return this.getFunnelWidgetData(widget, dateFrom, dateTo);
        
        case 'kanban':
          return this.getKanbanWidgetData(widget, dateFrom, dateTo);
        
        case 'custom':
          return this.getCustomWidgetData(widget, dateFrom, dateTo);
        
        case 'indicator':
          return this.getIndicatorWidgetData(widget, dateFrom, dateTo);
        
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
    const chartType = config.chartType || 'line';
    const metric = config.metric || 'messages';
    const groupBy = config.groupBy || 'day';
    const aggregation = config.aggregation || 'count';

    let data;
    switch (metric) {
      case 'messages':
        data = await this.getMessageChartData(dateFrom, dateTo, groupBy, aggregation);
        break;
      
      case 'deals':
        data = await this.getDealChartData(dateFrom, dateTo, groupBy, aggregation);
        break;
      
      case 'response_time':
        data = await this.getResponseTimeChartData(dateFrom, dateTo, groupBy);
        break;
      
      case 'sales_by_source':
        data = await this.getSalesBySourceChartData(dateFrom, dateTo, groupBy);
        break;
      
      case 'sales_by_region':
        data = await this.getSalesByRegionChartData(dateFrom, dateTo, groupBy);
        break;
      
      case 'team_performance':
        data = await this.getTeamPerformanceChartData(dateFrom, dateTo, groupBy);
        break;
      
      case 'conversion_rate':
        data = await this.getConversionRateChartData(dateFrom, dateTo, groupBy);
        break;
      
      case 'sales_funnel':
        data = await this.getSalesFunnelChartData(dateFrom, dateTo, groupBy);
        break;
      
      case 'activity_timeline':
        data = await this.getActivityTimelineChartData(dateFrom, dateTo, groupBy);
        break;
      
      default:
        throw new Error(`Métrica não suportada para gráfico: ${metric}`);
    }

    return {
      type: chartType,
      data,
      config: {
        ...config,
        xAxis: {
          type: groupBy,
          labels: this.getAxisLabels(groupBy)
        },
        yAxis: {
          type: aggregation,
          format: this.getValueFormat(metric, aggregation)
        }
      }
    };
  }

  /**
   * Busca dados de taxa de conversão para gráfico
   */
  private async getConversionRateChartData(dateFrom: Date, dateTo: Date, groupBy: string): Promise<any[]> {
    const timeGroup = this.getTimeGroupExpression(groupBy);
    
    const result = await db.execute(sql`
      WITH period_metrics AS (
        SELECT 
          ${timeGroup} as period,
          COUNT(*) as total_deals,
          COUNT(CASE WHEN stage = 'won' THEN 1 END) as won_deals
        FROM deals
        WHERE created_at BETWEEN ${dateFrom} AND ${dateTo}
        GROUP BY period
      )
      SELECT 
        period,
        total_deals,
        won_deals,
        CASE 
          WHEN total_deals > 0 THEN (won_deals::float / total_deals) * 100 
          ELSE 0 
        END as conversion_rate
      FROM period_metrics
      ORDER BY period
    `);

    return result.rows.map(row => ({
      x: row.period,
      y: Number(row.conversion_rate || 0),
      metadata: {
        totalDeals: Number(row.total_deals),
        wonDeals: Number(row.won_deals)
      }
    }));
  }

  /**
   * Busca dados de funil de vendas para gráfico
   */
  private async getSalesFunnelChartData(dateFrom: Date, dateTo: Date, groupBy: string): Promise<any[]> {
    const timeGroup = this.getTimeGroupExpression(groupBy);
    
    const result = await db.execute(sql`
      WITH period_stages AS (
        SELECT 
          ${timeGroup} as period,
          stage,
          COUNT(*) as count,
          SUM(value) as value
        FROM deals
        WHERE created_at BETWEEN ${dateFrom} AND ${dateTo}
        GROUP BY period, stage
      )
      SELECT 
        period,
        stage,
        count::integer as count,
        value::bigint as value,
        LAG(count::integer) OVER (PARTITION BY period ORDER BY stage) as previous_stage_count,
        FIRST_VALUE(count::integer) OVER (PARTITION BY period ORDER BY stage) as initial_stage_count
      FROM period_stages
      ORDER BY period, stage
    `);

    // Agrupar por período
    const groupedData: { [key: string]: any[] } = {};
    result.rows.forEach((row: { 
      period: string; 
      stage: string; 
      count: number; 
      value: number; 
      previous_stage_count: number | null; 
      initial_stage_count: number 
    }) => {
      if (!groupedData[row.period]) {
        groupedData[row.period] = [];
      }
      
      const conversionRate = row.previous_stage_count ? 
        (row.count / row.previous_stage_count) * 100 : 
        100;
      
      const overallConversionRate = row.initial_stage_count ? 
        (row.count / row.initial_stage_count) * 100 : 
        100;

      groupedData[row.period].push({
        stage: this.formatStageName(row.stage),
        count: row.count,
        value: row.value,
        conversionRate,
        overallConversionRate
      });
    });

    return Object.entries(groupedData).map(([period, stages]) => ({
      x: period,
      stages
    }));
  }

  /**
   * Busca dados de linha do tempo de atividades para gráfico
   */
  private async getActivityTimelineChartData(dateFrom: Date, dateTo: Date, groupBy: string): Promise<any[]> {
    const timeGroup = this.getTimeGroupExpression(groupBy);
    
    const messageActivities = await db.execute(sql`
      SELECT 
        ${timeGroup} as period,
        'message'::text as type,
        COUNT(*)::integer as count
      FROM messages
      WHERE timestamp BETWEEN ${dateFrom} AND ${dateTo}
      GROUP BY period
    `);

    const dealActivities = await db.execute(sql`
      SELECT 
        ${timeGroup} as period,
        'deal'::text as type,
        COUNT(*)::integer as count
      FROM deals
      WHERE created_at BETWEEN ${dateFrom} AND ${dateTo}
      GROUP BY period
    `);

    const userActivities = await db.execute(sql`
      SELECT 
        ${timeGroup} as period,
        activity_type::text as type,
        COUNT(*)::integer as count
      FROM user_activities
      WHERE performed_at BETWEEN ${dateFrom} AND ${dateTo}
      GROUP BY period, activity_type
    `);

    // Combinar todas as atividades
    const allActivities = [
      ...messageActivities.rows,
      ...dealActivities.rows,
      ...userActivities.rows
    ] as Array<{
      period: string;
      type: string;
      count: number;
    }>;

    // Agrupar por período
    const groupedData: { [key: string]: { [type: string]: number } } = {};
    const activityTypes = new Set<string>();

    allActivities.forEach(activity => {
      if (!groupedData[activity.period]) {
        groupedData[activity.period] = {};
      }
      activityTypes.add(activity.type);
      groupedData[activity.period][activity.type] = activity.count;
    });

    // Converter para formato de série temporal
    return Object.entries(groupedData).map(([period, activities]) => ({
      x: period,
      ...activities,
      total: Object.values(activities).reduce((sum, count) => sum + count, 0)
    }));
  }

  /**
   * Retorna configuração de cores para gráficos
   */
  private getChartColors(metric: string): { [key: string]: string } {
    const colors = {
      messages: '#1e88e5',
      deals: '#43a047',
      response_time: '#fb8c00',
      sales_by_source: {
        website: '#2196f3',
        social: '#4caf50',
        referral: '#ff9800',
        direct: '#f44336',
        other: '#9e9e9e'
      },
      sales_by_region: {
        north: '#2196f3',
        south: '#4caf50',
        east: '#ff9800',
        west: '#f44336',
        central: '#9c27b0'
      },
      team_performance: {
        deals: '#2196f3',
        value: '#4caf50',
        conversion: '#ff9800'
      },
      conversion_rate: '#4caf50',
      sales_funnel: {
        new: '#2196f3',
        contacted: '#03a9f4',
        qualified: '#4caf50',
        proposal: '#ffc107',
        negotiation: '#ff9800',
        won: '#4caf50',
        lost: '#f44336'
      },
      activity_timeline: {
        message: '#2196f3',
        deal: '#4caf50',
        login: '#ff9800',
        update: '#9c27b0',
        other: '#9e9e9e'
      }
    };

    return colors[metric as keyof typeof colors] || colors.messages;
  }

  /**
   * Retorna configuração de ícones para widgets
   */
  private getWidgetIcons(type: string): { [key: string]: string } {
    const icons = {
      messages: 'chat',
      deals: 'attach_money',
      response_time: 'timer',
      sales_by_source: 'source',
      sales_by_region: 'map',
      team_performance: 'group',
      conversion_rate: 'trending_up',
      sales_funnel: 'filter_list',
      activity_timeline: 'timeline',
      custom: 'widgets'
    };

    return icons[type as keyof typeof icons] || icons.custom;
  }

  /**
   * Retorna configuração de tooltips para widgets
   */
  private getWidgetTooltips(type: string): { [key: string]: string } {
    const tooltips = {
      messages: 'Total de mensagens trocadas no período',
      deals: 'Valor total de negócios no período',
      response_time: 'Tempo médio de resposta no período',
      sales_by_source: 'Vendas por origem no período',
      sales_by_region: 'Vendas por região no período',
      team_performance: 'Performance da equipe no período',
      conversion_rate: 'Taxa de conversão no período',
      sales_funnel: 'Funil de vendas no período',
      activity_timeline: 'Linha do tempo de atividades no período',
      custom: 'Widget personalizado'
    };

    return tooltips[type as keyof typeof tooltips] || tooltips.custom;
  }

  /**
   * Retorna configuração de formatação para valores
   */
  private getValueFormatting(type: string): { [key: string]: any } {
    const formatting = {
      currency: {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      },
      percentage: {
        style: 'percent',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      },
      number: {
        style: 'decimal',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      },
      time: {
        style: 'unit',
        unit: 'minute',
        unitDisplay: 'long'
      },
      date: {
        style: 'short',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      },
      datetime: {
        style: 'short',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }
    };

    return formatting[type as keyof typeof formatting] || formatting.number;
  }

  /**
   * Retorna configuração de layout para widgets
   */
  private getWidgetLayout(type: string): { [key: string]: any } {
    const layouts = {
      chart: {
        minWidth: 2,
        minHeight: 2,
        defaultWidth: 4,
        defaultHeight: 3
      },
      table: {
        minWidth: 2,
        minHeight: 2,
        defaultWidth: 4,
        defaultHeight: 4
      },
      map: {
        minWidth: 2,
        minHeight: 2,
        defaultWidth: 4,
        defaultHeight: 3
      },
      heatmap: {
        minWidth: 2,
        minHeight: 2,
        defaultWidth: 4,
        defaultHeight: 3
      },
      gauge: {
        minWidth: 1,
        minHeight: 1,
        defaultWidth: 2,
        defaultHeight: 2
      },
      timeline: {
        minWidth: 2,
        minHeight: 2,
        defaultWidth: 4,
        defaultHeight: 3
      },
      funnel: {
        minWidth: 2,
        minHeight: 2,
        defaultWidth: 3,
        defaultHeight: 4
      },
      kanban: {
        minWidth: 3,
        minHeight: 3,
        defaultWidth: 6,
        defaultHeight: 4
      },
      indicator: {
        minWidth: 1,
        minHeight: 1,
        defaultWidth: 2,
        defaultHeight: 1
      },
      custom: {
        minWidth: 1,
        minHeight: 1,
        defaultWidth: 2,
        defaultHeight: 2
      }
    };

    return layouts[type as keyof typeof layouts] || layouts.custom;
  }

  /**
   * Retorna configuração de atualização para widgets
   */
  private getWidgetRefreshConfig(type: string): { [key: string]: any } {
    const configs = {
      chart: {
        interval: 300, // 5 minutos
        realtime: false
      },
      table: {
        interval: 60, // 1 minuto
        realtime: true
      },
      map: {
        interval: 300, // 5 minutos
        realtime: false
      },
      heatmap: {
        interval: 300, // 5 minutos
        realtime: false
      },
      gauge: {
        interval: 60, // 1 minuto
        realtime: true
      },
      timeline: {
        interval: 60, // 1 minuto
        realtime: true
      },
      funnel: {
        interval: 300, // 5 minutos
        realtime: false
      },
      kanban: {
        interval: 60, // 1 minuto
        realtime: true
      },
      indicator: {
        interval: 60, // 1 minuto
        realtime: true
      },
      custom: {
        interval: 300, // 5 minutos
        realtime: false
      }
    };

    return configs[type as keyof typeof configs] || configs.custom;
  }

  /**
   * Retorna configuração de temas para widgets
   */
  private getWidgetThemeConfig(type: string): { [key: string]: any } {
    const configs = {
      chart: {
        light: {
          background: '#ffffff',
          text: '#000000',
          grid: '#e0e0e0',
          axis: '#9e9e9e'
        },
        dark: {
          background: '#1a1a1a',
          text: '#ffffff',
          grid: '#404040',
          axis: '#757575'
        }
      },
      table: {
        light: {
          background: '#ffffff',
          text: '#000000',
          border: '#e0e0e0',
          header: '#f5f5f5',
          hover: '#f0f0f0',
          selected: '#e8f0fe'
        },
        dark: {
          background: '#1a1a1a',
          text: '#ffffff',
          border: '#404040',
          header: '#2d2d2d',
          hover: '#333333',
          selected: '#1a3f6f'
        }
      },
      map: {
        light: {
          background: '#ffffff',
          land: '#e0e0e0',
          water: '#f5f5f5',
          border: '#bdbdbd',
          text: '#000000'
        },
        dark: {
          background: '#1a1a1a',
          land: '#404040',
          water: '#2d2d2d',
          border: '#757575',
          text: '#ffffff'
        }
      },
      heatmap: {
        light: {
          background: '#ffffff',
          text: '#000000',
          grid: '#e0e0e0',
          empty: '#f5f5f5'
        },
        dark: {
          background: '#1a1a1a',
          text: '#ffffff',
          grid: '#404040',
          empty: '#2d2d2d'
        }
      },
      gauge: {
        light: {
          background: '#ffffff',
          text: '#000000',
          track: '#e0e0e0',
          valueText: '#000000'
        },
        dark: {
          background: '#1a1a1a',
          text: '#ffffff',
          track: '#404040',
          valueText: '#ffffff'
        }
      },
      timeline: {
        light: {
          background: '#ffffff',
          text: '#000000',
          line: '#e0e0e0',
          point: '#bdbdbd',
          card: '#f5f5f5'
        },
        dark: {
          background: '#1a1a1a',
          text: '#ffffff',
          line: '#404040',
          point: '#757575',
          card: '#2d2d2d'
        }
      },
      funnel: {
        light: {
          background: '#ffffff',
          text: '#000000',
          border: '#e0e0e0',
          label: '#000000'
        },
        dark: {
          background: '#1a1a1a',
          text: '#ffffff',
          border: '#404040',
          label: '#ffffff'
        }
      },
      kanban: {
        light: {
          background: '#ffffff',
          text: '#000000',
          columnHeader: '#f5f5f5',
          columnBackground: '#fafafa',
          cardBackground: '#ffffff',
          cardBorder: '#e0e0e0'
        },
        dark: {
          background: '#1a1a1a',
          text: '#ffffff',
          columnHeader: '#2d2d2d',
          columnBackground: '#262626',
          cardBackground: '#333333',
          cardBorder: '#404040'
        }
      },
      indicator: {
        light: {
          background: '#ffffff',
          text: '#000000',
          value: '#000000',
          trend: {
            positive: '#4caf50',
            negative: '#f44336',
            neutral: '#9e9e9e'
          }
        },
        dark: {
          background: '#1a1a1a',
          text: '#ffffff',
          value: '#ffffff',
          trend: {
            positive: '#81c784',
            negative: '#e57373',
            neutral: '#bdbdbd'
          }
        }
      },
      custom: {
        light: {
          background: '#ffffff',
          text: '#000000',
          border: '#e0e0e0'
        },
        dark: {
          background: '#1a1a1a',
          text: '#ffffff',
          border: '#404040'
        }
      }
    };

    return configs[type as keyof typeof configs] || configs.custom;
  }

  /**
   * Retorna configuração de responsividade para widgets
   */
  private getWidgetResponsiveConfig(type: string): { [key: string]: any } {
    const configs = {
      chart: {
        breakpoints: {
          xs: {
            aspectRatio: 1,
            legend: false,
            dataLabels: false
          },
          sm: {
            aspectRatio: 4/3,
            legend: 'bottom',
            dataLabels: false
          },
          md: {
            aspectRatio: 16/9,
            legend: 'right',
            dataLabels: true
          }
        }
      },
      table: {
        breakpoints: {
          xs: {
            columns: ['title', 'value'],
            pagination: 5
          },
          sm: {
            columns: ['title', 'value', 'date'],
            pagination: 10
          },
          md: {
            columns: ['title', 'value', 'date', 'status'],
            pagination: 15
          }
        }
      },
      map: {
        breakpoints: {
          xs: {
            zoom: false,
            legend: false
          },
          sm: {
            zoom: true,
            legend: 'bottom'
          },
          md: {
            zoom: true,
            legend: 'right'
          }
        }
      },
      heatmap: {
        breakpoints: {
          xs: {
            cellSize: 20,
            dataLabels: false
          },
          sm: {
            cellSize: 30,
            dataLabels: false
          },
          md: {
            cellSize: 40,
            dataLabels: true
          }
        }
      },
      gauge: {
        breakpoints: {
          xs: {
            size: '80%',
            dataLabels: false
          },
          sm: {
            size: '90%',
            dataLabels: true
          },
          md: {
            size: '100%',
            dataLabels: true
          }
        }
      },
      timeline: {
        breakpoints: {
          xs: {
            orientation: 'vertical',
            labels: false
          },
          sm: {
            orientation: 'horizontal',
            labels: true
          },
          md: {
            orientation: 'horizontal',
            labels: true
          }
        }
      },
      funnel: {
        breakpoints: {
          xs: {
            dataLabels: 'inside',
            legend: false
          },
          sm: {
            dataLabels: 'outside',
            legend: 'bottom'
          },
          md: {
            dataLabels: 'outside',
            legend: 'right'
          }
        }
      },
      kanban: {
        breakpoints: {
          xs: {
            columns: 1,
            cardDetails: false
          },
          sm: {
            columns: 2,
            cardDetails: true
          },
          md: {
            columns: 3,
            cardDetails: true
          }
        }
      },
      indicator: {
        breakpoints: {
          xs: {
            trendIcon: false,
            previousValue: false
          },
          sm: {
            trendIcon: true,
            previousValue: false
          },
          md: {
            trendIcon: true,
            previousValue: true
          }
        }
      },
      custom: {
        breakpoints: {
          xs: {
            simplified: true
          },
          sm: {
            simplified: false
          },
          md: {
            simplified: false
          }
        }
      }
    };

    return configs[type as keyof typeof configs] || configs.custom;
  }

  /**
   * Retorna configuração de acessibilidade para widgets
   */
  private getWidgetAccessibilityConfig(type: string): { [key: string]: any } {
    const configs = {
      chart: {
        role: 'img',
        ariaLabel: 'Gráfico',
        features: {
          keyboard: true,
          screenReader: true,
          highContrast: true
        }
      },
      table: {
        role: 'table',
        ariaLabel: 'Tabela',
        features: {
          keyboard: true,
          screenReader: true,
          highContrast: true
        }
      },
      map: {
        role: 'img',
        ariaLabel: 'Mapa',
        features: {
          keyboard: true,
          screenReader: true,
          highContrast: true
        }
      },
      heatmap: {
        role: 'img',
        ariaLabel: 'Mapa de calor',
        features: {
          keyboard: true,
          screenReader: true,
          highContrast: true
        }
      },
      gauge: {
        role: 'img',
        ariaLabel: 'Medidor',
        features: {
          keyboard: true,
          screenReader: true,
          highContrast: true
        }
      },
      timeline: {
        role: 'list',
        ariaLabel: 'Linha do tempo',
        features: {
          keyboard: true,
          screenReader: true,
          highContrast: true
        }
      },
      funnel: {
        role: 'img',
        ariaLabel: 'Funil',
        features: {
          keyboard: true,
          screenReader: true,
          highContrast: true
        }
      },
      kanban: {
        role: 'grid',
        ariaLabel: 'Quadro kanban',
        features: {
          keyboard: true,
          screenReader: true,
          highContrast: true
        }
      },
      indicator: {
        role: 'status',
        ariaLabel: 'Indicador',
        features: {
          keyboard: true,
          screenReader: true,
          highContrast: true
        }
      },
      custom: {
        role: 'region',
        ariaLabel: 'Widget personalizado',
        features: {
          keyboard: true,
          screenReader: true,
          highContrast: true
        }
      }
    };

    return configs[type as keyof typeof configs] || configs.custom;
  }

  /**
   * Retorna configuração de tempos para gráficos
   */
  private getTimeGroupExpression(groupBy: string): SQL {
    switch (groupBy) {
      case 'day':
        return sql`DATE_TRUNC('day', timestamp)`;
      case 'week':
        return sql`DATE_TRUNC('week', timestamp)`;
      case 'month':
        return sql`DATE_TRUNC('month', timestamp)`;
      case 'year':
        return sql`DATE_TRUNC('year', timestamp)`;
      default:
        throw new Error(`Grupo de tempo não suportado: ${groupBy}`);
    }
  }

  /**
   * Retorna rótulos para eixos de gráficos
   */
  private getAxisLabels(groupBy: string): string[] {
    switch (groupBy) {
      case 'day':
        return ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
      case 'week':
        return ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
      case 'month':
        return ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      case 'year':
        return ['2024', '2025'];
      default:
        throw new Error(`Grupo de tempo não suportado: ${groupBy}`);
    }
  }

  /**
   * Retorna formato de valor para gráficos
   */
  private getValueFormat(metric: string, aggregation: string): string {
    switch (metric) {
      case 'messages':
      case 'deals':
      case 'response_time':
      case 'sales_by_source':
      case 'sales_by_region':
      case 'team_performance':
        return aggregation === 'count' ? 'number' : 'currency';
      case 'conversion_rate':
        return aggregation === 'count' ? 'percentage' : 'currency';
      case 'sales_funnel':
        return aggregation === 'count' ? 'number' : 'currency';
      case 'activity_timeline':
        return aggregation === 'count' ? 'number' : 'time';
      default:
        throw new Error(`Métrica não suportada para formato de valor: ${metric}`);
    }
  }

  /**
   * Busca dados para um widget de funil
   */
  private async getFunnelWidgetData(widget: DashboardWidget, dateFrom: Date, dateTo: Date): Promise<any> {
    const config = widget.configuration as any;
    const funnelType = config.funnelType || 'sales';

    let stages;
    switch (funnelType) {
      case 'sales':
        stages = await this.getSalesFunnelData(dateFrom, dateTo);
        break;
      
      case 'conversion':
        stages = await this.getConversionFunnelData(dateFrom, dateTo);
        break;
      
      default:
        throw new Error(`Tipo de funil não suportado: ${funnelType}`);
    }

    return {
      stages,
      config: {
        ...config,
        showValues: config.showValues !== false,
        showPercentages: config.showPercentages !== false,
        gradientColors: config.gradientColors || ['#2196f3', '#1976d2']
      }
    };
  }

  /**
   * Busca dados de funil de vendas
   */
  private async getSalesFunnelData(dateFrom: Date, dateTo: Date): Promise<any[]> {
    const stages = ['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won'];
    
    const results = await Promise.all(stages.map(async stage => {
      const count = await db.select({ value: count() })
        .from(deals)
        .where(and(
          gte(deals.createdAt, dateFrom),
          lte(deals.createdAt, dateTo),
          eq(deals.stage, stage)
        ));
      
      const value = await db.select({ total: sum(deals.value) })
        .from(deals)
        .where(and(
          gte(deals.createdAt, dateFrom),
          lte(deals.createdAt, dateTo),
          eq(deals.stage, stage)
        ));

      return {
        name: this.formatStageName(stage),
        count: Number(count[0]?.value || 0),
        value: Number(value[0]?.total || 0)
      };
    }));

    // Calcular percentuais
    const maxCount = Math.max(...results.map(r => r.count));
    return results.map(stage => ({
      ...stage,
      percentage: maxCount > 0 ? (stage.count / maxCount) * 100 : 0
    }));
  }

  /**
   * Busca dados de funil de conversão
   */
  private async getConversionFunnelData(dateFrom: Date, dateTo: Date): Promise<any[]> {
    const totalMessages = await db.select({ count: count() })
      .from(messages)
      .where(and(
        gte(messages.timestamp, dateFrom),
        lte(messages.timestamp, dateTo)
      ));

    const totalDeals = await db.select({ count: count() })
      .from(deals)
      .where(and(
        gte(deals.createdAt, dateFrom),
        lte(deals.createdAt, dateTo)
      ));

    const wonDeals = await db.select({ count: count() })
      .from(deals)
      .where(and(
        gte(deals.createdAt, dateFrom),
        lte(deals.createdAt, dateTo),
        eq(deals.stage, 'won')
      ));

    const stages = [
      {
        name: 'Mensagens',
        count: Number(totalMessages[0]?.count || 0)
      },
      {
        name: 'Negócios',
        count: Number(totalDeals[0]?.count || 0)
      },
      {
        name: 'Vendas',
        count: Number(wonDeals[0]?.count || 0)
      }
    ];

    // Calcular percentuais
    const maxCount = stages[0].count;
    return stages.map(stage => ({
      ...stage,
      percentage: maxCount > 0 ? (stage.count / maxCount) * 100 : 0
    }));
  }

  /**
   * Busca dados para um widget de kanban
   */
  private async getKanbanWidgetData(widget: DashboardWidget, dateFrom: Date, dateTo: Date): Promise<any> {
    const config = widget.configuration as any;
    const boardType = config.boardType || 'deals';

    let columns;
    switch (boardType) {
      case 'deals':
        columns = await this.getDealsKanbanData(dateFrom, dateTo);
        break;
      
      default:
        throw new Error(`Tipo de kanban não suportado: ${boardType}`);
    }

    return {
      columns,
      config: {
        ...config,
        showCardCount: config.showCardCount !== false,
        showColumnTotal: config.showColumnTotal !== false,
        cardTemplate: config.cardTemplate || {
          title: true,
          value: true,
          assignee: true,
          priority: true
        }
      }
    };
  }

  /**
   * Busca dados de negócios para kanban
   */
  private async getDealsKanbanData(dateFrom: Date, dateTo: Date): Promise<any[]> {
    const stages = ['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won'];
    
    const dealsResult = await db.select({
      id: deals.id,
      title: deals.title,
      stage: deals.stage,
      value: deals.value,
      priority: deals.priority,
      assignedTo: deals.assignedTo,
      updatedAt: deals.updatedAt,
      createdAt: deals.createdAt
    })
    .from(deals)
    .where(and(
      gte(deals.createdAt, dateFrom),
      lte(deals.createdAt, dateTo)
    ));

    return stages.map(stage => {
      const stageDeals = dealsResult.filter(deal => deal.stage === stage);
      const total = stageDeals.reduce((sum, deal) => sum + (deal.value || 0), 0);

      return {
        id: stage,
        title: this.formatStageName(stage),
        cards: stageDeals.map(deal => ({
          id: deal.id,
          title: deal.title,
          value: deal.value ? `R$ ${(deal.value / 100).toFixed(2)}` : '-',
          priority: deal.priority,
          assignedTo: deal.assignedTo,
          updatedAt: deal.updatedAt?.toLocaleString() || '',
          createdAt: deal.createdAt?.toLocaleString() || ''
        })),
        total: `R$ ${(total / 100).toFixed(2)}`
      };
    });
  }

  /**
   * Busca dados para um widget personalizado
   */
  private async getCustomWidgetData(widget: DashboardWidget, dateFrom: Date, dateTo: Date): Promise<any> {
    const config = widget.configuration as any;
    const query = config.query;

    if (!query) {
      throw new Error('Query SQL não especificada para widget personalizado');
    }

    try {
      const result = await db.execute(sql.raw(query));
      
      // Aplicar formatação personalizada
      const formattedData = this.applyCustomFormatting(result.rows, config.formatting || {});
      
      // Aplicar agregações
      const aggregations = this.applyCustomAggregations(formattedData, config.aggregations || []);

      return {
        data: formattedData,
        columns: result.fields.map(f => ({
          name: f.name,
          type: f.dataTypeID,
          format: config.formatting?.[f.name]
        })),
        aggregations,
        config: {
          ...config,
          pagination: config.pagination !== false,
          search: config.search !== false,
          export: config.export !== false
        }
      };
    } catch (error) {
      console.error('Erro ao executar query personalizada:', error);
      throw new Error('Erro ao executar query personalizada');
    }
  }

  /**
   * Aplica formatação personalizada aos dados
   */
  private applyCustomFormatting(data: any[], formatting: { [key: string]: any }): any[] {
    return data.map(row => {
      const formattedRow = { ...row };
      
      Object.entries(formatting).forEach(([field, format]) => {
        if (row[field] !== undefined) {
          switch (format.type) {
            case 'currency':
              formattedRow[field] = this.formatCurrency(row[field], format.currency || 'BRL');
              break;
            
            case 'percentage':
              formattedRow[field] = this.formatPercentage(row[field], format.decimals || 2);
              break;
            
            case 'number':
              formattedRow[field] = this.formatNumber(row[field], format.decimals || 0);
              break;
            
            case 'date':
              formattedRow[field] = this.formatDate(row[field], format.format);
              break;
            
            case 'time':
              formattedRow[field] = this.formatTime(row[field], format.format);
              break;
            
            case 'datetime':
              formattedRow[field] = this.formatDateTime(row[field], format.format);
              break;
            
            case 'custom':
              if (format.formatter && typeof format.formatter === 'function') {
                formattedRow[field] = format.formatter(row[field]);
              }
              break;
          }
        }
      });

      return formattedRow;
    });
  }

  /**
   * Aplica agregações personalizadas aos dados
   */
  private applyCustomAggregations(data: any[], aggregations: any[]): any[] {
    return aggregations.map(agg => {
      const field = agg.field;
      const type = agg.type;
      const label = agg.label || `${type}(${field})`;

      let value;
      switch (type) {
        case 'sum':
          value = data.reduce((sum, row) => sum + (Number(row[field]) || 0), 0);
          break;
        
        case 'avg':
          const sum = data.reduce((sum, row) => sum + (Number(row[field]) || 0), 0);
          value = data.length > 0 ? sum / data.length : 0;
          break;
        
        case 'min':
          value = Math.min(...data.map(row => Number(row[field]) || 0));
          break;
        
        case 'max':
          value = Math.max(...data.map(row => Number(row[field]) || 0));
          break;
        
        case 'count':
          value = data.length;
          break;
        
        case 'distinct':
          value = new Set(data.map(row => row[field])).size;
          break;
        
        default:
          value = null;
      }

      return {
        label,
        value: this.formatAggregationValue(value, agg.format)
      };
    });
  }

  /**
   * Formata valor monetário
   */
  private formatCurrency(value: number, currency: string = 'BRL'): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency
    }).format(value / 100);
  }

  /**
   * Formata percentual
   */
  private formatPercentage(value: number, decimals: number = 2): string {
    return `${value.toFixed(decimals)}%`;
  }

  /**
   * Formata número
   */
  private formatNumber(value: number, decimals: number = 0): string {
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(value);
  }

  /**
   * Formata data
   */
  private formatDate(value: string | Date, format?: string): string {
    const date = new Date(value);
    if (format) {
      return format.replace(/yyyy|MM|dd/g, match => {
        switch (match) {
          case 'yyyy':
            return date.getFullYear().toString();
          case 'MM':
            return (date.getMonth() + 1).toString().padStart(2, '0');
          case 'dd':
            return date.getDate().toString().padStart(2, '0');
          default:
            return match;
        }
      });
    }
    return date.toLocaleDateString('pt-BR');
  }

  /**
   * Formata hora
   */
  private formatTime(value: string | Date, format?: string): string {
    const date = new Date(value);
    if (format) {
      return format.replace(/HH|mm|ss/g, match => {
        switch (match) {
          case 'HH':
            return date.getHours().toString().padStart(2, '0');
          case 'mm':
            return date.getMinutes().toString().padStart(2, '0');
          case 'ss':
            return date.getSeconds().toString().padStart(2, '0');
          default:
            return match;
        }
      });
    }
    return date.toLocaleTimeString('pt-BR');
  }

  /**
   * Formata data e hora
   */
  private formatDateTime(value: string | Date, format?: string): string {
    const date = new Date(value);
    if (format) {
      return format.replace(/yyyy|MM|dd|HH|mm|ss/g, match => {
        switch (match) {
          case 'yyyy':
            return date.getFullYear().toString();
          case 'MM':
            return (date.getMonth() + 1).toString().padStart(2, '0');
          case 'dd':
            return date.getDate().toString().padStart(2, '0');
          case 'HH':
            return date.getHours().toString().padStart(2, '0');
          case 'mm':
            return date.getMinutes().toString().padStart(2, '0');
          case 'ss':
            return date.getSeconds().toString().padStart(2, '0');
          default:
            return match;
        }
      });
    }
    return date.toLocaleString('pt-BR');
  }

  /**
   * Formata valor de agregação
   */
  private formatAggregationValue(value: any, format?: any): string {
    if (!format) {
      return value?.toString() || '';
    }

    switch (format.type) {
      case 'currency':
        return this.formatCurrency(value, format.currency);
      case 'percentage':
        return this.formatPercentage(value, format.decimals);
      case 'number':
        return this.formatNumber(value, format.decimals);
      case 'custom':
        if (format.formatter && typeof format.formatter === 'function') {
          return format.formatter(value);
        }
        return value?.toString() || '';
      default:
        return value?.toString() || '';
    }
  }

  /**
   * Formata o nome do estágio
   */
  private formatStageName(stage: string): string {
    const stageNames: { [key: string]: string } = {
      new: 'Novo',
      contacted: 'Contatado',
      qualified: 'Qualificado',
      proposal: 'Proposta',
      negotiation: 'Negociação',
      won: 'Ganho',
      lost: 'Perdido'
    };
    return stageNames[stage] || stage;
  }

  /**
   * Busca dados para um widget de indicador
   */
  private async getIndicatorWidgetData(widget: DashboardWidget, dateFrom: Date, dateTo: Date): Promise<any> {
    const config = widget.configuration as any;
    const metric = config.metric || 'messages';
    const aggregation = config.aggregation || 'count';
    const comparison = config.comparison || 'previous_period';

    let currentValue;
    let previousValue;
    let trend;

    switch (metric) {
      case 'messages':
        [currentValue, previousValue] = await this.getMessageIndicatorData(dateFrom, dateTo, aggregation, comparison);
        break;
      
      case 'deals':
        [currentValue, previousValue] = await this.getDealIndicatorData(dateFrom, dateTo, aggregation, comparison);
        break;
      
      case 'response_time':
        [currentValue, previousValue] = await this.getResponseTimeIndicatorData(dateFrom, dateTo, comparison);
        break;
      
      case 'conversion_rate':
        [currentValue, previousValue] = await this.getConversionRateIndicatorData(dateFrom, dateTo, comparison);
        break;
      
      case 'team_performance':
        [currentValue, previousValue] = await this.getTeamPerformanceIndicatorData(dateFrom, dateTo, aggregation, comparison);
        break;
      
      default:
        throw new Error(`Métrica não suportada para indicador: ${metric}`);
    }

    // Calcular tendência
    if (previousValue !== null && previousValue !== 0) {
      trend = ((currentValue - previousValue) / previousValue) * 100;
    } else {
      trend = null;
    }

    return {
      value: currentValue,
      previousValue,
      trend,
      config: {
        ...config,
        format: this.getValueFormat(metric, aggregation),
        trendColors: config.trendColors || {
          positive: '#4caf50',
          negative: '#f44336',
          neutral: '#9e9e9e'
        }
      }
    };
  }

  /**
   * Busca dados de mensagens para indicador
   */
  private async getMessageIndicatorData(
    dateFrom: Date, 
    dateTo: Date, 
    aggregation: string,
    comparison: string
  ): Promise<[number, number]> {
    const [previousFrom, previousTo] = this.getPreviousPeriod(dateFrom, dateTo, comparison);

    const currentResult = await db.select({
      value: aggregation === 'count' ? count() : count(messages.id)
    })
    .from(messages)
    .where(and(
      gte(messages.timestamp, dateFrom),
      lte(messages.timestamp, dateTo)
    ));

    const previousResult = await db.select({
      value: aggregation === 'count' ? count() : count(messages.id)
    })
    .from(messages)
    .where(and(
      gte(messages.timestamp, previousFrom),
      lte(messages.timestamp, previousTo)
    ));

    return [
      Number(currentResult[0]?.value || 0),
      Number(previousResult[0]?.value || 0)
    ];
  }

  /**
   * Busca dados de negócios para indicador
   */
  private async getDealIndicatorData(
    dateFrom: Date, 
    dateTo: Date, 
    aggregation: string,
    comparison: string
  ): Promise<[number, number]> {
    const [previousFrom, previousTo] = this.getPreviousPeriod(dateFrom, dateTo, comparison);

    let currentResult;
    let previousResult;

    switch (aggregation) {
      case 'count':
        currentResult = await db.select({ value: count() })
          .from(deals)
          .where(and(
            gte(deals.createdAt, dateFrom),
            lte(deals.createdAt, dateTo)
          ));
        
        previousResult = await db.select({ value: count() })
          .from(deals)
          .where(and(
            gte(deals.createdAt, previousFrom),
            lte(deals.createdAt, previousTo)
          ));
        break;
      
      case 'sum':
        currentResult = await db.select({ value: sum(deals.value) })
          .from(deals)
          .where(and(
            gte(deals.createdAt, dateFrom),
            lte(deals.createdAt, dateTo)
          ));
        
        previousResult = await db.select({ value: sum(deals.value) })
          .from(deals)
          .where(and(
            gte(deals.createdAt, previousFrom),
            lte(deals.createdAt, previousTo)
          ));
        break;
      
      case 'avg':
        currentResult = await db.select({ value: avg(deals.value) })
          .from(deals)
          .where(and(
            gte(deals.createdAt, dateFrom),
            lte(deals.createdAt, dateTo)
          ));
        
        previousResult = await db.select({ value: avg(deals.value) })
          .from(deals)
          .where(and(
            gte(deals.createdAt, previousFrom),
            lte(deals.createdAt, previousTo)
          ));
        break;
      
      default:
        throw new Error(`Agregação não suportada: ${aggregation}`);
    }

    return [
      Number(currentResult[0]?.value || 0),
      Number(previousResult[0]?.value || 0)
    ];
  }

  /**
   * Busca dados de tempo de resposta para indicador
   */
  private async getResponseTimeIndicatorData(
    dateFrom: Date, 
    dateTo: Date, 
    comparison: string
  ): Promise<[number, number]> {
    const [previousFrom, previousTo] = this.getPreviousPeriod(dateFrom, dateTo, comparison);

    const currentResult = await db.execute(sql`
      WITH message_pairs AS (
        SELECT 
          m1.conversation_id,
          m1.timestamp AS client_message_time,
          MIN(m2.timestamp) AS agent_response_time
        FROM messages m1
        JOIN messages m2 ON m1.conversation_id = m2.conversation_id 
          AND m1.timestamp < m2.timestamp
          AND m1.sender = 'contact'
          AND m2.sender = 'user'
        WHERE m1.timestamp BETWEEN ${dateFrom} AND ${dateTo}
        GROUP BY m1.id, m1.conversation_id, m1.timestamp
      )
      SELECT AVG(EXTRACT(EPOCH FROM (agent_response_time - client_message_time)) / 60) AS avg_minutes
      FROM message_pairs
    `);

    const previousResult = await db.execute(sql`
      WITH message_pairs AS (
        SELECT 
          m1.conversation_id,
          m1.timestamp AS client_message_time,
          MIN(m2.timestamp) AS agent_response_time
        FROM messages m1
        JOIN messages m2 ON m1.conversation_id = m2.conversation_id 
          AND m1.timestamp < m2.timestamp
          AND m1.sender = 'contact'
          AND m2.sender = 'user'
        WHERE m1.timestamp BETWEEN ${previousFrom} AND ${previousTo}
        GROUP BY m1.id, m1.conversation_id, m1.timestamp
      )
      SELECT AVG(EXTRACT(EPOCH FROM (agent_response_time - client_message_time)) / 60) AS avg_minutes
      FROM message_pairs
    `);

    return [
      Number(currentResult.rows[0]?.avg_minutes || 0),
      Number(previousResult.rows[0]?.avg_minutes || 0)
    ];
  }

  /**
   * Busca dados de taxa de conversão para indicador
   */
  private async getConversionRateIndicatorData(
    dateFrom: Date, 
    dateTo: Date, 
    comparison: string
  ): Promise<[number, number]> {
    const [previousFrom, previousTo] = this.getPreviousPeriod(dateFrom, dateTo, comparison);

    const currentResult = await db.execute(sql`
      SELECT 
        COUNT(*) as total_deals,
        COUNT(CASE WHEN stage = 'won' THEN 1 END) as won_deals,
        CASE 
          WHEN COUNT(*) > 0 THEN (COUNT(CASE WHEN stage = 'won' THEN 1 END)::float / COUNT(*)) * 100 
          ELSE 0 
        END as conversion_rate
      FROM deals
      WHERE created_at BETWEEN ${dateFrom} AND ${dateTo}
    `);

    const previousResult = await db.execute(sql`
      SELECT 
        COUNT(*) as total_deals,
        COUNT(CASE WHEN stage = 'won' THEN 1 END) as won_deals,
        CASE 
          WHEN COUNT(*) > 0 THEN (COUNT(CASE WHEN stage = 'won' THEN 1 END)::float / COUNT(*)) * 100 
          ELSE 0 
        END as conversion_rate
      FROM deals
      WHERE created_at BETWEEN ${previousFrom} AND ${previousTo}
    `);

    return [
      Number(currentResult.rows[0]?.conversion_rate || 0),
      Number(previousResult.rows[0]?.conversion_rate || 0)
    ];
  }

  /**
   * Busca dados de performance da equipe para indicador
   */
  private async getTeamPerformanceIndicatorData(
    dateFrom: Date, 
    dateTo: Date, 
    aggregation: string,
    comparison: string
  ): Promise<[number, number]> {
    const [previousFrom, previousTo] = this.getPreviousPeriod(dateFrom, dateTo, comparison);

    let currentResult;
    let previousResult;

    switch (aggregation) {
      case 'deals_per_user':
        currentResult = await db.execute(sql`
          SELECT AVG(deals_count) as value
          FROM (
            SELECT assigned_to, COUNT(*) as deals_count
            FROM deals
            WHERE created_at BETWEEN ${dateFrom} AND ${dateTo}
            GROUP BY assigned_to
          ) user_deals
        `);
        
        previousResult = await db.execute(sql`
          SELECT AVG(deals_count) as value
          FROM (
            SELECT assigned_to, COUNT(*) as deals_count
            FROM deals
            WHERE created_at BETWEEN ${previousFrom} AND ${previousTo}
            GROUP BY assigned_to
          ) user_deals
        `);
        break;
      
      case 'value_per_user':
        currentResult = await db.execute(sql`
          SELECT AVG(total_value) as value
          FROM (
            SELECT assigned_to, SUM(value) as total_value
            FROM deals
            WHERE created_at BETWEEN ${dateFrom} AND ${dateTo}
            GROUP BY assigned_to
          ) user_values
        `);
        
        previousResult = await db.execute(sql`
          SELECT AVG(total_value) as value
          FROM (
            SELECT assigned_to, SUM(value) as total_value
            FROM deals
            WHERE created_at BETWEEN ${previousFrom} AND ${previousTo}
            GROUP BY assigned_to
          ) user_values
        `);
        break;
      
      case 'conversion_per_user':
        currentResult = await db.execute(sql`
          SELECT AVG(conversion_rate) as value
          FROM (
            SELECT 
              assigned_to,
              CASE 
                WHEN COUNT(*) > 0 THEN (COUNT(CASE WHEN stage = 'won' THEN 1 END)::float / COUNT(*)) * 100 
                ELSE 0 
              END as conversion_rate
            FROM deals
            WHERE created_at BETWEEN ${dateFrom} AND ${dateTo}
            GROUP BY assigned_to
          ) user_conversion
        `);
        
        previousResult = await db.execute(sql`
          SELECT AVG(conversion_rate) as value
          FROM (
            SELECT 
              assigned_to,
              CASE 
                WHEN COUNT(*) > 0 THEN (COUNT(CASE WHEN stage = 'won' THEN 1 END)::float / COUNT(*)) * 100 
                ELSE 0 
              END as conversion_rate
            FROM deals
            WHERE created_at BETWEEN ${previousFrom} AND ${previousTo}
            GROUP BY assigned_to
          ) user_conversion
        `);
        break;
      
      default:
        throw new Error(`Agregação não suportada: ${aggregation}`);
    }

    return [
      Number(currentResult.rows[0]?.value || 0),
      Number(previousResult.rows[0]?.value || 0)
    ];
  }

  /**
   * Retorna período anterior para comparação
   */
  private getPreviousPeriod(dateFrom: Date, dateTo: Date, comparison: string): [Date, Date] {
    const duration = dateTo.getTime() - dateFrom.getTime();
    
    let previousFrom: Date;
    let previousTo: Date;

    switch (comparison) {
      case 'previous_period':
        previousFrom = new Date(dateFrom.getTime() - duration);
        previousTo = new Date(dateTo.getTime() - duration);
        break;
      
      case 'previous_month':
        previousFrom = new Date(dateFrom);
        previousFrom.setMonth(previousFrom.getMonth() - 1);
        previousTo = new Date(dateTo);
        previousTo.setMonth(previousTo.getMonth() - 1);
        break;
      
      case 'previous_year':
        previousFrom = new Date(dateFrom);
        previousFrom.setFullYear(previousFrom.getFullYear() - 1);
        previousTo = new Date(dateTo);
        previousTo.setFullYear(previousTo.getFullYear() - 1);
        break;
      
      default:
        throw new Error(`Tipo de comparação não suportado: ${comparison}`);
    }

    return [previousFrom, previousTo];
  }

  /**
   * Retorna configuração de animações para widgets
   */
  private getWidgetAnimationConfig(type: string): { [key: string]: any } {
    const configs = {
      chart: {
        enabled: true,
        duration: 1000,
        easing: 'easeOutQuart',
        effects: {
          load: true,
          update: true,
          hover: true
        }
      },
      table: {
        enabled: true,
        duration: 300,
        easing: 'easeInOutQuad',
        effects: {
          sort: true,
          filter: true,
          page: true
        }
      },
      map: {
        enabled: true,
        duration: 1000,
        easing: 'easeOutQuart',
        effects: {
          zoom: true,
          pan: true,
          hover: true
        }
      },
      heatmap: {
        enabled: true,
        duration: 1000,
        easing: 'easeOutQuart',
        effects: {
          load: true,
          update: true,
          hover: true
        }
      },
      gauge: {
        enabled: true,
        duration: 1000,
        easing: 'easeOutQuart',
        effects: {
          value: true,
          hover: true
        }
      },
      timeline: {
        enabled: true,
        duration: 500,
        easing: 'easeInOutQuad',
        effects: {
          scroll: true,
          expand: true,
          hover: true
        }
      },
      funnel: {
        enabled: true,
        duration: 1000,
        easing: 'easeOutQuart',
        effects: {
          load: true,
          hover: true
        }
      },
      kanban: {
        enabled: true,
        duration: 300,
        easing: 'easeInOutQuad',
        effects: {
          drag: true,
          drop: true,
          expand: true
        }
      },
      indicator: {
        enabled: true,
        duration: 1000,
        easing: 'easeOutQuart',
        effects: {
          value: true,
          trend: true
        }
      },
      custom: {
        enabled: true,
        duration: 500,
        easing: 'easeInOutQuad',
        effects: {
          load: true,
          update: true
        }
      }
    };

    return configs[type as keyof typeof configs] || configs.custom;
  }

  /**
   * Retorna configuração de eventos para widgets
   */
  private getWidgetEventConfig(type: string): { [key: string]: any } {
    const configs = {
      chart: {
        click: true,
        hover: true,
        zoom: true,
        pan: true,
        legendClick: true,
        axisLabelClick: true
      },
      table: {
        rowClick: true,
        cellClick: true,
        headerClick: true,
        selectionChange: true,
        pageChange: true,
        sortChange: true,
        filterChange: true
      },
      map: {
        regionClick: true,
        hover: true,
        zoom: true,
        pan: true,
        selectionChange: true
      },
      heatmap: {
        cellClick: true,
        hover: true,
        selectionChange: true
      },
      gauge: {
        valueClick: true,
        hover: true,
        thresholdCross: true
      },
      timeline: {
        itemClick: true,
        hover: true,
        scroll: true,
        rangeChange: true
      },
      funnel: {
        stageClick: true,
        hover: true,
        selectionChange: true
      },
      kanban: {
        cardClick: true,
        columnClick: true,
        dragStart: true,
        dragEnd: true,
        drop: true
      },
      indicator: {
        valueClick: true,
        trendClick: true,
        hover: true
      },
      custom: {
        click: true,
        hover: true,
        change: true
      }
    };

    return configs[type as keyof typeof configs] || configs.custom;
  }

  /**
   * Retorna configuração de filtros para widgets
   */
  private getWidgetFilterConfig(type: string): { [key: string]: any } {
    const configs = {
      chart: {
        date: true,
        category: true,
        value: true,
        series: true
      },
      table: {
        text: true,
        number: true,
        date: true,
        select: true,
        boolean: true
      },
      map: {
        region: true,
        value: true,
        date: true
      },
      heatmap: {
        x: true,
        y: true,
        value: true
      },
      gauge: {
        value: true,
        threshold: true
      },
      timeline: {
        date: true,
        type: true,
        category: true
      },
      funnel: {
        stage: true,
        value: true
      },
      kanban: {
        column: true,
        tag: true,
        assignee: true,
        priority: true
      },
      indicator: {
        metric: true,
        comparison: true
      },
      custom: {
        text: true,
        number: true,
        date: true
      }
    };

    return configs[type as keyof typeof configs] || configs.custom;
  }

  /**
   * Retorna configuração de drill-down para widgets
   */
  private getWidgetDrillDownConfig(type: string): { [key: string]: any } {
    const configs = {
      chart: {
        enabled: true,
        maxLevels: 3,
        types: ['category', 'time', 'geography']
      },
      table: {
        enabled: true,
        maxLevels: 3,
        types: ['detail', 'related', 'summary']
      },
      map: {
        enabled: true,
        maxLevels: 3,
        types: ['country', 'state', 'city']
      },
      heatmap: {
        enabled: true,
        maxLevels: 2,
        types: ['category', 'time']
      },
      gauge: {
        enabled: false
      },
      timeline: {
        enabled: true,
        maxLevels: 2,
        types: ['year', 'month', 'day']
      },
      funnel: {
        enabled: true,
        maxLevels: 2,
        types: ['stage', 'source']
      },
      kanban: {
        enabled: true,
        maxLevels: 2,
        types: ['card', 'activity']
      },
      indicator: {
        enabled: true,
        maxLevels: 2,
        types: ['detail', 'comparison']
      },
      custom: {
        enabled: true,
        maxLevels: 2,
        types: ['detail', 'summary']
      }
    };

    return configs[type as keyof typeof configs] || configs.custom;
  }

  /**
   * Retorna configuração de integração para widgets
   */
  private getWidgetIntegrationConfig(type: string): { [key: string]: any } {
    const configs = {
      chart: {
        export: ['png', 'svg', 'csv'],
        share: ['link', 'embed'],
        api: {
          data: true,
          config: true,
          events: true
        }
      },
      table: {
        export: ['csv', 'xlsx', 'pdf'],
        share: ['link', 'embed'],
        api: {
          data: true,
          config: true,
          events: true
        }
      },
      map: {
        export: ['png', 'svg'],
        share: ['link', 'embed'],
        api: {
          data: true,
          config: true,
          events: true
        }
      },
      heatmap: {
        export: ['png', 'svg', 'csv'],
        share: ['link', 'embed'],
        api: {
          data: true,
          config: true,
          events: true
        }
      },
      gauge: {
        export: ['png', 'svg'],
        share: ['link', 'embed'],
        api: {
          data: true,
          config: true,
          events: true
        }
      },
      timeline: {
        export: ['png', 'svg', 'csv'],
        share: ['link', 'embed'],
        api: {
          data: true,
          config: true,
          events: true
        }
      },
      funnel: {
        export: ['png', 'svg', 'csv'],
        share: ['link', 'embed'],
        api: {
          data: true,
          config: true,
          events: true
        }
      },
      kanban: {
        export: ['png', 'csv'],
        share: ['link', 'embed'],
        api: {
          data: true,
          config: true,
          events: true
        }
      },
      indicator: {
        export: ['png', 'csv'],
        share: ['link', 'embed'],
        api: {
          data: true,
          config: true,
          events: true
        }
      },
      custom: {
        export: ['png', 'svg', 'csv'],
        share: ['link', 'embed'],
        api: {
          data: true,
          config: true,
          events: true
        }
      }
    };

    return configs[type as keyof typeof configs] || configs.custom;
  }

  /**
   * Retorna configuração de validação para widgets
   */
  private getWidgetValidationConfig(type: string): { [key: string]: any } {
    const configs = {
      chart: {
        required: ['type', 'data', 'xAxis', 'yAxis'],
        types: {
          line: ['series', 'categories'],
          bar: ['series', 'categories'],
          pie: ['values', 'labels'],
          area: ['series', 'categories'],
          scatter: ['xValues', 'yValues']
        },
        limits: {
          maxSeries: 10,
          maxCategories: 50,
          maxDataPoints: 1000
        }
      },
      table: {
        required: ['columns', 'data'],
        types: {
          text: ['maxLength', 'pattern'],
          number: ['min', 'max', 'decimals'],
          date: ['format', 'min', 'max'],
          boolean: ['trueValue', 'falseValue']
        },
        limits: {
          maxColumns: 20,
          maxRows: 1000,
          maxCellLength: 1000
        }
      },
      map: {
        required: ['regions', 'values'],
        types: {
          choropleth: ['colorScale', 'boundaries'],
          bubble: ['size', 'color'],
          heatmap: ['intensity', 'radius']
        },
        limits: {
          maxRegions: 1000,
          maxDataPoints: 10000
        }
      },
      heatmap: {
        required: ['data', 'xAxis', 'yAxis'],
        types: {
          intensity: ['min', 'max', 'colors'],
          categorical: ['categories', 'colors']
        },
        limits: {
          maxRows: 100,
          maxColumns: 100,
          maxCategories: 20
        }
      },
      gauge: {
        required: ['value', 'min', 'max'],
        types: {
          simple: ['thresholds'],
          donut: ['segments'],
          linear: ['orientation']
        },
        limits: {
          maxThresholds: 5,
          maxSegments: 10,
          maxDecimals: 2
        }
      },
      timeline: {
        required: ['events', 'dateField'],
        types: {
          vertical: ['groupBy'],
          horizontal: ['scale'],
          calendar: ['view']
        },
        limits: {
          maxEvents: 1000,
          maxGroups: 20,
          maxNestedLevels: 3
        }
      },
      funnel: {
        required: ['stages', 'values'],
        types: {
          simple: ['direction'],
          segmented: ['segments'],
          interactive: ['actions']
        },
        limits: {
          maxStages: 10,
          maxSegments: 5,
          maxActions: 3
        }
      },
      kanban: {
        required: ['columns', 'cards'],
        types: {
          simple: ['cardTemplate'],
          swimlanes: ['groupBy'],
          timeline: ['dateRange']
        },
        limits: {
          maxColumns: 10,
          maxCards: 1000,
          maxSwimlanes: 5
        }
      },
      indicator: {
        required: ['value', 'format'],
        types: {
          number: ['decimals'],
          percentage: ['decimals'],
          currency: ['locale', 'currency']
        },
        limits: {
          maxDecimals: 4,
          maxComparison: 2,
          maxTrends: 5
        }
      },
      custom: {
        required: ['component', 'props'],
        types: {
          react: ['dependencies'],
          vue: ['components'],
          web: ['elements']
        },
        limits: {
          maxProps: 50,
          maxDependencies: 10,
          maxElements: 100
        }
      }
    };

    return configs[type as keyof typeof configs] || configs.custom;
  }

  /**
   * Retorna configuração de cache para widgets
   */
  private getWidgetCacheConfig(type: string): { [key: string]: any } {
    const configs = {
      chart: {
        enabled: true,
        ttl: 300, // 5 minutos
        strategy: 'memory',
        key: ['type', 'data', 'config']
      },
      table: {
        enabled: true,
        ttl: 60, // 1 minuto
        strategy: 'memory',
        key: ['data', 'columns', 'sort']
      },
      map: {
        enabled: true,
        ttl: 300, // 5 minutos
        strategy: 'memory',
        key: ['regions', 'values', 'config']
      },
      heatmap: {
        enabled: true,
        ttl: 300, // 5 minutos
        strategy: 'memory',
        key: ['data', 'config']
      },
      gauge: {
        enabled: true,
        ttl: 60, // 1 minuto
        strategy: 'memory',
        key: ['value', 'config']
      },
      timeline: {
        enabled: true,
        ttl: 60, // 1 minuto
        strategy: 'memory',
        key: ['events', 'config']
      },
      funnel: {
        enabled: true,
        ttl: 300, // 5 minutos
        strategy: 'memory',
        key: ['stages', 'values']
      },
      kanban: {
        enabled: true,
        ttl: 60, // 1 minuto
        strategy: 'memory',
        key: ['columns', 'cards']
      },
      indicator: {
        enabled: true,
        ttl: 60, // 1 minuto
        strategy: 'memory',
        key: ['value', 'trend']
      },
      custom: {
        enabled: true,
        ttl: 300, // 5 minutos
        strategy: 'memory',
        key: ['component', 'props']
      }
    };

    return configs[type as keyof typeof configs] || configs.custom;
  }

  /**
   * Retorna configuração de segurança para widgets
   */
  private getWidgetSecurityConfig(type: string): { [key: string]: any } {
    const configs = {
      chart: {
        sanitize: {
          data: true,
          config: true,
          events: true
        },
        validate: {
          input: true,
          output: true
        },
        permissions: {
          view: ['user'],
          edit: ['admin'],
          share: ['admin']
        }
      },
      table: {
        sanitize: {
          data: true,
          columns: true,
          filters: true
        },
        validate: {
          input: true,
          output: true
        },
        permissions: {
          view: ['user'],
          edit: ['admin'],
          export: ['admin']
        }
      },
      map: {
        sanitize: {
          data: true,
          regions: true,
          config: true
        },
        validate: {
          input: true,
          output: true
        },
        permissions: {
          view: ['user'],
          edit: ['admin'],
          share: ['admin']
        }
      },
      heatmap: {
        sanitize: {
          data: true,
          config: true,
          events: true
        },
        validate: {
          input: true,
          output: true
        },
        permissions: {
          view: ['user'],
          edit: ['admin'],
          share: ['admin']
        }
      },
      gauge: {
        sanitize: {
          value: true,
          config: true,
          events: true
        },
        validate: {
          input: true,
          output: true
        },
        permissions: {
          view: ['user'],
          edit: ['admin'],
          share: ['admin']
        }
      },
      timeline: {
        sanitize: {
          events: true,
          config: true,
          actions: true
        },
        validate: {
          input: true,
          output: true
        },
        permissions: {
          view: ['user'],
          edit: ['admin'],
          share: ['admin']
        }
      },
      funnel: {
        sanitize: {
          stages: true,
          values: true,
          config: true
        },
        validate: {
          input: true,
          output: true
        },
        permissions: {
          view: ['user'],
          edit: ['admin'],
          share: ['admin']
        }
      },
      kanban: {
        sanitize: {
          columns: true,
          cards: true,
          actions: true
        },
        validate: {
          input: true,
          output: true
        },
        permissions: {
          view: ['user'],
          edit: ['admin'],
          share: ['admin']
        }
      },
      indicator: {
        sanitize: {
          value: true,
          config: true,
          events: true
        },
        validate: {
          input: true,
          output: true
        },
        permissions: {
          view: ['user'],
          edit: ['admin'],
          share: ['admin']
        }
      },
      custom: {
        sanitize: {
          component: true,
          props: true,
          events: true
        },
        validate: {
          input: true,
          output: true
        },
        permissions: {
          view: ['admin'],
          edit: ['admin'],
          share: ['admin']
        }
      }
    };

    return configs[type as keyof typeof configs] || configs.custom;
  }
}

export const dashboardService = new DashboardService();
