import {timestampType} from "fireschema";
import {z} from "zod";

export const WAY_UUID_FIELD = "uuid";
export const WAY_NAME_FIELD = "name";
export const WAY_OWNER_UUID_FIELD = "ownerUuid";
export const WAY_MENTOR_UUIDS_FIELD = "mentorUuids";
export const WAY_CREATED_AT_FIELD = "createdAt";
export const WAY_IS_COMPLETED_FIELD = "isCompleted";
export const WAY_LAST_UPDATE_FIELD = "lastUpdate";
export const WAY_TAGS_FIELD = "wayTags";
export const WAY_JOB_TAGS_FIELD = "jobTags";
export const WAY_COPIED_FROM_WAY_UUID_FIELD = "copiedFromWayUuid";
export const WAY_GOAL_DESCRIPTION_FIELD = "goalDescription";
export const WAY_ESTIMATION_TIME_FIELD = "estimationTime";
export const WAY_METRICS_STRINGIFIED_FIELD = "metricsStringified";

export const WayDTOSchema = z.object({

  /**
   * Way's UUID
   */
  [WAY_UUID_FIELD]: z.string(),

  /**
   * Way's name
   */
  [WAY_NAME_FIELD]: z.string(),

  /**
   * @DayReport.uuids
   */
  dayReportUuids: z.array(z.string()),

  /**
   * Owner's UUIDs @User.uuid
   */
  [WAY_OWNER_UUID_FIELD]: z.string(),

  /**
   * Mentor's UUIDs @User.uuid
   */
  [WAY_MENTOR_UUIDS_FIELD]: z.array(z.string()),

  /**
   * Former mentor's UUIDs @User.uuid
   */
  formerMentorUuids: z.array(z.string()),

  /**
   * UUIDs of Users who sent request to become Way's mentor @User.uuid
   */
  mentorRequestUuids: z.array(z.string()),

  /**
   * Return true if way is completed and false if not completed
   */
  [WAY_IS_COMPLETED_FIELD]: z.boolean(),

  /**
   * Last time whe way was updated in ms (timestamp)
   */
  [WAY_LAST_UPDATE_FIELD]: timestampType(),

  /**
   * Uuids od Users for whom this way are favorite
   */
  favoriteForUserUuids: z.array(z.string()),

  /**
   * Time when way was created in ms (timestamp)
   */
  [WAY_CREATED_AT_FIELD]: timestampType(),

  /**
   * Way's tags
   */
  [WAY_TAGS_FIELD]: z.array(z.string()),

  /**
   * Tags that was used for jobDone
   */
  [WAY_JOB_TAGS_FIELD]: z.array(z.string()),

  /**
   * Way's uuid that was copied
   */
  [WAY_COPIED_FROM_WAY_UUID_FIELD]: z.string(),

  /**
   * Description of goal
   */
  [WAY_GOAL_DESCRIPTION_FIELD]: z.string(),

  /**
   * Estimation time for complete goal
   */
  [WAY_ESTIMATION_TIME_FIELD]: z.number(),

  /**
   * Stringified metrics objects {@link MetricDTO}
   */
  [WAY_METRICS_STRINGIFIED_FIELD]: z.array(z.string()),

}).strict();

export const WaysDTOSchema = z.array(WayDTOSchema);

/**
 * Way DTO model
 */
export type WayDTO = z.infer<typeof WayDTOSchema>;

/**
 * Partial WayDTO schema
 */
export const WayPartialDTOSchema = WayDTOSchema.partial().required({[WAY_UUID_FIELD]: true});

/**
 * WayPartialDTO model
 */
export type WayPartialDTO = z.infer<typeof WayPartialDTOSchema>;
