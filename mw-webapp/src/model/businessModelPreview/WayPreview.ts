import {UserPreview} from "src/model/businessModelPreview/UserPreview";

/**
 * Way preview model
 */
export class WayPreview {

  /**
   * Way's UUID
   */
  public uuid: string;

  /**
   * Way's name
   */
  public name: string;

  /**
   * Day reports uuids @DayReport.uuid
   */
  public dayReportUuids: string[];

  /**
   * Way's owner
   */
  public owner: UserPreview;

  /**
   * Mentors of this way
   */
  public mentors: UserPreview[];

  /**
   * Former mentor's UUIDs @User.uuid
   */
  public formerMentorUuids: string[];

  /**
   * Users who sent request to become Way's mentor
   */
  public mentorRequests: string[];

  /**
   * Return true if way is completed and false if not completed
   */
  public isCompleted: boolean;

  /**
   * Last day when way was updated
   */
  public lastUpdate: Date;

  /**
   * Users for whom this way are favorite
   */
  public favoriteForUserUuids: string[];

  /**
   * Date when way was created
   */
  public createdAt: Date;

  /**
   * Way's tags
   */
  public wayTags: string[];

  /**
   * Tags that was used for jobDone
   */
  public jobTags: string[];

  /**
   * Way's uuid that was copied
   */
  public copiedFromWayUuid: string;

  /**
   * Description of goal
   */
  public goalDescription: string;

  /**
   * Estimation time for complete goal
   */
  public estimationTime: number;

  /**
   * Stringified metrics objects {@link MetricDTO}
   */
  public metricsStringified: string[];

  constructor(wayData: WayPreview) {
    this.uuid = wayData.uuid;
    this.name = wayData.name;
    this.dayReportUuids = wayData.dayReportUuids;
    this.owner = wayData.owner;
    this.mentors = wayData.mentors;
    this.mentorRequests = wayData.mentorRequests;
    this.isCompleted = wayData.isCompleted;
    this.lastUpdate = wayData.lastUpdate;
    this.favoriteForUserUuids = wayData.favoriteForUserUuids;
    this.createdAt = wayData.createdAt;
    this.wayTags = wayData.wayTags;
    this.jobTags = wayData.jobTags;
    this.formerMentorUuids = wayData.formerMentorUuids;
    this.copiedFromWayUuid = wayData.copiedFromWayUuid;
    this.goalDescription = wayData.goalDescription;
    this.estimationTime = wayData.estimationTime;
    this.metricsStringified = wayData.metricsStringified;
  }

}
