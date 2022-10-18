import returnStatus from "../cores/returnStatus.js";
import UserModel from "../models/user.js";
class UserController {
  /**
   * Create user
   * POST /api/user/create
   * BODY { fullname, username, password, email}
   */
  async create(req, res) {
    const { fullname, username, password, email } = req.body;
    if (!fullname || !username || !password || !email) return returnStatus(res, 400);

    try {
      await UserModel.create({
        fullname, username, email, password
      })
      return returnStatus(res, 200);
    }
    catch (err) {
      console.log('[USER CREATE ERR]', err);
      return returnStatus(res, 500);
    }
  }

  /**
   * Set Admin
   * PATCH /api/set-admin
   * BODY { userId }
   */
   async setAdmin(req, res) {
    const { userId } = req.body;
    try{
      const response = await UserModel.updateOne({ id: userId }, { isAdmin: true });
      return returnStatus(res, 200);
    }catch(err){
      console.log('[USER SET ADMIN ERROR]', err);
      return returnStatus(res, 500);
    }
  }
}

export default new UserController;