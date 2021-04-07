import Joi from '@hapi/joi'

export const registerValidation = (data: any) => {
    const schema = Joi.object({
        name: Joi.string()
            .min(2)
            .required(),
        surname: Joi.string()
            .min(2)
            .required(),
        email: Joi.string()
            .min(6)
            .required()
            .email(),
        password: Joi.string()
            .min(6)
            .required(),
        isMale: Joi.boolean()
            .required()
    })
    return schema.validate(data)
}

export const loginValidation = (data: any) => {
    const schema = Joi.object({
        email: Joi.string()
            .min(6)
            .required()
            .email(),
        password: Joi.string()
            .min(6)
            .required()
    })
    return schema.validate(data)
}
