import React, { ReactElement } from 'react'
import { useUserPreferences } from '../../../../providers/UserPreferences'
import { accountTruncate } from '../../../../utils/web3'
import ExplorerLink from '../../../atoms/ExplorerLink'
import NetworkName from '../../../atoms/NetworkName'
import jellyfish from '@oceanprotocol/art/creatures/jellyfish/jellyfish-grid.svg'
import Copy from '../../../atoms/Copy'
import Blockies from '../../../atoms/Blockies'
import styles from './Account.module.css'

export default function Account({
  name,
  image,
  accountId
}: {
  name: string
  image: string
  accountId: string
}): ReactElement {
  const { chainIds } = useUserPreferences()

  return (
    <div className={styles.account}>
      <figure className={styles.imageWrap}>
        {image ? (
          <img src={image} className={styles.image} width="96" height="96" />
        ) : accountId ? (
          <Blockies accountId={accountId} className={styles.image} />
        ) : (
          <img
            src={jellyfish}
            className={styles.image}
            width="96"
            height="96"
          />
        )}
      </figure>

      <div>
        <h3 className={styles.name}>{name || accountTruncate(accountId)}</h3>
        {accountId && (
          <code className={styles.accountId}>
            {accountId} <Copy text={accountId} />
          </code>
        )}
        <p>
          {accountId &&
            chainIds.map((value) => (
              <ExplorerLink
                className={styles.explorer}
                networkId={value}
                path={`address/${accountId}`}
                key={value}
              >
                <NetworkName networkId={value} />
              </ExplorerLink>
            ))}
        </p>
      </div>
    </div>
  )
}