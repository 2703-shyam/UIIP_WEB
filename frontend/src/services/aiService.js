/**
 * AI Service Client
 * Connects directly to the local FastAPI Civic Issue Detection API (ai-service at http://localhost:8000)
 */

const AI_BASE_URL = import.meta.env.VITE_AI_SERVICE_URL || 'http://localhost:8000';

export const aiService = {
  /**
   * Check if ai-service is online and model is loaded
   */
  checkHealth: async () => {
    try {
      const res = await fetch(`${AI_BASE_URL}/health`, {
        method: 'GET',
        headers: { Accept: 'application/json' }
      });
      if (!res.ok) return { online: false };
      const data = await res.json();
      return {
        online: data.status === 'ok',
        modelLoaded: data.model_loaded,
        modelName: data.model_name,
        classes: data.classes || []
      };
    } catch {
      return { online: false, error: 'Could not connect to ai-service on http://localhost:8000' };
    }
  },

  /**
   * Classify a captured image using YOLOv8 model in ai-service
   * @param {File | Blob} imageFile
   */
  classifyImage: async (imageFile) => {
    const formData = new FormData();
    const file = imageFile instanceof File ? imageFile : new File([imageFile], 'live_capture.jpg', { type: 'image/jpeg' });
    formData.append('image', file);

    const res = await fetch(`${AI_BASE_URL}/classify`, {
      method: 'POST',
      body: formData
    });

    if (!res.ok) {
      let errorMsg = `Inference request failed with status ${res.status}`;
      try {
        const errorData = await res.json();
        if (errorData.error) errorMsg = errorData.error;
      } catch {
        // fallback error
      }
      throw new Error(errorMsg);
    }

    const data = await res.json();

    return {
      success: true,
      primaryClass: data.primary_class,
      confidence: data.confidence,
      suggestedDepartment: data.suggested_department,
      priority: data.priority,
      needsManualReview: data.needs_manual_review,
      routedTo: data.routed_to,
      reviewReason: data.review_reason,
      detections: data.detections || [],
      imageSize: data.image_size || null,
      thresholdUsed: data.threshold_used,
      inferenceTimeMs: data.inference_time_ms,
      modelName: data.model_name
    };
  }
};
