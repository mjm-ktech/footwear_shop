/**
 * reel controller
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreController(
  "api::reel.reel",
  ({ strapi }) => ({
    async like(ctx) {
      try {
        const { id } = ctx?.state?.user || {};
        if (!id) {
          return ctx.badRequest(
            "not_login",
            "need to login to using this feature"
          );
        }
        const body = ctx.request.body.data;
        const { reel_id } = body;
        const reel = await strapi.entityService.findOne(
          "api::reel.reel",
          reel_id
        );
        if (!reel) {
          return ctx.badRequest("reel_not_found", "reel not found");
        }
        const activities = await strapi.entityService.findMany("api::reel-activity.reel-activity", {
          filters: {
            reel: {
              id: reel_id
            },
            user: {
              id: id
            }
          }
        });
        if (activities.length > 0 && activities[0].status === true) {
          return { message: "success" }
        }
        if (activities.length > 0 && activities[0].status === false) {
          await strapi.entityService.update("api::reel-activity.reel-activity", activities[0].id , {
            data: {
              status: true
            }
          });
        }
        if (activities.length === 0) {
          await strapi.entityService.create("api::reel-activity.reel-activity", {
            data: {
              reel: {
                id: reel_id
              },
              user: {
                id: id
              },
              status: true
            }
          });
        }

        await strapi.db
                .connection("reels")
                .where({ id: reel_id })
                .increment("like", 1);
        return {
          message: "success",
        };
      } catch (e) {
        return {
          message: "fail",
        };
      }
    },
    async dislike(ctx) {
      try {
        const { id } = ctx?.state?.user || {};
        if (!id) {
          return ctx.badRequest(
            "not_login",
            "need to login to using this feature"
          );
        }
        const body = ctx.request.body.data;
        const { reel_id } = body;
        const reel = await strapi.entityService.findOne(
          "api::reel.reel",
          reel_id
        );
        if (!reel) {
          return ctx.badRequest("reel_not_found", "reel not found");
        }
        const activities = await strapi.entityService.findMany("api::reel-activity.reel-activity", {
          filters: {
            reel: {
              id: reel_id
            },
            user: {
              id: id
            }
          }
        });
        if (activities.length == 0 || activities[0].status === false) {
          return { message: "success" }
        }
        if (activities.length > 0 && activities[0].status === true) {
          await strapi.entityService.update("api::reel-activity.reel-activity", activities[0].id , {
            data: {
              status: false
            }
          });
          await strapi.db
                  .connection("reels")
                  .where({ id: reel_id })
                  .increment("like", -1);
        }
        return {
          message: "success",
        };
      } catch (e) {
        return {
          message: "fail",
        };
      }
    },

    async checkStatusLike(ctx) {
      const { id } = ctx?.state?.user || {};
      if (!id) {
        return ctx.badRequest(
          "not_login",
          "need to login to using this feature"
        );
      }
      const body = ctx.request.body.data;
      const { reel_id } = body;
      const reel = await strapi.entityService.findOne(
        "api::reel.reel",
        reel_id
      );
      if (!reel) {
        return ctx.badRequest("reel_not_found", "reel not found");
      }
      const activities = await strapi.entityService.findMany("api::reel-activity.reel-activity", {
        filters: {
          reel: {
            id: reel_id
          },
          user: {
            id: id
          },
          status: true
        }
      });
      if (activities.length > 0) {
        return {
          status: true
        };
      }
      return {
        status: false
      };
    }
  })
);
