// const  { AllRoles,
//     SetupSystemRole,
//     SingleRole,
//     RemoveRole,
//     UpdateRole,DeleteSystemRole} = require("../controllers/users/role")
  
//     const {CreateSystemUser,GetAllUsers,DeleteSystemUser,UpdateSystemUser} = require("../controllers/users/user")


//     const { checkBaseId,checkOriginatorBaseId,checkUserMenuBaseId } = require("../middleware/rolemenu");
    const  {SetupRoleMenu,AllRoleMenu,SingleRoleMenu,RemoveRoleMenu,UpdateRoleMenu,AllMenus,DeleteRoleMenu } = require("../controllers/users/rolemenu")

//ums

// router.route("/createsystemrole")["post"](SetupSystemRole);
// router.route("/roles")["post"](AllRoles);
// router.route("/findrole")["post"](SingleRole);
// router.route("/deleterole")["post"](DeleteSystemRole);
// router.route("/updaterole")["post"](UpdateRole);

// router.route("/createrolemenu")["post"](checkBaseId,SetupRoleMenu);
// router.route("/rolemenu")["post"](AllRoleMenu);
router.route("/menu")["post"](AllMenus);
// router.route("/findrolemenu")["post"](SingleRoleMenu);
// router.route("/deleterolemenu")["post"](DeleteRoleMenu);
// router.route("/updaterolemenu")["post"](UpdateRoleMenu);