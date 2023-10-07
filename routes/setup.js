const express = require("express");
const router = express.Router();

//user account
const { CreateUser, ActivateAccount, SendActivation, PasswordReset, GetAllUsers, UpdateUser,GoogleAuth,GoogleAuthFetchUser, AdminCreateUser, ReSendActivation } = require("../controllers/user/user")

//USER AUTH
const {
    Auth, VerifyUser, Logout, ResetInAppPassword,
} = require("../controllers/user/auth");
const { protect } = require("../middleware/protect");

const { checkBaseId, checkOriginatorBaseId, checkUserMenuBaseId } = require("../middleware/rolemenu");
const { SetupRoleMenu, AllRoleMenu, SingleRoleMenu, RemoveRoleMenu, UpdateRoleMenu, AllMenus, DeleteRoleMenu } = require("../controllers/user/rolemenu");
const { checkDuplicateaccount } = require("../middleware/duplicate");
const { verifyAccountActivate, verifyAccountReactivate, verifyResetAccount, verifyAccountReset, verifyUser, findBanner, findJob, findResume, findSettings, findAppSettings, findFeedBedoreApprove, findRateCardBedoreApprove, findCourseBedoreApprove, findCourse, findFeed, findCourseContent, findCoursePartnerships, findRate, findBeforePay, findJobBeforeApply, findApplicationBeforeApprove, findInvoiceBeforePaying, findSavedJob } = require("../middleware/verify");
const { CreateSkills, ViewSkills, ViewMySkills, UpdateSkills } = require("../controllers/jobs/skills");
const { CreateJobCategory, ViewJobCategory, UpdateJobCategory } = require("../controllers/jobs/jobcategory");
const { CreateQuestionnaire, CreateBulkQuestionnaire, LinkQuestionnaire, DeleteLinkage,ViewMyQuestionnaire,AdminViewQuestionnaire,ViewJointQuestionnaire, ViewMySingleQuestionnaire, UpdateQuestionnaire, DeleteMySingleQuestionnaire} = require("../controllers/jobs/questionnaire");

const { CreateJobStatus, UpdateJobStatus, ViewJobStatus } = require("../controllers/jobs/jobstatus");
const { CreateIndustry, ViewIndustry, UpdateIndustry, ViewCompany } = require("../controllers/company/industry");
const { CreateJobInfo, UpdateJobInfo, AdminApproveJobInfo, ViewMyJobs,ViewJobDetails, ViewJobsData, ApplyJob, ApproveJobApplication, ViewJobApplications, ViewMyJobApplications, ViewMyShortlistedJobApplicants, AdminListJobs, AdminViewJobDetails ,EmoloyerViewJobDetails} = require("../controllers/jobs/jobinfo");

const { CreateBanner, ViewBanners, UpdateBanner } = require("../controllers/admin/banner");
const { CreateFeed,UpdateFeed,ViewFeeds } = require("../controllers/admin/feed");
const { CreateUserFeeds,ViewUserFeeds,UpdateUserFeed,ApproveUserFeed,ViewMyUserFeeds } = require("../controllers/admin/userfeeds");
const { ViewRateCards,ApproveRateCard,UpdateRateCard,CreateRateCard, ViewApprovedRateCards} = require("../controllers/admin/ratecard");
const { CreateCourse,ViewCourse,ViewMyCourses,UpdateCourse,ApproveCourse } = require("../controllers/admin/courses");
const { CreateCourseContent,ViewCourseContent,UpdateCourseContent } = require("../controllers/admin/courses_content");
const { ViewCoursePartners,UpdateCoursePartners,CreateCoursePartners } = require("../controllers/admin/courses_partnership");
const { CreateCourseSchedule,UpdateCourseSchedule,ViewCourseSchedule } = require("../controllers/admin/courses_schedule");

/***
 * *****
 * ----JOBSEEKER CONTROLERS ->START
 */

const { CreateResume, ViewMyCv, UpdateCv } = require("../controllers/jobseeker/resume")
const { CreateCoverLetter, ViewMyCoverLetter, UpdateCoverLetter } = require("../controllers/jobseeker/coverletter")
const { CreateJobAlert, ViewMyJobAlert, UpdateJobAlert } = require("../controllers/jobseeker/jobalert")
const { SaveJob,ViewMySavedJobs,UpdateSavedJob } = require("../controllers/jobseeker/savedjobs");
const { FetchVariousUsers, FetchEmployersUsers } = require("../controllers/admin/manage_users");
const { CreateSystemSettings, UpdateSystemSettings } = require("../controllers/admin/app_settings");

/***
 * *****
 * ----JOBSEEKER CONTROLERS <-END
 */


const { GeneralPayment,VerifyPayment, PaystackViewTransactionTotal, ViewTransactionTotal, ViewEmployerTransactionTotal, InvoicePayment } = require("../controllers/jobs/pay");
const { UpdateLogoSettings } = require("../controllers/admin/logo_settings");
const { UpdateProfileImageSettings,UpdateUserDataWithImage } = require("../controllers/admin/profileimage_settings");
const { ViewMyAppliedJobs } = require("../controllers/jobs/applications");
const { CreateServiceEnquiry, ViewServiceEnquiry } = require("../controllers/admin/services_enquiry");
const { Utilities } = require("../controllers/admin/utilities");
const { ViewMyProfile } = require("../controllers/jobseeker/profile");
const { CreateInvoice,DeletInvoce, ViewSingleInvoice, UpdateInvoice, ViewMyUnpaidInvoice, AdminViewInvoices } = require("../controllers/jobs/invoice");
const { FrontendListJobs, FrontendFindJob } = require("../controllers/frontend/jobs");
const { FrontendListCategories, FrontendListIndustries, FrontendListLocations, FrontendListCourses, FrontendFindCourses } = require("../controllers/frontend/utilities");
const { Webhook } = require("../controllers/jobs/webhook");


//user account
router.route("/signup")["post"](checkDuplicateaccount, CreateUser);
router.route("/admincreateuser")["post"](checkDuplicateaccount, AdminCreateUser);
router.route("/activate")["post"](verifyAccountActivate, ActivateAccount);
router.route("/oauth")["get"](GoogleAuthFetchUser);
router.route("/request")["get"](GoogleAuth);
router.route("/activate")["post"](verifyAccountActivate, ActivateAccount);
router.route("/resendactivatecode")["post"](verifyAccountReactivate, ReSendActivation);
router.route("/sendresetcode")["post"](verifyResetAccount, SendActivation);
router.route("/passwordreset")["post"](verifyAccountReset, PasswordReset);
router.route("/passwordresetinapp")["post"](protect, ResetInAppPassword);



//ums
router.route("/createrolemenu")["post"](checkBaseId, SetupRoleMenu);
router.route("/rolemenu")["post"](AllRoleMenu);
router.route("/menu").post(AllMenus);
router.route("/findrolemenu")["post"](SingleRoleMenu);
router.route("/deleterolemenu")["post"](DeleteRoleMenu);
router.route("/updaterolemenu")["post"](UpdateRoleMenu);


//users table
router.route("/allusers").post(protect, FetchVariousUsers);
router.route("/fetchemployers").post(protect, FetchEmployersUsers);
router.route("/updateuser").post(protect, verifyUser, UpdateUser);


//user login auth
router.route("/login").post(Auth);
router.route("/auth").post(protect, VerifyUser);
router.route("/logout").post(protect, Logout);

//manage skills
router.route("/createskill").post(protect, CreateSkills);
router.route("/viewskills").post(protect, ViewSkills);
router.route("/viewmyskills").post(protect, ViewMySkills);
router.route("/updateskill").post(protect, UpdateSkills);

//manage jobcategory
router.route("/createjobcategory").post(protect, CreateJobCategory);
router.route("/viewjobcategory").post(protect, ViewJobCategory);
router.route("/updatejobcategory").post(protect, UpdateJobCategory);

//manage jobstatus
router.route("/createjobstatus").post(protect, CreateJobStatus);
router.route("/viewjobstatus").post(protect, ViewJobStatus);
router.route("/updatejobstatus").post(protect, UpdateJobStatus);


//manage industry
router.route("/createindustry").post(protect, CreateIndustry);
router.route("/viewindustry").post(protect, ViewIndustry);
router.route("/updateindustry").post(protect, UpdateIndustry);

//setup job
router.route("/setupjob").post(protect, CreateJobInfo);
router.route("/updatejob").post(protect, UpdateJobInfo);
router.route("/approvejob").post(protect, AdminApproveJobInfo);
router.route("/viewmyjobs").post(protect, ViewMyJobs);
router.route("/viewcompanies").post(protect, ViewCompany);
router.route("/adminlistjobs").post(protect, AdminListJobs);



//manage questions
router.route("/createquestion").post(protect, CreateQuestionnaire);
router.route("/viewquestions").post(protect, AdminViewQuestionnaire);
router.route("/viewmyquestions").post(protect, ViewMyQuestionnaire);
router.route("/viewmysinglequestion").post(protect, ViewMySingleQuestionnaire);
router.route("/viewjointquestions").post(protect, ViewJointQuestionnaire);
router.route("/createbulkquestion").post(protect, findJob, CreateBulkQuestionnaire);
router.route("/updatequestion").post(protect, UpdateQuestionnaire);
router.route("/deletequestion").post(protect, DeleteMySingleQuestionnaire);
router.route("/linkquestion").post(protect, LinkQuestionnaire);
router.route("/unlinkquestion").post(protect, DeleteLinkage);

//manage banner
router.route("/createbanner").post(protect, CreateBanner);
router.route("/updatebanner").post(protect, findBanner, UpdateBanner);
router.route("/viewbanner").post(protect, ViewBanners);


//manage resume
router.route("/createresume").post(protect, CreateResume);
router.route("/updateresume").post(protect, findResume, UpdateCv);
router.route("/myresume").post(protect, ViewMyCv);
router.route("/viewprofile").post(protect, ViewMyProfile);



//manage coverletter
router.route("/createcv").post(protect, CreateCoverLetter);
router.route("/updatecv").post(protect, UpdateCoverLetter);
router.route("/mycv").post(protect, ViewMyCoverLetter);


//manage jobalert
router.route("/createjobalert").post(protect, CreateJobAlert);
router.route("/updatejobalert").post(protect, UpdateJobAlert);
router.route("/myjobalert").post(protect, ViewMyJobAlert);


//manage job
router.route("/savejob").post(protect,findSavedJob, SaveJob);
router.route("/updatesavedjob").post(protect, UpdateSavedJob);
router.route("/mysavedjobs").post(protect, ViewMySavedJobs);
router.route("/jobdetails").post(protect, ViewJobDetails);
router.route("/public/jobdata").post(ViewJobsData);
router.route("/apply").post(protect,findJobBeforeApply,ApplyJob);
router.route("/approveapplication").post(protect,findApplicationBeforeApprove,ApproveJobApplication);
router.route("/admin/viewapplications").post(protect,ViewJobApplications);
router.route("/admin/viewjob").post(protect,AdminViewJobDetails);
router.route("/employer/viewjob").post(protect,EmoloyerViewJobDetails);
router.route("/employer/viewmyshortlisted").post(protect,findJob,ViewMyShortlistedJobApplicants);
router.route("/jobseeker/viewmyappliedjobs").post(protect,ViewMyAppliedJobs);

//manage feeds
router.route("/savefeed").post(protect, CreateFeed);
router.route("/updatesavedfeed").post(protect, UpdateFeed);
router.route("/viewsavedfeeds").post(protect, ViewFeeds);
router.route("/saveuserfeed").post(protect, CreateUserFeeds);
router.route("/updateusersavedfeed").post(protect,findFeed, UpdateUserFeed);
router.route("/viewsaveduserfeeds").post(protect, ViewUserFeeds);
router.route("/viewmysavedfeeds").post(protect, ViewMyUserFeeds);
router.route("/approveuserfeeds").post(protect,findFeedBedoreApprove, ApproveUserFeed);


//manage settings--logo|
router.route("/savesettings").post(protect,findSettings, CreateSystemSettings);
router.route("/updatesavedsetting").post(protect,findAppSettings, UpdateSystemSettings);

//manage employer--logo|
router.route("/admin/updateemployerlogo").post(protect,UpdateLogoSettings);
router.route("/employer/updateemployerlogo").post(protect,UpdateLogoSettings);
router.route("/updateprofileimage").post(protect,UpdateProfileImageSettings);
router.route("/updateprofiledata").post(protect,UpdateUserDataWithImage);


//manage ratecard
router.route("/saveratecard").post(protect, CreateRateCard);
router.route("/updateratecard").post(protect, UpdateRateCard);
router.route("/viewratecards").post(protect, ViewRateCards);
router.route("/rate").post(protect, ViewApprovedRateCards);
router.route("/approveratecards").post(protect,findRateCardBedoreApprove, ApproveRateCard);

//manage course
router.route("/savecourse").post(protect, CreateCourse);
router.route("/updatesavedcourse").post(protect,findCourse, UpdateCourse);
router.route("/mysavedcourses").post(protect, ViewMyCourses);
router.route("/viewsavedcourses").post(protect, ViewCourse);
router.route("/approvecourses").post(protect,findCourseBedoreApprove, ApproveCourse);
router.route("/saveschedule").post(protect, CreateCourseSchedule);
router.route("/updateschedule").post(protect, UpdateCourseSchedule);
router.route("/viewschedule").post(protect, ViewCourseSchedule);
router.route("/savecontent").post(protect, CreateCourseContent);
router.route("/updatecontent").post(protect,findCourseContent, UpdateCourseContent);
router.route("/viewcontent").post(protect, ViewCourseContent);
router.route("/savepartnerships").post(protect, CreateCoursePartners);
router.route("/updatepartnerships").post(protect,findCoursePartnerships, UpdateCoursePartners);
router.route("/viewpartnerships").post(protect, ViewCoursePartners);


//manage course
router.route("/pay").post(protect,findRate,findBeforePay, GeneralPayment);
router.route("/webhook").post(Webhook);
router.route("/verifypayment").post(protect,VerifyPayment);
router.route("/viewtransactiontotal").post(protect,PaystackViewTransactionTotal);
router.route("/transactionhistory").post(protect,ViewTransactionTotal);
router.route("/employer/transactionhistory").post(protect,ViewEmployerTransactionTotal);


//manage invoice
router.route("/createinvoice").post(protect,CreateInvoice);
router.route("/deleteinvoice").post(protect,DeletInvoce);
router.route("/viewinvoicedetails").post(protect,ViewSingleInvoice);
router.route("/admin/viewinvoices").post(protect,AdminViewInvoices);
router.route("/viewmyunpaid").post(protect,ViewMyUnpaidInvoice);
router.route("/updateinvoice").post(protect,UpdateInvoice);
router.route("/payinvoice").post(protect,findInvoiceBeforePaying,InvoicePayment);

//manage frontend
router.route("/services").post(CreateServiceEnquiry);
router.route("/viewservices").post(protect,ViewServiceEnquiry);
router.route("/listjobs").post(protect,FrontendListJobs);
router.route("/findjob").post(protect,FrontendFindJob);
router.route("/findlocations").post(protect,FrontendListLocations);
router.route("/findindustries").post(protect,FrontendListIndustries);
router.route("/findcategories").post(protect,FrontendListCategories);
router.route("/listcourses").post(protect,FrontendListCourses);
router.route("/findcourse").post(protect,FrontendFindCourses);

//manage dashboard
router.route("/utilities").post(protect,Utilities);

module.exports = router;