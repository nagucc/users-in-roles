# users-in-roles
用户角色授权模块

使用MongoDB存储的用户和角色的对应表。结构如下：
```
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
```

说明：
- 由于一个用户可能会在多个系统中共用，因此一个用户可能会具有多个不同的userid；
- 角色使用字符串形式，格式可自行定义；
- "_id" 是由MongoDB自动产生的，无实际用途。
- 可在数据中加入其他的自定义数据，如mobile等。

## API-MongoUserInRole类

### constructor(mongoUrl, collectionName = 'user_in_role')

### getDb()

### insertUser(appId, userId)

### getUser(appId, userId)

### addRole(appId, userId, role)

### removeRole(appId, userId, role)

### usersByAppId(appId)

### usersByRole(role)

### userByUserId(appId, userId)

### apps()

### attachUser(attatchTo, user)

### detachUser(appId, userId)