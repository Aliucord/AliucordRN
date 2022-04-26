import { getByProps } from "../metro";
import { after } from "./Patcher";

const assetMap = {};

const AssetRegistry = getByProps("registerAsset");

after(AssetRegistry, "registerAsset", (_, id, asset) => {
    assetMap[asset.name] = id;
});

for (let i = 1; ; i++) {
    const asset = AssetRegistry.getAssetByID(i);
    if (asset) {
        assetMap[asset.name] = i;
    } else break;
}

/**
 * Get the id of an asset to be used as Image source
 * @example <Image source={getAssetId("heart")} />)
 * @param assetName Name of the asset
 * @returns ID or -1
 * 
 * @see findAssets
 */
export function getAssetId(assetName: string) {
    return assetMap[assetName];
}

/**
 * Lists all assets containing the specified keyword
 * @param keyword
 * @returns asset names
 */
export function findAssets(keyword: string) {
    keyword = keyword.toLowerCase();

    const names = [] as string[];
    for (const name in assetMap) {
        if (name.toLowerCase().includes(keyword)) {
            names.push(name);
        }
    }

    return names;
}
