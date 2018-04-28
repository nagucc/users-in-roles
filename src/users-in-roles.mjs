/*
UserInRole
一个用户和角色的对应表。结构如下：
{
  _id: ObjectId("5927910a436fb552219ba5eb"),
  user: {
    appId1: userId1,
    appId2: userId2
  },
  roles: [
    'app1:role1',
    'app1:role2',
    'app2:role1'
  ],
  // 其他数据，比如：
  mobile: '2233111',
}
说明：
- 由于一个用户可能会在多个系统中共用，因此一个用户可能会具有多个不同的userid；
- 角色使用字符串形式，格式可自行定义；
- "_id" 是由MongoDB自动产生的，无实际用途。
*/


import mongodb from 'mongodb';
import { error, info } from './config.mjs';

export default class MongoUserInRole {
  constructor(mongoUrl, collectionName = 'user_in_role') {
    this.mongoUrl = mongoUrl;
    this.collectionName = collectionName;
  }
  async getDb() {
    const db = await mongodb.MongoClient.connect(this.mongoUrl);
    info('connected to ', this.mongoUrl);
    db.on('error', (e) => {
      error(e);
    });
    return db;
  }
  // 添加用户
  async insertUser(appId, userId) {
    if (!appId || !userId) throw new Error('appId or userId must be provided.');
    const existedUser = await this.getUser(appId, userId);
    let uirId;
    if (existedUser) {
      // 进行更新
      info('Exist User:', existedUser);
      uirId = existedUser._id; // eslint-disable-line
    } else {
      // 进行插入
      const db = await this.getDb();
      const col = db.collection(this.collectionName);
      const result = await col.insertOne({
        user: { [appId]: userId },
      });
      info('insertUser Result:', result.insertedId);
      uirId = result.insertedId;
      db.close();
    }
    return uirId;
  }
  // 根据appId和userId获取用户
  async getUser(appId, userId) {
    if (!appId || !userId) throw new Error('appId or userId must be provided.');
    const db = await this.getDb();
    const col = db.collection(this.collectionName);
    const query = {
      [`user.${appId}`]: userId,
    };
    info('findOne:', query);
    return col.findOne(query);
  }
  // 为指定用户添加角色
  async addRole(appId, userId, role) {
    if (!appId || !userId || !role) {
      throw new Error('appId, userId or role must be provided.');
    }
    const db = await this.getDb();
    const col = db.collection(this.collectionName);
    const query = {
      user: { [appId]: userId },
    };
    const result = col.updateOne(query, {
      $addToSet: { roles: role },
    });
    info('addRole Result: ', result);
    return true;
  }
  // 从指定用户删除角色
  async removeRole(appId, userId, role) {
    if (!appId || !userId || !role) {
      throw new Error('appId, userId or role must be provided.');
    }

    const existedUser = await this.getUser(appId, userId);
    if (!existedUser) throw new Error('user is not found');
    if (!existedUser.roles) throw new Error('no any role with this user');
    const updatedRoles = existedUser.roles.filter(r => r !== role);

    const db = await this.getDb();
    const col = db.collection(this.collectionName);
    const query = {
      user: { [appId]: userId },
    };
    col.updateOne(query, {
      $set: { roles: updatedRoles },
    });
    db.close();
    return true;
  }
  async usersByAppId(appId) {
    const db = await this.getDb();
    const col = db.collection(this.collectionName);
    const query = {
      [`user.${appId}`]: { $exists: true },
    };
    info('usersByAppId: ', query);
    return col.find(query).toArray();
  }
  async usersByRole(role) {
    const db = await this.getDb();
    const col = db.collection(this.collectionName);
    const query = {
      roles: role,
    };
    info('usersByRole: ', query);
    return col.find(query).toArray();
  }

  async userByUserId(appId, userId) {
    const db = await this.getDb();
    const col = db.collection(this.collectionName);
    const query = {
      [`user.${appId}`]: userId,
    };
    info('usersByUserId: ', query);
    return col.findOne(query);
  }

  async apps() {
    const db = await this.getDb();
    const col = db.collection(this.collectionName);
    const users = await col.find().toArray();
    const apps = users.reduce((acc, cur) => {
      Object.keys(cur.user).forEach(appId => acc.add(appId));
      return acc;
    }, new Set());
    return Array.from(apps);
  }

  async attachUser(attachTo, newUser) {
    const uir = await this.getUser(attachTo.appId, attachTo.userId);
    const db = await this.getDb();
    const col = db.collection(this.collectionName);
    return col.updateOne({
      _id: uir._id,
    }, {
      $set: { [`user.${newUser.appId}`]: newUser.userId },
    });
  }

  async detachUser(appId, userId) {
    const uir = await this.getUser(appId, userId);
    const db = await this.getDb();
    const col = db.collection(this.collectionName);
    return col.updateOne({
      _id: uir._id,
    }, {
      $unset: { [`user.${appId}`]: userId },
    });
  }
}
