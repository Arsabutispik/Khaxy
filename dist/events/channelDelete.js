import openMailsSchema from "../schemas/openMailsSchema.js";
export default async (_client, channel) => {
  const data = await openMailsSchema.findOne({
    channelID: channel.id,
  });
  if (data) {
    await openMailsSchema.findOneAndDelete({
      channelID: channel.id,
    });
  }
};
//# sourceMappingURL=channelDelete.js.map
