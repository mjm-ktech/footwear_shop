export default {
  createOverviewRecord: {
    task: async ({ strapi }) => {
      try {
        strapi.log.info("create overview record");
        await strapi.service("api::overview.overview").insertRecord();
      } catch (e) {
        strapi.log.error(e);
      }
    },
    options: {
      rule: "0 0 0 * * *",
      tz: "Asia/Ho_Chi_Minh",
    },
  }

}
