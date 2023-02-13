import mongoose from 'mongoose';
import GroupModel from '../models/group.js';
import MemberModel from '../models/member.js';
import UserModel from '../models/user.js';
import InviteModel from '../models/invite.js';
import returnStatus from '../cores/returnStatus.js';

class GroupController {
  /** Create a group
   * POST /api/group/create
   * BODY { userId, name, description, avatarImg }
   */
  async create(req, res) {
    const { userId, name, description, avatarImg, baseMoney } = req.body;
    try {
      if (!userId || !name) return returnStatus(res, 400);
      const newGroup = await GroupModel.create({
        name, description, avatarImg, adminId: userId, baseMoney
      })
      await MemberModel.create({
        userId,
        groupId: newGroup._id,
        isAdmin: true
      })
      return returnStatus(res, 200, );
    } catch (err) {
      console.log(err);
      return returnStatus( res, 500);
    }
  }

  /** Update a group
   * POST /api/group/:slug
   * BODY { userId, name, description, avatarImg }
   */
  async update(req, res) {
    const { userId, name, description, avatarImg, baseMoney } = req.body;
    const { slug } = req.params;

    try {
      if (!userId || !slug) return returnStatus(res, 400);
      const foundGroup = await GroupModel.findOne({slug});
      if(!foundGroup) return returnStatus(404);
      
      const response = await GroupModel.findOneAndUpdate({slug}, {
        name,
        description,
        avatarImg,
        baseMoney,
      }, {new: true})
      return returnStatus(res, 200, response);
    } catch (err) {
      console.log(err);
      return returnStatus( res, 500);
    }
  }

  /** 
   * Get groups
   * GET /api/group
   * BODY { userId }
   */
  async getGroups(req, res) {
    const { userId } = req.body;
    const { search } = req.query;
    try {
      const searchRegex = new RegExp(search, 'gi');
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
            'members.userId': mongoose.Types.ObjectId(userId),
            name: searchRegex
          }
        }, {
          $project: {
            _id: 1,
            name: 1,
            description: 1,
            avatarImg: 1,
            adminId: 1,
            slug: 1,
            members: {
              $slice: ['$members' , 2],
            },
          }
        }, {
          $lookup: {
            from: 'users',
            foreignField: '_id',
            localField: 'members.userId',
            as: 'members'
          }
        }, {
          $project : {
            // id: '$_id',
            name: 1,
            description: 1,
            avatarImg: 1,
            adminId: 1,
            slug: 1,
            "members.fullname": 1
          }
        }, 
      ])

      return returnStatus(res, 200, response);
    } catch (err) {
      console.log('[GROUP GET GROUPS ERROR]', err);
      return returnStatus(res, 500 );
    }

  }

  /**
   * GET GROUP BY SLUG
   * GET /api/group/:slug
   */
  async getGroup(req, res) {
    const {userId} = req.body;
    const {slug} = req.params;

    try {
      const response = await GroupModel.findOne({slug})
      return returnStatus(res, 200, response);
    }
    catch(err){
      console.log('[GROUP GET GROUP BY SLUG ERROR]', err);
      return returnStatus(res, 500);
    }
  }

  /**
   * Delete group
   * DELETE /api/group/:slug
   * BODY { userId }
   */
  async deleteGroup(req, res) {
    const { userId } = req.body;
    const { slug } = req.params;

    if (!userId || !slug) return returnStatus(res, 400);

    try {
      // const foundGroup = await GroupModel.findOne({ adminId: userId, slug });
      // if (!foundGroup) return returnStatus(res, 403);
      await GroupModel.deleteOne({ slug });

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
    const { userId, usernames  } = req.body;
    const { slug } = req.params;
    if (!userId || !slug || !usernames) return returnStatus(res, 400);

    try {
      const foundGroup = await GroupModel.findOne({ slug });

      if (!foundGroup)
        return res.status(400).json({ message: 'Bad Request' });
      
      const memberList = await UserModel.find({username: {$in: usernames}, _id: {$ne: userId}})

      const newMembers = memberList.map(value => ({
        userId: value._id,
        groupId: foundGroup._id,
        isAdmin: false
      }))

      await MemberModel.insertMany(newMembers)

      return returnStatus(res, 200);
    } catch (err) {
      console.log('[Group Add Member Error]', err);
      return returnStatus(res, 500);
    }
  }

  /**
   * Get Member
   * GET /api/group/:slug/member
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
   * DELETE /api/group/:slug/member/:memberId
   */
  async deleteMember(req, res) {
    const { userId } = req.body;
    const { slug, memberId } = req.params;
    if (!userId || !slug || !memberId) return returnStatus(res, 400);

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
            "members.userId": mongoose.Types.ObjectId(memberId),
            slug,
            $and: [
              {adminId: mongoose.Types.ObjectId(userId)},
              {adminId: {$ne: mongoose.Types.ObjectId(memberId)}}
            ]
          }
        },
        {
          $project: {
            _id: 1
          }
        }
      ]);
      if (foundGroup.length === 0) return returnStatus(res, 403);
      await MemberModel.deleteOne({ userId: memberId, groupId: foundGroup[0]._id });
      
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
