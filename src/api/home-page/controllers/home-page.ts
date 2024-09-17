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
              }
            },
            new_product: {
              populate: {
                category: {
                  fields: ["name", "slug"],
                  populate: {
                    products: {
                      fields: ["name", "slug", "price", "promotion_price"],
                      filter: {
                        isShow: true,
                        is_parent: true,
                      },
                      populate: {
                        avatar: {
                          fields: ["caption", "url"],
                        },
                        gallery: {
                          fields: ["caption", "url"],
                        },
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
                            color: true
                          },
                        },
                        color: true
                      },
                    },
                  },
                },
                image: {
                  fields: ["caption", "url"],
                },
              },
            },
            special_product: {
              populate: {
                product: {
                  filter: {
                    isShow: true,
                    is_parent: true,
                  },
                  populate: {
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
                        color: true
                      },
                    },
                    avatar: {
                      fields: ["caption", "url"],
                    },
                    gallery: {
                      fields: ["caption", "url"],
                    },
                    color: true
                  },
                },
              },
            },
            best_selling: {
              populate: {
                product: {
                  filter: {
                    isShow: true,
                    is_parent: true,
                  },
                  populate: {
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
                        color: true
                      },
                    },
                    avatar: {
                      fields: ["caption", "url"],
                    },
                    gallery: {
                      fields: ["caption", "url"],
                    },
                    color: true
                  },
                },
              },
            },
            sale_product: {
              populate: {
                product: {
                  filter: {
                    isShow: true,
                    is_parent: true,
                  },
                  populate: {
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
                        color: true
                      },
                    },
                    avatar: {
                      fields: ["caption", "url"],
                    },
                    gallery: {
                      fields: ["caption", "url"],
                    },
                    color: true
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
