import { sessionModel } from "../Model/sessionModel.js"

export async function session(user , userType) {
    const sessionid = await sessionModel.create({
        userId: user._id,
        userType
    })

    return sessionid._id
}