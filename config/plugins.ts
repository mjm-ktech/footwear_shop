export default ({ env }) => ({
  upload: {
    config: {
      provider: "aws-s3",
      providerOptions: {
        s3Options: {
          accessKeyId: env("AWS_ACCESS_KEY_ID"),
          secretAccessKey: env("AWS_ACCESS_SECRET"),
          region: env("AWS_REGION"),
          params: {
            ACL: env("AWS_ACL", "public-read"),
            signedUrlExpires: env("AWS_SIGNED_URL_EXPIRES", 15 * 60),
            Bucket: env("AWS_BUCKET"),
          },
        },
      },
      actionOptions: {
        upload: {},
        uploadStream: {},
        delete: {},
      },
    },
  },
  slugify: {
    enabled: true,
    config: {
      contentTypes: {
        category: {
          field: "slug",
          references: "name",
          options: {
            locale: "vi",
          },
        },
        product: {
          field: "slug",
          references: "name",
          options: {
            locale: "vi",
          },
        },
        reel: {
          field: "slug",
          references: "name",
          options: {
            locale: "vi",
          },
        },
        "blog-category": {
          field: "slug",
          references: "name",
          options: {
            locale: "vi",
          },
        },
        blog: {
          field: "slug",
          references: "name",
          options: {
            locale: "vi",
          },
        },
      },
    },
  },
  "users-permissions": {
    config: {
      jwt: {
        expiresIn: "7d",
      },
      register: {
        allowedFields: [
          "first_name",
          "last_name",
          "username",
          "gender",
          "birthday",
          "phone",
          "size",
          "address",
        ],
      },
    },
  },
  meilisearch: {
    enabled: true,
    config: {
      // Your meili host
      host: env("MEILISEARCH_HOST", "http://localhost:7701"),
      // Your master key or private key
      apiKey: env("MEILISEARCH_API_KEY", "masterKey"),

      product: {
        settings: {
          searchableAttributes: ["name", "description", "categories"],
        },
      },
    },
  },
  documentation: {
    enabled: true,
    config: {
      openapi: "3.0.0",
      info: {
        version: "1.0.0",
        title: "DOCUMENTATION",
        description: "",
        termsOfService: "YOUR_TERMS_OF_SERVICE_URL",
        contact: {
          name: "TEAM",
          email: "contact-email@something.io",
          url: "mywebsite.io",
        },
        license: {
          name: "Apache 2.0",
          url: "https://www.apache.org/licenses/LICENSE-2.0.html",
        },
      },
      "x-strapi-config": {
        // Leave empty to ignore plugins during generation
        plugins: ["upload", "users-permissions"],
        path: "/documentation",
      },
      servers: [
        { url: "http://localhost:1337/api", description: "Development server" },
        { url: "https://aff.k-tech.net.vn/api", description: "Dev server" },
      ],
      externalDocs: {
        description: "Find out more",
        url: "https://docs.strapi.io/developer-docs/latest/getting-started/introduction.html",
      },
      security: [{ bearerAuth: [] }],
    },
  },
  email: {
    config: {
      provider: "nodemailer",
      providerOptions: {
        host: env("SMTP_HOST", "smtp.example.com"),
        port: env("SMTP_PORT", 587),
        auth: {
          user: env("SMTP_USERNAME"),
          pass: env("SMTP_PASSWORD"),
        },
        // ... any custom nodemailer options
      },
      settings: {
        defaultFrom: "18521102@gm.uit.edu.vn",
        defaultReplyTo: "18521102@gm.uit.edu.vn",
      },
    },
  },
});
