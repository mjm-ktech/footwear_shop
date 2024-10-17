import type { Schema, Attribute } from '@strapi/strapi';

export interface BestSellingBestSelling extends Schema.Component {
  collectionName: 'components_best_selling_best_sellings';
  info: {
    displayName: 'best-selling';
  };
  attributes: {
    product: Attribute.Relation<
      'best-selling.best-selling',
      'oneToOne',
      'api::product.product'
    >;
  };
}

export interface BestSellingSaleProduct extends Schema.Component {
  collectionName: 'components_best_selling_sale_products';
  info: {
    displayName: 'sale_product';
  };
  attributes: {
    product: Attribute.Relation<
      'best-selling.sale-product',
      'oneToOne',
      'api::product.product'
    >;
  };
}

export interface NewProductNewProduct extends Schema.Component {
  collectionName: 'components_new_product_new_products';
  info: {
    displayName: 'new_product';
    description: '';
  };
  attributes: {
    category: Attribute.Relation<
      'new-product.new-product',
      'oneToOne',
      'api::category.category'
    >;
    banner: Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
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
      'best-selling.best-selling': BestSellingBestSelling;
      'best-selling.sale-product': BestSellingSaleProduct;
      'new-product.new-product': NewProductNewProduct;
      'special-product.special-product': SpecialProductSpecialProduct;
    }
  }
}
