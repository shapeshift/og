import { create } from 'zustand'

import { initialAssetsById } from '../constants/assets'
import type { Asset, AssetId } from '../types/assets'

interface AssetsState {
  byId: Record<AssetId, Asset>
  ids: AssetId[]
  getAssetById: (assetId: AssetId) => Asset
}

export const useAssetsStore = create<AssetsState>((_set, get) => ({
  byId: initialAssetsById,
  ids: Object.keys(initialAssetsById),
  getAssetById: (assetId: AssetId) => get().byId[assetId],
}))

export const useAssetById = (assetId: AssetId) => {
  return useAssetsStore(state => state.byId[assetId])
}

export const useAllAssets = () => {
  return useAssetsStore(state => state.ids.map(id => state.byId[id]))
}
