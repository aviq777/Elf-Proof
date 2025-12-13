// Elf character description for AI image generation
// Based on the classic Elf on the Shelf scout elf appearance

export const getElfCharacterPrompt = (elfName?: string) => `A TINY Christmas scout elf doll named ${elfName || "the elf"}.

CRITICAL SIZE REQUIREMENT - THE ELF MUST BE VERY SMALL:
- The elf is EXACTLY 11 inches tall (about 28cm) - roughly the size of a Barbie doll
- For scale reference: the elf should be about the height of a standard dinner plate diameter
- The elf should be MUCH smaller than common household objects - smaller than a coffee mug's height when sitting
- A human hand would easily wrap around the entire elf
- The elf should look TINY compared to furniture, appliances, and room features

The elf appearance:
- A soft beige/tan felt face with simple embroidered features: small black dot eyes, a tiny smile, and rosy cheeks
- A red pointed felt hat with white fuzzy trim at the base
- A red felt one-piece suit/jumpsuit covering the entire body
- A white felt collar around the neck
- Thin red felt arms and legs
- Small felt hands (no fingers detailed)
- The elf has a soft, plush toy appearance but with a mischievous, playful pose
- The elf is NOT a real person - it is clearly a soft fabric/felt doll`;

// Legacy constant for backwards compatibility
export const ELF_CHARACTER_PROMPT = getElfCharacterPrompt();

export const ELF_SCENE_PROMPT_SUFFIX = `The elf should:
- Be positioned naturally in the scene as if it climbed or moved there on its own
- IMPORTANT: Appear VERY SMALL - only 11 inches tall (28cm), like a small doll sitting on furniture
- The elf should be DWARFED by household objects - much smaller than chairs, lamps, appliances
- Look like a caught-in-the-act moment, as if photographed by a security camera
- Have a playful, mischievous positioning (sitting on something, peeking around corners, caught doing something silly)`;

export const SECURITY_CAMERA_STYLE = `Style the image like security camera or home surveillance footage:
- Slight wide-angle distortion
- Visible timestamp in corner showing late night time (between 11:00 PM and 3:00 AM)
- Night vision green tint OR grainy low-light appearance
- REC indicator in corner
- Motion detection box highlighting the elf`;

export const generateElfCompositePrompt = (sceneDescription: string, elfName?: string): string => {
  return `${getElfCharacterPrompt(elfName)}

Scene: ${sceneDescription}

${ELF_SCENE_PROMPT_SUFFIX}

${SECURITY_CAMERA_STYLE}

Make this look like authentic security camera footage that caught ${elfName || "the elf"} moving at night.

EXTREMELY IMPORTANT - SIZE MATTERS: The elf MUST be tiny - only 11 inches tall. Use real-world scale references in the scene (countertops are ~36 inches high, chairs are ~18 inches to seat, mugs are ~4 inches tall). The elf should be smaller than most objects in the scene. If there's a coffee mug, the elf should be only about 2-3x the height of the mug.`;
};

export const generateElfVideoPrompt = (sceneDescription: string, elfName?: string): string => {
  return `Security camera night vision footage of a TINY (exactly 11 inches tall) Christmas elf doll named ${elfName || "the elf"} coming to life and moving in ${sceneDescription}.

CRITICAL SIZE: The elf is ONLY 11 inches tall - like a small Barbie doll. The elf must appear VERY SMALL compared to all furniture and objects. For reference: kitchen counters are 36" high, so the elf is less than 1/3 the height of a counter. The elf should look tiny and doll-like, dwarfed by normal household items.

The elf is a soft plush felt doll with a red pointed hat, red suit, white collar, and beige felt face with simple embroidered features.

The footage should look like authentic home security camera:
- Night vision green tint or low-light grainy quality
- Timestamp visible in corner (late night hours)
- REC indicator
- ${elfName || "The elf"} moves slowly, carefully, looking around as if checking if anyone is watching
- Subtle, realistic movements - turning head, taking small steps, reaching for something

Camera is static (mounted on wall), only the tiny elf moves. The elf is proportionally VERY SMALL compared to furniture and objects - clearly only 11 inches tall, smaller than most household items.`;
};

// Generate random timestamp for security camera effect
export const generateSecurityTimestamp = (): string => {
  const hour = Math.floor(Math.random() * 5) + 23; // 11 PM to 3 AM
  const adjustedHour = hour > 23 ? hour - 24 : hour;
  const minute = Math.floor(Math.random() * 60);
  const second = Math.floor(Math.random() * 60);
  const month = 12;
  const day = Math.floor(Math.random() * 20) + 1;
  const year = 2024;

  const hourStr = adjustedHour.toString().padStart(2, "0");
  const minStr = minute.toString().padStart(2, "0");
  const secStr = second.toString().padStart(2, "0");
  const dayStr = day.toString().padStart(2, "0");

  return `${month}/${dayStr}/${year} ${hourStr}:${minStr}:${secStr}`;
};
