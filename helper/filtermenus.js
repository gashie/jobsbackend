const USERS = require("../models/User");
const { list_to_tree, getUniqueListBy } = require("../helper/func");
module.exports = {
FilterMenu: async (userDbResult) => {
   
    let roleMenuList = await USERS.FindRoleMenu(userDbResult.roleid);
    if (!roleMenuList) {
      return res.status(200).json({
        Status: 0,
        Data: [],
        Message: `Sorry, No Menus has been assigned to your role`,
      });
    }

    //Get User Menu

    let deniedResult = await USERS.FindUserMenu(userDbResult.id, 0);
    let allowedResult = await USERS.FindUserMenu(userDbResult.id, 1);

    let packMenu = [];

    for (const iterator of roleMenuList) {
      let newRoleMenu = {
        menu: iterator.menuid,
      };

      packMenu.push(newRoleMenu);
    }

    packMenu = packMenu.filter(
      (ar) => !deniedResult.find((rm) => rm.menu === ar.menu)
    );
    packMenu.push(...allowedResult);

    let NavItem = [];

    let parser = JSON.stringify(packMenu);
    let newparser = JSON.parse(parser);

    //remove duplicates
    const noDuplicates = getUniqueListBy(newparser, "menu");
    for (const iterator of noDuplicates) {
      let menus = await USERS.FindMenu(iterator.menu);
      NavItem.push(menus);
    }
    let listing = list_to_tree(NavItem);

    let userData = {
      userInfo: userDbResult,
      menus: listing,
    };

   return userData
  },
}