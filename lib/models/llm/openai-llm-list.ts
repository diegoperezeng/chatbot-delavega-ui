import { LLM } from "@/types"

const OPENAI_PLATORM_LINK = "https://platform.openai.com/docs/overview"

// OpenAI Models (UPDATED 1/25/24) -----------------------------
const GPT4o: LLM = {
  modelId: "gpt-4o",
  modelName: "GPT-4o",
  provider: "openai",
  hostedId: "gpt-4o",
  platformLink: OPENAI_PLATORM_LINK,
  imageInput: true,
  pricing: {
    currency: "USD",
    unit: "1M tokens",
    inputCost: 2,
    outputCost: 10
  }
}

// GPT-4 Turbo (UPDATED 1/25/24)
const GPT4Turbo: LLM = {
  modelId: "gpt-4-turbo",
  modelName: "GPT-4 Turbo",
  provider: "openai",
  hostedId: "gpt-4-turbo-preview",
  platformLink: OPENAI_PLATORM_LINK,
  imageInput: true,
  pricing: {
    currency: "USD",
    unit: "1M tokens",
    inputCost: 10,
    outputCost: 30
  }
}

// GPT-4 Vision (UPDATED 12/18/23)
const GPT4Vision: LLM = {
  modelId: "gpt-4-vision-preview",
  modelName: "GPT-4 Vision",
  provider: "openai",
  hostedId: "gpt-4-vision-preview",
  platformLink: OPENAI_PLATORM_LINK,
  imageInput: true,
  pricing: {
    currency: "USD",
    unit: "1M tokens",
    inputCost: 10
  }
}

// GPT-4 (UPDATED 1/29/24)
const GPT4: LLM = {
  modelId: "gpt-4",
  modelName: "GPT-4",
  provider: "openai",
  hostedId: "gpt-4",
  platformLink: OPENAI_PLATORM_LINK,
  imageInput: false,
  pricing: {
    currency: "USD",
    unit: "1M tokens",
    inputCost: 30,
    outputCost: 60
  }
}

// GPT-3.5 Turbo (UPDATED 1/25/24)
const GPT3_5Turbo: LLM = {
  modelId: "gpt-3.5-turbo",
  modelName: "GPT-3.5 Turbo",
  provider: "openai",
  hostedId: "gpt-3.5-turbo",
  platformLink: OPENAI_PLATORM_LINK,
  imageInput: false,
  pricing: {
    currency: "USD",
    unit: "1M tokens",
    inputCost: 0,
    outputCost: 1
  }
}

const GPT41: LLM = {
  modelId: "gpt-4.1",
  modelName: "GPT-4.1",
  provider: "openai",
  hostedId: "gpt-4.1-2025-04-14",
  platformLink: OPENAI_PLATORM_LINK,
  imageInput: true,
  pricing: {
    currency: "USD",
    unit: "1M tokens",
    inputCost: 2,
    outputCost: 8
  }
}

const GPT41Mini: LLM = {
  modelId: "gpt-4.1-mini",
  modelName: "GPT-4.1 Mini",
  provider: "openai",
  hostedId: "gpt-4.1-mini-2025-04-14",
  platformLink: OPENAI_PLATORM_LINK,
  imageInput: true,
  pricing: {
    currency: "USD",
    unit: "1M tokens",
    inputCost: 0,
    outputCost: 1
  }
}

const GPT41Nano: LLM = {
  modelId: "gpt-4.1-nano",
  modelName: "GPT-4.1 Nano",
  provider: "openai",
  hostedId: "gpt-4.1-nano-2025-04-14",
  platformLink: OPENAI_PLATORM_LINK,
  imageInput: true,
  pricing: {
    currency: "USD",
    unit: "1M tokens",
    inputCost: 0,
    outputCost: 0
  }
}

const GPT45Preview: LLM = {
  modelId: "gpt-4.5-preview",
  modelName: "GPT-4.5 Preview",
  provider: "openai",
  hostedId: "gpt-4.5-preview-2025-02-27",
  platformLink: OPENAI_PLATORM_LINK,
  imageInput: true,
  pricing: {
    currency: "USD",
    unit: "1M tokens",
    inputCost: 75,
    outputCost: 150
  }
}

const GPT4oAudioPreview: LLM = {
  modelId: "gpt-4o-audio-preview",
  modelName: "GPT-4o Audio Preview",
  provider: "openai",
  hostedId: "gpt-4o-audio-preview-2024-12-17",
  platformLink: OPENAI_PLATORM_LINK,
  imageInput: true,
  pricing: {
    currency: "USD",
    unit: "1M tokens",
    inputCost: 2,
    outputCost: 10
  }
}

const GPT4oRealtimePreview: LLM = {
  modelId: "gpt-4o-realtime-preview",
  modelName: "GPT-4o Realtime Preview",
  provider: "openai",
  hostedId: "gpt-4o-realtime-preview-2024-12-17",
  platformLink: OPENAI_PLATORM_LINK,
  imageInput: true,
  pricing: {
    currency: "USD",
    unit: "1M tokens",
    inputCost: 5,
    outputCost: 20
  }
}

const GPT4oMini: LLM = {
  modelId: "gpt-4o-mini",
  modelName: "GPT-4o Mini",
  provider: "openai",
  hostedId: "gpt-4o-mini-2024-07-18",
  platformLink: OPENAI_PLATORM_LINK,
  imageInput: true,
  pricing: {
    currency: "USD",
    unit: "1M tokens",
    inputCost: 0,
    outputCost: 0
  }
}

const GPT4oMiniAudioPreview: LLM = {
  modelId: "gpt-4o-mini-audio-preview",
  modelName: "GPT-4o Mini Audio Preview",
  provider: "openai",
  hostedId: "gpt-4o-mini-audio-preview-2024-12-17",
  platformLink: OPENAI_PLATORM_LINK,
  imageInput: true,
  pricing: {
    currency: "USD",
    unit: "1M tokens",
    inputCost: 0,
    outputCost: 0
  }
}

const GPT4oMiniRealtimePreview: LLM = {
  modelId: "gpt-4o-mini-realtime-preview",
  modelName: "GPT-4o Mini Realtime Preview",
  provider: "openai",
  hostedId: "gpt-4o-mini-realtime-preview-2024-12-17",
  platformLink: OPENAI_PLATORM_LINK,
  imageInput: true,
  pricing: {
    currency: "USD",
    unit: "1M tokens",
    inputCost: 0,
    outputCost: 2
  }
}

const O1: LLM = {
  modelId: "o1",
  modelName: "O1",
  provider: "openai",
  hostedId: "o1-2024-12-17",
  platformLink: OPENAI_PLATORM_LINK,
  imageInput: true,
  pricing: {
    currency: "USD",
    unit: "1M tokens",
    inputCost: 15,
    outputCost: 60
  }
}

const O1Pro: LLM = {
  modelId: "o1-pro",
  modelName: "O1 Pro",
  provider: "openai",
  hostedId: "o1-pro-2025-03-19",
  platformLink: OPENAI_PLATORM_LINK,
  imageInput: true,
  pricing: {
    currency: "USD",
    unit: "1M tokens",
    inputCost: 150,
    outputCost: 600
  }
}

const O3: LLM = {
  modelId: "o3",
  modelName: "O3",
  provider: "openai",
  hostedId: "o3-2025-04-16",
  platformLink: OPENAI_PLATORM_LINK,
  imageInput: true,
  pricing: {
    currency: "USD",
    unit: "1M tokens",
    inputCost: 10,
    outputCost: 40
  }
}

const O4Mini: LLM = {
  modelId: "o4-mini",
  modelName: "O4 Mini",
  provider: "openai",
  hostedId: "o4-mini-2025-04-16",
  platformLink: OPENAI_PLATORM_LINK,
  imageInput: true,
  pricing: {
    currency: "USD",
    unit: "1M tokens",
    inputCost: 1,
    outputCost: 4
  }
}

const O3Mini: LLM = {
  modelId: "o3-mini",
  modelName: "O3 Mini",
  provider: "openai",
  hostedId: "o3-mini-2025-01-31",
  platformLink: OPENAI_PLATORM_LINK,
  imageInput: true,
  pricing: {
    currency: "USD",
    unit: "1M tokens",
    inputCost: 1,
    outputCost: 4
  }
}

const O1Mini: LLM = {
  modelId: "o1-mini",
  modelName: "O1 Mini",
  provider: "openai",
  hostedId: "o1-mini-2024-09-12",
  platformLink: OPENAI_PLATORM_LINK,
  imageInput: true,
  pricing: {
    currency: "USD",
    unit: "1M tokens",
    inputCost: 1,
    outputCost: 4
  }
}

const GPT4oMiniSearchPreview: LLM = {
  modelId: "gpt-4o-mini-search-preview",
  modelName: "GPT-4o Mini Search Preview",
  provider: "openai",
  hostedId: "gpt-4o-mini-search-preview-2025-03-11",
  platformLink: OPENAI_PLATORM_LINK,
  imageInput: true,
  pricing: {
    currency: "USD",
    unit: "1M tokens",
    inputCost: 0,
    outputCost: 0
  }
}

const GPT4oSearchPreview: LLM = {
  modelId: "gpt-4o-search-preview",
  modelName: "GPT-4o Search Preview",
  provider: "openai",
  hostedId: "gpt-4o-search-preview-2025-03-11",
  platformLink: OPENAI_PLATORM_LINK,
  imageInput: true,
  pricing: {
    currency: "USD",
    unit: "1M tokens",
    inputCost: 2,
    outputCost: 10
  }
}

const ComputerUsePreview: LLM = {
  modelId: "computer-use-preview",
  modelName: "Computer Use Preview",
  provider: "openai",
  hostedId: "computer-use-preview-2025-03-11",
  platformLink: OPENAI_PLATORM_LINK,
  imageInput: true,
  pricing: {
    currency: "USD",
    unit: "1M tokens",
    inputCost: 3,
    outputCost: 12
  }
}

const GPTImage1: LLM = {
  modelId: "gpt-image-1",
  modelName: "GPT Image 1",
  provider: "openai",
  hostedId: "gpt-image-1",
  platformLink: OPENAI_PLATORM_LINK,
  imageInput: true,
  pricing: {
    currency: "USD",
    unit: "1M tokens",
    inputCost: 5
  }
}

export const OPENAI_LLM_LIST: LLM[] = [
  GPT41,
  GPT41Mini,
  GPT41Nano,
  GPT45Preview,
  GPT4o,
  GPT4oAudioPreview,
  GPT4oRealtimePreview,
  GPT4oMini,
  GPT4oMiniAudioPreview,
  GPT4oMiniRealtimePreview,
  O1,
  O1Pro,
  O3,
  O4Mini,
  O3Mini,
  O1Mini,
  GPT4oMiniSearchPreview,
  GPT4oSearchPreview,
  ComputerUsePreview,
  GPTImage1,
  GPT4Turbo,
  GPT4Vision,
  GPT4,
  GPT3_5Turbo
]
