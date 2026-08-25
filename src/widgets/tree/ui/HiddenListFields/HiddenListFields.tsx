import { Form, Input } from 'antd'
import { HiddenListFieldsRoot } from './HiddenListFields.styled'

interface HiddenListField {
  key: number
  name: number
}

interface HiddenListFieldsProps {
  fields: HiddenListField[]
  names: readonly string[]
}

export function HiddenListFields({ fields, names }: HiddenListFieldsProps) {
  return (
    <HiddenListFieldsRoot aria-hidden="true">
      {fields.map((field) => (
        <div key={field.key}>
          {names.map((name) => (
            <Form.Item key={name} name={[field.name, name]} hidden>
              <Input />
            </Form.Item>
          ))}
        </div>
      ))}
    </HiddenListFieldsRoot>
  )
}
