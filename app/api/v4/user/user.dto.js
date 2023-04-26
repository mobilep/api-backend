module.exports.user = (user) => {
  return {
    _id: user._id,
    name: user.name,
    avatarColor: user.avatarColor,
    avatar_sm: user.avatar_sm,
    avatar_md: user.avatar_md,
    avatar_lg: user.avatar_lg,
    email: user.email,
    firstLogIn: user.firstLogIn,
    lang: user.lang,
    isSysAdmin: user.isSysAdmin,
    isCompanyAdmin: user.isCompanyAdmin,
    isManager: !!user.managerCriteria,
    companyName: user.companyName,
    _company: user._company

  }
}
