import { db } from '../db';
import { kpis, kpiValues, userActivities, messages, conversations, deals, adminNotifications } from '../../shared/schema';
import { eq, and, gte, lte, sql, desc, count, sum, avg } from 'drizzle-orm';
import { insertKpiSchema, insertKpiValueSchema } from '../../shared/schema';
import type { InferSelectModel } from 'drizzle-orm';

type Kpi = InferSelectModel<typeof kpis>;
type KpiValue = InferSelectModel<typeof kpiValues>;
type InsertKpiValue = typeof insertKpiValueSchema._type;

/**
 * Serviço para gerenciamento de KPIs (Key Performance Indicators)
 */
class KpiService {
  /**
   * Busca um KPI pelo ID
   */
  async getKpi(id: number): Promise<Kpi | undefined> {
    const results = await db.select().from(kpis).where(eq(kpis.id, id));
    return results[0];
  }

  /**
   * Lista todos os KPIs, opcionalmente filtrados por categoria
   */
  async listKpis(category?: string): Promise<Kpi[]> {
    if (category) {
      return db.select().from(kpis).where(eq(kpis.category, category));
    }
    return db.select().from(kpis);
  }

  /**
   * Cria um novo KPI
   */
  async createKpi(kpi: any): Promise<Kpi> {
    const results = await db.insert(kpis).values(kpi).returning();
    return results[0];
  }

  /**
   * Atualiza um KPI existente
   */
  async updateKpi(id: number, kpi: Partial<Kpi>): Promise<Kpi | undefined> {
    const results = await db.update(kpis).set(kpi).where(eq(kpis.id, id)).returning();
    return results[0];
  }

  /**
   * Exclui um KPI
   */
  async deleteKpi(id: number): Promise<boolean> {
    const result = await db.delete(kpis).where(eq(kpis.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  /**
   * Busca valores históricos de um KPI
   */
  async getKpiValues(kpiId: number, periodType?: string, limit?: number): Promise<KpiValue[]> {
    const conditions = [eq(kpiValues.kpiId, kpiId)];
    
    if (periodType) {
      conditions.push(eq(kpiValues.periodType, periodType));
    }
    
    const result = await db.select()
      .from(kpiValues)
      .where(and(...conditions))
      .orderBy(desc(kpiValues.dateFrom));
    
    if (limit && result.length > limit) {
      return result.slice(0, limit);
    }
    
    return result;
  }

  /**
   * Verifica se um KPI está abaixo da meta e cria alerta se necessário
   */
  private async checkKpiThreshold(kpi: Kpi, currentValue: number): Promise<void> {
    if (!kpi.warningThreshold || currentValue >= kpi.warningThreshold) {
      return;
    }

    // Criar notificação de alerta usando o schema correto
    const notification = {
      title: `Alerta de KPI: ${kpi.name}`,
      message: `O KPI "${kpi.name}" está abaixo da meta. Valor atual: ${currentValue}, Meta: ${kpi.warningThreshold}`,
      type: 'kpi_alert',
      priority: 'high',
      isGlobal: false,
      targetRoles: ['admin', 'manager'],
      startDate: new Date(),
      requiresAcknowledgement: true
    };

    await db.insert(adminNotifications).values(notification);
  }

  /**
   * Registra um novo valor para um KPI e verifica alertas
   */
  async createKpiValue(kpiValue: InsertKpiValue): Promise<KpiValue> {
    const results = await db.insert(kpiValues).values(kpiValue).returning();
    const newValue = results[0];

    // Buscar o KPI completo para verificar thresholds
    const kpi = await this.getKpi(kpiValue.kpiId);
    if (kpi) {
      await this.checkKpiThreshold(kpi, kpiValue.value);
    }

    return newValue;
  }

  /**
   * Calcula e atualiza KPIs de atendimento
   * Métricas: tempo médio de resposta, taxa de resolução, satisfação do cliente
   */
  async updateCustomerServiceKpis(dateFrom: Date, dateTo: Date): Promise<void> {
    try {
      const responseTimeKpi = await this.getOrCreateKpi({
        name: 'Tempo Médio de Resposta',
        description: 'Tempo médio entre mensagens do cliente e respostas do atendente',
        category: 'customer_service',
        metricType: 'time',
        warningThreshold: 900, // 15 minutos em segundos
      });

      const responseTimeResult = await db.execute(sql`
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
        SELECT AVG(EXTRACT(EPOCH FROM (agent_response_time - client_message_time)) / 60) AS avg_response_time_minutes
        FROM message_pairs
      `);

      const avgResponseTimeRaw = responseTimeResult.rows[0]?.avg_response_time_minutes;
      const avgResponseTime = typeof avgResponseTimeRaw === 'number' ? avgResponseTimeRaw : 0;
      
      await this.createKpiValue({
        kpiId: responseTimeKpi.id,
        value: Math.round(avgResponseTime * 100),
        textValue: `${avgResponseTime.toFixed(2)} min`,
        dateFrom,
        dateTo,
        periodType: this.determinePeriodType(dateFrom, dateTo),
        metadata: { unit: 'minutes' }
      });

      const resolutionRateKpi = await this.getOrCreateKpi({
        name: 'Taxa de Resolução',
        description: 'Percentual de conversas marcadas como resolvidas',
        category: 'customer_service',
        metricType: 'percentage',
        warningThreshold: 7000, // 70% (valor armazenado em centésimos)
      });

      const totalConversations = await db.select({ count: count() }).from(conversations)
        .where(and(
          gte(conversations.createdAt, dateFrom),
          lte(conversations.createdAt, dateTo)
        ));
      
      const resolvedConversations = await db.select({ count: count() }).from(conversations)
        .where(and(
          gte(conversations.createdAt, dateFrom),
          lte(conversations.createdAt, dateTo),
          eq(conversations.status, 'resolved')
        ));

      const total = totalConversations[0]?.count || 0;
      const resolved = resolvedConversations[0]?.count || 0;
      const resolutionRate = total > 0 ? (resolved / total) * 100 : 0;

      await this.createKpiValue({
        kpiId: resolutionRateKpi.id,
        value: Math.round(resolutionRate * 100),
        textValue: `${resolutionRate.toFixed(2)}%`,
        dateFrom,
        dateTo,
        periodType: this.determinePeriodType(dateFrom, dateTo),
        metadata: { total, resolved }
      });

      const productivityKpi = await this.getOrCreateKpi({
        name: 'Produtividade do Atendente',
        description: 'Média de mensagens enviadas por hora de trabalho',
        category: 'customer_service',
        metricType: 'ratio',
        warningThreshold: 1000, // 10 mensagens/hora (valor armazenado em centésimos)
      });

      const messagesSent = await db.select({ count: count() }).from(messages)
        .where(and(
          gte(messages.timestamp, dateFrom),
          lte(messages.timestamp, dateTo),
          eq(messages.sender, 'user')
        ));
      
      const workingDays = this.getWorkingDaysBetweenDates(dateFrom, dateTo);
      const workingHours = workingDays * 8;
      
      const messagesCount = messagesSent[0]?.count || 0;
      const productivity = workingHours > 0 ? messagesCount / workingHours : 0;

      await this.createKpiValue({
        kpiId: productivityKpi.id,
        value: Math.round(productivity * 100),
        textValue: `${productivity.toFixed(2)} msgs/h`,
        dateFrom,
        dateTo,
        periodType: this.determinePeriodType(dateFrom, dateTo),
        metadata: { messages: messagesCount, hours: workingHours }
      });
    } catch (error) {
      console.error('Erro ao atualizar KPIs de atendimento:', error);
      throw error;
    }
  }

  /**
   * Calcula e atualiza KPIs de vendas
   * Métricas: taxa de conversão, valor médio de venda, ciclo de vendas
   */
  async updateSalesKpis(dateFrom: Date, dateTo: Date): Promise<void> {
    try {
      const conversionRateKpi = await this.getOrCreateKpi({
        name: 'Taxa de Conversão',
        description: 'Percentual de leads convertidos em vendas',
        category: 'sales',
        metricType: 'percentage',
        warningThreshold: 2000, // 20% (valor armazenado em centésimos)
        criticalThreshold: 1500, // 15%
        goal: 3000, // 30%
        unit: '%'
      });

      const totalLeads = await db.select({ count: count() }).from(deals)
        .where(and(
          gte(deals.createdAt, dateFrom),
          lte(deals.createdAt, dateTo)
        ));
      
      const wonDeals = await db.select({ count: count() }).from(deals)
        .where(and(
          gte(deals.createdAt, dateFrom),
          lte(deals.createdAt, dateTo),
          eq(deals.stage, 'won')
        ));

      const leads = totalLeads[0]?.count || 0;
      const won = wonDeals[0]?.count || 0;
      const conversionRate = leads > 0 ? (won / leads) * 100 : 0;

      await this.createKpiValue({
        kpiId: conversionRateKpi.id,
        value: Math.round(conversionRate * 100),
        textValue: `${conversionRate.toFixed(2)}%`,
        dateFrom,
        dateTo,
        periodType: this.determinePeriodType(dateFrom, dateTo),
        metadata: { leads, won }
      });

      const avgDealValueKpi = await this.getOrCreateKpi({
        name: 'Valor Médio de Venda',
        description: 'Valor médio das vendas fechadas',
        category: 'sales',
        metricType: 'currency',
        warningThreshold: 50000, // R$ 500,00 (valor armazenado em centavos)
        criticalThreshold: 30000, // R$ 300,00
        goal: 100000, // R$ 1.000,00
        unit: 'BRL'
      });

      const dealValues = await db.select({ 
        avg: avg(deals.value) 
      }).from(deals)
        .where(and(
          gte(deals.createdAt, dateFrom),
          lte(deals.createdAt, dateTo),
          eq(deals.stage, 'won')
        ));

      const avgValue = Number(dealValues[0]?.avg || 0);
      
      await this.createKpiValue({
        kpiId: avgDealValueKpi.id,
        value: Math.round(avgValue),
        textValue: `R$ ${(avgValue / 100).toFixed(2)}`,
        dateFrom,
        dateTo,
        periodType: this.determinePeriodType(dateFrom, dateTo),
        metadata: { currency: 'BRL' }
      });

      const salesCycleKpi = await this.getOrCreateKpi({
        name: 'Ciclo de Vendas',
        description: 'Tempo médio do primeiro contato até o fechamento da venda',
        category: 'sales',
        metricType: 'time',
        warningThreshold: 4320, // 72 horas em minutos
        criticalThreshold: 5760, // 96 horas em minutos
        goal: 2880, // 48 horas em minutos
        unit: 'min'
      });

      const cycleResult = await db.execute(sql`
        WITH first_contacts AS (
          SELECT 
            d.id AS deal_id,
            d.created_at AS deal_created,
            MIN(c.created_at) AS first_contact
          FROM deals d
          JOIN conversations c ON d.contact_id = c.contact_id
          WHERE d.stage = 'won'
            AND d.created_at BETWEEN ${dateFrom} AND ${dateTo}
          GROUP BY d.id, d.created_at
        )
        SELECT AVG(EXTRACT(EPOCH FROM (deal_created - first_contact)) / 60) AS avg_minutes
        FROM first_contacts
        WHERE first_contact IS NOT NULL
      `);

      const avgMinutesRaw = cycleResult.rows[0]?.avg_minutes;
      const avgMinutes = typeof avgMinutesRaw === 'number' ? avgMinutesRaw : 0;
      
      await this.createKpiValue({
        kpiId: salesCycleKpi.id,
        value: Math.round(avgMinutes),
        textValue: `${Math.floor(avgMinutes / 60)}h ${Math.round(avgMinutes % 60)}m`,
        dateFrom,
        dateTo,
        periodType: this.determinePeriodType(dateFrom, dateTo),
        metadata: { unit: 'minutes' }
      });

      const salesValueKpi = await this.getOrCreateKpi({
        name: 'Valor Total de Vendas',
        description: 'Soma do valor de todas as vendas no período',
        category: 'sales',
        metricType: 'currency',
        warningThreshold: 1000000, // R$ 10.000,00 (valor armazenado em centavos)
        criticalThreshold: 500000, // R$ 5.000,00
        goal: 2000000, // R$ 20.000,00
        unit: 'BRL'
      });

      const totalSales = await db.select({ 
        sum: sum(deals.value) 
      }).from(deals)
        .where(and(
          gte(deals.createdAt, dateFrom),
          lte(deals.createdAt, dateTo),
          eq(deals.stage, 'won')
        ));
      
      const totalSalesValue = Number(totalSales[0]?.sum || 0);
      
      await this.createKpiValue({
        kpiId: salesValueKpi.id,
        value: Math.round(totalSalesValue),
        textValue: `R$ ${(totalSalesValue / 100).toFixed(2)}`,
        dateFrom,
        dateTo,
        periodType: this.determinePeriodType(dateFrom, dateTo),
        metadata: { currency: 'BRL' }
      });

      const avgTicketKpi = await this.getOrCreateKpi({
        name: 'Ticket Médio',
        description: 'Valor médio por venda',
        category: 'sales',
        metricType: 'currency',
        warningThreshold: 50000, // R$ 500,00 (valor armazenado em centavos)
        criticalThreshold: 30000, // R$ 300,00
        goal: 100000, // R$ 1.000,00
        unit: 'BRL'
      });

      const avgTicket = totalSalesValue > 0 ? totalSalesValue / won : 0;
      
      await this.createKpiValue({
        kpiId: avgTicketKpi.id,
        value: Math.round(avgTicket),
        textValue: `R$ ${(avgTicket / 100).toFixed(2)}`,
        dateFrom,
        dateTo,
        periodType: this.determinePeriodType(dateFrom, dateTo),
        metadata: { currency: 'BRL' }
      });

      // Novos KPIs de vendas
      const leadsBySourceKpi = await this.getOrCreateKpi({
        name: 'Leads por Origem',
        description: 'Distribuição de leads por fonte de origem',
        category: 'sales',
        metricType: 'ratio',
        unit: 'leads'
      });

      const leadsBySource = await db.select({
        source: deals.source,
        count: count()
      })
      .from(deals)
      .where(and(
        gte(deals.createdAt, dateFrom),
        lte(deals.createdAt, dateTo)
      ))
      .groupBy(deals.source);

      await this.createKpiValue({
        kpiId: leadsBySourceKpi.id,
        value: leadsBySource.length,
        textValue: JSON.stringify(leadsBySource),
        dateFrom,
        dateTo,
        periodType: this.determinePeriodType(dateFrom, dateTo),
        metadata: { sources: leadsBySource }
      });

      const dealsByRegionKpi = await this.getOrCreateKpi({
        name: 'Vendas por Região',
        description: 'Distribuição geográfica das vendas',
        category: 'sales',
        metricType: 'ratio',
        unit: 'deals'
      });

      const dealsByRegion = await db.select({
        region: deals.region,
        count: count(),
        value: sum(deals.value)
      })
      .from(deals)
      .where(and(
        gte(deals.createdAt, dateFrom),
        lte(deals.createdAt, dateTo),
        eq(deals.stage, 'won')
      ))
      .groupBy(deals.region);

      await this.createKpiValue({
        kpiId: dealsByRegionKpi.id,
        value: dealsByRegion.length,
        textValue: JSON.stringify(dealsByRegion),
        dateFrom,
        dateTo,
        periodType: this.determinePeriodType(dateFrom, dateTo),
        metadata: { regions: dealsByRegion }
      });

    } catch (error) {
      console.error('Erro ao atualizar KPIs de vendas:', error);
      throw error;
    }
  }

  /**
   * Atualiza KPIs quando uma nova mensagem é recebida
   */
  async updateKpisOnNewMessage(messageData: any): Promise<void> {
    try {
      const now = new Date();
      const startOfDay = new Date(now);
      startOfDay.setHours(0, 0, 0, 0);
      
      await this.updateCustomerServiceKpis(startOfDay, now);
      
      if (messageData.sender === 'contact') {
        const conversation = await db.select().from(conversations)
          .where(eq(conversations.id, messageData.conversationId))
          .limit(1);
        
        if (conversation[0]?.contactId) {
          const contactDeals = await db.select().from(deals)
            .where(eq(deals.contactId, conversation[0].contactId));
          
          if (contactDeals.length > 0) {
            await this.updateSalesKpis(startOfDay, now);
          }
        }
      }
    } catch (error) {
      console.error('Erro ao atualizar KPIs após nova mensagem:', error);
    }
  }

  /**
   * Atualiza KPIs quando um negócio/deal é atualizado
   */
  async updateKpisOnDealUpdate(dealData: any): Promise<void> {
    try {
      const now = new Date();
      const startOfDay = new Date(now);
      startOfDay.setHours(0, 0, 0, 0);
      
      await this.updateSalesKpis(startOfDay, now);
    } catch (error) {
      console.error('Erro ao atualizar KPIs após atualização de deal:', error);
    }
  }

  /**
   * Busca ou cria um KPI com os parâmetros fornecidos
   */
  private async getOrCreateKpi(kpiData: Partial<Kpi>): Promise<Kpi> {
    const existingKpis = await db.select().from(kpis)
      .where(and(
        eq(kpis.name, kpiData.name as string),
        eq(kpis.category, kpiData.category as string)
      ));
    
    if (existingKpis.length > 0) {
      return existingKpis[0];
    }
    
    const newKpi = {
      ...kpiData,
      active: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const results = await db.insert(kpis).values(newKpi as any).returning();
    return results[0];
  }

  /**
   * Determina o tipo de período com base nas datas
   */
  private determinePeriodType(dateFrom: Date, dateTo: Date): string {
    const diffMs = dateTo.getTime() - dateFrom.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    
    if (diffDays <= 1) return 'daily';
    if (diffDays <= 7) return 'weekly';
    if (diffDays <= 31) return 'monthly';
    if (diffDays <= 92) return 'quarterly';
    return 'yearly';
  }

  /**
   * Calcula o número de dias úteis entre duas datas
   */
  private getWorkingDaysBetweenDates(startDate: Date, endDate: Date): number {
    let count = 0;
    const curDate = new Date(startDate.getTime());
    
    while (curDate <= endDate) {
      const dayOfWeek = curDate.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        count++;
      }
      curDate.setDate(curDate.getDate() + 1);
    }
    
    return count;
  }
}

export const kpiService = new KpiService();
