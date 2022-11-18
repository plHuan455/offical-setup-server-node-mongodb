import { verifyToken } from "../cores/handleToken.js";
import returnStatus from "../cores/returnStatus.js";

function tokenMiddleware(req, res, next) {
    req.body.userId = undefined;
    const authHeader = req.header('Authorization');
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return returnStatus(res, 401);
    }

    const tokenInfo = verifyToken(token);
    // console.log(tokenInfo);
    // console.log(tokenInfo);
    if (tokenInfo.error) {
        return returnStatus(res, 401);
    }

    req.body.userId = tokenInfo.data?.userId;

    return next();
}
export default tokenMiddleware;