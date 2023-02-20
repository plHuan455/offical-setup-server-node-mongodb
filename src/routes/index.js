import groupRouter from "./group.js";
import userRouter from "./user.js";
import wordRouter from "./word.js";
// import authRouter from "./auth.js";
import pendingRouter from "./pending.js";
import tokenMiddleware from "../midlewares/tokenMidleware.js";

function router(app) {
    app.use('/api/pending', tokenMiddleware, pendingRouter);
    app.use('/api/user', userRouter);
    app.use('/api/group', tokenMiddleware, groupRouter); 
    app.use('/api/word', tokenMiddleware, wordRouter);
    app.use('/', (req, res)=> { return res.json({success: true})});
}


export default router;


