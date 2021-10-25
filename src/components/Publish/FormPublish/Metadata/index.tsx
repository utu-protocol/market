import Input from '@shared/Form/Input'
import { Field } from 'formik'
import { graphql, useStaticQuery } from 'gatsby'
import React from 'react'
import { ReactElement } from 'react-markdown'

const query = graphql`
  query {
    content: publishJson {
      metadata {
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

export default function MetadataFields(): ReactElement {
  const { content } = useStaticQuery(query)

  return content.metadata.fields.map((field: FormFieldProps) => (
    <Field
      {...field}
      key={`metadata-${field.name}`}
      component={Input}
      name={`metadata.${field.name}`}
    />
  ))
}
