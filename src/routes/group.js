import GroupController from "../controllers/GroupController.js";
import express from "express";

const groupRouter = express.Router();

groupRouter.post('/', GroupController.create);
groupRouter.post('/add-member/:slug', GroupController.addMember);
groupRouter.post('/invite/:slug', GroupController.invite);
groupRouter.post('/reply-invite', GroupController.repInvite);
groupRouter.put('/:slug', GroupController.update);
groupRouter.delete('/:slug/member/:memberId', GroupController.deleteMember);
groupRouter.delete('/:slug', GroupController.deleteGroup);
groupRouter.get('/get-invites', GroupController.getInvites);
groupRouter.get('/:slug/member', GroupController.getMembers);
groupRouter.get('/:slug', GroupController.getGroup);
groupRouter.get('/', GroupController.getGroups);

export default groupRouter;