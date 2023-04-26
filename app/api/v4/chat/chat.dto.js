module.exports.chatList = (chats, userId) => {
  return chats.map(chat => this.chat(chat, userId))
}

module.exports.chat = (groupChat, userId) => {
  const chat = groupChat.toJSON()

  const chatUsers = chat.users.map(u => {
    if (u.isActive) { return u._user }
  })
  const usersId = chat.users.map(u => {
    if (u._user !== null) {
      return u._user._id.toString()
    }
  })

  const index = usersId.indexOf(userId.toString())
  const currentUser = chat.users[index]

  chat.users = chatUsers.filter(u => u !== undefined)
  chat.unreadMessagesCount = currentUser.unreadMessagesCount
  chat.lastReadMessage = currentUser.lastReadMessage
  chat.status = currentUser.status
  return chat
}
