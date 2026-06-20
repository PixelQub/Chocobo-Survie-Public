import { ItemStack, EquipmentSlot, GameMode, world } from '@minecraft/server';

// Random integer generator
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const maxGrowth = 4; // Maximum growth stage for the crop

const dropLootOnPhaseChange = (block, dimension) => {
  try {
    const blockId = block.typeId;
    const dropLocation = {
      x: block.location.x + 0.5,
      y: block.location.y + 0.5,
      z: block.location.z + 0.5,
    };

    let itemToDrop = null;

// Determine the loot based on the block type
if (blockId === "pxq:gysahl_jaune") {
  itemToDrop = "pxq:gysahl.jaune";
}


    // Drop the item if valid
    if (itemToDrop) {
      dimension.spawnItem(new ItemStack(itemToDrop, 1), dropLocation);
    }
  } catch (error) {
    console.error("Error in dropLootOnPhaseChange:", error);
  }
};

const CustomCropGrowthBlockComponent = {
  onRandomTick({ block, dimension }) {
    const growthChance = 1 / 4; // 25% chance to grow
    if (Math.random() > growthChance) return;

    const currentGrowth = block.permutation.getState("pxq:sequence.plante");

    if (currentGrowth < maxGrowth) {
      block.setPermutation(
        block.permutation.withState("pxq:sequence.plante", currentGrowth + 1)
      );
    } else if (currentGrowth === maxGrowth) {
      // Drop loot when resetting the crop growth back to 0
      dropLootOnPhaseChange(block, dimension);

      // Reset to 0 after reaching max growth
      block.setPermutation(block.permutation.withState("pxq:sequence.plante", 0));
    }
  },

  onPlayerInteract({ block, dimension, player }) {
    try {
      if (!player) {
        console.error("Player is undefined");
        return;
      }

      const equippable = player.getComponent("minecraft:equippable");
      if (!equippable) {
        console.error("Equippable component not found");
        return;
      }

      const mainhand = equippable.getEquipmentSlot(EquipmentSlot.Mainhand);
      if (!mainhand || !mainhand.hasItem() || mainhand.typeId !== "minecraft:bone_meal") {
        console.error("Player does not have bone meal in hand");
        return;
      }

      const currentGrowth = block.permutation.getState("pxq:sequence.plante");
      if (typeof currentGrowth !== "number") {
        console.error("Current growth state is invalid");
        return;
      }

      if (currentGrowth < maxGrowth) {
        const newGrowth = Math.min(
          currentGrowth + randomInt(1, maxGrowth - currentGrowth),
          maxGrowth
        );
        block.setPermutation(
          block.permutation.withState("pxq:sequence.plante", newGrowth)
        );
      } else if (currentGrowth === maxGrowth) {
        // Drop loot when using bone meal at max growth
        dropLootOnPhaseChange(block, dimension);

        // Reset to 0 when using bone meal at max growth
        block.setPermutation(block.permutation.withState("pxq:sequence.plante", 0));
      }

      // Ensure block location is valid
      const effectLocation = block.location
        ? {
            x: block.location.x + 0.5,
            y: block.location.y + 0.5,
            z: block.location.z + 0.5,
          }
        : null;

      if (!effectLocation) {
        console.error("Block location is invalid or undefined.");
        return;
      }

      // Ensure dimension is valid
      if (!dimension) {
        console.error("Dimension is invalid or undefined.");
        return;
      }

      // Play sound and spawn particle effects
      dimension.playSound("item.bone_meal.use", effectLocation);
      dimension.spawnParticle("minecraft:crop_growth_emitter", effectLocation);

      if (player.getGameMode() !== GameMode.creative) {
        // Reduce bone meal stack
        if (mainhand.amount > 1) mainhand.amount--;
        else mainhand.setItem(undefined);
      }
    } catch (error) {
      console.error("Error in onPlayerInteract:", error);
    }
  },
};

// Register the custom crop component
world.beforeEvents.worldInitialize.subscribe(({ blockComponentRegistry }) => {
  blockComponentRegistry.registerCustomComponent(
    "pxq:custom_crop_growth",
    CustomCropGrowthBlockComponent
  );
});
