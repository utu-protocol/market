/* eslint-disable react/no-children-prop */
import React, { ReactElement, useEffect, useMemo, useState } from 'react'
import Compute from './Compute'
import Consume from './Download'
import { Datatoken, FileInfo, LoggerInstance } from '@oceanprotocol/lib'
import Tabs, { TabsItem } from '@shared/atoms/Tabs'
import AssetSignals from '@shared/atoms/AssetSignals'
import { compareAsBN } from '@utils/numbers'
import { useAsset } from '@context/Asset'
import { useWeb3 } from '@context/Web3'
import Web3Feedback from '@shared/Web3Feedback'
import { getFileDidInfo, getFileInfo } from '@utils/provider'
import { getOceanConfig } from '@utils/ocean'
import { useCancelToken } from '@hooks/useCancelToken'
import { useIsMounted } from '@hooks/useIsMounted'
import styles from './index.module.css'
import { useFormikContext } from 'formik'
import { FormPublishData } from '@components/Publish/_types'
import { getTokenBalanceFromSymbol } from '@utils/web3'
import AssetStats from './AssetStats'
import { useSignalContext } from '@context/Signals'
import { getAssetSignalItems } from '@hooks/useSignals/_util'
import { AssetDatatoken } from '@oceanprotocol/lib/dist/src/@types/Asset'
import useSignalsLoader, { useSignalUrls } from '@hooks/useSignals'

export default function AssetActions({
  asset
}: {
  asset: AssetExtended
}): ReactElement {
  const { accountId, balance, web3 } = useWeb3()
  const { isAssetNetwork } = useAsset()
  const newCancelToken = useCancelToken()
  const isMounted = useIsMounted()

  // TODO: using this for the publish preview works fine, but produces a console warning
  // on asset details page as there is no formik context there:
  // Warning: Formik context is undefined, please verify you are calling useFormikContext()
  // as child of a <Formik> component.
  const formikState = useFormikContext<FormPublishData>()

  const [isBalanceSufficient, setIsBalanceSufficient] = useState<boolean>()
  const [dtBalance, setDtBalance] = useState<string>()
  const [fileMetadata, setFileMetadata] = useState<FileInfo>()
  const [fileIsLoading, setFileIsLoading] = useState<boolean>(false)
  const isCompute = Boolean(
    asset?.services.filter((service) => service.type === 'compute')[0]
  )

  // Signals loading logic
  // Get from AssetList component
  // const [dataTokenAddresses] = useState<string[][]>([
  //   asset.datatokens.map((data) => data.address)
  // ])
  const {
    signals,
    loading: isFetchingSignals,
    assetSignalsUrls
  } = useSignalContext()

  const dataTokensStringArray = useMemo(
    () => asset.datatokens.map((el) => el.address),
    [asset]
  )

  const urls = useSignalUrls(dataTokensStringArray, assetSignalsUrls)

  const { loading: isFetchingSignalsItems, signalItems } =
    useSignalsLoader(urls)

  const isFetching = useMemo(
    () => isFetchingSignalsItems || isFetchingSignals,
    [isFetchingSignals, isFetchingSignalsItems]
  )

  const filteredSignals = useMemo(
    () =>
      getAssetSignalItems(
        signalItems,
        asset.datatokens.map((data: AssetDatatoken) => data.address),
        signals
          .filter((signal) => true)
          .filter((signal) => signal.detailView.value)
      ),
    [signalItems, signals, asset]
  )
  // Get and set file info
  useEffect(() => {
    const oceanConfig = getOceanConfig(asset?.chainId)
    if (!oceanConfig) return

    async function initFileInfo() {
      setFileIsLoading(true)
      const providerUrl =
        formikState?.values?.services[0].providerUrl.url ||
        asset?.services[0]?.serviceEndpoint

      const storageType = formikState?.values?.services
        ? formikState?.values?.services[0].files[0].type
        : null

      try {
        const fileInfoResponse = formikState?.values?.services?.[0].files?.[0]
          .url
          ? await getFileInfo(
              formikState?.values?.services?.[0].files?.[0].url,
              providerUrl,
              storageType
            )
          : await getFileDidInfo(asset?.id, asset?.services[0]?.id, providerUrl)

        fileInfoResponse && setFileMetadata(fileInfoResponse[0])

        // set the content type in the Dataset Schema
        const datasetSchema = document.scripts?.namedItem('datasetSchema')
        if (datasetSchema) {
          const datasetSchemaJSON = JSON.parse(datasetSchema.innerText)
          if (datasetSchemaJSON?.distribution[0]['@type'] === 'DataDownload') {
            const contentType = fileInfoResponse[0]?.contentType
            datasetSchemaJSON.distribution[0].encodingFormat = contentType
            datasetSchema.innerText = JSON.stringify(datasetSchemaJSON)
          }
        }

        setFileIsLoading(false)
      } catch (error) {
        LoggerInstance.error(error.message)
      }
    }
    initFileInfo()
  }, [asset, isMounted, newCancelToken, formikState?.values?.services])

  // Get and set user DT balance
  useEffect(() => {
    if (!web3 || !accountId || !isAssetNetwork) return

    async function init() {
      try {
        const datatokenInstance = new Datatoken(web3)
        const dtBalance = await datatokenInstance.balance(
          asset.services[0].datatokenAddress,
          accountId
        )
        setDtBalance(dtBalance)
      } catch (e) {
        LoggerInstance.error(e.message)
      }
    }
    init()
  }, [web3, accountId, asset, isAssetNetwork])

  // Check user balance against price
  useEffect(() => {
    if (asset?.accessDetails?.type === 'free') setIsBalanceSufficient(true)
    if (
      !asset?.accessDetails?.price ||
      !asset?.accessDetails?.baseToken?.symbol ||
      !accountId ||
      !balance ||
      !dtBalance
    )
      return

    const baseTokenBalance = getTokenBalanceFromSymbol(
      balance,
      asset?.accessDetails?.baseToken?.symbol
    )
    setIsBalanceSufficient(
      compareAsBN(baseTokenBalance, `${asset?.accessDetails.price}`) ||
        Number(dtBalance) >= 1
    )

    return () => {
      setIsBalanceSufficient(false)
    }
  }, [balance, accountId, asset?.accessDetails, dtBalance])
  const UseContent = (
    <>
      {isCompute ? (
        <Compute
          asset={asset}
          dtBalance={dtBalance}
          file={fileMetadata}
          fileIsLoading={fileIsLoading}
        />
      ) : (
        <Consume
          asset={asset}
          dtBalance={dtBalance}
          isBalanceSufficient={isBalanceSufficient}
          file={fileMetadata}
          fileIsLoading={fileIsLoading}
        />
      )}
      <AssetStats />
    </>
  )

  const tabs: TabsItem[] = [{ title: 'Use', content: UseContent }]
  let AssetSignalsEl
  if (
    filteredSignals.filter((signalOrigin) => signalOrigin.signals.length > 0)
      .length === 0
  ) {
    AssetSignalsEl = (
      <div className={styles.signalsText}>No signals available</div>
    )
  } else {
    AssetSignalsEl = (
      <AssetSignals
        className={styles.actions}
        asset={asset}
        signalItems={filteredSignals}
        isLoading={isFetching}
      />
    )
  }
  return (
    <>
      <Tabs items={tabs} className={styles.actions} />
      {AssetSignalsEl}
      <Web3Feedback
        networkId={asset?.chainId}
        accountId={accountId}
        isAssetNetwork={isAssetNetwork}
      />
    </>
  )
}
