const { getMessaging } = require("firebase-admin/messaging");

exports.sendPushNotification = async ({
    token,
    title,
    body,
    data = {}
}) => {

    try {

        const response = await getMessaging().send({

            token,

            notification: {

                title,

                body

            },

            data

        });

        return response;

    } catch (error) {

        console.log("Firebase Notification Error :", error);

        throw error;

    }

};