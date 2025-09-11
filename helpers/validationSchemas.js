const Joi = require("joi");
const userSchema = Joi.object({
  fullname: Joi.string().min(3).max(50).required(),
  isverified: Joi.boolean().required(),
  token: Joi.string(),
  email: Joi.string()
    .email()
    .email({ minDomainSegments: 2, tlds: { allow: ["com", "net"] } })
    .required(),
  phone: Joi.string().min(11).max(11).required(),
  password: Joi.string().min(5).max(255).required().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')),
});

const kycSchema = Joi.object({
    id: Joi.string().required(),
    type: Joi.string().required(),
    status: Joi.string().required(),
    documents: Joi.array().items(Joi.object({
        type: Joi.string().required(),
        url: Joi.string().required()
    })).required(),
    createdAt: Joi.date().required()
})


module.exports = {
    userSchema,
    kycSchema
}