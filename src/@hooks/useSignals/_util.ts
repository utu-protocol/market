import {
  AssetSignalItem,
  SignalOriginItem,
  SignalParams
} from '@context/Signals/_types'
import { fetchData } from '@utils/fetch'

export function getURLParams(urlParams: SignalParams | string[]) {
  let paramString = ''
  if (Array.isArray(urlParams)) {
    return `?${urlParams[0]}=${urlParams.slice(1).join(',')}`
  }
  if (urlParams.assetIds.length > 0) {
    paramString = `?assetId=${urlParams.assetIds.join(',')}`
  }
  if (urlParams.publisherIds.length > 0) {
    paramString += `publisherId=${urlParams.publisherIds.join(',')}`
  }
  if (urlParams.userAddresses.length > 0) {
    paramString += `userAccountId=${urlParams.userAddresses.join(',')}`
  }
  return paramString
}

export function getURLParamsAssets({
  uuids,
  origin
}: {
  uuids: { label: string; value: string }[]
  origin: string
}) {
  let originCopy = `${origin}`
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  uuids.forEach((uuid) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    originCopy = originCopy.replace(uuid.label, uuid.value)
  })
  return originCopy
}

export function getSignalUrls(signalOriginItem: SignalOriginItem) {
  return signalOriginItem.origin
}

/**
 * A method fetching signals from specified origin URL
 * @returns SignalOriginItem[]
 * @memberOf useSignalsLoader
 * */
export async function fetchSignals(url: string): Promise<any[]> {
  if (url.length === 0) throw Error('empty url')
  try {
    return await fetchData(url)
  } catch (error) {
    console.log(error)
    throw Error('Something went wrong with the signal fetch - ' + url)
  }
}

export function fetcher(...urls: any[]) {
  // create a closure method to use the fetch function to load data from an API
  const fetchSignal = (u: string) => fetchSignals(u)
  if (urls.length > 1) {
    return Promise.all(urls.map(fetchSignal))
  }
  return fetchSignal(urls[0])
}

export async function onSuccess(data: AssetSignalItem[]) {
  if (!data) return
  return data
}
export async function onError(error: any) {
  console.error('[signals] loading error.', error)
}

export function arrayEqual(a1: any[], a2: any[]) {
  if (a1.length !== a2.length) return false
  for (let i = 0; i < a1.length; i++) {
    if (a1[i] !== a2[i]) {
      return false
    }
  }
  return true
}

function _appendSignalDetails(
  detailedItems: SignalOriginItem[],
  compArray: SignalOriginItem[]
) {
  return detailedItems.map((signalOrigin, index) => {
    return {
      description: compArray[index]?.description || '',
      title: compArray[index]?.title || '',
      id: compArray[index]?.id || '',
      ...signalOrigin
    } as SignalOriginItem
  })
}

export function getAssetSignalItems(
  signalItems: SignalOriginItem[] | SignalOriginItem,
  compareIds: string[],
  assetSignalOrigins: SignalOriginItem[]
) {
  let detailedItems
  if (!Array.isArray(signalItems)) {
    detailedItems = [signalItems]
    detailedItems = _appendSignalDetails(detailedItems, assetSignalOrigins)
  } else {
    detailedItems = [...assetSignalOrigins]
    detailedItems = _appendSignalDetails(assetSignalOrigins, detailedItems)
  }
  return detailedItems.map((signalItem) => {
    if (signalItem) {
      return {
        ...signalItem,
        signals: signalItem.signals
          ? signalItem.signals.filter((signal) =>
              compareIds.includes(signal.assetId)
            )
          : []
      }
    }
    return null
  })
}
