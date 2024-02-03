import {ChangeEvent, useEffect, useState} from "react";
import {renderSpan} from "src/component/editableText/renderSpan";
import {KeySymbols} from "src/utils/KeySymbols";
import styles from "src/component/editableTextarea/editableTextarea.module.scss";

/**
 * Cell item props
 */
interface EditableTextareaProps {

  /**
   * Cell item's text
   */
  text: string;

  /**
   * Function that update element on Enter click or unfocused
   */
  onChangeFinish: (value: string) => void;

  /**
   * Class name for the editable input
   */
  className?: string;

  /**
   * Textarea placeholder text
   */
  placeholder?: string;

  /**
   * Textarea rows.
   * @default 2
   */
  rows?: number;

  /**
   * If false - doubleclick handler disabled, if true - doubleclick handler allowed
   * @default true
   */
  isEditable?: boolean;
}

/**
 * EditableTextarea component
 */
export const EditableTextarea = (props: EditableTextareaProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(props.text);

  useEffect(() => {
    setText(props.text);
  }, [props.text]);

  /**
   * Handles the completion of changes.
   */
  const handleChangeFinish = () => {
    props.onChangeFinish(text);
    setIsEditing(false);
  };

  /**
   * Update cell value after OnKeyDown event
   */
  const handleCtrlEnter = (event: React.KeyboardEvent<HTMLElement>) => {
    if (event.key === KeySymbols.ENTER && event.ctrlKey) {
      handleChangeFinish();
    }
  };

  /**
   *
   */
  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setText(event.target.value);
  };

  /**
   * Render Textarea
   */
  const renderTextarea = () => (
    <div className={styles.growWrap}>
      <textarea
        value={text}
        onChange={e => handleChange(e)}
      />
    </div>
  );

  return (
    <div
      onDoubleClick={() => {
        props.isEditable !== false && setIsEditing(true);
      }}
      onBlur={handleChangeFinish}
      onKeyDown={handleCtrlEnter}
      className={styles.growWrap}
    >
      {isEditing ? renderTextarea() : renderSpan(text) }
    </div>
  );
};
