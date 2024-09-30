import { debug } from "../../../../utils";
import { isNull } from "lodash";
export default {
  async afterCreate(event) {
    try {
      const { result, params } = event;
      const { name, id } = result;

    await strapi.entityService.create("api::notification.notification",
      {
        data: {
          order: {
            id: id
          }
        }
      });
    } catch (e) {
      strapi.log.error(`fail after create advertisement ${e}`);
    }
  },
  async afterUpdate(event) {
    try {
      const { result, params } = event;
      const { name, id, status, total } = result;
      const order = await strapi.entityService.findOne("api::order.order", id, {
        populate: {
          user: true
        }
      })
      if (status === "CONFIRM") {
        await strapi.services["api::order.order"].countOrderByDay(total);
        const check = await strapi.services["api::order.order"].reduceStockForProduct(id);

        if (!check) {
          await strapi.entityService.update("api::order.order", id, {
            data: {
              status: "CANCEL",
              reason: "Không đủ số lượng sản phẩm"
            }
          })
        } else {
          const order = await strapi.entityService.findOne("api::order.order", id, {
            populate: {
              order_details: {
                populate: {
                  product: true
                }
              }
            }
          });

          const { order_details } = order;

          order_details.map(async (order_detail) => {
            await strapi.db
            .connection("products")
            .where({ id: order_detail.product.id })
            .increment("total_purchase", 1)
            .increment("total_revenue", Number(order_detail.quantity) * Number(order_detail.unit_price))
          })
        }
        if (isNull(order?.user) === false) {
          console.log("hello world");
          await strapi.services["api::order.order"].updatePointForUser(order.user.id,total);
        }
      }
    } catch (e) {
      strapi.log.error(`fail after update advertisement ${e}`);
    }
  }
}

