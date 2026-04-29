// Elf character description for AI image generation
// Based on the classic Elf on the Shelf scout elf appearance

export const getElfCharacterPrompt = (elfName?: string) => `Generate an image with a MINIATURE Christmas scout elf doll named ${elfName || "the elf"}.

*** ABSOLUTE SIZE REQUIREMENT - READ CAREFULLY ***
The elf is a TINY DOLL that is ONLY 11 INCHES TALL (28cm). This is NON-NEGOTIABLE.

MANDATORY SCALE REFERENCES - USE THESE EXACT PROPORTIONS:
- A standard kitchen counter is 36 inches tall. The elf should be LESS THAN 1/3 the height of a counter.
- A standard dining chair seat is 18 inches high. The elf should be about 60% the height of a chair seat.
- A coffee mug is about 4 inches tall. The elf should be only 2.5-3x taller than a mug.
- A standard dinner plate is 10-11 inches across. The elf should be about the same height as the plate diameter.
- A smartphone is about 6 inches tall. The elf should be less than 2x the height of a phone.
- The elf should fit easily in an adult's cupped hands.
- The elf should be SMALLER than a toaster, SMALLER than a cereal box, SMALLER than a laptop.

DO NOT make the elf human-sized. DO NOT make the elf child-sized. The elf is a SMALL TOY DOLL.

The elf appearance:
- A soft beige/tan felt face with simple embroidered features: small black dot eyes, a tiny smile, and rosy cheeks
- A red pointed felt hat with white fuzzy trim at the base
- A red felt one-piece suit/jumpsuit covering the entire body
- A white felt collar around the neck
- Thin red felt arms and legs
- Small felt hands (no fingers detailed)
- The elf has a soft, plush toy appearance but with a mischievous, playful pose
- The elf is NOT a real person - it is clearly a small soft fabric/felt DOLL/TOY`;

// Legacy constant for backwards compatibility
export const ELF_CHARACTER_PROMPT = getElfCharacterPrompt();

export const ELF_SCENE_PROMPT_SUFFIX = `The elf MUST:
- Be positioned naturally in the scene as if it climbed or moved there on its own
- *** CRITICAL ***: Appear as a TINY 11-inch doll - the elf should occupy only a SMALL portion of the image
- Be DWARFED by all furniture and household objects in the scene
- If sitting on a counter, the elf should barely reach 1/3 of the counter height
- Look like a small toy that was caught moving by a security camera
- Have a playful, mischievous positioning (sitting on something, peeking around corners, caught doing something silly)
- Be proportionally CORRECT to real-world object sizes - use counters (36"), chairs (18" seat), mugs (4") as references`;

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

*** FINAL SIZE CHECK - MANDATORY ***
Before generating, verify the elf will be TINY:
- The elf is 11 inches (28cm) tall - a small doll/toy
- If the scene has a counter (36" tall), the elf is less than 1/3 counter height
- If the scene has a chair, the elf is about half the height of the seat
- If there is a mug (4" tall), the elf is only about 3x taller than the mug
- The elf should take up a SMALL portion of the frame, NOT dominate it
- Think of it as photographing a Barbie doll in a real kitchen - that is the scale

DO NOT generate a human-sized or child-sized elf. The elf is a SMALL TOY.

Make this look like authentic security camera footage that caught ${elfName || "the elf"} (a tiny 11-inch doll) moving at night.`;
};

export const generateElfVideoPrompt = (sceneDescription: string, elfName?: string): string => {
  return `Security camera night vision footage of a MINIATURE (11 inches / 28cm tall) Christmas elf DOLL named ${elfName || "the elf"} coming to life and moving in ${sceneDescription}.

*** MANDATORY SIZE - THE ELF IS A TINY TOY ***
The elf is ONLY 11 inches tall - like a small Barbie doll or action figure.
- Kitchen counters are 36" high → elf is LESS than 1/3 counter height
- Chair seats are 18" high → elf is about 60% of seat height
- Coffee mugs are 4" tall → elf is only 2.5-3x mug height
- The elf is a SMALL TOY that fits in cupped hands
- The elf should occupy only a SMALL portion of the video frame
- DO NOT make the elf human-sized or child-sized

The elf is a soft plush felt doll with a red pointed hat, red suit, white collar, and beige felt face with simple embroidered features.

The footage should look like authentic home security camera:
- Night vision green tint or low-light grainy quality
- Timestamp visible in corner (late night hours)
- REC indicator
- ${elfName || "The elf"} moves slowly, carefully, looking around as if checking if anyone is watching
- Subtle, realistic movements - turning head, taking small steps, reaching for something

Camera is static (mounted on wall), only the tiny elf moves. Remember: the elf is a SMALL 11-inch toy doll, dwarfed by all furniture and household items.`;
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
