import React, { ReactElement } from 'react'
import { useUserPreferences } from '@context/UserPreferences'
import Input from '@shared/FormInput'

export default function Debug(): ReactElement {
  const { debug, setDebug } = useUserPreferences()

  return (
    <li>
      <Input
        label="Debug"
        help="Show geeky information in some places, and in your console."
        name="debug"
        type="checkbox"
        content="Show geeky information in some places, add your console"
        options={['Activate Debug Mode']}
        defaultChecked={debug === true}
        onChange={() => setDebug(!debug)}
      />
    </li>
  )
}
