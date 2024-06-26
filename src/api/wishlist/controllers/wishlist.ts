/**
 * wishlist controller
 */

import { factories } from "@strapi/strapi";
import { debug } from "../../../utils";
export default factories.createCoreController(
  "api::wishlist.wishlist",
  ({ strapi }) => ({
    async create(ctx) {
      const { product_id } = ctx.request.body;
      const { id } = ctx?.state?.user || {};
      if (!id) {
        return ctx.badRequest(
          "not_login",
          "need to login to using this feature"
        );
      }
      if (!product_id) {
        return ctx.badRequest(
          "product_id_is_required",
          "product_id is required"
        );
      }
      const product = await strapi.entityService.findOne(
        "api::product.product",
        product_id
      );
      if (!product) {
        return ctx.badRequest("product_not_found", "product not found");
      }
      const wishList = await strapi.entityService.findMany(
        "api::wishlist.wishlist",
        {
          filters: {
            user: {
              id: id,
            },
            product: {
              id: product_id,
            },
          },
        }
      );
      if (wishList.length > 0) {
        return ctx.badRequest(
          "user's_wishlist_existed",
          "User's wishlist existed"
        );
      }
      const wishlist = await strapi.entityService.create(
        "api::wishlist.wishlist",
        {
          data: {
            user: {
              id: id,
            },
            product: {
              id: product_id,
            },
          },
        }
      );
      return wishlist;
    },
  })
);
