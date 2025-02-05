import type { AssetId } from '@shapeshiftoss/caip'
import { create } from 'zustand'
import { useShallow } from 'zustand/shallow'

import { initialAssetsById } from '../constants/assets'
import type { Asset } from '../types/assets'

interface AssetsState {
  byId: Record<AssetId, Asset>
  ids: AssetId[]
  getAssetById: (assetId: AssetId) => Asset
  getAllAssets: () => Asset[]
}

export const useAssetsStore = create<AssetsState>((_set, get) => ({
  byId: initialAssetsById,
  ids: Object.keys(initialAssetsById),
  getAssetById: (assetId: AssetId) => get().byId[assetId],
  getAllAssets: () => get().ids.map(id => get().byId[id]),
}))

export const useAssetById = (assetId: AssetId | undefined) => {
  return useAssetsStore(state => state.byId[assetId ?? ''])
}

export const useAllAssets = () => {
  return useAssetsStore(useShallow(state => state.getAllAssets()))
}
