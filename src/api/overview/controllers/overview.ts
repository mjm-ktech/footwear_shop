/**
 * overview controller
 */
import moment from 'moment-timezone';
import { factories } from '@strapi/strapi'

export default factories.createCoreController('api::overview.overview', ({ strapi }) => ({
  async trackOverview(ctx) {
    const overView = await strapi.entityService.findMany("api::overview.overview", {
      limit: 2,
      sort: {
        createdAt: "desc",
      }
    });
    const now = moment().tz("Asia/Ho_Chi_Minh").format("YYYY-MM-DD HH:mm:ss");
    const startMonth = moment().tz("Asia/Ho_Chi_Minh").startOf("month").format("YYYY-MM-DD HH:mm:ss");
    // get date start month of previous month
    const startMonthPrev = moment(startMonth).subtract(1, "month").format("YYYY-MM-DD HH:mm:ss");
    const endMonthPrev = moment(startMonth).subtract(1, "month").endOf("month").format("YYYY-MM-DD HH:mm:ss");
    const previousMonthOverView = await strapi.entityService.findMany("api::overview.overview", {
      sort: {
        createdAt: "desc"
      },
      filters: {
        createdAt: {
          $gte: startMonthPrev,
          $lte: endMonthPrev
        }
      }
    });
    const nowOverView = await strapi.entityService.findMany("api::overview.overview", {
      sort: {
        createdAt: "desc"
      },
      filters: {
        createdAt: {
          $gte: startMonth,
          $lte: now
        }
      }
    });
    // reduce total_revenue for previousMonthOverView
    const totalRevenuePreviousMonth = previousMonthOverView.reduce((acc, overView) => {
      acc.total_revenue = Number(acc.total_revenue) + Number(overView.total_revenue)
      return acc
    }, {
      total_revenue: 0
    })
    const totalRevenueNowMonth = nowOverView.reduce((acc, overView) => {
      acc.total_revenue = Number(acc.total_revenue) + Number(overView.total_revenue)
      return acc
    }, {
      total_revenue: 0
    });
    if (overView.length < 2 && overView.length > 0) {
      return {
        number_of_new_customer: {
          value: overView[0].number_of_new_customer || 0,
          percent: 0
        },
        total_revenue: {
          value: overView[0].total_revenue || 0,
          percent: 0
        },
        total_order: {
          value: overView[0].total_order || 0,
          percent: 0
        },
        total_monthly_revenue: {
          value: totalRevenueNowMonth.total_revenue || 0,
          percent: 0
        }
      }
    }
    return {
      number_of_new_customer: {
        value: overView[0].number_of_new_customer || 0,
        percent: ((Number(overView[0].number_of_new_customer) - Number(overView[1].number_of_new_customer)) / Number(overView[1].number_of_new_customer)) * 100 || 0
      },
      total_revenue: {
        value: overView[0].total_revenue || 0,
        percent: ((Number(overView[0].total_revenue) - Number(overView[1].total_revenue)) / Number(overView[1].total_revenue)) * 100 || 0
      },
      total_order: {
        value: overView[0].total_order || 0,
        percent: ((Number(overView[0].total_order) - Number(overView[1].total_order)) / Number(overView[1].total_order)) * 100 || 0
      },
      total_monthly_revenue: {
        value: totalRevenueNowMonth.total_revenue || 0,
        percent: ((Number(totalRevenueNowMonth.total_revenue) - Number(totalRevenuePreviousMonth.total_revenue)) / Number(totalRevenuePreviousMonth.total_revenue)) * 100 || 0
      }
    }
  },



}));
