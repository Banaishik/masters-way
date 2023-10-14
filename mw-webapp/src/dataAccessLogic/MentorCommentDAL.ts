import {mentorCommentToMentorCommentDTOConverter} from
  "src/dataAccessLogic/BusinessToDTOConverter/mentorCommentToMentorCommentDTOConverter";
import {mentorCommentDTOToMentorCommentConverter}
  from "src/dataAccessLogic/DTOToBusinessConverter/mentorCommentDTOToMentorCommentConverter";
import {MentorComment} from "src/model/businessModel/MentorComment";
import {MentorCommentsService} from "src/service/MentorCommentsService";

/**
 * Provides methods to interact with the MentorComment business model
 */
export class MentorCommentDAL {

  /**
   * Get MentorComments
   */
  public static async getMentorComments(): Promise<MentorComment[]> {
    const mentorCommentsDTO = await MentorCommentsService.getMentorCommentsDTO();
    const mentorComments = mentorCommentsDTO.map((mentorComment) => (mentorCommentDTOToMentorCommentConverter(mentorComment)));

    return mentorComments;
  }

  /**
   * Get MentorComment by uuid
   */
  public static async getMentorComment(uuid: string): Promise<MentorComment> {
    const mentorCommentDTO = await MentorCommentsService.getMentorCommentDTO(uuid);
    const mentorComment = mentorCommentDTOToMentorCommentConverter(mentorCommentDTO);

    return mentorComment;
  }

  /**
   * Update MentorComment
   */
  public static async updateMentorComment(mentorComment: MentorComment) {
    const mentorCommentDTO = mentorCommentToMentorCommentDTOConverter(mentorComment);
    await MentorCommentsService.updateMentorCommentDTO(mentorCommentDTO, mentorComment.uuid);
  }

}