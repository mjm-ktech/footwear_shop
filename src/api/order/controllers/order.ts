/**
 * order controller
 */
import utils from "@strapi/utils";
const { ApplicationError, ValidationError, ForbiddenError } = utils.errors;
import { factories } from '@strapi/strapi';
export default factories.createCoreController('api::order.order', ({ strapi }) => ({
  async create(ctx) {
    try {
      const { id } = ctx.state.user;
      strapi.log.info(`start create order with user: ${id}`);
      const body = ctx.request.body.data;
      const { items, voucher } = ctx.request.body.data;

      if (!id) {
        return ctx.badRequest(
          "not_login",
          "need to login to using this feature"
        );
      }

      let errorItems = [];
      body.total = 0;
      let totalDiscount = 0;

      if (errorItems.length > 0) {
        throw new ValidationError(
          `product not found with id ${errorItems}`,
          "Bad request"
        );
      }
      delete body.items;
      body.user = {
        id: id,
      };

      // phi van chuyen mac dinh
      body.total += 35000;
      body.discount = totalDiscount;
      const order = await strapi.entityService.create("api::order.order", {
        data: body,
      });

      items.map(async (item) => {
        await strapi.entityService.create(
          "api::product-detail.product-detail",
          {
            data: {
              order: {
                id: order.id,
              },
              product: {
                id: item.product_id,
              },
              quanity: item.quanity,
              unit_price: item.unit_price,
            },
          }
        );
      });
      return {
        order: order
      };
    } catch (e) {
      strapi.log.error(`An error occurred in create: ${e.message}`);
      return ctx.badRequest(e.message);
    }
  },





}));
