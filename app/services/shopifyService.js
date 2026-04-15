import { createStorefrontApiClient } from '@shopify/storefront-api-client';

// Client inizializzato solo quando il token è disponibile
let _client = null;
function getClient() {
  const token = process.env.EXPO_PUBLIC_SHOPIFY_TOKEN;
  if (!token) return null; // token non ancora configurato
  if (!_client) {
    _client = createStorefrontApiClient({
      storeDomain: process.env.EXPO_PUBLIC_SHOPIFY_DOMAIN || 'vitaliyx.myshopify.com',
      apiVersion:  '2024-10',
      publicAccessToken: token,
    });
  }
  return _client;
}

const PRODUCTS_QUERY = `
  query GetProducts {
    products(first: 20) {
      edges {
        node {
          id
          title
          description
          handle
          tags
          priceRange {
            minVariantPrice { amount currencyCode }
          }
          images(first: 1) {
            edges { node { url altText } }
          }
          variants(first: 5) {
            edges {
              node {
                id
                title
                price { amount currencyCode }
                availableForSale
                sellingPlanAllocations(first: 3) {
                  edges {
                    node {
                      sellingPlan { name }
                      priceAdjustments {
                        price { amount currencyCode }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;

const CHECKOUT_MUTATION = `
  mutation CreateCheckout($lineItems: [CheckoutLineItemInput!]!) {
    checkoutCreate(input: { lineItems: $lineItems }) {
      checkout { id webUrl }
      checkoutUserErrors { message field }
    }
  }
`;

export const shopifyService = {

  async getProducts() {
    const client = getClient();
    if (!client) return []; // nessun token, ritorna lista vuota
    const { data } = await client.request(PRODUCTS_QUERY);
    return data.products.edges.map(({ node }) => ({
      id:          node.id,
      title:       node.title,
      description: node.description,
      handle:      node.handle,
      tags:        node.tags,
      price:       parseFloat(node.priceRange.minVariantPrice.amount),
      currency:    node.priceRange.minVariantPrice.currencyCode,
      image:       node.images.edges[0]?.node.url || null,
      variantId:   node.variants.edges[0]?.node.id,
      subscriptionPrice: node.variants.edges[0]?.node.sellingPlanAllocations?.edges[0]
        ?.node.priceAdjustments[0]?.price.amount,
    }));
  },

  async createCheckout(variantId, quantity = 1) {
    const client = getClient();
    if (!client) throw new Error('Shopify non configurato');
    const { data } = await client.request(CHECKOUT_MUTATION, {
      variables: { lineItems: [{ variantId, quantity }] }
    });
    return data.checkoutCreate.checkout; // { id, webUrl }
  },
};
