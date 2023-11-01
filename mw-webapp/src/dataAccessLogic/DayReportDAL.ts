import {dayReportToDayReportDTOConverter} from "src/dataAccessLogic/BusinessToDTOConverter/dayReportToDayReportDTOConverter";
import {CurrentProblemDAL} from "src/dataAccessLogic/CurrentProblemDAL";
import {dayReportDTOToDayReportConverter} from
  "src/dataAccessLogic/DTOToBusinessConverter/dayReportDTOToDayReportConverter";
import {getConvertedValue, getConvertedValues} from "src/dataAccessLogic/getConvertedValues";
import {JobDoneDAL} from "src/dataAccessLogic/JobDoneDAL";
import {MentorCommentDAL} from "src/dataAccessLogic/MentorCommentDAL";
import {PlanForNextPeriodDAL} from "src/dataAccessLogic/PlanForNextPeriodDAL";
import {CurrentProblem} from "src/model/businessModel/CurrentProblem";
import {DayReport} from "src/model/businessModel/DayReport";
import {JobDone} from "src/model/businessModel/JobDone";
import {MentorComment} from "src/model/businessModel/MentorComment";
import {PlanForNextPeriod} from "src/model/businessModel/PlanForNextPeriod";
import {DayReportDTOWithoutUuid, DayReportService} from "src/service/DayReportService";
import {WayService} from "src/service/WayService";
import {DateUtils} from "src/utils/DateUtils";

/**
 * Provides methods to interact with the DayReport business model
 */
export class DayReportDAL {

  /**
   * Get DayReports that belong to a specific way
   */
  public static async getDayReports(wayUuid: string): Promise<DayReport[]> {
    const dayReportsUuids = (await WayService.getWayDTO(wayUuid)).dayReportUuids;

    const dayReportsDTO = await Promise.all(dayReportsUuids.map(async (uuid) => {
      const res = await DayReportService.getDayReportDTO(uuid);

      return res;
    }));

    const jobsDonePreview = await JobDoneDAL.getJobsDone();
    const plansForNextPeriodPreview = await PlanForNextPeriodDAL.getPlansForNextPeriod();
    const mentorCommentsPreview = await MentorCommentDAL.getMentorComments();
    const problemsForCurrentPeriodPreview = await CurrentProblemDAL.getCurrentProblems();

    const jobDoneUuids = getConvertedValues<JobDone>(dayReportsDTO, "jobDoneUuids", jobsDonePreview);
    const planForNextPeriodUuids =
        getConvertedValues<PlanForNextPeriod>(dayReportsDTO, "planForNextPeriodUuids", plansForNextPeriodPreview);
    const problemForCurrentPeriodUuids =
        getConvertedValues<CurrentProblem>(dayReportsDTO, "problemForCurrentPeriodUuids", problemsForCurrentPeriodPreview);
    const mentorCommentUuids = getConvertedValues<MentorComment>(dayReportsDTO, "mentorCommentUuids", mentorCommentsPreview);

    /**
     * DayReportProps for each day report separately
     */
    const getDayReportProps = (i: number) => {
      const obj = {
        jobDoneUuids: jobDoneUuids[i],
        planForNextPeriodUuids: planForNextPeriodUuids[i],
        problemForCurrentPeriodUuids: problemForCurrentPeriodUuids[i],
        mentorCommentUuids: mentorCommentUuids[i],
      };

      return obj;
    };

    const dayReports = dayReportsDTO
      .map((dayReportPreview, i) => dayReportDTOToDayReportConverter(dayReportPreview, getDayReportProps(i)));

    return dayReports;
  }

  /**
   * Get DayReport by uuid
   */
  public static async getDayReport(uuid: string): Promise<DayReport> {
    const dayReportDTO = await DayReportService.getDayReportDTO(uuid);
    const jobsDonePreview = await JobDoneDAL.getJobsDone();
    const plansForNextPeriodPreview = await PlanForNextPeriodDAL.getPlansForNextPeriod();
    const mentorCommentsPreview = await MentorCommentDAL.getMentorComments();
    const problemsForCurrentPeriodPreview = await CurrentProblemDAL.getCurrentProblems();

    const jobDoneUuids = getConvertedValue<JobDone>(dayReportDTO, "jobDoneUuids", jobsDonePreview);
    const planForNextPeriodUuids =
      getConvertedValue<PlanForNextPeriod>(dayReportDTO, "planForNextPeriodUuids", plansForNextPeriodPreview);
    const problemForCurrentPeriodUuids =
      getConvertedValue<CurrentProblem>(dayReportDTO, "problemForCurrentPeriodUuids", problemsForCurrentPeriodPreview);
    const mentorCommentUuids = getConvertedValue<MentorComment>(dayReportDTO, "mentorCommentUuids", mentorCommentsPreview);

    const dayReportProps = {
      jobDoneUuids,
      planForNextPeriodUuids,
      problemForCurrentPeriodUuids,
      mentorCommentUuids,
    };

    const dayReport = dayReportDTOToDayReportConverter(dayReportDTO, dayReportProps);

    return dayReport;
  }

  /**
   * Create DayReport with empty fields and autogenerated uuid
   */
  public static async createDayReport(wayUuid: string) {
    const newJobDone = await JobDoneDAL.createJobDone();
    const newPlanForNextPeriod = await PlanForNextPeriodDAL.createPlanForNextPeriod();
    const newCurrentProblem = await CurrentProblemDAL.createCurrentProblem();
    const newMentorCommentUuid = await MentorCommentDAL.createMentorComment();

    const DEFAULT_DAY_REPORT: DayReportDTOWithoutUuid = {
      date: DateUtils.getShortISODateValue(new Date),
      jobDoneUuids: [`${newJobDone.uuid}`],
      planForNextPeriodUuids: [`${newPlanForNextPeriod.uuid}`],
      problemForCurrentPeriodUuids: [`${newCurrentProblem.uuid}`],
      studentComments: [""],
      learnedForToday: [""],
      mentorCommentUuids: [`${newMentorCommentUuid.uuid}`],
      isDayOff: false,
    };
    const dayReport = await DayReportService.createDayReportDTO(DEFAULT_DAY_REPORT);

    const way = await WayService.getWayDTO(wayUuid);

    const updatedDayReportUuids = [...way.dayReportUuids, dayReport.uuid];

    await WayService.updateWayDTO(way, updatedDayReportUuids);
  }

  /**
   * Update DayReport
   */
  public static async updateDayReport(dayReport: DayReport) {
    const jobDoneUuids = dayReport.jobsDone.map((item) => item.uuid);
    const planForNextPeriodUuids = dayReport.plansForNextPeriod.map((item) => item.uuid);
    const problemForCurrentPeriodUuids = dayReport.problemsForCurrentPeriod.map((item) => item.uuid);
    const mentorCommentUuids = dayReport.mentorComments.map((item) => item.uuid);

    const dayReportDTOProps = {
      jobDoneUuids,
      planForNextPeriodUuids,
      problemForCurrentPeriodUuids,
      mentorCommentUuids,
    };

    const dayReportDTO = dayReportToDayReportDTOConverter(dayReport, dayReportDTOProps);
    await DayReportService.updateDayReportDTO(dayReportDTO, dayReport.uuid);
  }

}