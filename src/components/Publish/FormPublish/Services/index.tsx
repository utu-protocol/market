import Input from '@shared/Form/Input'
import { Field } from 'formik'
import { graphql, useStaticQuery } from 'gatsby'
import React from 'react'
import { ReactElement } from 'react-markdown'
import { ReactComponent as IconDownload } from '@images/download.svg'
import { ReactComponent as IconCompute } from '@images/compute.svg'

const query = graphql`
  query {
    content: publishJson {
      services {
        title
        fields {
          name
          placeholder
          label
          help
          type
          required
          options
          disclaimer
          disclaimerValues
          advanced
        }
      }
    }
  }
`

const accessTypeOptions = [
  {
    name: 'Download',
    title: 'Download',
    icon: <IconDownload />
  },
  {
    name: 'Compute',
    title: 'Compute',
    icon: <IconCompute />
  }
]

export default function ServicesFields(): ReactElement {
  const { content } = useStaticQuery(query)

  return content.services.fields.map(
    (field: FormFieldProps) =>
      field.advanced !== true && (
        <Field
          {...field}
          key={`services-${field.name}`}
          component={Input}
          name={`services[0].${field.name}`}
          options={field.name === 'access' ? accessTypeOptions : field.options}
        />
      )
  )
}
