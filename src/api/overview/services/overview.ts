/**
 * overview service
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreService('api::overview.overview', ({ strapi }) => ({

  async insertRecord() {
    return await strapi.entityService.create("api::overview.overview", {
      data: {}
    });
  },

}));
