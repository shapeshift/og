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
import type { ChainId } from '@shapeshiftoss/caip'
import type { ChangeEvent } from 'react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import AssetData from 'lib/generatedAssetData.json'
import { isNft } from 'lib/utils'
import type { Asset } from 'types/Asset'

import { AssetList } from './AssetList'
import type { ChainRow } from './ChainButton'
import { ChainButton } from './ChainButton'
import { filterAssetsBySearchTerm } from './helpers/filterAssetsBySearchTerm'

type AssetSelectModalProps = {
  isOpen: boolean
  onClose: () => void
  onClick: (asset: Asset) => void
}

export const AssetSelectModal: React.FC<AssetSelectModalProps> = ({ isOpen, onClose, onClick }) => {
  const [searchQuery, setSearchQuery] = useState('')
  const assets = Object.values(AssetData)
  const [activeChain, setActiveChain] = useState<ChainId | 'All'>('All')
  const [searchTermAssets, setSearchTermAssets] = useState<Asset[]>([])
  const iniitalRef = useRef(null)

  const filteredAssets = useMemo(
    () =>
      activeChain === 'All'
        ? assets.filter(a => !isNft(a.assetId))
        : assets.filter(a => a.chainId === activeChain && !isNft(a.assetId)),
    [activeChain, assets],
  )

  const searching = useMemo(() => searchQuery.length > 0, [searchQuery])

  const handleSearchQuery = useCallback((value: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(value.target.value)
  }, [])

  const handleChainClick = useCallback((chainId: ChainId | 'All') => {
    setActiveChain(chainId)
  }, [])

  const handleAllChain = useCallback(() => {
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
    if (filteredAssets && searching) {
      setSearchTermAssets(
        searching ? filterAssetsBySearchTerm(searchQuery, filteredAssets) : filteredAssets,
      )
    }
  }, [searchQuery, searching, filteredAssets])

  const listAssets = searching ? searchTermAssets : filteredAssets

  const uniqueChainIds: ChainRow[] = assets.reduce((accumulator, currentAsset: Asset) => {
    const existingEntry = accumulator.find(
      (entry: ChainRow) => entry.chainId === currentAsset.chainId,
    )

    if (!existingEntry) {
      accumulator.push({
        chainId: currentAsset.chainId,
        icon: currentAsset.icon,
        name: currentAsset.networkName ?? currentAsset.name,
      })
    }

    return accumulator
  }, [])

  const renderRows = useMemo(() => {
    return <AssetList assets={listAssets} handleClick={handleClick} />
  }, [handleClick, listAssets])

  const renderChains = useMemo(() => {
    return uniqueChainIds.map(chain => (
      <ChainButton
        key={chain.chainId}
        isActive={chain.chainId === activeChain}
        onClick={handleChainClick}
        {...chain}
      />
    ))
  }, [activeChain, handleChainClick, uniqueChainIds])

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
            <CloseButton position='relative' />
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
              onClick={handleAllChain}
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
