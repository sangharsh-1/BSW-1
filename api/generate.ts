// This is a Vercel Edge Function for secure AI image generation.
// It receives image data from the frontend, calls the Gemini API with a
// secure API key, and returns the generated image data.
// Place this file in the `/api` directory.

import { GoogleGenAI, Modality } from '@google/genai';

export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  // 1. Only allow POST requests
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  
  const { API_KEY } = process.env;

  // 2. Check for the API key
  if (!API_KEY) {
    console.error("Server configuration error: API_KEY is not set.");
    return new Response(JSON.stringify({ error: 'Server configuration error.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    // 3. Parse request body
    const { base64Data, mimeType } = await req.json();
    if (!base64Data || !mimeType) {
        return new Response(JSON.stringify({ error: 'Missing base64Data or mimeType in request body.' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    // 4. Call the Gemini API
    const ai = new GoogleGenAI({ apiKey: API_KEY });

    const imagePart = {
      inlineData: { data: base64Data, mimeType: mimeType },
    };
    const textPart = {
      text: "Convert this image into a 3D Pixar-style portrait. Use the uploaded image as a reference for faces, poses, and lighting. Transform all people into Pixar or Disney-style 3D animated characters, keeping their facial features, skin tones, and expressions recognizable but stylized. The final image should have soft, cinematic warm lighting, smooth textures, and detailed, glossy eyes, resembling a high-quality 8K still frame from a Pixar movie. Maintain emotional realism and avoid cartoonish exaggeration. Use a shallow depth of field and soft background blur to enhance the cinematic feel, without drastically changing the original setting.",
    };

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [imagePart, textPart] },
      config: {
        responseModalities: [Modality.IMAGE],
      },
    });

    // 5. Extract the generated image from the response
    let imagePartFound = null;
    const candidate = response.candidates?.[0];
    if (candidate?.content?.parts) {
      for (const part of candidate.content.parts) {
        if (part.inlineData) {
          imagePartFound = part;
          break;
        }
      }
    }

    if (imagePartFound?.inlineData?.data) {
      const base64ImageBytes: string = imagePartFound.inlineData.data;
      const generatedMimeType = imagePartFound.inlineData.mimeType || 'image/png';
      const generatedImageUrl = `data:${generatedMimeType};base64,${base64ImageBytes}`;
      
      // 6. Send the successful response back to the frontend
      return new Response(JSON.stringify({ generatedImageUrl }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } else {
      // If no image part is found, something went wrong with the AI generation
      console.error("Full API Response on failure:", JSON.stringify(response, null, 2));
      throw new Error('Could not extract the generated image from the API response.');
    }

  } catch (error: any) {
    console.error("Error in /api/generate:", error);
    return new Response(JSON.stringify({ error: error.message || 'An unknown error occurred.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}