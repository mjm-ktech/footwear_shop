/**
 * home-page controller
 */

import { factories } from "@strapi/strapi";
export default factories.createCoreController(
  "api::home-page.home-page",
  ({ strapi }) => ({
    async find(ctx) {
      const { query } = ctx;
      const entity = await strapi.entityService.findMany(
        "api::home-page.home-page",
        {
          ...query,
          populate: {
            banner: {
              fields: ["caption", "url", "formats"],
              populate: {
                format: true,
              },
            },
            banner_for_mobile: {
              fields: ["caption", "url", "formats"],
              populate: {
                format: true,
              },
            },
            favorite_products: {
              populate: {
                product: {
                  filter: {
                    isShow: true,
                    is_parent: true,
                  },
                  populate: {
                    product_details: true,
                    children_product: {
                      fields: ["name", "slug", "price", "promotion_price"],
                      filter: {
                        isShow: true,
                        is_parent: false,
                      },
                      populate: {
                        avatar: {
                          fields: ["caption", "url"],
                        },
                        gallery: {
                          fields: ["caption", "url"],
                        },
                        color: true,
                        product_details: true,
                      },
                    },
                    avatar: {
                      fields: ["caption", "url"],
                    },
                    gallery: {
                      fields: ["caption", "url"],
                    },
                    color: true,
                    categories: true,
                  },
                },
              },
            },
            category_blocks_1: {
              populate: {
                category: true,
                banner: {
                  fields: ["caption", "url", "formats"],
                  populate: {
                    format: true,
                  },
                },
              },
            },
            category_blocks_2: {
              populate: {
                category: true,
                banner: {
                  fields: ["caption", "url", "formats"],
                  populate: {
                    format: true,
                  },
                },
              },
            },
          },
        }
      );
      return this.transformResponse(entity);
    },
  })
);
