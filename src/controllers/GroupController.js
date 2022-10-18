import mongoose from 'mongoose';
import GroupModel from '../models/group.js';
import MemberModel from '../models/member.js';
import InviteModel from '../models/invite.js';
import returnStatus from '../cores/returnStatus.js';

class GroupController {
  /** Create a group
   * POST /api/group/create
   * BODY { userId, name, description, avatarImg }
   */
  async create(req, res) {
    const { userId, name, description, avatarImg } = req.body;
    try {
      if (!userId || !name) return returnStatus(res, 400);
      const newGroup = await GroupModel.create({
        name, description, avatarImg, adminId: userId
      })
      await MemberModel.create({
        userId,
        groupId: newGroup._id
      })
      return returnStatus(res, 200);
    } catch (err) {
      console.log(err);
      return returnStatus( res, 500);
    }
  }

  /** 
   * Get groups
   * GET /api/group/get-groups
   * BODY { userId }
   */
  async getGroups(req, res) {
    const { userId } = req.body;
    try {
      if (!userId) return res.returnStatus(res, 400);
      const response = await GroupModel.aggregate([
        {
          $lookup: {
            from: 'members',
            foreignField: 'groupId',
            localField: '_id',
            as: 'members'
          }
        }, {
          $match: {
            'members.userId': mongoose.Types.ObjectId(userId)
          }
        }, {
          $project: {
            members: 0
          }
        }
      ])

      return returnStatus(res, 200, response);
    } catch (err) {
      console.log('[GROUP GET GROUPS ERROR]', err);
      return returnStatus(res, 500 );
    }

  }

  /**
   * Delete group
   * DELETE /api/group/delete-group/:slug
   * BODY { userId }
   */
  async deleteGroup(req, res) {
    const { userId } = req.body;
    const { slug } = req.params;

    if (!userId || !slug) return returnStatus(res, 400);

    try {
      const foundGroup = await GroupModel.findOne({ adminId: userId, slug });
      if (!foundGroup) return returnStatus(res, 403);

      await GroupModel.delete({ slug });

      return returnStatus(res, 200);
    } catch (err) {
      console.log('[GROUP DELETE ERROR]', err);
      return returnStatus(res, 500);
    }

  }


  /**
   * Add Member
   * POST /api/group/add-member/:slug
   * BODY { userId }
   */
  async addMember(req, res) {
    const { userId } = req.body;
    const { slug } = req.params;
    if (!userId || !slug) return returnStatus(res, 400);

    try {
      const foundGroup = await GroupModel.findOne({ slug });
      if (!foundGroup)
        return res.status(400).json({ message: 'Bad Request' });

      await MemberModel.create({
        userId,
        groupId: foundGroup._id
      })

      return returnStatus(res, 200);
    } catch (err) {
      console.log('[Group Add Member Error]', err);
      return returnStatus(res, 500);
    }
  }

  /**
   * Get Member
   * GET /api/group/get-members/:slug
   * BODY { userId }
   */
  async getMembers(req, res) {
    const { userId } = req.body;
    const { slug } = req.params;
    if (!userId || !slug) return returnStatus(res, 400);
    try {
      const response = await MemberModel.aggregate([
        {
          $lookup: {
            from: 'groups',
            foreignField: '_id',
            localField: 'groupId',
            as: 'groups'
          }
        }, {
          $match: {
            'groups.slug': slug
          }
        }, {
          $lookup: {
            from: 'users',
            foreignField: '_id',
            localField: 'userId',
            as: 'users'
          }
        }, {
          $replaceRoot: { newRoot: { $mergeObjects: [{ $arrayElemAt: ["$users", 0] }, "$$ROOT"] } }
        }, {
          $project: {
            groups: 0,
            deleted: 0,
            users: 0,
            __v: 0,
            password: 0,
            isAdmin: 0,
            groupId: 0,
          }
        }
      ])
      return returnStatus(res, 200, response);
    } catch (err) {
      console.log('[GROUP GET MEMBERS]', err);
      return returnStatus(500, res);
    }
  }

  /**
   * Delete Member
   * DELETE /api/group/delete-member/:slug
   * BODY { userId, deletedMemberId }
   */
  async deleteMember(req, res) {
    const { userId, deletedMemberId } = req.body;
    const { slug } = req.params;

    if (!userId || !slug || !deletedMemberId) return returnStatus(res, 400);

    try {
      const foundGroup = await GroupModel.aggregate([
        {
          $lookup: {
            from: 'members',
            foreignField: 'groupId',
            localField: '_id',
            as: 'members'
          }
        }, {
          $match: {
            "members.userId": mongoose.Types.ObjectId(deletedMemberId),
            slug,
            adminId: mongoose.Types.ObjectId(userId)
          }
        }
      ]);
      if (foundGroup.length === 0) return returnStatus(res, 403);
      await MemberModel.deleteOne({ userId: deletedMemberId });
      return returnStatus(res, 200);

    } catch (err) {
      console.log('[GROUP DELETE MEMBER ERROR]', err);
      return returnStatus(res, 500);
    }
  }

  /**
   * Get invites
   * GET /api/group/get-invites
   * BODY { userId }
   */
  async getInvites(req, res) {
    const { userId } = req.body;
    if (!userId) return returnStatus(res, 400);

    try {
      // const response = await InviteModel.find({userId}).populate('groupId');
      const response = await InviteModel.aggregate([{
        $lookup: {
          from: "groups",
          localField: 'groupId',
          foreignField: '_id',
          as: 'groups',
        }
      }, {
        $project: {
          group: { $arrayElemAt: ["$groups", 0] },
        }
      }, {
        $project: {
          "group.description": 0,
          "group.deleted": 0,
          "group.createdAt": 0,
          "group.updatedAt": 0,
        }
      }
      ])

      return returnStatus(res, 200, response);
    } catch (err) {
      console.log('[GROUP GET INVITE ERROR]', err);
      return returnStatus(res, 500);
    }
  }

  /**
   *  Invite Member
   * POST /api/group/invite/:slug
   * BODY { userId, inviteMemberId }
   */
  async invite(req, res) {
    const { userId, inviteMemberId } = req.body;
    const { slug } = req.params;
    if (!userId || !slug || !inviteMemberId) return returnStatus(res, 400);

    try {
      // const foundGroup = await GroupModel.findOne({ adminId: userId, slug });
      const foundGroup = await GroupModel.aggregate([{
        $lookup: {
          from: 'members',
          foreignField: 'groupId',
          localField: '_id',
          as: 'members'
        },
      }, {
        $match: {
          "members.userId": { $ne: mongoose.Types.ObjectId(inviteMemberId) },
          slug
        }
      }, {
        $project: {
          members: 0
        }
      }
      ])
      if (foundGroup.length === 0) return returnStatus(res, 403);

      await InviteModel.deleteMany({ userId: inviteMemberId, groupId: foundGroup[0]._id })
      await InviteModel.create({
        userId: inviteMemberId,
        groupId: foundGroup[0]._id
      })

      return returnStatus(res, 200);
    } catch (err) {
      console.log('[GROUP INVITE ERROR]', err);
      return returnStatus(res, 500);
    }
  }

  /**
   * Rep invite
   * POST /api/group/reply-invite
   * BODY { userId, inviteId, isAccept}
   */
  async repInvite(req, res) {
    const { userId, inviteId, isAccept } = req.body;
    if (!userId || !inviteId) return returnStatus(res, 400);

    try {
      const foundInvite = await InviteModel.findOne({ _id: inviteId, userId });
      if (!foundInvite) return returnStatus(res, 403);

      if (isAccept) {
        await MemberModel.create({
          groupId: foundInvite.groupId,
          userId: foundInvite.userId
        });
      }
      await InviteModel.deleteOne({ _id: inviteId });

      return returnStatus(res, 200);
    } catch (err) {
      console.log('[GROUP REP INVITE ERROR]', err);
      return returnStatus(res, 500);
    }

  }

}

export default new GroupController;
