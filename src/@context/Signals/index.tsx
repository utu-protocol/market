import React, {
  createContext,
  ReactElement,
  ReactNode,
  useContext,
  useEffect,
  useRef,
  useState
} from 'react'
import { SignalOriginItem, SignalSettingsItem } from '@context/Signals/_types'
import useSignalsLoader, { useListSignals } from '@hooks/useSignals'
import { useUserPreferences } from '@context/UserPreferences'
import { arrayEqual, getSignalUrls } from '@hooks/useSignals/_util'

export interface SignalsProviderValue {
  // We need to create variables that store the available assets and profiles for the relevant signals to then be fetched.
  userAddresses: string[]
  assetIds: string[]
  publisherIds: string[]
  datatokenAddresses: any
  assetSignalsUrls?: string[]
  publisherSignalsUrls?: string[]
  signals?: SignalOriginItem[]
  assetSignalOriginItems?: SignalOriginItem[]
  signalItems: SignalOriginItem[]
  loading: boolean
  // Settings provide data to work with locally and then also decide fetching based on user preferences
  settings?: SignalSettingsItem

  // // A method to update the current assetIds to use in signal queries
  setAssetIds(assets: string[]): void
  updateDatatokenAddresses(datatokens: any): any

  setAssetSignalOriginItems(signals: SignalOriginItem[]): void

  // setUserAddresses?(userAddresses: string[]): void
  // setPublisherIds?(queryUrls: string[]): void
  // setSignalUrls?(queryUrls: string[]): void
}

const SignalsContext = createContext({} as SignalsProviderValue)

function SignalsProvider({ children }: { children: ReactNode }): ReactElement {
  const [signalUrls, setSignalUrls] = useState<string[]>([])
  const [assetSignalsUrls, setAssetSignalsUrl] = useState<string[]>([])
  // const [origin, setOrigin] = useState<string[]>(
  //   signalUrls[0] ? signalUrls : ['']
  // )
  const { signals } = useUserPreferences()
  const [assetSignalOriginItems, setAssetSignalOriginItems] =
    useState<SignalOriginItem[]>()
  // TODO set the datatoken addresses here for use across multiple components
  const _refDataTokenAddresses = useRef(new Set())
  const [datatokenAddresses, _setDatatokenAddresses] = useState<any[]>([])
  const updateDatatokenAddresses = (arr: string[]) => {
    const newItems: string[] = []
    arr.forEach((item) => {
      if (!_refDataTokenAddresses.current.has(item)) {
        _refDataTokenAddresses.current.add(item)
        newItems.push(item)
      }
    })
    if (newItems.length > 0) {
      _setDatatokenAddresses([...datatokenAddresses, ...newItems])
    }
  }
  // Using depsString method to resolve the array dependency issues when loading signalUrls array as a dependency
  // https://stackoverflow.com/questions/59467758/passing-array-to-useeffect-dependency-list
  const refSignalUrls = useRef(signalUrls)
  if (!arrayEqual(signalUrls, refSignalUrls.current)) {
    refSignalUrls.current = signalUrls
  }
  // Check if we have synced the datatokens array with the set of unique
  const uniqueDatatokensArr = Array.from(_refDataTokenAddresses.current)
  if (!arrayEqual(datatokenAddresses, uniqueDatatokensArr)) {
    _setDatatokenAddresses(uniqueDatatokensArr)
  }
  // TODO fetch datatoken addresses once loaded by the search queries
  // TODO pass datatoken addresses to signal url loader to generate the correct signals
  // TODO pass urls into signals API fetcher to fetch signals from relevant APIs
  // TODO Indicate loading when signals are being fetched
  // TODO update available signals once loaded from the API responses
  // Based on current default signal settings set the signalURLs that will be used to fetch signals by a signal loader
  useEffect(() => {
    // Check if there's anything in the current default settings
    if (signals.length > 0) {
      const defaultSignalUrls: string[] = signals.map((signalOrigin) =>
        getSignalUrls(signalOrigin)
      )
      setAssetSignalsUrl(defaultSignalUrls)
      const compareUrl = new Set()
      defaultSignalUrls.forEach((url) => {
        if (compareUrl.has(url)) return
        setAssetSignalsUrl((signalUrlArray) => {
          return [...signalUrlArray, url]
        })
        compareUrl.add(url)
      })
    }
  }, [signals])

  const { urls } = useListSignals(
    datatokenAddresses,
    signals,
    assetSignalsUrls,
    'listView',
    true
  )
  // we can use multiple useSignalsLoaders(origins) in the context based on the various queries that load assetIds
  // publisher ids, and user addresses at different times
  const {
    assetIds,
    setAssetIds,
    userAddresses,
    publisherIds,
    loading,
    signalItems
  } = useSignalsLoader(urls)
  return (
    <SignalsContext.Provider
      value={
        {
          userAddresses,
          assetIds,
          setAssetIds,
          signals,
          publisherIds,
          signalItems,
          assetSignalsUrls,
          loading,
          assetSignalOriginItems,
          datatokenAddresses,
          updateDatatokenAddresses,
          setAssetSignalOriginItems
        } as SignalsProviderValue
      }
    >
      {children}
    </SignalsContext.Provider>
  )
}

const useSignalContext = (): SignalsProviderValue => useContext(SignalsContext)

export { SignalsProvider, useSignalContext, SignalsContext }
