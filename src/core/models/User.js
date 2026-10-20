export default class User {
  constructor({ id = null, nickname = '', email = '', role = 'guest', avatar = '', createdAt = null } = {}) {
    this.id = id
    this.nickname = nickname
    this.email = email
    this.role = role
    this.avatar = avatar
    this.createdAt = createdAt
    this.isGuest = !id
  }
}