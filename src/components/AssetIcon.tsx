import type { AvatarProps } from '@chakra-ui/react'
import { Avatar, Center } from '@chakra-ui/react'
import type { AssetId } from '@shapeshiftoss/caip'
import { memo } from 'react'
import { useAssetById } from 'store/assets'
import type { Asset } from 'types/Asset'

export type AssetIconProps = (
  | {
      assetId: AssetId | undefined
      asset?: undefined
      src?: undefined
    }
  | {
      asset: Asset
      assetId?: undefined
      src?: undefined
    }
  | {
      src: string
      assetId?: undefined
      asset?: undefined
    }
) &
  AvatarProps

export const AssetIcon = memo(
  ({ assetId: _assetId, asset: _asset, src, ...rest }: AssetIconProps) => {
    const asset = useAssetById(_assetId) ?? _asset
    const iconSrc = src ?? asset?.icon
    const shouldShowNetworkIcon = asset?.networkIcon && asset?.relatedAssetKey

    return (
      <Center>
        <Center position={shouldShowNetworkIcon ? 'relative' : 'static'}>
          {shouldShowNetworkIcon && (
            <Avatar
              position='absolute'
              right='-8%'
              top='-8%'
              transform='scale(0.4)'
              transformOrigin='top right'
              src={asset.networkIcon}
              size={rest.size}
              zIndex={2}
            />
          )}
          <Avatar src={iconSrc || ''} name={asset?.symbol} {...rest} />
        </Center>
      </Center>
    )
  },
)
