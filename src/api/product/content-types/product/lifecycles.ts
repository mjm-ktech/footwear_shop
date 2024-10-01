import { debug } from '../../../../utils'
export default {
  async afterCreate(event) {
    const { result, params } = event;
    let { height, id, promotion_price, price } = result;
    if(!height) {
      height = 0;
    }
    let height_type: "low" | "medium" | "high"
    if (height >= 0 && height <= 5.5) {
      height_type = "low"
    }
    if (height >= 5.6 && height <= 7.5) {
      height_type = "medium"
    }
    if (height >= 7.6) {
      height_type = "high"
    }

    await strapi.entityService.update("api::product.product", id, {
      data: {
        height_type: height_type
      }
    });

    if (promotion_price == 0) {
      await strapi.entityService.update("api::product.product", id, {
        data: {
          promotion_price: price
        }
      });
    }
    // do something to the result;
  }
}
