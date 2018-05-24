import { expect } from 'chai';
import MongoUserInRole from '../src/users-in-roles.mjs';
import { mongoUrl, info } from '../src/config.mjs';

describe('Mongo User In Role', () => {
  const uir = new MongoUserInRole(mongoUrl);
  let userId;

  [
    [null, null],
    [null, 'userId'],
    ['appId', null],
  ].map(params => it('insertUser() appId or userId should not be empty.', async () => {
    try {
      await uir.insertUser(...params);
    } catch (e) {
      return;
    }
    throw new Error('should not go here');
  }));

  it('insertUser() 正常添加', async () => {
    userId = await uir.insertUser('myappId', 'myuserid');
    expect(userId).is.ok;
  });

  [
    [null, null],
    [null, 'userId'],
    ['appId', null],
  ].map(params => it('getUser() appId or userId should not be empty.', async () => {
    try {
      await uir.get(...params);
    } catch (e) {
      return;
    }
    throw new Error('should not go here');
  }));
  it('getUser() 正常获取用户', async () => {
    const result = await uir.getUser('myappId', 'myuserid');
    expect(result._id).eql(userId);
  });

  it('addRole() 正常添加', async () => {
    await uir.addRole('myappId', 'myuserid', 'myrole');
  });

  it('addRole() 正常添加', async () => {
    await uir.addRole('myappId', 'myuserid', 'myrole2');
  });


  it('usersByAppId()', async () => {
    const result = await uir.usersByAppId('myappId');
    expect(result.length).above(0);
  });

  it('usersByRole()', async () => {
    const result = await uir.usersByRole('myrole');
    expect(result.length).above(0);
  });

  it('removeRole() 正常添加', async () => {
    await uir.removeRole('myappId', 'myuserid', 'myrole');
  });
});
