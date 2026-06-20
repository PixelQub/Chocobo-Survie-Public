import { ItemStack, EquipmentSlot, GameMode, world } from '@minecraft/server';
// Script pour les effets des fruits Gysahl
world.afterEvents.itemCompleteUse.subscribe(({ source: player, itemStack: item }) => {
  try {
      if (!item) return;

      switch (item.typeId) {

          case "pxq:gysahl.jaune":
              // Effet pour le fruit jaune
              player.addEffect("slow_falling", 5 * 20, { amplifier: 3, showParticles: true });
              break;

          case "pxq:gysahl.or":
              // Séquence d'effets pour le fruit or
              const effectsSequence = [
                  { effect: "slow_falling", duration: 10 * 20, amplifier: 3 },
                  { effect: "absorption", duration: 10 * 20, amplifier: 3 },
                  { effect: "resistance", duration: 10 * 20, amplifier: 3 },
                  { effect: "fire_resistance", duration: 15 * 20, amplifier: 3 }
              ];

              effectsSequence.forEach(effect => {
                  player.addEffect(effect.effect, effect.duration, { amplifier: effect.amplifier, showParticles: true });
              });
              break;

          default:
              // Si l'objet n'est pas un fruit connu
              console.warn(`Objet non pris en charge : ${item.typeId}`);
              break;
      }
  } catch (error) {
      console.warn("Erreur dans le script :", error);
  }
});