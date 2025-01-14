import {useState} from "react";
import {useNavigate} from "react-router-dom";
import {Button, ButtonType} from "src/component/button/Button";
import {Confirm} from "src/component/confirm/Confirm";
import {HorizontalContainer} from "src/component/horizontalContainer/HorizontalContainer";
import {Loader} from "src/component/loader/Loader";
import {Modal} from "src/component/modal/Modal";
import {PromptModalContent} from "src/component/modal/PromptModalContent";
import {Select} from "src/component/select/Select";
import {HeadingLevel, Title} from "src/component/title/Title";
import {VerticalContainer} from "src/component/verticalContainer/VerticalContainer";
import {WayPreviewDAL} from "src/dataAccessLogic/WayPreviewDAL";
import {useLoad} from "src/hooks/useLoad";
import {waysColumns} from "src/logic/waysTable/waysColumns";
import {WaysTable} from "src/logic/waysTable/WaysTable";
import {WayStatus, WayStatusType} from "src/logic/waysTable/wayStatus";
import {WaysCollection} from "src/model/businessModelPreview/UserPreview";
import {WayPreview} from "src/model/businessModelPreview/WayPreview";
import {pages} from "src/router/pages";
import {GetWaysFilter} from "src/service/WayService";
import {ArrayUtils} from "src/utils/ArrayUtils";
import styles from "src/logic/waysTable/BaseWaysTable.module.scss";

/**
 * Favorite ways table props
 */
interface BaseWaysTableProps {

  /**
   * User's favorite ways preview
   */
  wayUuids: string[];

  /**
   * Table title
   */
  title: string;

  /**
   * Filter status
   */
  filterStatus: WayStatusType | typeof FILTER_STATUS_ALL_VALUE;

  /**
   * Callback to change filter status
   */
  setFilterStatus: (status: WayStatusType | typeof FILTER_STATUS_ALL_VALUE) => void;

  /**
   * Delete current collection
   */
  deleteCollection?: () => Promise<void>;

  /**
   * Rename collection
   */
  updateCollection?: (wayCollectionPartial: Partial<WaysCollection>) => Promise<void>;
}

export const FILTER_STATUS_ALL_VALUE = "all";

/**
 * Callback that is called to fetch data
 */
const loadWays = async (
  wayUuids: string[],
  filterStatus: WayStatusType | typeof FILTER_STATUS_ALL_VALUE,
): Promise<WayPreview[]> => {
  const filter: GetWaysFilter | undefined = filterStatus !== FILTER_STATUS_ALL_VALUE
    ? {
      isAbandoned: filterStatus === WayStatus.Abandoned,
      isCompleted: filterStatus === WayStatus.Completed,
      isInProgress: filterStatus === WayStatus.InProgress,
    }
    : undefined;
  const waysPreview = await WayPreviewDAL.getWaysPreviewByUuids(Array.from(wayUuids), filter);

  return waysPreview;
};

/**
 * Callback that is called to validate data
 */
const validateData = (data: WayPreview[]) => {
  return !!data;
};

/**
 * Render table of favorite ways preview
 */
export const BaseWaysTable = (props: BaseWaysTableProps) => {
  const [ways, setWays] = useState<WayPreview[]>();

  const navigate = useNavigate();

  useLoad(
    {

      /**
       * Load ways
       */
      loadData: () => loadWays(props.wayUuids, props.filterStatus),
      validateData,
      onSuccess: setWays,

      /**
       * Error handler (in case of invalid data)
       */
      onError: () => navigate(pages.page404.getPath({})),
      dependency: [props.filterStatus],
    },
  );

  const [isRenameCollectionModalOpen, setIsRenameCollectionModalOpen] = useState(false);

  if (!ways) {
    return (
      <VerticalContainer className={styles.loaderWrapper}>
        <Loader />
      </VerticalContainer>
    );
  }

  /**
   * Check is filters for collection used
   */
  const getIsNoFilters = () => props.filterStatus === FILTER_STATUS_ALL_VALUE;

  return (
    <>
      <HorizontalContainer className={styles.wayCollectionActions}>
        {props.deleteCollection && (
          <Confirm
            trigger={
              <Button
                value="Delete current collection"
                onClick={() => {}}
                buttonType={ButtonType.SECONDARY}
                className={styles.button}
              />
            }
            content={<p>
              {`Are you sure you want to delete collection "${props.title}" ?`}
            </p>}
            onOk={props.deleteCollection}
            okText="Ok"
          />
        )}
        {props.updateCollection && (
          <Modal
            isOpen={isRenameCollectionModalOpen}
            content={
              <PromptModalContent
                defaultValue={props.title}
                close={() => setIsRenameCollectionModalOpen(false)}
                onOk={(name: string) => {
                  if (props.updateCollection) {
                    return props.updateCollection({name});
                  }
                }}
              />
            }
            trigger={
              <Button
                value="Rename collection"
                onClick={() => setIsRenameCollectionModalOpen(true)}
              />
            }
          />
        )}
        <Select
          label="Show only: "
          value={props.filterStatus}
          name="filterStatus"
          options={[
            {id: "1", value: FILTER_STATUS_ALL_VALUE, text: "All"},
            {id: "2", value: WayStatus.Completed, text: "Completed"},
            {id: "3", value: WayStatus.Abandoned, text: "Abandoned"},
            {id: "4", value: WayStatus.InProgress, text: "InProgress"},
          ]}
          onChange={(value) => props.setFilterStatus(value as WayStatusType)}
        />

      </HorizontalContainer>
      <Title
        text={`${props.title} (${ways.length})`}
        level={HeadingLevel.h2}
      />
      <WaysTable
        data={ways}
        columns={waysColumns}
      />

      {props.updateCollection && getIsNoFilters() && (
        <>
          {ArrayUtils.getDifference(
            props.wayUuids,
            ways.map(way => way.uuid),
          ).map((notExistentWayUuid) => (
            <>
              <Confirm
                trigger={
                  // TODO: #480 make normal element for suggestions
                  <Button
                    value={`Way with uuid "${notExistentWayUuid}" is was removed or hidden. Remove it from the collection?`}
                    onClick={() => {}}
                    buttonType={ButtonType.SECONDARY}
                    className={styles.button}
                  />
                }
                content={<p>
                  {`Are you sure you want the way "${notExistentWayUuid}" from the collection?`}
                </p>}
                onOk={() => {
                  if (props.updateCollection) {
                    props.updateCollection({wayUuids: props.wayUuids.filter(uuid => uuid !== notExistentWayUuid)});
                  }
                }}
                okText="Ok"
              />
            </>
          ))}
        </>
      )}
    </>
  );
};
