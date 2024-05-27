import {
  createApiKeysWorkflow,
  createProductCategoryWorkflow,
  createProductsWorkflow,
  createRegionsWorkflow,
  createSalesChannelsWorkflow,
  createShippingOptionsWorkflow,
  createShippingProfilesWorkflow,
  createStockLocationsWorkflow,
  createTaxRegionsWorkflow,
  linkSalesChannelsToApiKeyWorkflow,
  linkSalesChannelsToStockLocationWorkflow
} from "@medusajs/core-flows"
import { Logger } from "@medusajs/medusa"
import {
  ModuleRegistrationName,
  RemoteLink
} from "@medusajs/modules-sdk"
import {
  ExecArgs,
  IFulfillmentModuleService,
  ISalesChannelModuleService,
} from "@medusajs/types"
import {
  ContainerRegistrationKeys,
  Modules,
  ProductStatus
} from "@medusajs/utils"

export default async function seedDemoData({
  container,
}: ExecArgs) {
  const logger: Logger = container.resolve(
    ContainerRegistrationKeys.LOGGER
  )
  const remoteLink: RemoteLink = container.resolve(
    ContainerRegistrationKeys.REMOTE_LINK
  )
  const fulfillmentModuleService: IFulfillmentModuleService = container.resolve(
    ModuleRegistrationName.FULFILLMENT
  )
  const salesChannelModuleService: ISalesChannelModuleService = container.resolve(
    ModuleRegistrationName.SALES_CHANNEL
  )

  const countries = [
    "gb",
    "de",
    "dk",
    "se",
    "fr",
    "es",
    "it"
  ]
  
  try {
    logger.info("Seeding region data...")
    const { result: regionResult } = await createRegionsWorkflow(container)
      .run({
        input: {
          regions: [{
            name: "Europe",
            currency_code: "eur",
            countries,
            payment_providers: ["pp_system_default"]
          }]
        }
      })
    const region = regionResult[0]
    logger.info("Finished seeding regions.")

    logger.info("Seeding tax regions...")
    await createTaxRegionsWorkflow(container)
      .run({
        input: countries.map((country_code) => ({
          country_code
        }))
      })
    logger.info("Finished seeding tax regions.")

    logger.info("Seeding fulfillment data...")
    const { 
      result: shippingProfileResult
    } = await createShippingProfilesWorkflow(container)
      .run({
        input: {
          data: [{
            name: "Default",
            type: "default"
          }]
        }
      })
    const shippingProfile = shippingProfileResult[0]

    const fulfillmentSet = await fulfillmentModuleService.create({
      name: "European Warehouse delivery",
      type: "delivery",
      service_zones: [
        {
          name: "Europe",
          geo_zones: [
            {
              country_code: "gb",
              type: "country"
            },
            {
              country_code: "de",
              type: "country"
            },
            {
              country_code: "dk",
              type: "country"
            },
            {
              country_code: "se",
              type: "country"
            },
            {
              country_code: "fr",
              type: "country"
            },
            {
              country_code: "es",
              type: "country"
            },
            {
              country_code: "it",
              type: "country"
            }
          ],
        }
      ]
    })

    await createShippingOptionsWorkflow(container)
      .run({
        input: [
          {
            name: "Standard Shipping",
            price_type: "flat",
            provider_id: "manual_manual",
            service_zone_id: fulfillmentSet.service_zones[0].id,
            shipping_profile_id: shippingProfile.id,
            type: {
              label: "Standard",
              description: "Ship in 2-3 days.",
              code: "standard"
            },
            prices: [
              {
                currency_code: "usd",
                amount: 1000,
              },
              {
                currency_code: "eur",
                amount: 1000,
              },
              {
                region_id: region.id,
                amount: 1000,
              },
            ],
            rules: [
              {
                attribute: "enabled_in_store",
                value: '"true"',
                operator: "eq"
              },
              {
                attribute: "is_return",
                value: "false",
                operator: "eq"
              }
            ]
          },
          {
            name: "Express Shipping",
            price_type: "flat",
            provider_id: "manual_manual",
            service_zone_id: fulfillmentSet.service_zones[0].id,
            shipping_profile_id: shippingProfile.id,
            type: {
              label: "Express",
              description: "Ship in 24 hours.",
              code: "express"
            },
            prices: [
              {
                currency_code: "usd",
                amount: 1000,
              },
              {
                currency_code: "eur",
                amount: 1000,
              },
              {
                region_id: region.id,
                amount: 1000,
              },
            ],
            rules: [
              {
                attribute: "enabled_in_store",
                value: '"true"',
                operator: "eq"
              },
              {
                attribute: "is_return",
                value: "false",
                operator: "eq"
              }
            ]
          }
        ]
      })
    logger.info("Finished seeding fulfillment data.")

    let defaultSalesChannel = await salesChannelModuleService.list({
      name: "Default Sales Channel"
    })
    
    if (!defaultSalesChannel.length) {
      // create the default sales channel
      const { 
        result: salesChannelResult
      } = await createSalesChannelsWorkflow(container)
        .run({
          input: {
            salesChannelsData: [
              {
                name: "Default Sales Channel"
              }
            ]
          }
        })
      defaultSalesChannel = salesChannelResult
    }

    logger.info("Seeding stock location data...")
    const { 
      result: stockLocationResult
    } = await createStockLocationsWorkflow(container)
      .run({
        input: {
          locations: [{
            name: "European Warehouse",
            address: {
              city: "Copenhagen",
              country_code: "DK",
              address_1: ""
            }
          }]
        }
      })
    const stockLocation = stockLocationResult[0]

    await linkSalesChannelsToStockLocationWorkflow(container)
      .run({
        input: {
          id: stockLocation.id,
          add: [defaultSalesChannel[0].id]
        }
      })

    await remoteLink.create({
      [Modules.STOCK_LOCATION]: {
        stock_location_id: stockLocation.id
      },
      [Modules.FULFILLMENT]: {
        fulfillment_set_id: fulfillmentSet.id
      }
    })
    logger.info("Finished seeding stock location data.")

    logger.info("Seeding publishable API key data...")
    const {
      result: publishableApiKeyResult
    } = await createApiKeysWorkflow(container)
      .run({
        input: {
          api_keys: [{
            title: "Webshop",
            type: "publishable",
            created_by: ""
          }]
        }
      })
    const publishableApiKey = publishableApiKeyResult[0]

    await linkSalesChannelsToApiKeyWorkflow(container)
      .run({
        input: {
          id: publishableApiKey.id,
          add: [defaultSalesChannel[0].id]
        }
      })
    logger.info("Finished seeding publishable API key data.")

    logger.info("Seeding product data...")
    const categories = {
      "Shirts": "",
      "Sweatshirts": "",
      "Pants": "",
      "Merch": ""
    }
    for (const category in categories) {
      const { 
        result: categoryResult
      } = await createProductCategoryWorkflow(container)
        .run({
          input: {
            product_category: {
              name: category,
              is_active: true
            }
          }
        })

      categories[category] = categoryResult.id
    }
    await createProductsWorkflow(container)
      .run({
        input: {
          products: [
            {
              title: "Medusa T-Shirt",
              category_ids: [categories["Shirts"]],
              description: "Reimagine the feeling of a classic T-shirt. With our cotton T-shirts, everyday essentials no longer have to be ordinary.",
              handle: "t-shirt",
              weight: 400,
              status: ProductStatus.PUBLISHED,
              images: [
                {
                  url: "https://medusa-public-images.s3.eu-west-1.amazonaws.com/tee-black-front.png"
                },
                {
                  url: "https://medusa-public-images.s3.eu-west-1.amazonaws.com/tee-black-back.png"
                },
                {
                  url: "https://medusa-public-images.s3.eu-west-1.amazonaws.com/tee-white-front.png"
                },
                {
                  url: "https://medusa-public-images.s3.eu-west-1.amazonaws.com/tee-white-back.png"
                }
              ],
              options: [
                {
                  title: "Size",
                  values: [
                    "S",
                    "M",
                    "L",
                    "XL"
                  ]
                },
                {
                  title: "Color",
                  values: [
                    "Black",
                    "White"
                  ]
                }
              ],
              variants: [
                {
                  title: "S / Black",
                  sku: "SHIRT-S-BLACK",
                  options: {
                    Size: "S",
                    Color: "Black"
                  },
                  manage_inventory: false,
                  prices: [
                    {
                      amount: 1000,
                      currency_code: "eur",
                    },
                    {
                      amount: 1500,
                      currency_code: "usd"
                    }
                  ]
                },
                {
                  title: "S / White",
                  sku: "SHIRT-S-WHITE",
                  options: {
                    Size: "S",
                    Color: "White"
                  },
                  manage_inventory: false,
                  prices: [
                    {
                      amount: 1000,
                      currency_code: "eur",
                    },
                    {
                      amount: 1500,
                      currency_code: "usd"
                    }
                  ]
                },
                {
                  title: "M / Black",
                  sku: "SHIRT-M-BLACK",
                  options: {
                    Size: "M",
                    Color: "Black"
                  },
                  manage_inventory: false,
                  prices: [
                    {
                      amount: 1000,
                      currency_code: "eur",
                    },
                    {
                      amount: 1500,
                      currency_code: "usd"
                    }
                  ]
                },
                {
                  title: "M / White",
                  sku: "SHIRT-M-WHITE",
                  options: {
                    Size: "M",
                    Color: "White"
                  },
                  manage_inventory: false,
                  prices: [
                    {
                      amount: 1000,
                      currency_code: "eur",
                    },
                    {
                      amount: 1500,
                      currency_code: "usd"
                    }
                  ]
                },
                {
                  title: "L / Black",
                  sku: "SHIRT-L-BLACK",
                  options: {
                    Size: "L",
                    Color: "Black"
                  },
                  manage_inventory: false,
                  prices: [
                    {
                      amount: 1000,
                      currency_code: "eur",
                    },
                    {
                      amount: 1500,
                      currency_code: "usd"
                    }
                  ]
                },
                {
                  title: "L / White",
                  sku: "SHIRT-L-WHITE",
                  options: {
                    Size: "L",
                    Color: "White"
                  },
                  manage_inventory: false,
                  prices: [
                    {
                      amount: 1000,
                      currency_code: "eur",
                    },
                    {
                      amount: 1500,
                      currency_code: "usd"
                    }
                  ]
                },
                {
                  title: "XL / Black",
                  sku: "SHIRT-XL-BLACK",
                  options: {
                    Size: "XL",
                    Color: "Black"
                  },
                  manage_inventory: false,
                  prices: [
                    {
                      amount: 1000,
                      currency_code: "eur",
                    },
                    {
                      amount: 1500,
                      currency_code: "usd"
                    }
                  ]
                },
                {
                  title: "XL / White",
                  sku: "SHIRT-XL-WHITE",
                  options: {
                    Size: "XL",
                    Color: "White"
                  },
                  manage_inventory: false,
                  prices: [
                    {
                      amount: 1000,
                      currency_code: "eur",
                    },
                    {
                      amount: 1500,
                      currency_code: "usd"
                    }
                  ]
                },
              ],
              sales_channels: [{
                id: defaultSalesChannel[0].id
              }]
            },
            {
              title: "Medusa Sweatshirt",
              category_ids: [categories["Sweatshirts"]],
              description: "Reimagine the feeling of a classic sweatshirt. With our cotton sweatshirt, everyday essentials no longer have to be ordinary.",
              handle: "sweatshirt",
              weight: 400,
              status: ProductStatus.PUBLISHED,
              images: [
                {
                  url: "https://medusa-public-images.s3.eu-west-1.amazonaws.com/sweatshirt-vintage-front.png"
                },
                {
                  url: "https://medusa-public-images.s3.eu-west-1.amazonaws.com/sweatshirt-vintage-back.png"
                },
              ],
              options: [
                {
                  title: "Size",
                  values: [
                    "S",
                    "M",
                    "L",
                    "XL"
                  ]
                },
              ],
              variants: [
                {
                  title: "S",
                  sku: "SWEATSHIRT-S",
                  options: {
                    Size: "S"
                  },
                  manage_inventory: false,
                  prices: [
                    {
                      amount: 1000,
                      currency_code: "eur",
                    },
                    {
                      amount: 1500,
                      currency_code: "usd"
                    }
                  ]
                },
                {
                  title: "M",
                  sku: "SWEATSHIRT-M",
                  options: {
                    Size: "M",
                  },
                  manage_inventory: false,
                  prices: [
                    {
                      amount: 1000,
                      currency_code: "eur",
                    },
                    {
                      amount: 1500,
                      currency_code: "usd"
                    }
                  ]
                },
                {
                  title: "L",
                  sku: "SWEATSHIRT-L",
                  options: {
                    Size: "L",
                  },
                  manage_inventory: false,
                  prices: [
                    {
                      amount: 1000,
                      currency_code: "eur",
                    },
                    {
                      amount: 1500,
                      currency_code: "usd"
                    }
                  ]
                },
                {
                  title: "XL",
                  sku: "SWEATSHIRT-XL",
                  options: {
                    Size: "XL",
                  },
                  manage_inventory: false,
                  prices: [
                    {
                      amount: 1000,
                      currency_code: "eur",
                    },
                    {
                      amount: 1500,
                      currency_code: "usd"
                    }
                  ]
                },
              ],
              sales_channels: [{
                id: defaultSalesChannel[0].id
              }]
            },
            {
              title: "Medusa Sweatpants",
              category_ids: [categories["Pants"]],
              description: "Reimagine the feeling of classic sweatpants. With our cotton sweatpants, everyday essentials no longer have to be ordinary.",
              handle: "sweatpants",
              weight: 400,
              status: ProductStatus.PUBLISHED,
              images: [
                {
                  url: "https://medusa-public-images.s3.eu-west-1.amazonaws.com/sweatpants-gray-front.png"
                },
                {
                  url: "https://medusa-public-images.s3.eu-west-1.amazonaws.com/sweatpants-gray-back.png"
                },
              ],
              options: [
                {
                  title: "Size",
                  values: [
                    "S",
                    "M",
                    "L",
                    "XL"
                  ]
                },
              ],
              variants: [
                {
                  title: "S",
                  sku: "SWEATPANTS-S",
                  options: {
                    Size: "S"
                  },
                  manage_inventory: false,
                  prices: [
                    {
                      amount: 1000,
                      currency_code: "eur",
                    },
                    {
                      amount: 1500,
                      currency_code: "usd"
                    }
                  ]
                },
                {
                  title: "M",
                  sku: "SWEATPANTS-M",
                  options: {
                    Size: "M",
                  },
                  manage_inventory: false,
                  prices: [
                    {
                      amount: 1000,
                      currency_code: "eur",
                    },
                    {
                      amount: 1500,
                      currency_code: "usd"
                    }
                  ]
                },
                {
                  title: "L",
                  sku: "SWEATPANTS-L",
                  options: {
                    Size: "L",
                  },
                  manage_inventory: false,
                  prices: [
                    {
                      amount: 1000,
                      currency_code: "eur",
                    },
                    {
                      amount: 1500,
                      currency_code: "usd"
                    }
                  ]
                },
                {
                  title: "XL",
                  sku: "SWEATPANTS-XL",
                  options: {
                    Size: "XL",
                  },
                  manage_inventory: false,
                  prices: [
                    {
                      amount: 1000,
                      currency_code: "eur",
                    },
                    {
                      amount: 1500,
                      currency_code: "usd"
                    }
                  ]
                },
              ],
              sales_channels: [{
                id: defaultSalesChannel[0].id
              }]
            },
            {
              title: "Medusa Shorts",
              category_ids: [categories["Merch"]],
              description: "Reimagine the feeling of classic shorts. With our cotton shorts, everyday essentials no longer have to be ordinary.",
              handle: "shorts",
              weight: 400,
              status: ProductStatus.PUBLISHED,
              images: [
                {
                  url: "https://medusa-public-images.s3.eu-west-1.amazonaws.com/shorts-vintage-front.png"
                },
                {
                  url: "https://medusa-public-images.s3.eu-west-1.amazonaws.com/shorts-vintage-back.png"
                },
              ],
              options: [
                {
                  title: "Size",
                  values: [
                    "S",
                    "M",
                    "L",
                    "XL"
                  ]
                },
              ],
              variants: [
                {
                  title: "S",
                  sku: "SHORTS-S",
                  options: {
                    Size: "S"
                  },
                  manage_inventory: false,
                  prices: [
                    {
                      amount: 1000,
                      currency_code: "eur",
                    },
                    {
                      amount: 1500,
                      currency_code: "usd"
                    }
                  ]
                },
                {
                  title: "M",
                  sku: "SHORTS-M",
                  options: {
                    Size: "M",
                  },
                  manage_inventory: false,
                  prices: [
                    {
                      amount: 1000,
                      currency_code: "eur",
                    },
                    {
                      amount: 1500,
                      currency_code: "usd"
                    }
                  ]
                },
                {
                  title: "L",
                  sku: "SHORTS-L",
                  options: {
                    Size: "L",
                  },
                  manage_inventory: false,
                  prices: [
                    {
                      amount: 1000,
                      currency_code: "eur",
                    },
                    {
                      amount: 1500,
                      currency_code: "usd"
                    }
                  ]
                },
                {
                  title: "XL",
                  sku: "SHORTS-XL",
                  options: {
                    Size: "XL",
                  },
                  manage_inventory: false,
                  prices: [
                    {
                      amount: 1000,
                      currency_code: "eur",
                    },
                    {
                      amount: 1500,
                      currency_code: "usd"
                    }
                  ]
                },
              ],
              sales_channels: [{
                id: defaultSalesChannel[0].id
              }]
            }
          ]
        }
      })
    logger.info("Finished seeding product data.")

  } catch (e) {
    logger.error(`Seeding failed`, e)
  }
}