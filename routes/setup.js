const express = require("express");
const router = express.Router();

//user account
const  {CreateUser,ActivateAccount,SendActivation,PasswordReset,GetAllUsers,UpdateUser} = require("../controllers/user/user")


   const { checkBaseId,checkOriginatorBaseId,checkUserMenuBaseId } = require("../middleware/rolemenu");
    const  {SetupRoleMenu,AllRoleMenu,SingleRoleMenu,RemoveRoleMenu,UpdateRoleMenu,AllMenus,DeleteRoleMenu } = require("../controllers/user/rolemenu");
const { checkDuplicateaccount } = require("../middleware/duplicate");
const { verifyAccountActivate,verifyAccountReactivate,verifyResetAccount,verifyAccountReset ,verifyUser} = require("../middleware/verify");



//user account
router.route("/signup")["post"](checkDuplicateaccount,CreateUser);
router.route("/activate")["post"](verifyAccountActivate,ActivateAccount);
router.route("/resendactivatecode")["post"](verifyAccountReactivate,SendActivation);
router.route("/sendresetcode")["post"](verifyResetAccount,SendActivation);
router.route("/passwordreset")["post"](verifyAccountReset,PasswordReset);



//ums
router.route("/createrolemenu")["post"](checkBaseId,SetupRoleMenu);
router.route("/rolemenu")["post"](AllRoleMenu);
router.route("/menu").post(AllMenus);
router.route("/findrolemenu")["post"](SingleRoleMenu);
router.route("/deleterolemenu")["post"](DeleteRoleMenu);
router.route("/updaterolemenu")["post"](UpdateRoleMenu);


//users table
router.route("/allusers").post(GetAllUsers);
router.route("/updateuser").post(verifyUser,UpdateUser);


module.exports = router;