import { Form, Input, DatePicker } from 'antd';
import React from 'react';
import dayjs from 'dayjs';

const EditableCell = ({
  editing,
  dataIndex,
  title,
  inputType,
  record,
  index,
  children,
  ...restProps
}) => {
  const isDatetime = inputType === 'datetime';
  const isDate = inputType === 'date';
  const isTimeType = inputType === 'time'; // Use regular Input or TimePicker, maybe stick to TimePicker?

  const inputNode = isDatetime ? (
    <DatePicker
      showTime
      format="YYYY-MM-DD HH:mm:ss"
      className="w-full"
      needConfirm={false}
    />
  ) : isDate ? (
    <DatePicker
      format="YYYY-MM-DD"
      className="w-full"
    />
  ) : (
    <Input />
  );

  return (
    <td {...restProps}>
      {editing ? (
        <Form.Item
          name={dataIndex}
          style={{ margin: 0 }}
          rules={[
            {
              required: true,
              message: `Please Input ${title}!`,
            },
          ]}
          {...(isDatetime && {
            getValueProps: (value) => ({
              value: value ? dayjs(value) : null,
            }),
            normalize: (value) =>
              value ? value.format('YYYY-MM-DD HH:mm:ss') : null,
          })}
          {...(isDate && {
            getValueProps: (value) => ({
              value: value ? dayjs(value) : null,
            }),
            normalize: (value) =>
              value ? value.format('YYYY-MM-DD') : null,
          })}
        >
          {inputNode}
        </Form.Item>
      ) : (
        children
      )}
    </td>
  );
};
export default EditableCell;
