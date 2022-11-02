import React, { ReactElement, ChangeEvent, ReactNode } from 'react'
import { useUserPreferences } from '@context/UserPreferences'
import Input from '@shared/FormInput'
import { useMarketMetadata } from '@context/MarketMetadata'
import styles from './index.module.css'
import Label from '@shared/FormInput/Label'

export default function Currency({
  children,
  width,
  style
}: {
  children?: ReactNode
  width: string
  style: string
}): ReactElement {
  const { currency, setCurrency } = useUserPreferences()
  const { appConfig } = useMarketMetadata()

  return (
    <li>
      {/* <Label htmlFor="">Currency</Label> */}
      <Input
        name="currency"
        label="Currency"
        help="Your conversion display currency."
        type="select"
        options={appConfig?.currencies}
        value={currency}
        onChange={(e: ChangeEvent<HTMLSelectElement>) =>
          setCurrency(e.target.value)
        }
        size="small"
        width={width}
      >
        {children}
      </Input>
    </li>
  )
}
