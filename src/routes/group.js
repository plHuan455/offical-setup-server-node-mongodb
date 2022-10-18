import GroupController from "../controllers/GroupController.js";
import express from "express";

const groupRouter = express.Router();

groupRouter.post('/create', GroupController.create);
groupRouter.post('/add-member/:slug', GroupController.addMember);
groupRouter.post('/invite/:slug', GroupController.invite);
groupRouter.post('/reply-invite', GroupController.repInvite);
groupRouter.delete('/delete-member/:slug', GroupController.deleteMember);
groupRouter.delete('/delete-group/:slug', GroupController.deleteGroup);
groupRouter.get('/get-invites', GroupController.getInvites);
groupRouter.get('/get-members/:slug', GroupController.getMembers);
groupRouter.get('/get-groups', GroupController.getGroups);

export default groupRouter;