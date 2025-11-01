import { Op, Sequelize } from 'sequelize';
import { Appointment, Visit } from '../../../database/models';
import { AppointmentStatus } from '../../../database/models/appointment';
import dayjs from 'dayjs';

export interface DashboardStatistics {
  today: {
    total: number;
    completed: number;
    pending: number;
  };
  weekly: {
    total: number;
    completed: number;
    completion_rate: number;
  };
  monthly: {
    total: number;
    completed: number;
    completion_rate: number;
  };
  no_show_rate: number;
  avg_wait_time: number;
}

export class AppointmentStatisticsService {
  /**
   * Get comprehensive dashboard statistics
   * Uses optimized database aggregation queries
   * @returns {Promise<DashboardStatistics>} dashboard statistics
   */
  static async getDashboardStatistics(): Promise<DashboardStatistics> {
    const today = dayjs()
      .startOf('day')
      .toDate();
    const tomorrow = dayjs()
      .startOf('day')
      .add(1, 'day')
      .toDate();

    // Get start of current week (Monday)
    const weekStart = dayjs()
      .startOf('week')
      .startOf('day')
      .toDate();
    const weekEnd = dayjs()
      .endOf('week')
      .endOf('day')
      .toDate();

    // Get start of current month
    const monthStart = dayjs()
      .startOf('month')
      .startOf('day')
      .toDate();
    const monthEnd = dayjs()
      .endOf('month')
      .endOf('day')
      .toDate();

    // Get 30 days ago for no-show rate calculation
    const thirtyDaysAgo = dayjs()
      .subtract(30, 'day')
      .startOf('day')
      .toDate();

    // Execute all queries in parallel for optimal performance
    const [
      todayStats,
      weeklyStats,
      monthlyStats,
      noShowStats,
      avgWaitTimeResult,
    ] = await Promise.all([
      // Today's statistics
      this.getTodayStats(today, tomorrow),

      // Weekly statistics
      this.getWeeklyStats(weekStart, weekEnd),

      // Monthly statistics
      this.getMonthlyStats(monthStart, monthEnd),

      // No-show rate (last 30 days, excluding today)
      this.getNoShowRate(thirtyDaysAgo, today),

      // Average wait time for today
      this.getAverageWaitTime(today, tomorrow),
    ]);

    // Calculate completion rates
    const weeklyCompletionRate =
      weeklyStats.total > 0 ? Math.round((weeklyStats.completed / weeklyStats.total) * 100) : 0;

    const monthlyCompletionRate =
      monthlyStats.total > 0 ? Math.round((monthlyStats.completed / monthlyStats.total) * 100) : 0;

    // Calculate no-show rate percentage
    const noShowRate =
      noShowStats.total > 0 ? Math.round((noShowStats.no_shows / noShowStats.total) * 100) : 0;

    return {
      today: {
        total: todayStats.total,
        completed: todayStats.completed,
        pending: todayStats.pending,
      },
      weekly: {
        total: weeklyStats.total,
        completed: weeklyStats.completed,
        completion_rate: weeklyCompletionRate,
      },
      monthly: {
        total: monthlyStats.total,
        completed: monthlyStats.completed,
        completion_rate: monthlyCompletionRate,
      },
      no_show_rate: noShowRate,
      avg_wait_time: avgWaitTimeResult,
    };
  }

  /**
   * Get today's appointment statistics
   */
  private static async getTodayStats(
    startDate: Date,
    endDate: Date
  ): Promise<{
    total: number;
    completed: number;
    pending: number;
  }> {
    const where = {
      appointment_date: {
        [Op.gte]: startDate,
        [Op.lt]: endDate,
      },
    };

    const [total, completed, pending] = await Promise.all([
      Appointment.count({ where }),
      Appointment.count({
        where: {
          ...where,
          status: AppointmentStatus.COMPLETED,
        },
      }),
      Appointment.count({
        where: {
          ...where,
          status: { [Op.in]: [AppointmentStatus.SCHEDULED, AppointmentStatus.CONFIRMED] },
        },
      }),
    ]);

    return {
      total,
      completed,
      pending,
    };
  }

  /**
   * Get weekly appointment statistics
   */
  private static async getWeeklyStats(
    startDate: Date,
    endDate: Date
  ): Promise<{
    total: number;
    completed: number;
  }> {
    const where = {
      appointment_date: {
        [Op.gte]: startDate,
        [Op.lte]: endDate,
      },
    };

    const [total, completed] = await Promise.all([
      Appointment.count({ where }),
      Appointment.count({
        where: {
          ...where,
          status: AppointmentStatus.COMPLETED,
        },
      }),
    ]);

    return {
      total,
      completed,
    };
  }

  /**
   * Get monthly appointment statistics
   */
  private static async getMonthlyStats(
    startDate: Date,
    endDate: Date
  ): Promise<{
    total: number;
    completed: number;
  }> {
    const where = {
      appointment_date: {
        [Op.gte]: startDate,
        [Op.lte]: endDate,
      },
    };

    const [total, completed] = await Promise.all([
      Appointment.count({ where }),
      Appointment.count({
        where: {
          ...where,
          status: AppointmentStatus.COMPLETED,
        },
      }),
    ]);

    return {
      total,
      completed,
    };
  }

  /**
   * Get no-show rate for last 30 days
   */
  private static async getNoShowRate(
    startDate: Date,
    endDate: Date
  ): Promise<{
    total: number;
    no_shows: number;
  }> {
    const where = {
      appointment_date: {
        [Op.gte]: startDate,
        [Op.lt]: endDate,
      },
    };

    const [total, noShows] = await Promise.all([
      Appointment.count({ where }),
      Appointment.count({
        where: {
          ...where,
          status: AppointmentStatus.NO_SHOW,
        },
      }),
    ]);

    return {
      total,
      no_shows: noShows,
    };
  }

  /**
   * Get average wait time for today's appointments
   * Wait time = difference between appointment_time and visit.date_visit_start
   */
  private static async getAverageWaitTime(startDate: Date, endDate: Date): Promise<number> {
    const result = await Appointment.findOne({
      attributes: [
        [
          Sequelize.fn(
            'AVG',
            Sequelize.literal(
              `TIMESTAMPDIFF(MINUTE, 
                CONCAT(CAST(Appointment.appointment_date AS CHAR), ' ', Appointment.appointment_time),
                visit.date_visit_start
              )`
            )
          ),
          'avg_wait_time',
        ],
      ],
      where: {
        appointment_date: {
          [Op.gte]: startDate,
          [Op.lt]: endDate,
        },
        status: AppointmentStatus.COMPLETED,
        visit_id: { [Op.ne]: null },
      },
      include: [
        {
          model: Visit,
          as: 'visit',
          attributes: [],
          required: true,
          where: {
            date_visit_start: { [Op.ne]: null },
          },
        },
      ],
      raw: true,
    });

    const avgWaitTime = result ? (result as any).avg_wait_time : null;
    return avgWaitTime ? Math.round(Number(avgWaitTime)) : 0;
  }
}
