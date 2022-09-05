import AssetTeaser from '@shared/AssetTeaser/AssetTeaser'
import React, { ReactElement, useEffect, useState } from 'react'
import Pagination from '@shared/Pagination'
import styles from './index.module.css'
import classNames from 'classnames/bind'
import Loader from '@shared/atoms/Loader'
import { useUserPreferences } from '@context/UserPreferences'
import { useIsMounted } from '@hooks/useIsMounted'
import { getAccessDetailsForAssets } from '@utils/accessDetailsAndPricing'
import { useWeb3 } from '@context/Web3'
import { AssetSignalItem } from '@context/Signals/_types'
import useSignalsLoader, { useAssetListSignals } from '@hooks/useSignals'
import { useSignalContext } from '@context/Signals'

const cx = classNames.bind(styles)

export function LoaderArea() {
  return (
    <div className={styles.loaderWrap}>
      <Loader />
    </div>
  )
}

declare type AssetListProps = {
  assets: AssetExtended[]
  showPagination: boolean
  page?: number
  totalPages?: number
  isLoading?: boolean
  onPageChange?: React.Dispatch<React.SetStateAction<number>>
  className?: string
  noPublisher?: boolean
  signalItems?: AssetSignalItem[]
  help: any
}

export default function AssetList({
  assets,
  showPagination,
  page,
  totalPages,
  isLoading,
  onPageChange,
  className,
  noPublisher,
  help
}: AssetListProps): ReactElement {
  const { chainIds, signals: settingsSignals } = useUserPreferences()
  const { accountId } = useWeb3()
  const [assetsWithPrices, setAssetsWithPrices] = useState<AssetExtended[]>()
  const [loading, setLoading] = useState<boolean>(isLoading)
  const [dataTokenAddresses, setDataTokenAddresses] = useState<string[][]>(
    assetsWithPrices
      ? assetsWithPrices.map((asset) =>
          asset.datatokens.map((data) => data.address)
        )
      : null
  )
  const isMounted = useIsMounted()
  // Signals loading logic
  // Get from AssetList component
  const { assetSignalOriginItems, signals, assetSignalsUrls } =
    useSignalContext()
  const { assetSignalOrigins, urls } = useAssetListSignals(
    dataTokenAddresses,
    signals,
    assetSignalsUrls
  )
  const { signalItems, loading: isFetchingSignals } = useSignalsLoader(urls)
  // console.log(signals)
  useEffect(() => {
    if (!assets) return
    setAssetsWithPrices(assets as AssetExtended[])
    setLoading(false)

    async function fetchPrices() {
      const assetsWithPrices = await getAccessDetailsForAssets(
        assets,
        accountId || ''
      )
      if (!isMounted() || !assetsWithPrices) return
      setAssetsWithPrices([...assetsWithPrices])
    }

    fetchPrices()
  }, [assets, isMounted, accountId])

  useEffect(() => {
    if (assetsWithPrices) {
      setDataTokenAddresses(
        assetsWithPrices.map((asset) =>
          asset.datatokens.map((data) => data.address)
        )
      )
    }
  }, [assetsWithPrices])

  // // This changes the page field inside the query
  function handlePageChange(selected: number) {
    onPageChange(selected + 1)
  }

  const styleClasses = cx({
    assetList: true,
    [className]: className
  })

  return chainIds.length === 0 ? (
    <div className={styleClasses}>
      <div className={styles.empty}>No network selected</div>
    </div>
  ) : assetsWithPrices && !loading ? (
    <>
      <div className={styleClasses}>
        {assetsWithPrices.length > 0 ? (
          assetsWithPrices.map((assetWithPrice) => {
            return (
              <AssetTeaser
                asset={assetWithPrice}
                key={assetWithPrice.id}
                noPublisher={noPublisher}
                signalItems={signalItems}
              />
            )
          })
        ) : (
          <div className={styles.empty}>No results found</div>
        )}
      </div>

      {showPagination && (
        <Pagination
          totalPages={totalPages}
          currentPage={page}
          onChangePage={handlePageChange}
        />
      )}
    </>
  ) : (
    <LoaderArea />
  )
}
