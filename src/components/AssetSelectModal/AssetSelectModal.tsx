import {
  Button,
  CloseButton,
  Flex,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Text,
} from '@chakra-ui/react'
import type { AssetId, ChainId } from '@shapeshiftoss/caip'
import type { ChangeEvent } from 'react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useAllAssets } from 'store/assets'
import type { Asset } from 'types/Asset'

import { AssetList } from './AssetList'
import { ChainButton } from './ChainButton'
import { filterAssetsBySearchTerm } from './helpers/filterAssetsBySearchTerm'

type AssetSelectModalProps = {
  isOpen: boolean
  onClose: () => void
  onClick: (asset: Asset) => void
  excludeAssetId?: AssetId
}

type NetworkItem = {
  chainId: ChainId
  icon: string
  name: string
}

export const AssetSelectModal: React.FC<AssetSelectModalProps> = ({
  isOpen,
  onClose,
  onClick,
  excludeAssetId,
}) => {
  const [searchQuery, setSearchQuery] = useState('')
  const assets = useAllAssets()
  const [activeChain, setActiveChain] = useState<ChainId | 'All'>('All')
  const [searchTermAssets, setSearchTermAssets] = useState<Asset[]>([])
  const iniitalRef = useRef(null)

  // All assets, minus the selected one on the opposite side
  const assetsExcludeOpposite = useMemo(
    () => assets.filter(asset => asset.assetId !== excludeAssetId),
    [assets, excludeAssetId],
  )

  const maybeActiveChainFilteredAssets = useMemo(
    () =>
      activeChain === 'All'
        ? assetsExcludeOpposite
        : assetsExcludeOpposite.filter(a => a.chainId === activeChain),
    [activeChain, assetsExcludeOpposite],
  )

  const isSearching = useMemo(() => searchQuery.length > 0, [searchQuery])

  const handleSearchQuery = useCallback((value: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(value.target.value)
  }, [])

  const handleChainClick = useCallback((chainId: ChainId | 'All') => {
    setActiveChain(chainId)
  }, [])

  const handleAllClick = useCallback(() => {
    setActiveChain('All')
  }, [])

  const handleClose = useCallback(() => {
    // Reset state on close
    setActiveChain('All')
    setSearchQuery('')
    onClose()
  }, [onClose])

  const handleClick = useCallback(
    (asset: Asset) => {
      onClick(asset)
      handleClose()
    },
    [handleClose, onClick],
  )

  useEffect(() => {
    if (maybeActiveChainFilteredAssets && isSearching) {
      setSearchTermAssets(
        isSearching
          ? filterAssetsBySearchTerm(searchQuery, maybeActiveChainFilteredAssets)
          : maybeActiveChainFilteredAssets,
      )
    }
  }, [searchQuery, isSearching, maybeActiveChainFilteredAssets])

  // Only display chains that have available assets after excluding the opposite side asset
  const availableChains: NetworkItem[] = useMemo(() => {
    const chainMap = new Map<ChainId, NetworkItem>()

    assetsExcludeOpposite.forEach(asset => {
      if (!chainMap.has(asset.chainId)) {
        chainMap.set(asset.chainId, {
          chainId: asset.chainId,
          icon: asset.networkIcon || asset.icon,
          name: asset.networkName || asset.name,
        })
      }
    })

    return Array.from(chainMap.values())
  }, [assetsExcludeOpposite])

  const renderRows = useMemo(() => {
    const assets = isSearching ? searchTermAssets : maybeActiveChainFilteredAssets

    return <AssetList assets={assets} handleClick={handleClick} />
  }, [handleClick, isSearching, maybeActiveChainFilteredAssets, searchTermAssets])

  const renderChains = useMemo(() => {
    return availableChains.map(chain => (
      <ChainButton
        key={chain.chainId}
        isActive={chain.chainId === activeChain}
        onClick={handleChainClick}
        {...chain}
      />
    ))
  }, [activeChain, handleChainClick, availableChains])

  return (
    <Modal isOpen={isOpen} onClose={handleClose} isCentered initialFocusRef={iniitalRef}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader
          display='flex'
          flexDir='column'
          gap={2}
          borderBottomWidth={1}
          borderColor='border.base'
        >
          <Flex alignItems='center' justifyContent='space-between'>
            <Text fontWeight='bold' fontSize='md'>
              Select asset
            </Text>
            <CloseButton position='relative' onClick={handleClose} />
          </Flex>
          <Input
            size='lg'
            placeholder='Search name or paste address'
            ref={iniitalRef}
            onChange={handleSearchQuery}
          />
          <Flex mt={4} flexWrap='wrap' gap={2} justifyContent='space-between'>
            <Button
              size='lg'
              isActive={activeChain === 'All'}
              variant='outline'
              fontSize='sm'
              px={2}
              onClick={handleAllClick}
            >
              All
            </Button>
            {renderChains}
          </Flex>
        </ModalHeader>
        <ModalBody px={2} py={0}>
          {renderRows}
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
