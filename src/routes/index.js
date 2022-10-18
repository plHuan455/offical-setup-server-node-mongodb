import groupRouter from "./group.js";
import userRouter from "./user.js";
// import authRouter from "./auth.js";
import pendingRouter from "./pending.js";
import tokenMidleware from "../midlewares/tokenMidleware.js";

function router(app) {
    app.use('/api/pending', tokenMidleware, pendingRouter);
    app.use('/api/user', userRouter);
    app.use('/api/group', tokenMidleware, groupRouter);
}


export default router;


