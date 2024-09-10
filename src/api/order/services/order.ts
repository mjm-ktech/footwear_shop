/**
 * order service
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreService('api::order.order', ({ strapi }) => ({
  async reduceStockForProduct(OrderId) {
    const orderDetail = await strapi.entityService.findMany('api::order-detail.order-detail', {
      filters: {
        order: {
          id: OrderId
        }
      },
      populate: {
        product: {
          fields: ['id']
        }
      }
    });

    if(orderDetail.length === 0) {
      return;
    }
    let checkResult = [];
    // check stock
    await Promise.all(orderDetail.map(async (orderDetail) => {
      const { product, quantity, size } = orderDetail;
      const productDetail = await strapi.entityService.findMany('api::product-detail.product-detail',{
        filters: {
          size,
          product: {
            id: product.id
          }
        },
      });
      if (productDetail[0].stock < quantity) {
        checkResult.push(product.id);
      }
    }));

    if(checkResult.length > 0) {
      return false;
    }

    await Promise.all(orderDetail.map(async (orderDetail) => {
      const { product, quantity, size} = orderDetail;
      const productDetail = await strapi.entityService.findMany('api::product-detail.product-detail',{
        filters: {
          size,
          product: {
            id: product.id
          }
        },
      });
      await strapi.db.connection("product_details")
        .where({ id: productDetail[0].id }).decrement("stock", quantity);
    }));
    return true;

  }
}));
