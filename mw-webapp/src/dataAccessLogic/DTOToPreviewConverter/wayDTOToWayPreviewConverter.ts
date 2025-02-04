import {UserPreview} from "src/model/businessModelPreview/UserPreview";
import {WayPreview} from "src/model/businessModelPreview/WayPreview";
import {WayDTO} from "src/model/DTOModel/WayDTO";

/**
 * WayPreview props
 */
interface WayPreviewProps {

  /**
   * Way's creator
   */
  owner: UserPreview;

  /**
   * Way's current mentors
   */
  mentors: UserPreview[];

}

/**
 * Convert {@link WayDTO} to {@link WayPreview}
 */
export const wayDTOToWayPreviewConverter = (wayDTO: WayDTO, wayProps: WayPreviewProps): WayPreview => {
  return new WayPreview({
    ...wayDTO,
    owner: wayProps.owner,
    mentors: wayProps.mentors,
    mentorRequests: wayDTO.mentorRequestUuids,
    lastUpdate: wayDTO.lastUpdate.toDate(),
    createdAt: wayDTO.createdAt.toDate(),
  });
};
