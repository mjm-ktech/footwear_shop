/**
 * order controller
 */
import utils from "@strapi/utils";
const { ApplicationError, ValidationError, ForbiddenError } = utils.errors;
import { factories } from "@strapi/strapi";
import { debug } from "../../../utils/index";
const TRANSPORT_FEE = process.env.TRANSPORT_FEE || 0;
export default factories.createCoreController(
  "api::order.order",
  ({ strapi }) => ({
    async create(ctx) {
      try {
        const body = ctx.request.body.data;
        const { items, voucher, user } = ctx.request.body.data;
        delete body.items;
        let errors = [];
        let total = 0;
        if (items.length === 0) {
          throw new ValidationError("items is required");
        }
        let discount = 0;

        await Promise.all(
          items.map(async (item) => {
            const productDetail = await strapi.entityService.findOne(
              "api::product-detail.product-detail",
              item.product_detail_id,
              {
                populate: {
                  product: true,
                },
              }
            );
            if (!productDetail) {
              errors.push(item.product_detail_id);
            }
            if (productDetail) {
              total +=
                (Number(
                  Number(productDetail.product.promotion_price) === 0 ||
                    !productDetail.product.promotion_price
                    ? productDetail.product.price
                    : productDetail.product.promotion_price
                ) || 0) * item.quantity;
            }
          })
        );
        if (voucher.id) {
          const checkVoucher = await strapi.entityService.findOne(
            "api::voucher.voucher",
            voucher.id
          );
          const userVoucher = await strapi.entityService.findMany(
            "api::user-voucher.user-voucher",
            {
              filters: {
                user: {
                  id: user.id,
                },
                voucher: {
                  id: voucher.id,
                },
                status: "USED",
              },
            }
          );
          if (!checkVoucher || userVoucher.length === 1) {
            throw new ValidationError("voucher is not valid");
          }
          const reducePercent = checkVoucher?.percent_decrease || 0;

          const reduceAmount = checkVoucher?.amount_decrease || 0;

          if (reducePercent > 0) {
            discount = (total * reducePercent) / 100;
          } else {
            discount = Number(reduceAmount);
          }
          const userVoucher2 = await strapi.entityService.findMany(
            "api::user-voucher.user-voucher",
            {
              filters: {
                user: {
                  id: user.id,
                },
                voucher: {
                  id: voucher.id,
                },
                status: "UNUSED",
              },
            }
          );
          if (userVoucher2.length > 0) {
            await strapi.entityService.update(
              "api::user-voucher.user-voucher",
              userVoucher2[0].id,
              {
                data: {
                  status: "USED",
                },
              }
            );
          }

        }
        total += Number(TRANSPORT_FEE);
        body.total = total - discount;
        body.transport_fee = Number(TRANSPORT_FEE);

        if (errors.length > 0) {
          throw new ValidationError(`product_detail_id: ${errors} not found`);
        }

        let checkResult = [];
        await Promise.all(
          items.map(async (item) => {
            const productDetail = await strapi.entityService.findOne(
              "api::product-detail.product-detail",
              item.product_detail_id,
              {
                populate: {
                  product: true,
                },
              }
            );
            if (item.quantity > productDetail.stock) {
              checkResult.push(
                ` ${productDetail.product.name} - size: ${productDetail.size} - stock: ${productDetail.stock} `
              );
            }
          })
        );
        if (checkResult.length > 0) {
          return ctx.badRequest(`Các sản phẩm: ${checkResult} không đủ hàng`);
        }
        const order = await strapi.entityService.create("api::order.order", {
          data: {
            ...body,
          },
        });
        items.map(async (item) => {
          const productDetail = await strapi.entityService.findOne(
            "api::product-detail.product-detail",
            item.product_detail_id,
            {
              populate: {
                product: true,
              },
            }
          );
          await strapi.entityService.create("api::order-detail.order-detail", {
            data: {
              order: order.id,
              product: {
                id: productDetail.product.id,
              },
              quantity: item.quantity,
              unit_price:
                Number(productDetail.product.promotion_price) === 0 ||
                !productDetail.product.promotion_price
                  ? productDetail.product.price
                  : Number(productDetail.product.promotion_price),
              size: productDetail.size,
            },
          });
        });
        return {
          order: order,
        };
      } catch (e) {
        strapi.log.error(`An error occurred in create: ${e.message}`);
        return ctx.badRequest(e.message);
      }
    },
  })
);
