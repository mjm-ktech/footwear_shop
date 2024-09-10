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
      const { name, id, status } = result;
      if (status === "CONFIRM") {
        console.log("CONFIRM");
        const check = await strapi.services["api::order.order"].reduceStockForProduct(id);
        console.log("🚀 ~ afterUpdate ~ check:", check)

        if (!check) {
          await strapi.entityService.update("api::order.order", id, {
            data: {
              status: "CANCEL",
              reason: "Không đủ số lượng sản phẩm"
            }
          })
        }
      }
    } catch (e) {
      strapi.log.error(`fail after update advertisement ${e}`);
    }
  }
}

