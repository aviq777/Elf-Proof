// Elf character description for AI image generation
// Based on the classic Elf on the Shelf scout elf appearance

export const ELF_CHARACTER_PROMPT = `A small Christmas scout elf doll, exactly 10-12 inches tall. The elf has:
- A soft beige/tan felt face with simple embroidered features: small black dot eyes, a tiny smile, and rosy cheeks
- A red pointed felt hat with white fuzzy trim at the base
- A red felt one-piece suit/jumpsuit covering the entire body
- A white felt collar around the neck
- Thin red felt arms and legs
- Small felt hands (no fingers detailed)
- The elf has a soft, plush toy appearance but with a mischievous, playful pose
- The elf is NOT a real person - it is clearly a soft fabric/felt doll`;

export const ELF_SCENE_PROMPT_SUFFIX = `The elf should:
- Be positioned naturally in the scene as if it climbed or moved there on its own
- Appear to be the correct scale (10-12 inches / about 25-30cm tall) relative to surrounding objects
- Look like a caught-in-the-act moment, as if photographed by a security camera
- Have a playful, mischievous positioning (sitting on something, peeking around corners, caught doing something silly)`;

export const SECURITY_CAMERA_STYLE = `Style the image like security camera or home surveillance footage:
- Slight wide-angle distortion
- Visible timestamp in corner showing late night time (between 11:00 PM and 3:00 AM)
- Night vision green tint OR grainy low-light appearance
- REC indicator in corner
- Motion detection box highlighting the elf`;

export const generateElfCompositePrompt = (sceneDescription: string): string => {
  return `${ELF_CHARACTER_PROMPT}

Scene: ${sceneDescription}

${ELF_SCENE_PROMPT_SUFFIX}

${SECURITY_CAMERA_STYLE}

Make this look like authentic security camera footage that caught the elf moving at night. The elf should appear real but small, clearly the 10-12 inch plush doll size relative to household objects.`;
};

export const generateElfVideoPrompt = (sceneDescription: string): string => {
  return `Security camera night vision footage of a small (10-12 inch tall) Christmas elf doll coming to life and moving in ${sceneDescription}.

The elf is a soft plush felt doll with a red pointed hat, red suit, white collar, and beige felt face with simple embroidered features.

The footage should look like authentic home security camera:
- Night vision green tint or low-light grainy quality
- Timestamp visible in corner (late night hours)
- REC indicator
- The elf moves slowly, carefully, looking around as if checking if anyone is watching
- Subtle, realistic movements - turning head, taking small steps, reaching for something

Camera is static (mounted on wall), only the elf moves. The elf is proportionally small compared to furniture and objects - clearly 10-12 inches tall.`;
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
