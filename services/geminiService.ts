
import { GoogleGenAI, Type } from "@google/genai";
import { Product } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const getAIRecommendations = async (query: string, products: Product[]) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `
        用户正在寻找商品。用户输入是: "${query}"
        
        我们的商品列表如下: ${JSON.stringify(products.map(p => ({ id: p.id, name: p.name, tags: p.tags, description: p.description })))}
        
        请作为专业的购物助手，执行以下任务：
        1. 从列表中选出最相关的商品ID。
        2. 写一段亲切的导购建议，解释为什么推荐这些。
        
        输出必须是合法的JSON格式，包含 keys: "recommendedIds" (数组), "explanation" (字符串)。
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            recommendedIds: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            explanation: {
              type: Type.STRING
            }
          },
          required: ["recommendedIds", "explanation"]
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("AI Recommendation Error:", error);
    return {
      recommendedIds: [],
      explanation: "抱歉，我现在有点忙，建议您直接浏览下方的热门商品。"
    };
  }
};

export const getProductInsight = async (product: Product) => {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `请为这款商品写一个简短且吸引人的AI推荐语（50字以内）：${product.name}。它是${product.category}类别的商品，特点是：${product.tags.join(', ')}。`,
      });
      return response.text;
    } catch (error) {
      return "这是我们的精选好物，不容错过。";
    }
}
