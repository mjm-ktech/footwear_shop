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
  }
}
