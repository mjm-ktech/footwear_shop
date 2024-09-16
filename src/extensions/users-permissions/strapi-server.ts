const { sanitize, validate } = require("@strapi/utils");
const { contentAPI } = sanitize;
const uid = "plugin::users-permissions.user";
import utils from "@strapi/utils";
import { debug } from "../../utils"
const {
  contentTypes: { getNonWritableAttributes },
} = require("@strapi/utils");
const { concat, compact, isArray } = require("lodash/fp");
import _ from "lodash";
import auth from "./validation/auth";
const getService = (name) => {
  return strapi.plugin("users-permissions").service(name);
};
const { ApplicationError, ValidationError, ForbiddenError } = utils.errors;
const sanitizeUser = (user, ctx) => {
  const { auth } = ctx.state;
  const userSchema = strapi.getModel("plugin::users-permissions.user");
  return sanitize.contentAPI.output(user, userSchema);
};
const sanitizeQuery = async (ctx) => {
  const contentType = strapi.contentType(uid);
  return await contentAPI.input(ctx.query, contentType, ctx.state.auth);
};

const sanitizeOutput = async (user, ctx) => {
  const schema = strapi.getModel(uid);
  const { auth } = ctx.state;

  return sanitize.contentAPI.output(user, schema, { auth });
};

export default (plugin) => {
  plugin.controllers.user.find = async (ctx) => {
    const schema = strapi.getModel("plugin::users-permissions.user");
    const { auth } = ctx.state;
    await validate.contentAPI.query(ctx.query, schema, { auth });

    let sanitizedQueryParams = await sanitize.contentAPI.query(
      ctx.query,
      schema,
      { auth }
    );
    //cheating here, because currently user findPage only accept page & pageSize, not pagination object.
    sanitizedQueryParams = {
      ...sanitizedQueryParams,
      ...(sanitizedQueryParams.pagination as Record<string, unknown>),
    };
    const { results, pagination } = await strapi.entityService.findPage(
      "plugin::users-permissions.user",
      sanitizedQueryParams
    );
    const users = await Promise.all(
      results.map((user) => sanitize.contentAPI.output(user, schema, { auth }))
    );
    ctx.body = {
      data: users,
      meta: {
        pagination: pagination,
      },
    };
  };

  plugin.controllers.auth.register = async (ctx) => {
    const pluginStore = await strapi.store({
      type: "plugin",
      name: "users-permissions",
    });

    const settings: any = await pluginStore.get({ key: "advanced" });

    if (!settings?.allow_register) {
      throw new ApplicationError("Register action is currently disabled");
    }

    const { register }: any = strapi.config.get("plugin.users-permissions");
    const alwaysAllowedKeys = ["username", "password", "email"];
    const userModel = strapi.contentTypes["plugin::users-permissions.user"];
    const { attributes }: any = userModel;

    const nonWritable = getNonWritableAttributes(userModel);

    const allowedKeys = compact(
      concat(
        alwaysAllowedKeys,
        isArray(register?.allowedFields)
          ? // Note that we do not filter allowedFields in case a user explicitly chooses to allow a private or otherwise omitted field on registration
            register.allowedFields // if null or undefined, compact will remove it
          : // to prevent breaking changes, if allowedFields is not set in config, we only remove private and known dangerous user schema fields
            // TODO V5: allowedFields defaults to [] when undefined and remove this case
            Object.keys(attributes).filter(
              (key) =>
                !nonWritable.includes(key) &&
                !attributes[key].private &&
                ![
                  // many of these are included in nonWritable, but we'll list them again to be safe and since we're removing this code in v5 anyway
                  // Strapi user schema fields
                  "confirmed",
                  "blocked",
                  "confirmationToken",
                  "resetPasswordToken",
                  "provider",
                  "id",
                  "role",
                  // other Strapi fields that might be added
                  "createdAt",
                  "updatedAt",
                  "createdBy",
                  "updatedBy",
                  "publishedAt", // d&p
                  "strapi_reviewWorkflows_stage", // review workflows
                ].includes(key)
            )
      )
    );

    const params: any = {
      ..._.pick(ctx.request.body, allowedKeys),
      provider: "local",
    };

    const ref = ctx.request.body?.ref || null;
    await auth.validateRegisterBody(params);

    const role = await strapi
      .query("plugin::users-permissions.role")
      .findOne({ where: { type: settings.default_role } });

    if (!role) {
      throw new ApplicationError("Impossible to find the default role");
    }

    const { email, username, provider } = params;

    const identifierFilter = {
      $or: [
        { email: email.toLowerCase() },
        { username: email.toLowerCase() },
        { username },
        { email: username },
      ],
    };

    const conflictingUserCount = await strapi
      .query("plugin::users-permissions.user")
      .count({
        where: { ...identifierFilter, provider },
      });

    if (conflictingUserCount > 0) {
      throw new ApplicationError("Email or Username are already taken");
    }

    if (settings.unique_email) {
      const conflictingUserCount = await strapi
        .query("plugin::users-permissions.user")
        .count({
          where: { ...identifierFilter },
        });

      if (conflictingUserCount > 0) {
        throw new ApplicationError("Email or Username are already taken");
      }
    }

    const newUser = {
      ...params,
      role: role.id,
      email: email.toLowerCase(),
      username,
      confirmed: !settings.email_confirmation,
    };

    const user = await getService("user").add(newUser);

    const sanitizedUser = await sanitizeUser(user, ctx);

    if (settings.email_confirmation) {
      try {
        await getService("user").sendConfirmationEmail(sanitizedUser);
      } catch (err) {
        throw new ApplicationError(err.message);
      }

      return ctx.send({ user: sanitizedUser });
    }
    // get now timezone via moment
    // create new overview
    const overView = await strapi.entityService.findMany(
      "api::overview.overview",
      {
        sort: {
          createdAt: "desc",
        },
        limit: 1,
      }
    );

    // update count new user
    await strapi.db
      .connection("overviews")
      .where({ id: overView[0].id })
      .increment("number_of_new_customer", 1);

    // const startVoucher = await strapi.entityService.findMany(
    //   "api::voucher-start.voucher-start",
    //   {
    //     populate: {
    //       voucher: {
    //         filters: {
    //           publishedAt: {
    //             $notNull: true,
    //           },
    //         },
    //       },
    //     },
    //   }
    // );
    // get voucher for new user

    // create user-voucher

    const jwt = getService("jwt").issue(_.pick(user, ["id"]));
    return ctx.send({
      jwt,
      user: sanitizedUser,
    });
  },
    plugin.routes["content-api"].routes.push({
      method: "POST",
      path: "/auth/local/register",
      handler: "auth.register",
      config: {
        middlewares: ["plugin::users-permissions.rateLimit"],
        prefix: "",
      },
    });
  return plugin;
};
