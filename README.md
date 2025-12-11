# Elf Sightings App

A magical Christmas app that creates convincing "security camera footage" of your Elf on the Shelf coming to life and moving around your home. Perfect for proving to kids that their elf is real!

## Features

### Photo Sightings
- Upload or capture a photo of any room in your house
- AI generates a composite image with a 10-12 inch elf doll perfectly placed in the scene
- Security camera styling with timestamps, night vision effects, and REC indicators

### Video Sightings
- Upload a scene photo as the base
- Generates an 8-second video of the elf moving through the scene
- Authentic security camera footage look with the elf sneaking around

### Gallery
- Save all your elf sightings
- Favorite your best captures
- Share sightings with family
- Save to your device photo gallery

## How It Works

1. **Home Screen**: Choose between creating a photo or video sighting
2. **Create Sighting**: Take a photo or upload one from your gallery
3. **Optional Description**: Add details about the scene for better elf placement
4. **AI Generation**: The app uses advanced AI to:
   - Analyze your scene for depth and scale
   - Place a properly-sized elf (10-12 inches relative to objects)
   - Apply security camera styling
5. **View & Share**: See your sighting and share with family!

## Tech Stack

- **Expo SDK 53** with React Native
- **Gemini 3 Pro** for image compositing
- **Sora 2 Pro** for video generation
- **React Navigation** for navigation
- **Zustand** for state management with AsyncStorage persistence
- **NativeWind** for styling

## File Structure

```
src/
  screens/
    HomeScreen.tsx        - Main hub with create options
    CreateSightingScreen.tsx - Upload/capture scene
    GeneratingScreen.tsx  - AI generation progress
    GalleryScreen.tsx     - View all sightings
    ViewSightingScreen.tsx - View single sighting
  state/
    elfStore.ts           - Zustand store for sightings
  types/
    elf.ts               - TypeScript types
  utils/
    elfPrompts.ts        - AI prompt templates
  navigation/
    RootNavigator.tsx    - Navigation setup
```

## Notes

- Photo generation takes ~30 seconds
- Video generation takes 2-5 minutes
- The elf character is a generic Christmas scout elf doll (10-12 inches tall)
- Best results with well-lit scenes that have clear reference objects for scale
