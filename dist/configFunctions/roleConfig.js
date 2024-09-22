import { ComponentType } from "discord.js";
import { handleErrors } from "../utils/utils.js";
export default async function roleConfig(interaction, client) {
  await interaction.reply(client.handleLanguages("ROLE_CONFIG_PROMPT", client, interaction.guildId));
  const msg = await interaction.fetchReply();
  const filter = (i) => i.customId === "roleConfig" && i.user.id === interaction.user.id;
  try {
    const collector = await msg.awaitMessageComponent({
      filter,
      componentType: ComponentType.SelectMenu,
      time: 60000,
    });
    if (collector.customId === "roleConfig") {
      switch (collector.values[0]) {
        case "memberRole":
          await memberRole(collector, client);
          break;
        case "maleRole":
          await maleRole(collector, client);
          break;
        case "femaleRole":
          await femaleRole(collector, client);
          break;
        case "muteRole":
          await muteRole(collector, client);
          break;
        case "djRole":
          await djRole(collector, client);
          break;
        case "dayColorRole":
          await dayColorRole(collector, client);
      }
    }
  } catch (error) {
    await handleErrors(client, error, "roleConfig.ts", interaction);
  }
}
async function memberRole(interaction, client) {
  const raw = client.handleLanguages("MEMBER_ROLE_PROMPT", client, interaction.guildId);
  raw.components[0].components[0].default_values.shift();
  const memberRole = client.guildsConfig.get(interaction.guild.id)?.config.memberRole;
  if (memberRole) {
    raw.components[0].components[0].default_values.push({
      id: memberRole,
      type: "role",
    });
  }
  await interaction.reply(raw);
  const msg = await interaction.fetchReply();
  const filter = (i) => i.user.id === interaction.user.id;
  try {
    const collector = await msg.awaitMessageComponent({
      filter: filter,
      componentType: ComponentType.RoleSelect,
      time: 60000,
    });
    if (collector) {
      const data = collector.values[0];
      const role = interaction.guild.roles.cache.get(data);
      const config = {
        $set: {
          "config.memberRole": role.id,
        },
      };
      await client.updateGuildConfig({
        guildId: interaction.guild.id,
        config,
      });
      await collector.reply({
        content: client.handleLanguages("MEMBER_ROLE_SUCCESS", client, interaction.guildId),
        ephemeral: true,
      });
    }
  } catch (error) {
    await handleErrors(client, error, "roleConfig.ts", interaction);
  }
}
async function maleRole(interaction, client) {
  const raw = client.handleLanguages("MALE_ROLE_PROMPT", client, interaction.guildId);
  raw.components[0].components[0].default_values.shift();
  const maleRole = client.guildsConfig.get(interaction.guild.id)?.config.maleRole;
  if (maleRole) {
    raw.components[0].components[0].default_values.push({
      id: maleRole,
      type: "role",
    });
  }
  await interaction.reply(raw);
  const msg = await interaction.fetchReply();
  const filter = (i) => i.user.id === interaction.user.id;
  try {
    const collector = await msg.awaitMessageComponent({
      filter: filter,
      componentType: ComponentType.RoleSelect,
      time: 60000,
    });
    if (collector) {
      const data = collector.values[0];
      const role = interaction.guild.roles.cache.get(data);
      const config = {
        $set: {
          "config.maleRole": role.id,
        },
      };
      await client.updateGuildConfig({
        guildId: interaction.guild.id,
        config,
      });
      await collector.reply({
        content: client.handleLanguages("MALE_ROLE_SUCCESS", client, interaction.guildId),
        ephemeral: true,
      });
    }
  } catch (error) {
    await handleErrors(client, error, "roleConfig.ts", interaction);
  }
}
async function femaleRole(interaction, client) {
  const raw = client.handleLanguages("FEMALE_ROLE_PROMPT", client, interaction.guildId);
  raw.components[0].components[0].default_values.shift();
  const femaleRole = client.guildsConfig.get(interaction.guild.id)?.config.femaleRole;
  if (femaleRole) {
    raw.components[0].components[0].default_values.push({
      id: femaleRole,
      type: "role",
    });
  }
  await interaction.reply(raw);
  const msg = await interaction.fetchReply();
  const filter = (i) => i.user.id === interaction.user.id;
  try {
    const collector = await msg.awaitMessageComponent({
      filter: filter,
      componentType: ComponentType.RoleSelect,
      time: 60000,
    });
    if (collector) {
      const data = collector.values[0];
      const role = interaction.guild.roles.cache.get(data);
      const config = {
        $set: {
          "config.femaleRole": role.id,
        },
      };
      await client.updateGuildConfig({
        guildId: interaction.guild.id,
        config,
      });
      await collector.reply({
        content: client.handleLanguages("FEMALE_ROLE_SUCCESS", client, interaction.guildId),
        ephemeral: true,
      });
    }
  } catch (error) {
    await handleErrors(client, error, "roleConfig.ts", interaction);
  }
}
async function muteRole(interaction, client) {
  const raw = client.handleLanguages("MUTE_ROLE_PROMPT", client, interaction.guildId);
  raw.components[0].components[0].default_values.shift();
  const muteRole = client.guildsConfig.get(interaction.guild.id)?.config.muteRole;
  if (muteRole) {
    raw.components[0].components[0].default_values.push({
      id: muteRole,
      type: "role",
    });
  }
  await interaction.reply(raw);
  const msg = await interaction.fetchReply();
  const filter = (i) => i.user.id === interaction.user.id;
  try {
    const collector = await msg.awaitMessageComponent({
      filter: filter,
      componentType: ComponentType.RoleSelect,
      time: 60000,
    });
    if (collector) {
      const data = collector.values[0];
      const role = interaction.guild.roles.cache.get(data);
      const config = {
        $set: {
          "config.muteRole": role.id,
        },
      };
      await client.updateGuildConfig({
        guildId: interaction.guild.id,
        config,
      });
      await collector.reply({
        content: client.handleLanguages("MUTE_ROLE_SUCCESS", client, interaction.guildId),
        ephemeral: true,
      });
    }
  } catch (error) {
    await handleErrors(client, error, "roleConfig.ts", interaction);
  }
}
async function djRole(interaction, client) {
  const raw = client.handleLanguages("DJ_ROLE_PROMPT", client, interaction.guildId);
  raw.components[0].components[0].default_values.shift();
  const djRole = client.guildsConfig.get(interaction.guild.id)?.config.djRole;
  if (djRole) {
    raw.components[0].components[0].default_values.push({
      id: djRole,
      type: "role",
    });
  }
  await interaction.reply(raw);
  const msg = await interaction.fetchReply();
  const filter = (i) => i.user.id === interaction.user.id;
  try {
    const collector = await msg.awaitMessageComponent({
      filter: filter,
      componentType: ComponentType.RoleSelect,
      time: 60000,
    });
    if (collector) {
      const data = collector.values[0];
      const role = interaction.guild.roles.cache.get(data);
      const config = {
        $set: {
          "config.djRole": role.id,
        },
      };
      await client.updateGuildConfig({
        guildId: interaction.guild.id,
        config,
      });
      await collector.reply({
        content: client.handleLanguages("DJ_ROLE_SUCCESS", client, interaction.guildId),
        ephemeral: true,
      });
    }
  } catch (error) {
    await handleErrors(client, error, "roleConfig.ts", interaction);
  }
}
async function dayColorRole(interaction, client) {
  const raw = client.handleLanguages("COLOUR_OF_THE_DAY_ROLE_PROMPT", client, interaction.guildId);
  raw.components[0].components[0].default_values.shift();
  const dayColorRole = client.guildsConfig.get(interaction.guild.id)?.config.roleOfTheDay;
  if (dayColorRole) {
    raw.components[0].components[0].default_values.push({
      id: dayColorRole,
      type: "role",
    });
  }
  await interaction.reply(raw);
  const msg = await interaction.fetchReply();
  const filter = (i) => i.user.id === interaction.user.id;
  try {
    const collector = await msg.awaitMessageComponent({
      filter: filter,
      componentType: ComponentType.RoleSelect,
      time: 60000,
    });
    if (collector) {
      const data = collector.values[0];
      const role = interaction.guild.roles.cache.get(data);
      const config = {
        $set: {
          "config.roleOfTheDay": role.id,
        },
      };
      await client.updateGuildConfig({
        guildId: interaction.guild.id,
        config,
      });
      await collector.reply({
        content: client.handleLanguages("COLOUR_OF_THE_DAY_ROLE_SUCCESS", client, interaction.guildId),
        ephemeral: true,
      });
    }
  } catch (error) {
    await handleErrors(client, error, "roleConfig.ts", interaction);
  }
}
//# sourceMappingURL=roleConfig.js.map
