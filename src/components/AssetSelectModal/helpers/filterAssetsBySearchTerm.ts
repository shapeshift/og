import { matchSorter } from 'match-sorter'
import type { Asset } from 'types/Asset'

export const filterAssetsBySearchTerm = (search: string, assets: Asset[]) => {
  if (!assets) return []

  return matchSorter(assets, search, {
    keys: ['name', 'symbol'],
    threshold: matchSorter.rankings.CONTAINS,
  })
}
