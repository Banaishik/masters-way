import {DayReport} from "src/model/businessModel/DayReport";
import {Way} from "src/model/businessModel/Way";
import {UserPreview} from "src/model/businessModelPreview/UserPreview";
import {WayDTO} from "src/model/DTOModel/WayDTO";

/**
 * Way props
 */
interface WayProps {

  /**
   * Way's creator
   */
  owner: UserPreview;

  /**
   * Way's current mentors
   * @key @User.uuid
   * @value @UserPreview
   */
  mentors: Map<string, UserPreview>;

  /**
   * Way's former mentors
   * @key @User.uuid
   * @value @UserPreview
   */
  formerMentors: Map<string, UserPreview>;

  /**
   * Users who sent request to become Way's mentor
   */
  mentorRequests: UserPreview[];

  /**
   * Last day when way was updated in ms
   */
  lastUpdate: Date;

  /**
   * Date when way was created in ms
   */
  createdAt: Date;

  /**
   * Day reports
   */
  dayReports: DayReport[];

}

/**
 * Convert {@link WayDTO} to {@link Way}
 */
export const wayDTOToWayConverter = (wayDTO: WayDTO, wayProps: WayProps): Way => {
  return new Way({
    ...wayDTO,
    uuid: wayDTO.uuid,
    name: wayDTO.name,
    dayReports: wayProps.dayReports,
    owner: wayProps.owner,
    mentors: wayProps.mentors,
    formerMentors: wayProps.formerMentors,
    mentorRequests: wayProps.mentorRequests,
    isCompleted: wayDTO.isCompleted,
    lastUpdate: wayProps.lastUpdate,
    favoriteForUserUuids: wayDTO.favoriteForUserUuids,
    createdAt: wayProps.createdAt,
    copiedFromWayUuid: wayDTO.copiedFromWayUuid,
    goalDescription: wayDTO.goalDescription,
    estimationTime: wayDTO.estimationTime,
    metrics: wayDTO.metricsStringified.map((metricStringified) => {
      const metric = JSON.parse(metricStringified);
      metric.doneDate = new Date(metric.doneDate) ?? null;

      return metric;
    }),
  });
};
