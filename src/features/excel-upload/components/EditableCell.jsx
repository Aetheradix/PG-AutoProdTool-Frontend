import { Form, Input, DatePicker, TimePicker } from 'antd';
import React from 'react';
import dayjs from 'dayjs';
import { parseDuration } from '../../../utils/tableUtils';

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
  ) : isTimeType ? (
    <TimePicker
      format="HH:mm"
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
          {...(isTimeType && {
            getValueProps: (value) => {
              if (!value) return { value: null };
              // Handle ISO duration like PT14H46M
              const { hours, minutes, isParsed } = parseDuration(value);
              if (isParsed) {
                return { value: dayjs().hour(hours).minute(minutes).second(0) };
              }
              // Normal date or time string fallback
              const d = dayjs(value, 'HH:mm');
              return { value: d.isValid() ? d : null };
            },
            normalize: (value) =>
              value ? (dayjs.isDayjs(value) ? value.format('HH:mm') : value) : null,
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
