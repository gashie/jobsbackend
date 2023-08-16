const express = require("express");
const router = express.Router();

//user account
const { CreateUser, ActivateAccount, SendActivation, PasswordReset, GetAllUsers, UpdateUser } = require("../controllers/user/user")

//USER AUTH
const {
    Auth, VerifyUser, Logout,
} = require("../controllers/user/auth");
const { protect } = require("../middleware/protect");

const { checkBaseId, checkOriginatorBaseId, checkUserMenuBaseId } = require("../middleware/rolemenu");
const { SetupRoleMenu, AllRoleMenu, SingleRoleMenu, RemoveRoleMenu, UpdateRoleMenu, AllMenus, DeleteRoleMenu } = require("../controllers/user/rolemenu");
const { checkDuplicateaccount } = require("../middleware/duplicate");
const { verifyAccountActivate, verifyAccountReactivate, verifyResetAccount, verifyAccountReset, verifyUser, findBanner, findJob, findResume } = require("../middleware/verify");
const { CreateSkills, ViewSkills,ViewMySkills,UpdateSkills} = require("../controllers/jobs/skills");
const { CreateJobCategory, ViewJobCategory,UpdateJobCategory} = require("../controllers/jobs/jobcategory");
const { CreateQuestionnaire,CreateBulkQuestionnaire,LinkQuestionnaire,DeleteLinkage} = require("../controllers/jobs/questionnaire");

const { CreateJobStatus,UpdateJobStatus,ViewJobStatus} = require("../controllers/jobs/jobstatus");
const { CreateIndustry,ViewIndustry,UpdateIndustry} = require("../controllers/company/industry");
const { CreateJobInfo,UpdateJobInfo,AdminApproveJobInfo,ViewMyJobs} = require("../controllers/jobs/jobinfo");

const { CreateBanner,ViewBanners,UpdateBanner} = require("../controllers/admin/banner");


/***
 * *****
 * ----JOBSEEKER CONTROLERS
 */

const { CreateCv,ViewMyCv,UpdateCv} = require("../controllers/jobseeker/cv")



//user account
router.route("/signup")["post"](checkDuplicateaccount, CreateUser);
router.route("/activate")["post"](verifyAccountActivate, ActivateAccount);
router.route("/resendactivatecode")["post"](verifyAccountReactivate, SendActivation);
router.route("/sendresetcode")["post"](verifyResetAccount, SendActivation);
router.route("/passwordreset")["post"](verifyAccountReset, PasswordReset);



//ums
router.route("/createrolemenu")["post"](checkBaseId, SetupRoleMenu);
router.route("/rolemenu")["post"](AllRoleMenu);
router.route("/menu").post(AllMenus);
router.route("/findrolemenu")["post"](SingleRoleMenu);
router.route("/deleterolemenu")["post"](DeleteRoleMenu);
router.route("/updaterolemenu")["post"](UpdateRoleMenu);


//users table
router.route("/allusers").post(protect, GetAllUsers);
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



//manage questions
router.route("/createquestion").post(protect,CreateQuestionnaire);
router.route("/createbulkquestion").post(protect,findJob,CreateBulkQuestionnaire);
router.route("/linkquestion").post(protect,LinkQuestionnaire);
router.route("/unlinkquestion").post(protect,DeleteLinkage);

//manage banner
router.route("/createbanner").post(protect,CreateBanner);
router.route("/updatebanner").post(protect,findBanner,UpdateBanner);
router.route("/viewbanner").post(protect,ViewBanners);


//manage resume
router.route("/createresume").post(protect,CreateCv);
router.route("/updateresume").post(protect,findResume,UpdateCv);
router.route("/myresume").post(protect,ViewMyCv);



module.exports = router;