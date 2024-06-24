export default ({ env }) => ({
  upload: {
    config: {
      provider: 'aws-s3',
      providerOptions: {
        s3Options: {
          accessKeyId: env('AWS_ACCESS_KEY_ID'),
          secretAccessKey: env('AWS_ACCESS_SECRET'),
          region: env('AWS_REGION'),
          params: {
            ACL: env('AWS_ACL', 'public-read'),
            signedUrlExpires: env('AWS_SIGNED_URL_EXPIRES', 15 * 60),
            Bucket: env('AWS_BUCKET'),
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
          field: 'slug',
          references: 'name',
          options: {
            locale: 'vi',
          },
        },
        product: {
          field: 'slug',
          references: 'name',
          options: {
            locale: 'vi',
          },
        },
      },
    },
  },
  'users-permissions': {
    config: {
      jwt: {
        expiresIn: '7d',
      },
      register: {
        allowedFields:["first_name", "last_name", "username", "gender", "birthday", "phone", "size"],
      }
    },
  },
  meilisearch: {
    enabled: true,
    config: {
      // Your meili host
      host: env('MEILISEARCH_HOST','http://localhost:7701'),
      // Your master key or private key
      apiKey: env('MEILISEARCH_API_KEY','masterKey'),

      product: {
        settings: {
          searchableAttributes: ['name', 'description', 'categories']
        }
      }
    }
  },
});
