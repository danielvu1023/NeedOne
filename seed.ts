
import { createSeedClient } from "@snaplet/seed";
import { copycat } from "@snaplet/copycat";

const main = async () => {
  const seed = await createSeedClient({dryRun: true});

  // Truncate all tables in the database
  await seed.$resetDatabase();
    console.log("Database has been reset.");

  // --- Manually define our data models ---
  const facilityTypes = ["Swimming Pool", "Soccer Field", "Tennis Courts", "Basketball Court", "Community Hall", "Skate Park"];
  const locationPrefixes = ["North Side", "Riverside", "Westside", "East End", "Central", "Oakwood"];
  
  const netOptions = ["permanent", "temporary", "none"];
  const accessOptions = ["public", "private", "members-only"];
  const environmentOptions = ["indoor", "outdoor"];

    await seed.parks((x) => x(10, (i) => { // Let's create 20 parks
    // This helper function for the tags is still perfect.
    const pick = <T>(arr: T[]): T => {
      return arr[copycat.int(i.index, { min: 0, max: arr.length - 1 })];
    };

    return {
      // --- NEW: More random and realistic name generation ---
      // We'll combine a random full name with a park suffix.
      name: `${copycat.fullName(i.index)} Park`,
      
      // --- NEW: A more realistic, single-line address ---
      location: copycat.streetAddress(i.index),

      // This is still perfect.
      courts: copycat.int(i.index, { min: 1, max: 8 }),

      // --- UNCHANGED: Your tags logic is preserved exactly ---
      tags: {
        net: pick(netOptions),
        access: pick(accessOptions),
        environment: pick(environmentOptions),
      },
    };
  }));

  console.log("✅ Parks table populated with random names!");

  process.exit(0);
};

main();