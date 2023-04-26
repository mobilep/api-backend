const templateModel = require('./../../../models/template.model')

module.exports.create = (data) => {
  return templateModel.create(data)
    .then((data) => {
      return templateModel.findOne({_id: data._id})
        .populate('_criterias')
    })
}

module.exports.findOne = (query) => {
  return templateModel.findOne(query)
    .populate('logs.user')
    .populate('_criterias')
}

module.exports.update = (id, data) => {
  return templateModel.findByIdAndUpdate(id, {$set: data}, {new: true})
    .populate('_criterias')
    .then((updated) => {
      return updated
    })
    .catch((err) => {
      throw utils.ErrorHelper.serverError(err)
    })
}

module.exports.bulkDelete = (filter) => {
  return templateModel.updateMany(filter, {isActive: false})
}

module.exports.find = (query) => {
  return templateModel.find({isActive: true, ...query})
    .populate('logs.user')
}
