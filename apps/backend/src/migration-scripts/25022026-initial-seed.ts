import { MedusaContainer } from "@medusajs/framework";
import {
    ContainerRegistrationKeys,
    ModuleRegistrationName,
    Modules,
} from "@medusajs/framework/utils";
import {
    batchVariantImagesWorkflow,
    createDefaultsWorkflow,
    createProductCategoriesWorkflow,
    createProductsWorkflow,
    createRegionsWorkflow,
    createShippingOptionsWorkflow,
    createShippingProfilesWorkflow,
    createStockLocationsWorkflow,
    createTaxRegionsWorkflow,
    linkProductsToSalesChannelWorkflow,
    linkSalesChannelsToStockLocationWorkflow,
    updateStoresWorkflow,
} from "@medusajs/medusa/core-flows";
import { CreateProductCategoryDTO } from "@medusajs/types";


export default async function migration_25022026_initial_seed({
    container,
}: {
    container: MedusaContainer;
}) {
    const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
    const link = container.resolve(ContainerRegistrationKeys.LINK);
    const query = container.resolve(ContainerRegistrationKeys.QUERY);
    const storeModuleService = container.resolve(ModuleRegistrationName.STORE);
    const salesChannelModuleService = container.resolve(ModuleRegistrationName.SALES_CHANNEL);
    const fulfillmentModuleService = container.resolve(
        ModuleRegistrationName.FULFILLMENT
    );

    const { data: existingProductsAtStartup } = await query.graph({
        entity: "product",
        fields: ["id"],
    });

    // If we want to explicitly not seed data, or if it's an existing project with data seeded in a different way, skip the seeding.
    if (process.env.SKIP_INITIAL_SEED === "true" || existingProductsAtStartup.length > 0) {
        return
    }

    logger.info("Seeding defaults...");
    await createDefaultsWorkflow(container).run();

    const [store] = await storeModuleService.listStores();
    let defaultSalesChannel = await salesChannelModuleService.listSalesChannels({
        name: "Default Sales Channel",
    });


    await updateStoresWorkflow(container).run({
        input: {
            selector: { id: store.id },
            update: {
                supported_currencies: [
                    { currency_code: "usd", is_default: true },
                    { currency_code: "eur", is_tax_inclusive: true },
                ],
                default_sales_channel_id: defaultSalesChannel[0].id,
            },
        },
    });

    const { data: pricePreferences } = await query.graph({
        entity: "price_preference",
        fields: ["id"],
    });

    if (pricePreferences.length > 0) {
        const ids = pricePreferences.map((pp) => pp.id);
        await container.resolve(Modules.PRICING).deletePricePreferences(ids);
    }

    const europeanCountries = ["gb", "de", "dk", "se", "fr", "es", "it"];
    const { data: existingRegions } = await query.graph({
        entity: "region",
        fields: ["id", "name"],
    });

    let usRegion;
    let europeRegion;
    if (!existingRegions.length) {
        logger.info("Creating regions...");
        const { result: regionResult } = await createRegionsWorkflow(container).run(
            {
                input: {
                    regions: [
                        {
                            name: "US",
                            currency_code: "usd",
                            countries: ["us"],
                            payment_providers: ["pp_system_default"],
                            automatic_taxes: false,
                            is_tax_inclusive: false,
                        },
                        {
                            name: "Europe",
                            currency_code: "eur",
                            countries: europeanCountries,
                            payment_providers: ["pp_system_default"],
                            automatic_taxes: true,
                            is_tax_inclusive: true,
                        },
                    ],
                },
            }
        );
        usRegion = regionResult[0];
        europeRegion = regionResult[1];
    } else {
        logger.info("Regions already exist, skipping creation...");
        usRegion = existingRegions.find((r) => r.name === "US");
        europeRegion = existingRegions.find((r) => r.name === "Europe");
    }

    const { data: existingTaxRegions } = await query.graph({
        entity: "tax_region",
        fields: ["id", "name"],
    });

    if (!existingTaxRegions.length) {
        logger.info("Seeding tax regions...");
        const taxRates: Record<string, { rate: number; code: string; name: string }> =
        {
            gb: { rate: 20, code: "GB20", name: "UK VAT" },
            de: { rate: 19, code: "DE19", name: "Germany VAT" },
            dk: { rate: 25, code: "DK25", name: "Denmark VAT" },
            se: { rate: 25, code: "SE25", name: "Sweden VAT" },
            fr: { rate: 20, code: "FR20", name: "France VAT" },
            es: { rate: 21, code: "ES21", name: "Spain VAT" },
            it: { rate: 22, code: "IT22", name: "Italy VAT" },
        };

        await createTaxRegionsWorkflow(container).run({
            input: Object.entries(taxRates).map(([country_code, taxConfig]) => {
                return {
                    country_code,
                    provider_id: "tp_system",
                    default_tax_rate: {
                        rate: taxConfig.rate,
                        code: taxConfig.code,
                        name: taxConfig.name,
                        is_default: true,
                    },
                };
            }),
        });

        logger.info("Finished seeding tax regions.");
    } else {
        logger.info("Tax regions already exist, skipping creation...");
    }


    const { data: existingStockLocations } = await query.graph({
        entity: "stock_location",
        fields: ["id", "name"],
    });

    let stockLocation;
    if (!existingStockLocations.length) {
        logger.info("Seeding stock location data...");
        const { result: stockLocationResult } = await createStockLocationsWorkflow(
            container
        ).run({
            input: {
                locations: [
                    {
                        name: "Main Warehouse",
                        address: {
                            city: "",
                            country_code: "US",
                            address_1: "",
                        },
                    },
                ],
            },
        });
        stockLocation = stockLocationResult[0];

        await link.create({
            [Modules.STOCK_LOCATION]: {
                stock_location_id: stockLocation.id,
            },
            [Modules.FULFILLMENT]: {
                fulfillment_provider_id: "manual_manual",
            },
        });
    } else {
        logger.info("Stock location already exists, skipping creation...");
        stockLocation = existingStockLocations[0];
    }


    const shippingProfiles = await fulfillmentModuleService.listShippingProfiles({
        type: "default",
    });
    let shippingProfile;

    if (!shippingProfiles.length) {
        logger.info("Creating shipping profile...");
        const { result: shippingProfileResult } =
            await createShippingProfilesWorkflow(container).run({
                input: {
                    data: [
                        {
                            name: "Default Shipping Profile",
                            type: "default",
                        },
                    ],
                },
            });
        shippingProfile = shippingProfileResult[0];
    } else {
        logger.info("Shipping profile already exists, skipping creation...");
        shippingProfile = shippingProfiles[0];
    }

    const fulfillmentSets = await fulfillmentModuleService.listFulfillmentSets();

    let fulfillmentSet;
    if (!fulfillmentSets.length) {
        logger.info("Creating fulfillment set...");
        fulfillmentSet = await fulfillmentModuleService.createFulfillmentSets({
            name: "Main Warehouse Delivery",
            type: "shipping",
            service_zones: [
                {
                    name: "Worldwide",
                    geo_zones: ["us", ...europeanCountries].map((country_code) => ({
                        country_code,
                        type: "country" as const,
                    })),
                },
            ],
        });

        await link.create({
            [Modules.STOCK_LOCATION]: {
                stock_location_id: stockLocation.id,
            },
            [Modules.FULFILLMENT]: {
                fulfillment_set_id: fulfillmentSet.id,
            },
        });
    } else {
        logger.info("Fulfillment set already exists, skipping creation...");
        fulfillmentSet = fulfillmentSets[0];
    }


    const { data: existingShippingOptions } = await query.graph({
        entity: "shipping_option",
        fields: ["id", "name"],
    });

    if (!existingShippingOptions.length) {
        logger.info("Creating shipping option...");
        await createShippingOptionsWorkflow(container).run({
            input: [
                {
                    name: "Standard Worldwide Shipping",
                    price_type: "flat",
                    provider_id: "manual_manual",
                    service_zone_id: fulfillmentSet.service_zones[0].id,
                    shipping_profile_id: shippingProfile.id,
                    type: {
                        label: "Standard",
                        description: "Ships worldwide",
                        code: "standard-worldwide",
                    },
                    prices: [
                        {
                            currency_code: "usd",
                            amount: 10,
                        },
                        {
                            currency_code: "eur",
                            amount: 10,
                        },
                    ],
                    rules: [
                        {
                            attribute: "enabled_in_store",
                            value: "true",
                            operator: "eq",
                        },
                        {
                            attribute: "is_return",
                            value: "false",
                            operator: "eq",
                        },
                    ],
                },
            ],
        });
    } else {
        logger.info("Shipping option already exists, skipping creation...");
    }

    await linkSalesChannelsToStockLocationWorkflow(container).run({
        input: {
            id: stockLocation.id,
            add: [defaultSalesChannel[0].id],
        },
    });

    // Seed product categories with nesting
    const { data: existingCategories } = await query.graph({
        entity: "product_category",
        fields: ["id", "handle", "name"],
    });

    const categoryHandles = existingCategories.map((c: any) => c.handle);
    const categoriesToCreate: CreateProductCategoryDTO[] = [];

    // Parent categories
    if (!categoryHandles.includes("sofas")) {
        categoriesToCreate.push({
            name: "Sofas",
            handle: "sofas",
            is_active: true,
            is_internal: false,
        },);
    }

    if (categoriesToCreate.length > 0) {
        logger.info("Seeding product categories...");
        await createProductCategoriesWorkflow(container).run({
            input: {
                product_categories: categoriesToCreate,
            },
        });
    } else {
        logger.info("Product categories already exist, skipping creation...");
    }

    // Get updated categories including newly created ones
    const { data: allCategories } = await query.graph({
        entity: "product_category",
        fields: ["id", "handle", "name"],
    });

    // Create a map for easy lookup
    const categoryMap: Record<string, any> = {};
    allCategories.forEach((cat: any) => {
        categoryMap[cat.handle] = cat;
    });

    const getCategoryId = (handle: string) => {
        const category = allCategories.find((c: any) => c.handle === handle);
        return category ? category.id : null;
    };

    const { data: existingProducts } = await query.graph({
        entity: "product",
        fields: ["id", "handle"],
    });

    const existingHandles = existingProducts.map((p: any) => p.handle);

    // Variant image mappings by variant title (used after product creation)
    const variantImageMappings: Record<string, string[]> = {
        // Sofa OPQ variants
        "Charcoal": [
            "https://cdn.mignite.app/ws/works_01KFFXEX6GF2518JZE6KHPYG9Q/generated-01KG0240BW7S992KRAER8YBE46-01KG0240BWREX32J1EN6Y21V4Y.jpeg",
            "https://cdn.mignite.app/ws/works_01KFFXEX6GF2518JZE6KHPYG9Q/generated-01KG0241K7EJDS0WBZW98EXYD6-01KG0241K7ZWF59D9KQB0PF4PR.jpeg",
            "https://cdn.mignite.app/ws/works_01KFFXEX6GF2518JZE6KHPYG9Q/generated-01KG0241YZFGM75EY831E039MP-01KG0241YZ59JGWGS98NYBNDB7.jpeg",
            "https://cdn.mignite.app/ws/works_01KFFXEX6GF2518JZE6KHPYG9Q/generated-01KG0243TZPVGF0KYVEJE38680-01KG0243TZAY3SJG4WZ64YVNGG.jpeg",
            "https://cdn.mignite.app/ws/works_01KFFXEX6GF2518JZE6KHPYG9Q/generated-01KG02443EAFN33Z1EHBF6NFH2-01KG02443ENG6GFNKQ2YB3HZ77.jpeg",
        ],
        "Ivory": [
            "https://cdn.mignite.app/ws/works_01KFFXEX6GF2518JZE6KHPYG9Q/generated-01KG024645SGG1ZY08M4CQGGQQ-01KG024645M4RJZK7CE14WSPZ3.jpeg",
            "https://cdn.mignite.app/ws/works_01KFFXEX6GF2518JZE6KHPYG9Q/generated-01KG0246VTDBMNEMZHS3KTRTDC-01KG0246VTGQRP6NKKHJEDRNE8.jpeg",
            "https://cdn.mignite.app/ws/works_01KFFXEX6GF2518JZE6KHPYG9Q/generated-01KG0246VME3YABRWCEMRBC2KH-01KG0246VNYZA3Q7S2YXB9N7MM.jpeg",
            "https://cdn.mignite.app/ws/works_01KFFXEX6GF2518JZE6KHPYG9Q/generated-01KG0247DGGJXG21K417FS3M0H-01KG0247DG61Z3ZD57AV9REQV1.jpeg",
            "https://cdn.mignite.app/ws/works_01KFFXEX6GF2518JZE6KHPYG9Q/generated-01KG0247NHTVZNNNVH31TGQQ54-01KG0247NHWXJFWV923TXH3CA4.jpeg",
        ],
        "Sage": [
            "https://cdn.mignite.app/ws/works_01KFFXEX6GF2518JZE6KHPYG9Q/generated-01KG024DAB7ZR11FK39YS6EZAH-01KG024DAB9B40QVTNZ4TE24RW.jpeg",
            "https://cdn.mignite.app/ws/works_01KFFXEX6GF2518JZE6KHPYG9Q/generated-01KG024DPS37QC4WXGQ5P036PB-01KG024DPSECR7X23H7B8MM3T5.jpeg",
            "https://cdn.mignite.app/ws/works_01KFFXEX6GF2518JZE6KHPYG9Q/generated-01KG024F13CKA56XFCXT9RP77H-01KG024F135GMH7B1XBMQT8NK3.jpeg",
            "https://cdn.mignite.app/ws/works_01KFFXEX6GF2518JZE6KHPYG9Q/generated-01KG024EX9MX58KKBDMM465306-01KG024EX9F1VEZ5WTN735W93R.jpeg",
            "https://cdn.mignite.app/ws/works_01KFFXEX6GF2518JZE6KHPYG9Q/generated-01KG024FKQ9YKP2J13V73RNR68-01KG024FKQVHHV9T3S3MW9DTTX.jpeg",
        ],
        "Terracotta": [
            "https://cdn.mignite.app/ws/works_01KFFXEX6GF2518JZE6KHPYG9Q/generated-01KG024GC707FE1261G852T4KV-01KG024GC855DGJ4Z7M3PMMAVJ.jpeg",
            "https://cdn.mignite.app/ws/works_01KFFXEX6GF2518JZE6KHPYG9Q/generated-01KG024H9976J5M0H9BQQ747HR-01KG024H993PY33JT3J97F3KM1.jpeg",
            "https://cdn.mignite.app/ws/works_01KFFXEX6GF2518JZE6KHPYG9Q/generated-01KG024J1A4MJ1A9SKHXJG9XFJ-01KG024J1A60TG02MPRGZCQR2S.jpeg",
            "https://cdn.mignite.app/ws/works_01KFFXEX6GF2518JZE6KHPYG9Q/generated-01KG024K35P29NE4EMJ5K1AXJX-01KG024K35BP43CX3YHNWHP512.jpeg",
            "https://cdn.mignite.app/ws/works_01KFFXEX6GF2518JZE6KHPYG9Q/generated-01KG024KY4V1C47Y1NRNA10X40-01KG024KY48CYD8NF360SP8YEB.jpeg",
        ],
        "Navy": [
            "https://cdn.mignite.app/ws/works_01KFFXEX6GF2518JZE6KHPYG9Q/generated-01KG024SYV1386TKDYSFFG9QQW-01KG024SYW0YK6ZGBH27SXJRC7.jpeg",
            "https://cdn.mignite.app/ws/works_01KFFXEX6GF2518JZE6KHPYG9Q/generated-01KG024TVRH2VS9R1T4DFFBT7E-01KG024TVR0CQM57H3YAAMC2EE.jpeg",
            "https://cdn.mignite.app/ws/works_01KFFXEX6GF2518JZE6KHPYG9Q/generated-01KG024VN18QVM2FR38KADTMKD-01KG024VN16KAC3EYF5BT021KN.jpeg",
            "https://cdn.mignite.app/ws/works_01KFFXEX6GF2518JZE6KHPYG9Q/generated-01KG024WP2NHCRR54VT74163GP-01KG024WP2KAXGPEPEN86BYGFX.jpeg",
            "https://cdn.mignite.app/ws/works_01KFFXEX6GF2518JZE6KHPYG9Q/generated-01KG024WV84ZQZ1FB5ZPWHT27E-01KG024WV8Z1J4651E6X1HZA2R.jpeg",
        ],
        "Camel": [
            "https://cdn.mignite.app/ws/works_01KFFXEX6GF2518JZE6KHPYG9Q/generated-01KG024YMGRP9S5W5877DHF9FN-01KG024YMGT806FSK84T8XCCWB.jpeg",
            "https://cdn.mignite.app/ws/works_01KFFXEX6GF2518JZE6KHPYG9Q/generated-01KG02599GMNGHGGZCEW2ZVN8W-01KG02599GJBQJY8B7W3FK1KAP.jpeg",
            "https://cdn.mignite.app/ws/works_01KFFXEX6GF2518JZE6KHPYG9Q/generated-01KG0259JMAGNQ3NHAY6JVRZKW-01KG0259JMXPTGCWWW726VQ11S.jpeg",
            "https://cdn.mignite.app/ws/works_01KFFXEX6GF2518JZE6KHPYG9Q/generated-01KG0250FZR0N6V3V43WG7B0GB-01KG0250FZR4NJC7TCQ2ETHCCJ.jpeg",
            "https://cdn.mignite.app/ws/works_01KFFXEX6GF2518JZE6KHPYG9Q/generated-01KG0250TY0FBKTNBPQGYCCJ7W-01KG0250TZ15FR4EJ0C43YR97T.jpeg",
        ],
        "Blush": [
            "https://cdn.mignite.app/ws/works_01KFFXEX6GF2518JZE6KHPYG9Q/generated-01KG025J8THSJ23KXK50866KS1-01KG025J8TAYYWQBF78VGRYB59.jpeg",
            "https://cdn.mignite.app/ws/works_01KFFXEX6GF2518JZE6KHPYG9Q/generated-01KG025E41KQAZ24KQ3XWX22JP-01KG025E4163AQ31EBRF8P5S2N.jpeg",
            "https://cdn.mignite.app/ws/works_01KFFXEX6GF2518JZE6KHPYG9Q/generated-01KG025GN2X53CKQ9MW81HQCYF-01KG025GN2BF8MN82M75YG89B7.jpeg",
            "https://cdn.mignite.app/ws/works_01KFFXEX6GF2518JZE6KHPYG9Q/generated-01KG025FD3YYK0QRTYPMPRW55Z-01KG025FD3AB6FTS3YNVKTJN80.jpeg",
            "https://cdn.mignite.app/ws/works_01KFFXEX6GF2518JZE6KHPYG9Q/generated-01KG025GJEN63JR60VSD2VGMCX-01KG025GJFV1365FV26ZW39CTH.jpeg",
        ],
        "Slate": [
            "https://cdn.mignite.app/ws/works_01KFFXEX6GF2518JZE6KHPYG9Q/generated-01KG025HBJJBT90E5AFBSAFN8D-01KG025HBJR1QD7X7NMW6C9WG2.jpeg",
            "https://cdn.mignite.app/ws/works_01KFFXEX6GF2518JZE6KHPYG9Q/generated-01KG025HT1J26610DWTN1FQ0MN-01KG025HT18T4F254MBC5BRQHG.jpeg",
            "https://cdn.mignite.app/ws/works_01KFFXEX6GF2518JZE6KHPYG9Q/generated-01KG025JT0QGNRZJTE9YJK85Y6-01KG025JT0Q5Z0WBMK93STWQD4.jpeg",
            "https://cdn.mignite.app/ws/works_01KFFXEX6GF2518JZE6KHPYG9Q/generated-01KG025KK5N2KA5PX2PP0NAHBW-01KG025KK5C3D332FCDVYM44K8.jpeg",
            "https://cdn.mignite.app/ws/works_01KFFXEX6GF2518JZE6KHPYG9Q/generated-01KG025MAK7C1DWGS420C53SAW-01KG025MAKN1K4M1CCK49DAAM7.jpeg",
        ],
    };

    // Sofa XYZ variant images
    const sofaXyzVariantImages: Record<string, string[]> = {
        "Charcoal": [
            "https://cdn.mignite.app/ws/works_01KFFXEX6GF2518JZE6KHPYG9Q/generated-01KG00XXW3M8SSJ088J4HTHKMW-01KG00XXW30VGCDRESZVSA6273.jpeg",
            "https://cdn.mignite.app/ws/works_01KFFXEX6GF2518JZE6KHPYG9Q/generated-01KG00XYVASD5F2Q3BMX0TMMXG-01KG00XYVA3TZ7V396YJ4YF0A3.jpeg",
            "https://cdn.mignite.app/ws/works_01KFFXEX6GF2518JZE6KHPYG9Q/generated-01KG00XZFJ7D1CCAX1J764AD6N-01KG00XZFJ084D9JQM48G4C96F.jpeg",
            "https://cdn.mignite.app/ws/works_01KFFXEX6GF2518JZE6KHPYG9Q/generated-01KG00Y0VBAC5P5PD7AP76CA7M-01KG00Y0VBGWJY4JRZYC3FK3DK.jpeg",
            "https://cdn.mignite.app/ws/works_01KFFXEX6GF2518JZE6KHPYG9Q/generated-01KG00Y21AYNMFBZTY4FNF98C7-01KG00Y21AHPKPB6RD57SP9EAS.jpeg",
        ],
        "Ivory": [
            "https://cdn.mignite.app/ws/works_01KFFXEX6GF2518JZE6KHPYG9Q/generated-01KG00Y83TFHNE3CDX1ECBHWMX-01KG00Y83T6TKVSDMDZ02TR81Z.jpeg",
            "https://cdn.mignite.app/ws/works_01KFFXEX6GF2518JZE6KHPYG9Q/generated-01KG00Y8HMR4QV8DGN2948N328-01KG00Y8HNBRFTJSMG9DBQDGZH.jpeg",
            "https://cdn.mignite.app/ws/works_01KFFXEX6GF2518JZE6KHPYG9Q/generated-01KG00Y9SYY7F834PP12S9W9FH-01KG00Y9SYPWWDZDNJ93G997N2.jpeg",
            "https://cdn.mignite.app/ws/works_01KFFXEX6GF2518JZE6KHPYG9Q/generated-01KG00YAP8Y8NQ4NVA6VBZRFRG-01KG00YAP9SMZS8NQ6J7NE76A8.jpeg",
            "https://cdn.mignite.app/ws/works_01KFFXEX6GF2518JZE6KHPYG9Q/generated-01KG00YAXJP32C2ED5E6GN4MM9-01KG00YAXJQ0HRCASZYGPW999A.jpeg",
        ],
        "Sage": [
            "https://cdn.mignite.app/ws/works_01KFFXEX6GF2518JZE6KHPYG9Q/generated-01KG00YH1WSJ65PR5P1WRJF04T-01KG00YH1XQ8YXEWNTX0S478QR.jpeg",
            "https://cdn.mignite.app/ws/works_01KFFXEX6GF2518JZE6KHPYG9Q/generated-01KG00YJ2S57K6W5DARY25JGA2-01KG00YJ2SG66SMJ7C8RC1XYKM.jpeg",
            "https://cdn.mignite.app/ws/works_01KFFXEX6GF2518JZE6KHPYG9Q/generated-01KG00YJEPJ9RXWEEB891DVCA0-01KG00YJEPS0MF1YQ9RZPB91T9.jpeg",
            "https://cdn.mignite.app/ws/works_01KFFXEX6GF2518JZE6KHPYG9Q/generated-01KG00YKAY88Q9CGVEXFBCA4PX-01KG00YKAYZ5NDZ8N8SMMBZ80S.jpeg",
            "https://cdn.mignite.app/ws/works_01KFFXEX6GF2518JZE6KHPYG9Q/generated-01KG00YKWEVE9VNJ5YP3MD0A6C-01KG00YKWENSAH3HNY8B7DWSE8.jpeg",
        ],
        "Navy": [
            "https://cdn.mignite.app/ws/works_01KFFXEX6GF2518JZE6KHPYG9Q/generated-01KG00YS15MQ0JKGYS67EKW176-01KG00YS1591ZP9G4JRVFRPN23.jpeg",
            "https://cdn.mignite.app/ws/works_01KFFXEX6GF2518JZE6KHPYG9Q/generated-01KG00YSZ6J5NY3HGPXQWVM49P-01KG00YSZ69YQWB6ZR8MF5VQ4B.jpeg",
            "https://cdn.mignite.app/ws/works_01KFFXEX6GF2518JZE6KHPYG9Q/generated-01KG00YTSD6Z8TMRT1Z98A24SE-01KG00YTSEKEZQ02W93X2ABR8P.jpeg",
            "https://cdn.mignite.app/ws/works_01KFFXEX6GF2518JZE6KHPYG9Q/generated-01KG00YV70S6ZMVJPX293D6WKM-01KG00YV71C995TFD0AN8DHPVX.jpeg",
            "https://cdn.mignite.app/ws/works_01KFFXEX6GF2518JZE6KHPYG9Q/generated-01KG00YVN7CQ92GE6NXNST6Q3J-01KG00YVN7ANM2M4ZPHS20A49N.jpeg",
        ],
    };

    // Sofa BCD variant images
    const sofaBcdVariantImages: Record<string, string[]> = {
        "Sage": [
            "https://cdn.mignite.app/ws/works_01KFFXEX6GF2518JZE6KHPYG9Q/generated-01KG02MDBNECE8NYGJBQQD4ZW5-01KG02MDBNQ67PAYFWG3MA3BBM.jpeg",
            "https://cdn.mignite.app/ws/works_01KFFXEX6GF2518JZE6KHPYG9Q/generated-01KG02MDXZP646AQANGR4CEBG2-01KG02MDXZ08C557CBE5GBMVXV.jpeg",
            "https://cdn.mignite.app/ws/works_01KFFXEX6GF2518JZE6KHPYG9Q/generated-01KG02MEJ1RDM1SXXYK50JKKQC-01KG02MEJ1838NKYR16FW9XX4G.jpeg",
            "https://cdn.mignite.app/ws/works_01KFFXEX6GF2518JZE6KHPYG9Q/generated-01KG02MG130CARA1001XRPB0R1-01KG02MG13B0R999Z0M7BJQ7VS.jpeg",
            "https://cdn.mignite.app/ws/works_01KFFXEX6GF2518JZE6KHPYG9Q/generated-01KG02MHCDEV037KNPTD5DQVZK-01KG02MHCDZ810KK34F0G4QV0A.jpeg",
        ],
        "Ivory": [
            "https://cdn.mignite.app/ws/works_01KFFXEX6GF2518JZE6KHPYG9Q/generated-01KG02MHTNATQKVZSFWBK1V7M2-01KG02MHTNJV2SNRV8WKRAY725.jpeg",
            "https://cdn.mignite.app/ws/works_01KFFXEX6GF2518JZE6KHPYG9Q/generated-01KG02MJMQJWQQKJA1SC8Z2AFP-01KG02MJMQG3SF69M00A51W1KB.jpeg",
            "https://cdn.mignite.app/ws/works_01KFFXEX6GF2518JZE6KHPYG9Q/generated-01KG02MKMR51PCRYM2R8TAWASZ-01KG02MKMRTHCM9J7SXGQXEMCW.jpeg",
            "https://cdn.mignite.app/ws/works_01KFFXEX6GF2518JZE6KHPYG9Q/generated-01KG02MME2J3SZZPQG2BSECME8-01KG02MME2Z982VBC9VBV5QWST.jpeg",
            "https://cdn.mignite.app/ws/works_01KFFXEX6GF2518JZE6KHPYG9Q/generated-01KG02MN60SN7SEMZ3PYP3G0EV-01KG02MN60438Z02T4DB7F5H5J.jpeg",
        ],
        "Charcoal": [
            "https://cdn.mignite.app/ws/works_01KFFXEX6GF2518JZE6KHPYG9Q/generated-01KG02MSAQZDSN92Q902QWR1KM-01KG02MSAQM9SQJBTBB53T3HZ9.jpeg",
            "https://cdn.mignite.app/ws/works_01KFFXEX6GF2518JZE6KHPYG9Q/generated-01KG02MT68P47224P7VH0Z1S5K-01KG02MT686A9XRJF04JW20TF6.jpeg",
            "https://cdn.mignite.app/ws/works_01KFFXEX6GF2518JZE6KHPYG9Q/generated-01KG02MV7YKSD0PY6ZKT4TKNEX-01KG02MV7YQS6ZYN9YKRMK896W.jpeg",
            "https://cdn.mignite.app/ws/works_01KFFXEX6GF2518JZE6KHPYG9Q/generated-01KG02MVT689JQQ1FD1KR49KCQ-01KG02MVT6P9X0C32P1TG0981W.jpeg",
            "https://cdn.mignite.app/ws/works_01KFFXEX6GF2518JZE6KHPYG9Q/generated-01KG02MX3NMK2FDC9YN8PW6ZPY-01KG02MX3NE7ZS36YNER82E1WP.jpeg",
        ],
        "Camel": [
            "https://cdn.mignite.app/ws/works_01KFFXEX6GF2518JZE6KHPYG9Q/generated-01KG02MYM1XTRQWJJ4K6SQ1QJH-01KG02MYM1SQY8W207RS5F1BRZ.jpeg",
            "https://cdn.mignite.app/ws/works_01KFFXEX6GF2518JZE6KHPYG9Q/generated-01KG02MZHF239AWEMF2CMS7T35-01KG02MZHF2HS2QRANPCM4YV2W.jpeg",
            "https://cdn.mignite.app/ws/works_01KFFXEX6GF2518JZE6KHPYG9Q/generated-01KG02N09N8MBSA6BG6D2WME77-01KG02N09NN11WNX908E21KHKB.jpeg",
            "https://cdn.mignite.app/ws/works_01KFFXEX6GF2518JZE6KHPYG9Q/generated-01KG02N0AZET5JR82SFE4H0V0N-01KG02N0AZB1HMY1D76A450V63.jpeg",
            "https://cdn.mignite.app/ws/works_01KFFXEX6GF2518JZE6KHPYG9Q/generated-01KG02N0SKJM15Q5PN3PP70Q80-01KG02N0SK6X0MS3X5TCSZQVWF.jpeg",
        ],
        "Terracotta": [
            "https://cdn.mignite.app/ws/works_01KFFXEX6GF2518JZE6KHPYG9Q/generated-01KG02N727P5WERW29QXKQQYGW-01KG02N727EYZA5DMH5JFTJVJ4.jpeg",
            "https://cdn.mignite.app/ws/works_01KFFXEX6GF2518JZE6KHPYG9Q/generated-01KG02N8RRVYGAWPTV9XN0C3XT-01KG02N8RSSPABMZ23M7XGXDTV.jpeg",
            "https://cdn.mignite.app/ws/works_01KFFXEX6GF2518JZE6KHPYG9Q/generated-01KG02NMBJP31AKMFP4AXVDDCD-01KG02NMBJE74AJZ4Z7DSD217A.jpeg",
            "https://cdn.mignite.app/ws/works_01KFFXEX6GF2518JZE6KHPYG9Q/generated-01KG02NA026VPPA7XSR4NB5BBN-01KG02NA027RJHGK2W417KHM8D.jpeg",
            "https://cdn.mignite.app/ws/works_01KFFXEX6GF2518JZE6KHPYG9Q/generated-01KG02NAV4NKM8FGG5VNWJDSD3-01KG02NAV4HY1E20Z5HDNYM1WT.jpeg",
        ],
        "Navy": [
            "https://cdn.mignite.app/ws/works_01KFFXEX6GF2518JZE6KHPYG9Q/generated-01KG02NBKV4T4X6RB8N3FDJBDK-01KG02NBKV71ZNK0W7T1WZMBEK.jpeg",
            "https://cdn.mignite.app/ws/works_01KFFXEX6GF2518JZE6KHPYG9Q/generated-01KG02NBE3C5DTV874STKYY4X3-01KG02NBE30T0RGN4E76VAJG8X.jpeg",
            "https://cdn.mignite.app/ws/works_01KFFXEX6GF2518JZE6KHPYG9Q/generated-01KG02NC8V7GCHJNEP755E6MNK-01KG02NC8VGJSMTT1K4TFHVA51.jpeg",
            "https://cdn.mignite.app/ws/works_01KFFXEX6GF2518JZE6KHPYG9Q/generated-01KG02NCZFSQF1XQJ5Q0YX5R57-01KG02NCZF1NKQARX7BNH6KK71.jpeg",
            "https://cdn.mignite.app/ws/works_01KFFXEX6GF2518JZE6KHPYG9Q/generated-01KG02NE51QBN9G7QSCZ4MFK4G-01KG02NE51RJGYFPYH4W6THTPP.jpeg",
        ],
    };

    // All images for products
    const sofaOpqAllImages = [
        ...variantImageMappings["Charcoal"],
        ...variantImageMappings["Ivory"],
        ...variantImageMappings["Sage"],
        ...variantImageMappings["Terracotta"],
        ...variantImageMappings["Navy"],
        ...variantImageMappings["Camel"],
        ...variantImageMappings["Blush"],
        ...variantImageMappings["Slate"],
    ];

    const sofaXyzAllImages = [
        ...sofaXyzVariantImages["Charcoal"],
        ...sofaXyzVariantImages["Ivory"],
        ...sofaXyzVariantImages["Sage"],
        ...sofaXyzVariantImages["Navy"],
    ];

    const sofaBcdAllImages = [
        ...sofaBcdVariantImages["Sage"],
        ...sofaBcdVariantImages["Ivory"],
        ...sofaBcdVariantImages["Charcoal"],
        ...sofaBcdVariantImages["Camel"],
        ...sofaBcdVariantImages["Terracotta"],
        ...sofaBcdVariantImages["Navy"],
    ];

    const productsToCreate = [
        {
            title: "Sofa OPQ",
            handle: "sofa-opq",
            subtitle: "A comfortable modern sofa",
            description: "This is our premium Sofa OPQ, featuring exceptional comfort and contemporary design.",
            status: "published" as const,
            is_giftcard: false,
            discountable: true,
            category_ids: [getCategoryId("sofas")],
            thumbnail: variantImageMappings["Charcoal"][0],
            images: sofaOpqAllImages.map(url => ({ url })),
            options: [
                {
                    title: "Color",
                    values: ["Charcoal", "Ivory", "Sage", "Terracotta", "Navy", "Camel", "Blush", "Slate"],
                },
            ],
            variants: [
                { title: "Charcoal", manage_inventory: false, options: { Color: "Charcoal" }, prices: [{ currency_code: "usd", amount: 1299 }, { currency_code: "eur", amount: 1199 }] },
                { title: "Ivory", manage_inventory: false, options: { Color: "Ivory" }, prices: [{ currency_code: "usd", amount: 1299 }, { currency_code: "eur", amount: 1199 }] },
                { title: "Sage", manage_inventory: false, options: { Color: "Sage" }, prices: [{ currency_code: "usd", amount: 1299 }, { currency_code: "eur", amount: 1199 }] },
                { title: "Terracotta", manage_inventory: false, options: { Color: "Terracotta" }, prices: [{ currency_code: "usd", amount: 1299 }, { currency_code: "eur", amount: 1199 }] },
                { title: "Navy", manage_inventory: false, options: { Color: "Navy" }, prices: [{ currency_code: "usd", amount: 1299 }, { currency_code: "eur", amount: 1199 }] },
                { title: "Camel", manage_inventory: false, options: { Color: "Camel" }, prices: [{ currency_code: "usd", amount: 1299 }, { currency_code: "eur", amount: 1199 }] },
                { title: "Blush", manage_inventory: false, options: { Color: "Blush" }, prices: [{ currency_code: "usd", amount: 1299 }, { currency_code: "eur", amount: 1199 }] },
                { title: "Slate", manage_inventory: false, options: { Color: "Slate" }, prices: [{ currency_code: "usd", amount: 1299 }, { currency_code: "eur", amount: 1199 }] },
            ],
            variantImageMap: variantImageMappings,
        },
        {
            title: "Sofa XYZ",
            handle: "sofa-xyz",
            subtitle: "A comfortable modern sofa",
            description: "This is our premium Sofa XYZ, featuring exceptional comfort and contemporary design.",
            status: "published" as const,
            is_giftcard: false,
            discountable: true,
            category_ids: [getCategoryId("sofas")],
            thumbnail: sofaXyzVariantImages["Charcoal"][0],
            images: sofaXyzAllImages.map(url => ({ url })),
            options: [
                {
                    title: "Color",
                    values: ["Charcoal", "Ivory", "Sage", "Navy"],
                },
            ],
            variants: [
                { title: "Charcoal", manage_inventory: false, options: { Color: "Charcoal" }, prices: [{ currency_code: "usd", amount: 1599 }, { currency_code: "eur", amount: 1499 }] },
                { title: "Ivory", manage_inventory: false, options: { Color: "Ivory" }, prices: [{ currency_code: "usd", amount: 1599 }, { currency_code: "eur", amount: 1499 }] },
                { title: "Sage", manage_inventory: false, options: { Color: "Sage" }, prices: [{ currency_code: "usd", amount: 1599 }, { currency_code: "eur", amount: 1499 }] },
                { title: "Navy", manage_inventory: false, options: { Color: "Navy" }, prices: [{ currency_code: "usd", amount: 1599 }, { currency_code: "eur", amount: 1499 }] },
            ],
            variantImageMap: sofaXyzVariantImages,
        },
        {
            title: "Sofa BCD",
            handle: "sofa-bcd",
            subtitle: "A comfortable modern sofa",
            description: "This is our premium Sofa BCD, featuring exceptional comfort and contemporary design.",
            status: "published" as const,
            is_giftcard: false,
            discountable: true,
            category_ids: [getCategoryId("sofas")],
            thumbnail: sofaBcdVariantImages["Sage"][0],
            images: sofaBcdAllImages.map(url => ({ url })),
            options: [
                {
                    title: "Color",
                    values: ["Sage", "Ivory", "Charcoal", "Camel", "Terracotta", "Navy"],
                },
            ],
            variants: [
                { title: "Sage", manage_inventory: false, options: { Color: "Sage" }, prices: [{ currency_code: "usd", amount: 1899 }, { currency_code: "eur", amount: 1799 }] },
                { title: "Ivory", manage_inventory: false, options: { Color: "Ivory" }, prices: [{ currency_code: "usd", amount: 1899 }, { currency_code: "eur", amount: 1799 }] },
                { title: "Charcoal", manage_inventory: false, options: { Color: "Charcoal" }, prices: [{ currency_code: "usd", amount: 1899 }, { currency_code: "eur", amount: 1799 }] },
                { title: "Camel", manage_inventory: false, options: { Color: "Camel" }, prices: [{ currency_code: "usd", amount: 1899 }, { currency_code: "eur", amount: 1799 }] },
                { title: "Terracotta", manage_inventory: false, options: { Color: "Terracotta" }, prices: [{ currency_code: "usd", amount: 1899 }, { currency_code: "eur", amount: 1799 }] },
                { title: "Navy", manage_inventory: false, options: { Color: "Navy" }, prices: [{ currency_code: "usd", amount: 1899 }, { currency_code: "eur", amount: 1799 }] },
            ],
            variantImageMap: sofaBcdVariantImages,
        },
    ];

    const newProducts = productsToCreate.filter(
        (p) => !existingHandles.includes(p.handle)
    );

    if (newProducts.length > 0) {
        // Create products (without variantImageMap in the workflow input)
        const productsForWorkflow = newProducts.map(({ variantImageMap, ...product }) => product);

        const { result: createdProducts } = await createProductsWorkflow(container).run({
            input: { products: productsForWorkflow },
        });

        // Link products to sales channel
        await linkProductsToSalesChannelWorkflow(container).run({
            input: {
                id: defaultSalesChannel[0].id,
                add: createdProducts.map((p) => p.id),
            },
        });

        // Assign images to variants
        logger.info("Assigning images to variants...");
        for (let i = 0; i < createdProducts.length; i++) {
            const createdProduct = createdProducts[i];
            const productConfig = newProducts[i];
            const variantImageMap = productConfig.variantImageMap;

            // Get the created product with images to find image IDs
            const { data: [productWithImages] } = await query.graph({
                entity: "product",
                fields: ["id", "images.*", "variants.*"],
                filters: { id: createdProduct.id },
            });

            // Create a map of URL to image ID
            const urlToImageId: Record<string, string> = {};
            for (const img of productWithImages.images || []) {
                urlToImageId[img.url] = img.id;
            }

            // Assign images to each variant
            for (const variant of productWithImages.variants || []) {
                const variantTitle = variant.title;
                const variantUrls = variantImageMap[variantTitle];

                if (variantUrls && variantUrls.length > 0) {
                    const imageIds = variantUrls
                        .map((url: string) => urlToImageId[url])
                        .filter((id: string | undefined): id is string => !!id);

                    if (imageIds.length > 0) {
                        await batchVariantImagesWorkflow(container).run({
                            input: {
                                variant_id: variant.id,
                                add: imageIds,
                                remove: [],
                            },
                        });
                    }
                }
            }
        }

        logger.info(`Created ${createdProducts.length} products with variant images.`);
    } else {
        logger.info("Products already exist, skipping.");
    }

    logger.info("Finished seeding data.");
}