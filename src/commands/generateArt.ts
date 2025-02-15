import fs from "fs/promises";
import { fork } from "child_process";
import { Chance } from "chance";
import pLimit from "p-limit";
import os from "os";
import _includes from "lodash.includes";

import { NFTMetaData } from "../lib/types/NFTMetaData";
import { Logger } from "../lib/types/Logger";
import { padNumber } from "../lib/tools/string.js";
import mkdirp from "mkdirp";

const cpuCount = os.cpus().length;
const limit = pLimit(cpuCount); // pLimit(1); // pLimit(cpuCount);

const PAINTER_SCRIPT = "./bin/src/scripts/painter.js";

type LayerConfigItem = {
  items: string[];
  weights: number[];
  priority: number;
};

type LayerItem = {
  layerName: string;
  item: string;
  uri: string;
  priority: number;
};

export type GenerateArtInput = {
  jsonTemplatePath: string;
  layersConfigPath: string;
  layersPath: string;
  outputPath: string;
  amount: string;
  outputFormat: "png" | "jpeg";
};

const getJsonTemplate = async (jsonTemplatePath: string) =>
  JSON.parse(await fs.readFile(jsonTemplatePath, "utf-8")) as NFTMetaData;

const getLayersConfig = async (layersConfigPath: string) =>
  JSON.parse(await fs.readFile(layersConfigPath, "utf-8")) as Record<
    string,
    LayerConfigItem
  >;

type PickedLayer = {
  priority: number;
  pickedLayerItem: string;
};

const reRollIfException = (
  layer: string,
  exceptions: string[],
  {
    items,
    config,
  }: {
    items: Record<string, PickedLayer>;
    config: Record<string, LayerConfigItem>;
  },
  chance: Chance.Chance = new Chance()
) => {
  while (exceptions.includes(items[layer].pickedLayerItem)) {
    console.log("Rerolling layer", layer);
    items[layer].pickedLayerItem = chance.weighted(
      config[layer].items,
      config[layer].weights
    );
  }
};

const pickLayers = (
  config: Record<string, LayerConfigItem>,
  chance: Chance.Chance = new Chance()
) => {
  const items = Object.entries(config).reduce(
    (acc, [layerName, layerConfig]) => ({
      ...acc,
      [layerName]: {
        priority: layerConfig.priority,
        pickedLayerItem: chance.weighted(
          layerConfig.items,
          layerConfig.weights
        ),
      },
    }),
    {} as Record<string, PickedLayer>
  );

  // TODO: Move this into a re-ordering worker plugin.
  //#region JungleCats Lionesses

  if (items["Skin"].pickedLayerItem === "Zombie") {
    reRollIfException(
      "Eyes",
      [
        "Blue",
        "Cat Eyes",
        "Dragon Eyes",
        "Glowing Blue",
        "Glowing White",
        "Glowing Yellow",
        "Green",
        "Orange",
        "Red",
        "Snake Eyes",
        "Solana Eyes",
        "Yellow",
      ],
      {
        items,
        config,
      }
    );
  }

  if (items["Head"].pickedLayerItem === "Cleopatra") {
    reRollIfException(
      "Eyes",
      [
        "Eye Patch",
        "Heart Glasses",
        "Nerd Glasses",
        "Opera Mask",
        "Pit Vipers",
        "Ski Goggles",
        "Soundwave Goggles",
        "Steam Punk",
        "VR",
        "Laser Eyes",
        "Ray Eyes",
      ],
      { items, config }
    );
    reRollIfException("Accessories", ["Earrings"], { items, config });
    reRollIfException(
      "Mouth",
      ["Microphone", "Scuba", "Cigar", "Flower", "Grapes", "Pipe"],
      { items, config }
    );
  } else if (items["Head"].pickedLayerItem === "Devil Horns") {
    reRollIfException(
      "Eyes",
      [
        "Eye Patch",
        "Nerd Glasses",
        "Opera Mask",
        "Pit Vipers",
        "Heart Glasses",
        "Steam Punk",
        "VR",
      ],
      { items, config }
    );
  } else if (items["Head"].pickedLayerItem === "Unicorn Horn") {
    reRollIfException(
      "Eyes",
      [
        "Eye Patch",
        "Heart Glasses",
        "Nerd Glasses",
        "Opera Mask",
        "Pit Vipers",
        "Ski Goggles",
        "Soundwave Goggles",
        "Steam Punk",
        "VR",
      ],
      { items, config }
    );
  } else if (items["Head"].pickedLayerItem === "Viking Helmet") {
    reRollIfException(
      "Eyes",
      [
        "Eye Patch",
        "Heart Glasses",
        "Pit Vipers",
        "Ski Goggles",
        "Soundwave Goggles",
        "Steam Punk",
        "VR",
      ],
      { items, config }
    );
  } else if (items["Head"].pickedLayerItem === "Brain") {
    reRollIfException("Eyes", ["Pit Vipers", "Opera Mask"], { items, config });
  } else if (items["Head"].pickedLayerItem === "Chef hat") {
    reRollIfException("Eyes", ["Opera Mask"], { items, config });
  } else if (items["Head"].pickedLayerItem === "Cowboy hat") {
    reRollIfException("Eyes", ["Soundwave Goggles", "Ski Goggles"], {
      items,
      config,
    });
  } else if (
    items["Head"].pickedLayerItem === "Green Mushroom Hat" ||
    items["Head"].pickedLayerItem === "Purple Mushroom Hat"
  ) {
    reRollIfException("Eyes", ["Ski Goggles", "Soundwave Goggles", "VR"], {
      items,
      config,
    });
  } else if (
    items["Head"].pickedLayerItem === "Pink Visor" ||
    items["Head"].pickedLayerItem === "Blue Visor"
  ) {
    reRollIfException("Eyes", ["Soundwave Goggles", "Ski Goggles"], {
      items,
      config,
    });
  } else if (items["Head"].pickedLayerItem === "Pirate Hat") {
    reRollIfException("Eyes", ["VR", "Pit Vipers", "Opera Mask"], {
      items,
      config,
    });
  } else if (items["Head"].pickedLayerItem === "Santa Hat") {
    reRollIfException(
      "Eyes",
      ["Soundwave Goggles", "Ski Goggles", "VR", "Steam Punk"],
      {
        items,
        config,
      }
    );
  } else if (items["Head"].pickedLayerItem === "Tiara") {
    reRollIfException("Eyes", ["VR", "Steam Punk", "Opera Mask"], {
      items,
      config,
    });
  } else if (items["Head"].pickedLayerItem === "Wizard Hat") {
    reRollIfException("Eyes", ["Soundwave Goggles", "Ski Goggles"], {
      items,
      config,
    });
  }

  if (items["Eyes"].pickedLayerItem === "Opera Mask") {
    reRollIfException("Mouth", ["Gas Mask", "Microphone", "Scuba"], {
      items,
      config,
    });
    reRollIfException("Nose", ["Stud", "Ring", "Septum", "Butterfly"], {
      items,
      config,
    });
  } else if (
    items["Eyes"].pickedLayerItem === "Laser Eyes" ||
    items["Eyes"].pickedLayerItem === "Ray Eyes"
  ) {
    reRollIfException("Nose", ["Butterfly"], {
      items,
      config,
    });
  }

  if (items["Mouth"].pickedLayerItem === "Gas Mask") {
    reRollIfException("Nose", ["Stud", "Ring", "Septum"], {
      items,
      config,
    });
  } else if (items["Mouth"].pickedLayerItem === "Scuba") {
    items["Nose"].pickedLayerItem = "None";
    reRollIfException("Accessories", ["Butterfly Wings"], {
      items,
      config,
    });
  } else if (items["Mouth"].pickedLayerItem === "Microphone") {
    reRollIfException("Accessories", ["Bone Necklace", "Sea Shell"], {
      items,
      config,
    });
  }

  if (items["Accessories"].pickedLayerItem === "Egyptian Necklace") {
    reRollIfException(
      "Top",
      [
        "Yellow Shirt",
        "White Tracksuit",
        "Red Poncho",
        "Purple Shirt",
        "Purple Puffer Jacket",
        "Puffer Vest",
        "Pink Tracksuit",
        "Green Tracksuit",
        "Green Shirt",
        "Green Puffer Jacket",
        "Green Poncho",
        "Dress",
        "Cream Puffer Jacket",
        "Cargo Vest",
        "Blue Tracksuit",
        "Blue Shirt",
        "Black Puffer Jacket",
        "Black Shirt",
      ],
      {
        items,
        config,
      }
    );
  }

  //#endregion

  //#region Ordering
  if (
    items["Accessories"].pickedLayerItem === "Butterfly Wings" ||
    items["Accessories"].pickedLayerItem === "Wings"
  ) {
    for (const layer of Object.keys(items)) {
      if (layer !== "Background") {
        items[layer].priority += 1;
      }
    }
    items["Accessories"].priority = 1;
  }
  if (items["Mouth"].pickedLayerItem === "Scuba") {
    for (const layer of Object.keys(items)) {
      if (layer !== "Background") {
        items[layer].priority += 1;
      }
    }
    items["Pseudo"] = {
      pickedLayerItem: "Scuba",
      priority: 1,
    };
  }

  if (
    items["Mouth"].pickedLayerItem === "Microphone" &&
    items["Eyes"].pickedLayerItem !== "Ray Eyes" &&
    items["Eyes"].pickedLayerItem !== "Laser Eyes"
  ) {
    items["Mouth"].priority =
      Object.entries(items)
        .map((i) => i[1].priority)
        .sort((a, b) => b - a)[0] + 1;
  }
  if (
    items["Mouth"].pickedLayerItem === "Sneakers" &&
    items["Head"].pickedLayerItem === "Cleopatra"
  ) {
    items["Mouth"].priority =
      Object.entries(items)
        .map((i) => i[1].priority)
        .sort((a, b) => b - a)[0] + 1;
  }
  if (items["Accessories"].pickedLayerItem === "Egyptian Necklace") {
    items["Accessories"].priority = items["Top"].priority - 0.1; // Behind by little.
  }
  if (items["Nose"].pickedLayerItem === "Butterfly") {
    items["Nose"].priority =
      Object.entries(items)
        .map((i) => i[1].priority)
        .sort((a, b) => b - a)[0] + 1;
  }
  if (
    items["Eyes"].pickedLayerItem === "Ray Eyes" ||
    items["Eyes"].pickedLayerItem === "Laser Eyes"
  ) {
    items["Eyes"].priority =
      Object.entries(items)
        .map((i) => i[1].priority)
        .sort((a, b) => b - a)[0] + 1;
  }
  //#endregion
  return items;
};

const getLayerItemUri = async (
  layersPath: string,
  { layerName, item }: { layerName: string; item: string }
) => {
  const layerPath = `${layersPath}/${layerName}`;
  const files = await fs.readdir(layerPath);
  const file = files.find((file) => file.includes(item));
  if (!file) {
    throw new Error(`${layerName}/${item} not found`);
  }
  return `${layerPath}/${file}`;
};

const getLayerItemUris = (
  layersPath: string,
  pickedItems: Record<string, PickedLayer>
) =>
  Object.entries(pickedItems).map<Promise<LayerItem>>(
    async ([layerName, { pickedLayerItem: item, priority }]) => ({
      layerName,
      item,
      priority,
      uri: await getLayerItemUri(layersPath, {
        layerName,
        item,
      }),
    })
  );

const writeImage = async (
  i: number,
  items: LayerItem[],
  outputFormat: string,
  outputPath: string
) =>
  new Promise<string>(async (resolve, reject) => {
    fork(PAINTER_SCRIPT, [
      i.toString(),
      outputFormat,
      outputPath,
      ...items.sort((a, b) => a.priority - b.priority).map(({ uri }) => uri),
    ])
      .on("exit", () => resolve(`${outputPath}/${i}.${outputFormat}`))
      .on("error", () => reject());
  });

const cloneTemplate = (jsonTemplate: NFTMetaData) =>
  JSON.parse(JSON.stringify(jsonTemplate)) as NFTMetaData;

const writeMetadataJson = async (
  i: number,
  jsonTemplate: NFTMetaData,
  pickedLayerItems: LayerItem[],
  outputFormat: string,
  outputPath: string
) => {
  const jsonTemplateForItem = cloneTemplate(jsonTemplate);
  jsonTemplateForItem.name = `${jsonTemplateForItem.name} #${padNumber(i + 1)}`;
  jsonTemplateForItem.attributes = pickedLayerItems.map(
    ({ layerName, item }) => ({
      trait_type: layerName,
      value: item,
    })
  );
  jsonTemplateForItem.image = `${i}.${outputFormat}`;
  const metaDataUri = `${outputPath}/${i}.json`;
  await fs.writeFile(
    metaDataUri,
    JSON.stringify(jsonTemplateForItem, null, 2),
    "utf-8"
  );
  return { metaDataUri, jsonTemplateForItem };
};

const generateNFT = async (
  i: number,
  { layersPath, outputFormat, outputPath }: GenerateArtInput,
  layersConfig: Record<string, LayerConfigItem>,
  jsonTemplate: NFTMetaData,
  logger?: Logger
) => {
  // TODO: Create a file system cache since this doesn't regularly change during generation
  const pickedLayerItems = await Promise.all(
    getLayerItemUris(layersPath, pickLayers(layersConfig))
  );
  logger?.log(`[${i + 1}] - ${JSON.stringify(pickedLayerItems)}`);
  const [imageUri, { jsonTemplateForItem, metaDataUri }] = await Promise.all([
    writeImage(i, pickedLayerItems, outputFormat, outputPath),
    writeMetadataJson(
      i,
      jsonTemplate,
      pickedLayerItems,
      outputFormat,
      outputPath
    ),
  ]);
  return {
    imageUri,
    metaDataUri,
    jsonTemplateForItem,
  };
};

export const createGenerateArtCommand =
  (logger: Logger) => async (input: GenerateArtInput) => {
    const totalAmount = parseInt(input.amount, 10);
    logger.log(`Generating ${totalAmount} NFTs...`);

    logger.log("Reading template...");
    const jsonTemplate = await getJsonTemplate(input.jsonTemplatePath);

    logger.log("Reading layers config...");
    const layersConfig = await getLayersConfig(input.layersConfigPath);

    logger.log("Creating output directory...");
    await mkdirp(input.outputPath);

    const results = await Promise.all(
      [...Array(totalAmount).keys()].map((i) =>
        limit(async () => {
          try {
            logger.log(`Starting: ${i + 1}.`);
            const result = await generateNFT(
              i,
              input,
              layersConfig,
              jsonTemplate,
              logger
            );
            return result;
          } catch (e) {
            logger.error(`Error: ${i + 1}.`);
            throw e;
          } finally {
            logger.log(`Completed: ${i + 1}.`);
          }
        })
      )
    );
    const attributesMap = results.map(({ jsonTemplateForItem }) => ({
      id: jsonTemplateForItem.name,
      attributes: jsonTemplateForItem.attributes,
    }));
    const repeatedAttributes = attributesMap
      .map((i) => i.attributes)
      .filter((val, i, iteratee) => _includes(iteratee, val, i + 1));
    const repeated = attributesMap.filter(({ attributes }) =>
      repeatedAttributes.includes(attributes)
    );
    logger.log(`Repeated items: ${JSON.stringify(repeated, null, 2)}`);
    logger.log(
      `If there are too many repeated Items try adding more features or manually edit them to add some really unique items.`
    );
    // Save all the generated NFTs to the output directory
    logger.log("Saving all.json...");
    await fs.writeFile(
      `${input.outputPath}/all.json`,
      JSON.stringify(results.map((i) => i.jsonTemplateForItem))
    );
    logger.log("Done saving all.json...");
    logger.log("Done generating NFTs.");
  };
