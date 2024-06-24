import type { Schema, Attribute } from '@strapi/strapi';

export interface NewProductNewProduct extends Schema.Component {
  collectionName: 'components_new_product_new_products';
  info: {
    displayName: 'new_product';
  };
  attributes: {
    category: Attribute.Relation<
      'new-product.new-product',
      'oneToOne',
      'api::category.category'
    >;
  };
}

export interface SpecialProductSpecialProduct extends Schema.Component {
  collectionName: 'components_special_product_special_products';
  info: {
    displayName: 'special product';
  };
  attributes: {
    product: Attribute.Relation<
      'special-product.special-product',
      'oneToOne',
      'api::product.product'
    >;
  };
}

declare module '@strapi/types' {
  export module Shared {
    export interface Components {
      'new-product.new-product': NewProductNewProduct;
      'special-product.special-product': SpecialProductSpecialProduct;
    }
  }
}
