import { createToken } from "../cores/handleToken.js";
import returnStatus from "../cores/returnStatus.js";
import UserModel from "../models/user.js";
class UserController {
  /**
   * Get User Data 
   * GET /api/user/info
   */
  async getUserData(req, res) {
    const { userId } = req.body;
    if(!userId);
    try{
      const response = await UserModel.findOne({_id: userId}).select('_id username email fullName');
      return returnStatus(res, 200, {email: response.email, username: response.username, fullName: response.fullName});      
    }catch(err){
      console.log(`[USER GET USER DATA ERR]`, err);
      return returnStatus(res, 500);
    }
  }
  /**
   * Login
   * POST /api/user/login
   * BODY { username, password }
   */
  async login(req, res) {
    const { username, password } = req.body;

    if (!username || !password) return returnStatus(res, 400);

    try {
      const user = await UserModel.findOne({ username, password });
      if (!user) return returnStatus(res, 403);

      const jwtToken = await createToken({ userId: user._id, isAdmin: user.isAdmin });
      return returnStatus(res, 200, { token: jwtToken, id: user._id, username: user.username, email: user.email, fullName: user.fullname});

    } catch (err) {
      console.log('[USER LOGIN ERROR]', err);
      return returnStatus(res, 500);
    }
  }

  /**
   * Register
   * POST /api/user/register
   * BODY { username, password, email, fullName }
   */
  async register(req, res) {
    const { username, password, email, fullName } = req.body;
    try {
      if (!username || !password || !email || !fullName) return returnStatus(res, 400);
      await UserModel.create({ username, password, email, fullname: fullName });
      return returnStatus(res, 200);
    } catch (err) {
      console.log('[USER REGISTER ERROR', err);
      return returnStatus(res, 500);
    }
  }
  /**
   * Check username
   * POST /api/user/check-username
   * BODY { username }
   */
  async checkUsername(req, res) {
    const { username } = req.body;
    try {
      const foundUser = await UserModel.exists({ username });
      if (!foundUser) return returnStatus(res, 404);

      return returnStatus(res, 200);
    } catch (err) {
      console.log('[USER CHECK USERNAME ERROR]', err);
      return returnStatus(res, 500);
    }
  }

  /**
   * Check email
   * POST /api/user/check-email
   * BODY { email }
   */
  async checkEmail(req, res) {
    const { email } = req.body;
    try {
      const foundUser = await UserModel.exists({ email });
      if (!foundUser) return returnStatus(res, 404);

      return returnStatus(res, 200);
    } catch (err) {
      console.log('[USER CHECK EMAIL ERROR]', err);
    }
  }

  /**
   * Set Admin
   * PATCH /api/set-admin
   * BODY { userId }
   */
  async setAdmin(req, res) {
    const { userId } = req.body;
    try {
      await UserModel.updateOne({ id: userId }, { isAdmin: true });
      return returnStatus(res, 200);
    } catch (err) {
      console.log('[USER SET ADMIN ERROR]', err);
      return returnStatus(res, 500);
    }
  }
}

export default new UserController;