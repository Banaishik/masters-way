import {TrashIcon} from "@radix-ui/react-icons";
import {Checkbox} from "src/component/checkbox/Сheckbox";
import {Confirm} from "src/component/confirm/Confirm";
import {EditableText} from "src/component/editableText/EditableText";
import {HorizontalContainer} from "src/component/horizontalContainer/HorizontalContainer";
import {Tooltip} from "src/component/tooltip/Tooltip";
import {Metric} from "src/model/businessModel/Metric";
import {DateUtils} from "src/utils/DateUtils";
import styles from "src/logic/wayPage/WayPage.module.scss";

/**
 * Single Goal Metric Props
 */
interface SingleGoalMetricProps {

  /**
   * Single goal metric
   */
  metric: Metric;

  /**
   * Is editable
   * @default false
   */
  isEditable: boolean;

  /**
   * Callback to delete metric
   */
  deleteMetric: (metricUuid: string) => Promise<void>;

  /**
   * Callback to update Metric
   */
  updateMetric: (metric: Metric) => Promise<void>;

}

/**
 * Goal metric
 */
export const GoalMetricItem = (props: SingleGoalMetricProps) => {
  const tooltipContent = props.metric.isDone && props.metric.doneDate
    ? `Done date ${DateUtils.getShortISODateValue(props.metric.doneDate)}`
    : "Not finished yet...";

  return (
    <div
      key={props.metric.uuid}
      className={styles.singularMetric}
    >
      <HorizontalContainer className={styles.horizontalContainer}>
        <Checkbox
          isEditable={props.isEditable}
          isDefaultChecked={props.metric.isDone}
          className={styles.checkbox}
          // TODO #487: check logic about update doneDate. What if I accidentally clicked checkbox few times
          onChange={(isDone) => props.updateMetric({...props.metric, isDone, doneDate: new Date()})}
        />
        <Tooltip content={tooltipContent}>
          <EditableText
            text={props.metric.description ?? ""}
            onChangeFinish={(description) => props.updateMetric({...props.metric, description})}
            isEditable={props.isEditable}
          />
        </Tooltip>
      </HorizontalContainer>
      {props.isEditable && (
        <Tooltip content="Delete goal metric">
          <Confirm
            trigger={
              <TrashIcon className={styles.icon} />}
            content={<p>
              {`Are you sure that you want to delete goal metric "${props.metric.description}"?`}
            </p>}
            onOk={() => props.deleteMetric(props.metric.uuid)}
            okText="Delete"
          />
        </Tooltip>
      )
      }
    </div>
  );
};
