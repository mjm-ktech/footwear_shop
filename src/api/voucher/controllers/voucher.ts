/**
 * voucher controller
 */

import { factories } from "@strapi/strapi";
import { debug } from "../../../utils";
export default factories.createCoreController(
  "api::voucher.voucher",
  ({ strapi }) => ({
    async checkVoucher(ctx) {
      const { code } = ctx.request.body;

      if (!code) {
        return ctx.badRequest("code is required");
      }
      const voucher = await strapi.entityService.findMany(
        "api::voucher.voucher",
        {
          filters: {
            code: code,
          },
        }
      );
      if(voucher.length === 0) {
        return { id: null, status: false };
      }
      if ((voucher.length > 0 && new Date(voucher[0].expiry_date) > new Date() )|| (voucher.length > 0 && voucher[0].expiry_date === null)) {
        return {
          voucher: voucher[0],
          status: true,
        };
      } else {
        return { voucher: voucher[0], status: false };
      }
    },
  })
);
