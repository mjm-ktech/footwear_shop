
const { sanitize, validate } = require('@strapi/utils')
const { contentAPI } = sanitize;
const uid = "plugin::users-permissions.user";

const sanitizeQuery = async (ctx) => {
  const contentType = strapi.contentType(uid)
  return await contentAPI.input(ctx.query, contentType, ctx.state.auth)
};

const sanitizeOutput = async (user, ctx) => {
  const schema = strapi.getModel(uid);
  const { auth } = ctx.state;

  return sanitize.contentAPI.output(user, schema, { auth });
};

module.exports = (plugin) => {
  plugin.controllers.user.find = async (ctx) => {
      const schema = strapi.getModel('plugin::users-permissions.user');
      const { auth } = ctx.state;
      await validate.contentAPI.query(ctx.query, schema, { auth });

      let sanitizedQueryParams = await sanitize.contentAPI.query(ctx.query, schema, { auth });
      //cheating here, because currently user findPage only accept page & pageSize, not pagination object.
      sanitizedQueryParams = { ...sanitizedQueryParams, ...sanitizedQueryParams.pagination as Record<string, unknown> };
      const { results, pagination } = await strapi.entityService.findPage('plugin::users-permissions.user', sanitizedQueryParams);
      const users = await Promise.all(results.map((user) => sanitize.contentAPI.output(user, schema, { auth })));
      ctx.body = {
        data: users,
        meta: {
          pagination: pagination,
        },
      };
    };
  return plugin;
}
