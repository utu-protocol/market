import React, { ReactElement, useEffect } from 'react'
import Link from 'next/link'
import Dotdotdot from 'react-dotdotdot'
import Price from '@shared/Price'
import removeMarkdown from 'remove-markdown'
import Publisher from '@shared/Publisher'
import AssetType from '@shared/AssetType'
import NetworkName from '@shared/NetworkName'
import styles from '../AssetTeaser/index.module.css'
import { getServiceByName } from '@utils/ddo'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { AssetExtended } from 'src/@types/AssetExtended'
import { useSignalContext } from '@context/Signals'
import { getAssetSignalItems } from '@hooks/useSignals/_util'
import Loader from '@shared/atoms/Loader'
import { SignalOriginItem } from '@context/Signals/_types'
import { AssetDatatoken } from '@oceanprotocol/lib/dist/src/@types/Asset'
import AssetTeaserSignals from '../../Signals/AssetTeaserSignals'
import { formatPrice } from '@shared/Price/PriceUnit'
import { useUserPreferences } from '@context/UserPreferences'

declare type AssetTeaserProps = {
  asset: AssetExtended
  noPublisher?: boolean
  isLoading?: boolean
  signalItems?: SignalOriginItem[]
}

function LoaderArea() {
  return (
    <div className={styles.loaderWrap}>
      <Loader />
    </div>
  )
}

export default function SignalAssetTeaser({
  asset,
  noPublisher,
  isLoading,
  signalItems
}: AssetTeaserProps): ReactElement {
  const { datatokens } = asset
  const { locale } = useUserPreferences()
  const { signals, assetSignalsUrls } = useSignalContext()
  const filterAssetSignals = () => {
    return signals
      .filter((signal) => signal.type === 1)
      .filter((signal) => signal.listView.value)
  }

  const { name, type, description } = asset.metadata
  const isCompute = Boolean(getServiceByName(asset, 'compute'))
  const accessType = isCompute ? 'compute' : 'access'
  const { owner } = asset.nft
  const filteredSignals = getAssetSignalItems(
    signalItems,
    datatokens.map((data: AssetDatatoken) => data.address),
    filterAssetSignals()
  )
  const isUnsupportedPricing =
    asset?.accessDetaiPolygonIconls?.type === 'NOT_SUPPORTED'
  const { orders, allocated } = asset.stats
  useEffect(() => {
    if (signalItems) {
      // eslint-disable-next-line no-empty
      if (signalItems.length > 0) {
      }
    }
  }, [signalItems])

  if (!signalItems || signalItems.length < 1) {
    return null
  }
  return (
    <article className={`${styles.teaser} ${styles[type]}`}>
      <Link href={`/asset/${asset.id}`}>
        <a className={styles.link}>
          <aside className={styles.detailLine}>
            <AssetType
              className={styles.typeLabel}
              type={type}
              accessType={accessType}
            />
            <span className={styles.typeLabel}>
              {datatokens[0]?.symbol.substring(0, 9)}
            </span>
            <NetworkName
              networkId={asset.chainId}
              className={styles.typeLabel}
            />
          </aside>
          <header className={styles.header}>
            <div className={styles.symbol}>{datatokens[0]?.symbol}</div>
            <Dotdotdot tagName="h1" clamp={3} className={styles.title}>
              {name.slice(0, 200)}
            </Dotdotdot>
            {!noPublisher && <Publisher account={owner} minimal />}
          </header>

          {/* <AssetType */}
          {/*  type={type} */}
          {/*  accessType={accessType} */}
          {/*  className={styles.typeDetails} */}
          {/* /> */}

          <div className={styles.content}>
            <Dotdotdot tagName="p" clamp={3}>
              {removeMarkdown(description?.substring(0, 300) || '')}
            </Dotdotdot>
          </div>
          {isUnsupportedPricing ? (
            <strong>No pricing schema available</strong>
          ) : (
            <Price accessDetails={asset.accessDetails} size="small" />
          )}
          <footer className={styles.footer}>
            {allocated && allocated > 0 ? (
              <span className={styles.typeLabel}>
                {allocated < 0
                  ? ''
                  : `${formatPrice(allocated, locale)} veOCEAN`}
              </span>
            ) : null}
            {orders && orders > 0 ? (
              <span className={styles.typeLabel}>
                {orders < 0
                  ? 'N/A'
                  : `${orders} ${orders === 1 ? 'sale' : 'sales'}`}
              </span>
            ) : null}
          </footer>
        </a>
      </Link>
      {signalItems ? (
        <AssetTeaserSignals assetId={asset.id} signalItems={filteredSignals} />
      ) : null}
    </article>
  )
}