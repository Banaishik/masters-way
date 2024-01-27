import {ChangeEvent, useEffect, useState, useRef} from "react";
import clsx from "clsx";
import {renderSpan} from "src/component/editableText/renderSpan";
import {Textarea} from "src/component/textarea/Textarea";
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
   * HandleChangeFinish
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

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    // setText()
    // autoResizeWidth()
    const newText = event.target.value;
    setText(newText);
    autoResizeWidth();

  };

  const autoResizeWidth = () => {
    if (textareaRef.current) {
      textareaRef.current.style.width = 'auto';
      textareaRef.current.style.width = `${textareaRef.current.scrollWidth}px`;
    }
  };

  /**
   * Render Textarea
   */
  const renderTextarea = () => (
      <textarea
        ref={textareaRef}
        onChange={handleChange}
        defaultValue={text}
        placeholder={props.placeholder ?? ""}
        rows={props.rows}
        onKeyPress={handleCtrlEnter}
        style={{ resize: 'none', overflow: 'hidden', height : "20px", width: 'auto', maxWidth : "300px", whiteSpace: 'nowrap' }}
      />    
  );

  return (
    <div
      onDoubleClick={() => {
        props.isEditable !== false && setIsEditing(true);
      }}
      onBlur={handleChangeFinish}
      onKeyDown={handleCtrlEnter}
      className={clsx(styles.editableTextarea, props.className)}
    >
      {isEditing ? renderTextarea() : renderSpan(text)}

    </div>
  );
};

