import {ChangeEvent, useState} from "react";
import clsx from "clsx";
import styles from "src/component/textarea/Textarea.module.scss";

/**
 * Textarea props
 */
interface TextareaProps {

  /**
   * Textarea default value
   */
  defaultValue?: string;

  /**
   * Tracks the value entered into the Textarea
   */
  onChange?: (value: string) => void;

  /**
   * Textarea placeholder text
   */
  placeholder?: string;

  /**
   * Specifies the default height in average character heights.
   * @default 2
   */
  rows?: number;

  /**
   * Custom class for the Textarea.
   */
  className?: string;
}

/**
 * Textarea component
 */
export const Textarea = (props: TextareaProps) => {
  const [value, setValue] = useState<string>(props.defaultValue || "");

  /**
   * Handle textarea event
   */
  const handleTextChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    if (props.onChange) {
      props.onChange(event.target.value);
    }
    setValue(event.target.value);
  };

  return (
    <textarea
      className={clsx(styles.textarea, props.className)}
      placeholder={props.placeholder}
      value={value}
      onChange={handleTextChange}
      rows={props.rows}
    />
  );
};