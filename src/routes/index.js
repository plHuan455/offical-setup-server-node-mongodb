import groupRouter from "./group.js";
import userRouter from "./user.js";
import authRouter from "./auth.js";

function router(app) {
    // app.use('/api/auth', authRouter)
    // app.use('/api/group', groupRouter);
    // app.use('/api/note', getTokenDataMidleware, noteRouter);
    // app.use('/api/todo', getTokenDataMidleware, todoRouter);
    app.use('/api/auth', authRouter)
    app.use('/api/user', userRouter);
    app.use('/api/group', groupRouter);
}


export default router;


