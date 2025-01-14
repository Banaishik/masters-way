import {Timestamp, writeBatch} from "firebase/firestore";
import {userToUserDTOPartialConverter}
  from "src/dataAccessLogic/BusinessToDTOConverter/userPreviewToUserPreviewDTOPartialConverter";
import {wayToWayDTOPartialConverter} from "src/dataAccessLogic/BusinessToDTOConverter/wayToWayDTOPartialConverter";
import {DayReportDAL} from "src/dataAccessLogic/DayReportDAL";
import {wayDTOToWayConverter} from "src/dataAccessLogic/DTOToBusinessConverter/wayDTOToWayPreviewConverter";
import {userPreviewToUserDTOConverter} from "src/dataAccessLogic/PreviewToDTOConverter/userPreviewToUserDTOConverter";
import {SafeMap} from "src/dataAccessLogic/SafeMap";
import {UserPreviewDAL} from "src/dataAccessLogic/UserPreviewDAL";
import {db} from "src/firebase";
import {DayReport} from "src/model/businessModel/DayReport";
import {Way} from "src/model/businessModel/Way";
import {UserPreview} from "src/model/businessModelPreview/UserPreview";
import {USER_UUID_FIELD} from "src/model/DTOModel/UserDTO";
import {
  WAY_COPIED_FROM_WAY_UUID_FIELD,
  WAY_ESTIMATION_TIME_FIELD,
  WAY_GOAL_DESCRIPTION_FIELD,
  WAY_JOB_TAGS_FIELD,
  WAY_MENTOR_UUIDS_FIELD,
  WAY_METRICS_STRINGIFIED_FIELD,
  WAY_NAME_FIELD,
  WAY_OWNER_UUID_FIELD, WAY_TAGS_FIELD,
} from "src/model/DTOModel/WayDTO";
import {DayReportService} from "src/service/DayReportService";
import {UserService} from "src/service/UserService";
import {WayDTOWithoutUuid, WayService} from "src/service/WayService";
import {arrayToHashMap} from "src/utils/arrayToHashMap";
import {PartialWithUuid} from "src/utils/PartialWithUuid";

export type BaseWayData = Pick<WayDTOWithoutUuid,
  typeof WAY_NAME_FIELD
| typeof WAY_TAGS_FIELD
| typeof WAY_JOB_TAGS_FIELD
| typeof WAY_COPIED_FROM_WAY_UUID_FIELD
| typeof WAY_GOAL_DESCRIPTION_FIELD
| typeof WAY_ESTIMATION_TIME_FIELD
| typeof WAY_METRICS_STRINGIFIED_FIELD
>

/**
 * Provides methods to interact with the Way model
 */
export class WayDAL {

  /**
   * Get all WayPreview
   */
  public static async getWays(): Promise<Way[]> {
    const waysDTO = await WayService.getWaysDTO();
    const waysUuids = waysDTO.map((item) => item.uuid);

    const waysPreview = await Promise.all(waysUuids.map(WayDAL.getWay));

    return waysPreview;
  }

  /**
   * Get WayPreview
   */
  public static async getWay(uuid: string): Promise<Way> {
    const wayDTO = await WayService.getWayDTO(uuid);

    const allNeededUsersUuids = new Set([
      wayDTO[WAY_OWNER_UUID_FIELD],
      ...wayDTO.formerMentorUuids,
      ...wayDTO[WAY_MENTOR_UUIDS_FIELD],
      ...wayDTO.mentorRequestUuids,
    ]);

    const allNeededUsersPreviewPromise = UserPreviewDAL.getUsersPreviewByUuids(Array.from(allNeededUsersUuids));
    const dayReportsPromise = DayReportDAL.getDayReports(wayDTO.dayReportUuids);

    const [
      allNeededUsersPreview,
      dayReports,
    ] = await Promise.all([
      allNeededUsersPreviewPromise,
      dayReportsPromise,
    ]);

    const usersHashmap = arrayToHashMap({keyField: USER_UUID_FIELD, list: allNeededUsersPreview});

    const usersSafeHashmap = new SafeMap(usersHashmap);

    const owner = usersSafeHashmap.getValue(wayDTO[WAY_OWNER_UUID_FIELD]);
    const mentors = wayDTO.mentorUuids.map((mentorUuid) => usersSafeHashmap.getValue(mentorUuid));
    const mentorRequests = wayDTO.mentorRequestUuids.map((mentorRequestUuid) => usersSafeHashmap.getValue(mentorRequestUuid));
    const formerMentors = wayDTO.formerMentorUuids.map((formerMentorUuid) => usersSafeHashmap.getValue(formerMentorUuid));

    const mentorsDictionary = arrayToHashMap({keyField: USER_UUID_FIELD, list: mentors});

    const formerMentorsDictionary = arrayToHashMap({keyField: USER_UUID_FIELD, list: formerMentors});

    const dayReportsOrderedByDate = dayReports.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    const lastUpdate = wayDTO.lastUpdate.toDate();
    const createdAt = wayDTO.createdAt.toDate();

    const wayProps = {
      owner,
      mentors: mentorsDictionary,
      formerMentors: formerMentorsDictionary,
      dayReports: dayReportsOrderedByDate,
      mentorRequests,
      lastUpdate,
      createdAt,
    };

    const way = wayDTOToWayConverter(wayDTO, wayProps);

    return way;
  }

  /**
   * Create Way with empty fields and autogenerated uuid
   */
  public static async createWay(user: UserPreview, baseWayData?: BaseWayData): Promise<Way> {
    const batch = writeBatch(db);

    const DEFAULT_WAY: WayDTOWithoutUuid = {
      name: `Way of ${user.name}`,
      dayReportUuids: [],
      ownerUuid: `${user.uuid}`,
      mentorUuids: [],
      formerMentorUuids: [],
      mentorRequestUuids: [],
      isCompleted: false,
      lastUpdate: Timestamp.fromDate(new Date()),
      createdAt: Timestamp.fromDate(new Date()),
      favoriteForUserUuids: [],
      wayTags: [],
      jobTags: [],
      copiedFromWayUuid: "",
      goalDescription: "",
      estimationTime: 0,
      metricsStringified: [],
      ...baseWayData,
    };
    const wayDTO = WayService.createWayDTOWithBatch(DEFAULT_WAY, batch);

    const updatedUser: PartialWithUuid<UserPreview> = {
      uuid: user.uuid,
      ownWays: [...user.ownWays, wayDTO.uuid],
    };

    const userDTO = userToUserDTOPartialConverter(updatedUser);

    UserService.updateUserDTOWithBatch(userDTO, batch);

    await batch.commit();

    const mentors: Map<string, UserPreview> = new Map();
    const formerMentors: Map<string, UserPreview> = new Map();
    const mentorRequests: UserPreview[] = [];
    const favoriteForUsers: UserPreview[] = [];
    const dayReports: DayReport[] = [];

    const lastUpdate = wayDTO.lastUpdate.toDate();
    const createdAt = wayDTO.createdAt.toDate();

    const wayProps = {
      owner: user,
      mentors,
      formerMentors,
      dayReports,
      mentorRequests,
      lastUpdate,
      createdAt,
      favoriteForUsers,
    };

    const way = wayDTOToWayConverter(wayDTO, wayProps);

    return way;
  }

  /**
   * Update Way
   */
  public static async updateWay(way: PartialWithUuid<Way>) {
    const wayDTO = wayToWayDTOPartialConverter(way);
    await WayService.updateWayDTO(wayDTO);
  }

  /**
   * Delete Way
   */
  public static async deleteWay(way: Way) {
    const batch = writeBatch(db);

    const dayReportsForDelete = way.dayReports;
    const mentorsForDelete = way.mentors;
    const favoriteForUsersForDelete = way.favoriteForUserUuids;
    const ownWaysForDelete = way.owner.ownWays;
    const favoriteWaysForDelete = way.owner.favoriteWays;

    const updatedOwner = new UserPreview({
      ...way.owner,
      ownWays: ownWaysForDelete.filter((ownWay) => ownWay !== way.uuid),
      favoriteWays: favoriteWaysForDelete.filter((ownWay) => ownWay !== way.uuid),
    });
    const updatedOwnerDTO = userPreviewToUserDTOConverter(updatedOwner);
    UserService.updateUserDTOWithBatch(updatedOwnerDTO, batch);

    mentorsForDelete.forEach((mentor) => {
      const updatedMentor = new UserPreview({
        ...mentor,
        mentoringWays: mentor.mentoringWays.filter((mentoringWay) => mentoringWay !== way.uuid),
      });
      const updatedMentorDTO = userPreviewToUserDTOConverter(updatedMentor);
      UserService.updateUserDTOWithBatch(updatedMentorDTO, batch);
    });

    favoriteForUsersForDelete.forEach(async (favoriteForUser) => {
      const user = await UserPreviewDAL.getUserPreview(favoriteForUser);

      const updatedFavoriteForUser = new UserPreview({
        ...user,
        favoriteWays: user.favoriteWays.filter((favoriteWay) => favoriteWay !== way.uuid),
      });

      const updatedFavoriteForUserDTO = userPreviewToUserDTOConverter(updatedFavoriteForUser);
      UserService.updateUserDTOWithBatch(updatedFavoriteForUserDTO, batch);
    });

    dayReportsForDelete.forEach((dayReport) => DayReportService.deleteDayReportDTOWithBatch(dayReport.uuid, batch));

    WayService.deleteWayDTOWithBatch(way.uuid, batch);

    await batch.commit();
  }

}
