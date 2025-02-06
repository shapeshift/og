import type { AssetId } from '@shapeshiftoss/caip'
import { create } from 'zustand'
import { useShallow } from 'zustand/shallow'

import { initialAssetsById } from '../constants/assets'
import type { Asset } from '../types/assets'

interface AssetsState {
  byId: Record<AssetId, Asset>
  ids: AssetId[]
  getAssetById: <T extends AssetId | undefined>(assetId: T) => T extends AssetId ? Asset : undefined
  getAllAssets: () => Asset[]
}

export const useAssetsStore = create<AssetsState>((_set, get) => ({
  byId: initialAssetsById,
  ids: Object.keys(initialAssetsById),
  getAssetById: ((assetId: AssetId | undefined) => assetId ? get().byId[assetId] : undefined) as AssetsState['getAssetById'],
  getAllAssets: () => get().ids.map(id => get().byId[id]),
}))

export const useAssetById = <T extends AssetId | undefined>(assetId: T): T extends AssetId ? Asset : undefined => {
  return useAssetsStore(state => state.getAssetById(assetId)) as T extends AssetId ? Asset : undefined
}

export const useAllAssets = () => {
  return useAssetsStore(useShallow(state => state.getAllAssets()))
}
