export default {
  async afterCreate(event) {
    try {
      const { result, params } = event;
      const { name, id, reel } = result;

      const comment = await strapi.entityService.findOne("api::comment.comment", id ,{
        populate: {
          reel: true
        }
      });
      await strapi.db.connection("reels")
      .where({ id: comment.reel.id })
      .increment("total_comment", 1)
    } catch (e) {
      strapi.log.error(`fail after create advertisement ${e}`);
    }
  }
}
