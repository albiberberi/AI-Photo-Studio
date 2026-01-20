// src/fal-service.ts
import { fal } from "@fal-ai/client";

// Configure fal with your API key
fal.config({
  credentials: import.meta.env.VITE_FAL_KEY,
});

export interface GenerateImageParams {
  imageUrls: string[];
  prompt: string;
  size?: "square_hd" | "square" | "portrait_4_3" | "portrait_16_9" | "landscape_4_3" | "landscape_16_9";
  quality?: string;
  sharpness?: string;
  orientation?: string;
  lighting?: string;
  model?: string;
  maskUrl?: string; // New: For inpainting
}

export interface GenerateImageResult {
  imageUrl: string;
  success: boolean;
  error?: string;
}

// Image editing using various models
interface FalModelInput {
  prompt: string;
  image_urls?: string[];
  image_url?: string;
  strength?: number;
  image_size?: string | { width: number; height: number };
  mask_url?: string; // New: For inpainting
  guidance_scale?: number;
}

// Image editing using various models
export async function generateProductImage(
  params: GenerateImageParams
): Promise<GenerateImageResult> {
  console.log('🚀 Starting Image Generation with params:', params);
  console.log('🔑 API Key:', import.meta.env.VITE_FAL_KEY);
  console.log('📸 Image URLs:', params.imageUrls);
  console.log('📝 Prompt:', params.prompt);
  console.log('🤖 Model:', params.model || "Default (Gemini)");
  
  try {
    // If a mask is provided, we MUST use an inpainting model.
    // We override the selected model to use the robust Flux Inpainting model.
    // unless the user explicitly selected another known inpainting model (future proofing).
    let model = params.model || "fal-ai/gemini-25-flash-image/edit";
    
    // Construct a rich prompt with all settings
    let richPrompt = params.prompt;
    const settings = [];
    if (params.lighting) settings.push(`${params.lighting} lighting`);
    if (params.quality) settings.push(`${params.quality} quality`);
    if (params.sharpness) settings.push(`${params.sharpness} sharpness`);
    if (params.orientation) settings.push(`${params.orientation} orientation`);
    
    if (settings.length > 0) {
      richPrompt += ` . Style details: ${settings.join(', ')}.`;
    }
    
    console.log('✨ Rich Prompt:', richPrompt);

    const input: FalModelInput = {
      prompt: richPrompt,
    };

    // INPAINTING / SELECT & EDIT FLOW
    if (params.maskUrl) {
      console.log('🎭 Mask detected!');
      
      // If the user explicitly selected Nano Banana Pro, valid try using it (experimental support for mask)
      // Otherwise, default to the robust Flux Inpainting for selection-based edits.
      if (model === "fal-ai/nano-banana-pro/edit") {
           console.log("🍌 Using Nano Banana Pro with mask");
           // Keep model as is
      } else {
           console.log("Process: Switching to Flux Inpainting workflow.");
           model = "fal-ai/flux-general/inpainting"; 
      }
      
      // Ensure local image is uploaded
      const publicImageUrl = await ensureImageUrl(params.imageUrls[0]);
      
      // Reverting to Fast SDXL Inpainting for replacement tasks.
      // Flux Inpainting was ignoring "replace" prompts (acting as pure eraser).
      // SDXL is generally more obedient for object replacement (e.g. "red apple").
      // Since we fixed the mask (multi-point), SDXL should perform well now.
      console.log("Process: Switching to Fast SDXL Inpainting for adherence.");
      model = "fal-ai/fast-sdxl/inpainting"; 
      
      // publicImageUrl is already declared above
      input.image_url = publicImageUrl; 
      input.mask_url = params.maskUrl;
      input.prompt = params.prompt;
      
      // SDXL Inpainting settings
      input.strength = 1.0; 
      // input.guidance_scale = 7.5; // Default is usually fine for SDXL
    } 
    else {
        // STANDARD EDIT FLOW
        console.log(`📡 Standard Edit Mode: ${model}`);

        // Handle Size Mapping (only for generation/edit, not strictly needed for inpainting but harmless)
        if (params.size) {
        const sizeMap: Record<string, { width: number; height: number }> = {
            square_hd: { width: 1024, height: 1024 },
            square: { width: 512, height: 512 },
            portrait_4_3: { width: 768, height: 1024 },
            portrait_16_9: { width: 576, height: 1024 },
            landscape_4_3: { width: 1024, height: 768 },
            landscape_16_9: { width: 1024, height: 576 },
        };
        
        if (sizeMap[params.size]) {
            input.image_size = sizeMap[params.size];
        }
        }

        // Prepare input based on model signature
        if (
        model === "fal-ai/gemini-25-flash-image/edit" || 
        model === "fal-ai/flux-2-pro/edit" || 
        model === "fal-ai/nano-banana-pro/edit"
        ) {
        input.image_urls = params.imageUrls;
        } else {
        // Fallback for other models 
        if (params.imageUrls.length > 0) {
            input.image_url = params.imageUrls[0];
        }
        input.strength = 0.85; 
        }
    }

    const result = await fal.subscribe(model, {
      input,
      logs: true,
      onQueueUpdate: (update) => {
        console.log('📊 Queue update:', update);
      },
    });

    console.log('✅ API call successful!');
    console.log('📦 Full result:', JSON.stringify(result, null, 2));
    console.log('📦 Result.data:', result.data);
    
    // Try to find the image URL in different possible locations
    let imageUrl = null;
    
    if (result.data.images?.[0]?.url) {
      imageUrl = result.data.images[0].url;
      console.log('✅ Found image at result.data.images[0].url');
    }
    
    if (!imageUrl) {
      console.error('❌ Could not find image URL in response');
      return {
        imageUrl: "",
        success: false,
        error: "No image URL found in response",
      };
    }
    
    return {
      imageUrl: imageUrl,
      success: true,
    };
  } catch (err: unknown) {
    const error = err as {
      name?: string;
      message?: string;
      stack?: string;
      body?: { detail?: string };
      response?: unknown;
    };
    console.error('❌ FULL ERROR:', error);
    console.error('❌ Error name:', error?.name);
    console.error('❌ Error message:', error?.message);
    console.error('❌ Error stack:', error?.stack);
    
    if (error?.body) {
      console.error('❌ Error body:', error.body);
    }
    
    if (error?.response) {
      console.error('❌ Error response:', error.response);
    }
    
    let errorMessage = "Unknown error";
    if (error?.message) {
      errorMessage = error.message;
    } else if (error?.body?.detail) {
      errorMessage = error.body.detail;
    } else if (typeof err === 'string') {
      errorMessage = err;
    }
    
    return {
      imageUrl: "",
      success: false,
      error: errorMessage,
    };
  }
}

// Background removal
export async function removeBackground(
  imageUrl: string
): Promise<GenerateImageResult> {
  try {
    const result = await fal.subscribe("fal-ai/imageutils/rembg", {
      input: {
        image_url: imageUrl,
      },
    });

    return {
      imageUrl: result.data.image.url,
      success: true,
    };
  } catch (error) {
    console.error("Error removing background:", error);
    return {
      imageUrl: "",
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Upscale image
export async function upscaleImage(
  imageUrl: string,
  scaleFactor: number = 2
): Promise<GenerateImageResult> {
  try {
    const result = await fal.subscribe("fal-ai/clarity-upscaler", {
      input: {
        image_url: imageUrl,
        upscale_factor: scaleFactor,
      },
    });

    return {
      imageUrl: result.data.image.url,
      success: true,
    };
  } catch (error) {
    console.error("Error upscaling image:", error);
    return {
      imageUrl: "",
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

const ensureImageUrl = async (url: string): Promise<string> => {
  if (url.startsWith('data:')) {
    try {
      // Convert base64/data URI to Blob
      const response = await fetch(url);
      const blob = await response.blob();
      // Upload to Fal storage
      const uploadedUrl = await fal.storage.upload(blob);
      return uploadedUrl;
    } catch (error) {
      console.error('Error uploading data URI to Fal storage:', error);
      throw new Error('Failed to upload local image for processing');
    }
  }
  return url;
};

// Response structure for various Fal models
interface FalImageResponse {
  image?: { url: string };
  images?: { url: string }[];
  mask?: { url: string };
  masks?: { url: string }[];
}

// Segment object using SAM 2 (State of the Art)
export async function segmentObject(
  imageUrl: string,
  points: { x: number; y: number }[]
): Promise<GenerateImageResult> {
  try {
    console.log('🔍 Segmenting object at points:', points);
    
    // Ensure we have a public URL
    const publicImageUrl = await ensureImageUrl(imageUrl);
    console.log('🌐 Using public image URL:', publicImageUrl);

    // Using fal-ai/sam2/image which is more robust
    const result = await fal.subscribe("fal-ai/sam2/image", {
      input: {
        image_url: publicImageUrl,
        prompts: points.map(p => ({
             type: "point", 
             x: p.x,
             y: p.y,
             label: "1" as const // Standard foreground label
        }))
      },
      logs: true,
    });

    console.log('📦 SAM 2 result:', result.data);

    // SAM 2 usually returns a mask image directly or in a similar structure
    const data = result.data as FalImageResponse;
    const maskUrl = 
      data.image?.url ||
      data.mask?.url ||
      data.masks?.[0]?.url;

    if (!maskUrl) {
      console.error('❌ No mask found in result');
      throw new Error("No mask generated");
    }

    return {
      imageUrl: maskUrl,
      success: true,
    };
  } catch (error) {
    console.error("Error segmenting object:", error);
    return {
      imageUrl: "",
      success: false,
      error: error instanceof Error ? error.message : "Errors selecting object",
    };
  }
}

// Erase object using Inpainting
export async function eraseObject(
  imageUrl: string,
  maskUrl: string
): Promise<GenerateImageResult> {
  try {
    console.log('🧹 Erasing object with mask:', maskUrl);
    // Ensure we have a public URL for the base image too
    const publicImageUrl = await ensureImageUrl(imageUrl);
    
    // Using Flux General Inpainting (Dev) which is robust and supports masking
    // This is often better for "erasure" than Pro Fill if prompt is generic.
    const result = await fal.subscribe("fal-ai/flux-general/inpainting", {
      input: {
        image_url: publicImageUrl,
        mask_url: maskUrl,
        prompt: "clean background, empty space, seamless removal of object, high quality",
        strength: 1.0, 
        guidance_scale: 3.5 // slightly lower guidance to allow blending
      },
      logs: true,
    });
    
    // Check for various result formats safely
    const data = result.data as FalImageResponse;
    const outputUrl = 
      data.image?.url || 
      data.images?.[0]?.url;

    if (!outputUrl) {
       throw new Error("No image generated from erase");
    }

    return {
      imageUrl: outputUrl,
      success: true,
    };
  } catch (error) {
    console.error("Error erasing object:", error);
    return {
      imageUrl: "",
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}