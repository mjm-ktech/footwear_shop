export default ({ env }) => [
  'strapi::logger',
  'strapi::errors',
  'strapi::cors',
  'strapi::poweredBy',
  'strapi::query',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
  {
    name: 'strapi::security',
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          'connect-src': ["'self'", 'https:'],
          'img-src': [
            "'self'",
            'data:',
            'blob:',
            'market-assets.strapi.io',
            `${env('AWS_BUCKET')}.s3.ap-southeast-1.amazonaws.com`,
          ],
          'media-src': [
            "'self'",
            'data:',
            'blob:',
            'market-assets.strapi.io',
            `${env('AWS_BUCKET')}.s3.ap-southeast-1.amazonaws.com`,
          ],
          upgradeInsecureRequests: null,
        },
      },
    },
  },
];
