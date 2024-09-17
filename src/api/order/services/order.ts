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

  },
  async countOrderByDay(total) {
    // check user already bought this order
    const overView = await strapi.entityService.findMany(
      "api::overview.overview",
      {
        sort: {
          createdAt: "desc",
        },
        limit: 1,
      }
    );
      return await strapi.db
        .connection("overviews")
        .where({ id: overView[0].id })
        .increment("total_order", 1)
        .increment("total_revenue", total)
  },
  async updatePointForUser(userId, total) {
    const point = Math.ceil(total / 50000);

    const user = await await strapi.entityService.findOne(
      "plugin::users-permissions.user",
      userId
    );

    const initUserPoint = user.point || 0;
    // Get member level from user
    const memberLevel = await strapi.entityService.findMany(
      "api::membership-class.membership-class",
      {
        filters: {
          point: {
            $lte: initUserPoint,
          },
        },
        sort: {
          point: "desc",
        },
      }
    );
    const initMemberLevelId = memberLevel[0].id;
    if (!user.point) {
      await strapi.entityService.update(
        "plugin::users-permissions.user",
        userId,
        {
          data: {
            point: 0,
          },
        }
      );
    }
    await strapi.db
      .connection("up_users")
      .where({ id: userId })
      .increment("point", point);

    // const filteredMembers = memberLevel.filter(member => member.point >= updatedUser);
    const afterUpdateUser = await await strapi.entityService.findOne(
      "plugin::users-permissions.user",
      userId
    );

    const memberLevel2 = await strapi.entityService.findMany(
      "api::membership-class.membership-class",
      {
        filters: {
          point: {
            $lte: afterUpdateUser.point || 0,
          },
        },
        sort: {
          point: "desc",
        },
      }
    );
    const AfterMemberLevelId = memberLevel2[0].id;

    if (AfterMemberLevelId !== initMemberLevelId) {
      // get voucher of member level
      const vouchers = await strapi.entityService.findMany(
        "api::voucher.voucher",
        {
          filters: {
            membership_class: {
              id: AfterMemberLevelId,
            },
          },
        }
      );

      // create voucher-user relationship
      for (let i = 0; i < vouchers.length; i++) {
        await strapi.entityService.create("api::user-voucher.user-voucher", {
          data: {
            voucher: vouchers[i].id,
            user: userId,
          },
        });
      }
    }
  },
}));
