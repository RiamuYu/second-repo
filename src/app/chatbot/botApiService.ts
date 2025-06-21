import { Message, MessageContent } from './types';

/**
 * Calls the GPT-4 Vision API and returns the bot's response
 * @param userMessage - The text message from the user
 * @param messageHistory - Array of previous messages in the conversation
 * @param imageUrl - Optional image URL to process (can be base64 data URL)
 * @returns Promise resolving to the bot's text response
 */
export const callBotApi = async (
  userMessage: string, 
  messageHistory: Message[], 
  imageUrl: string | null = null
): Promise<string> => {
  try {
    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, 300000); // 5 minute timeout

    // Prepare content array for the current user message
    const content: MessageContent[] = [
      {
        type: "text",
        text: userMessage,
      }
    ];
    
    // Add image to content if available
    if (imageUrl) {
      content.push({
        type: "image_url",
        image_url: {
          url: imageUrl,
          detail: "auto",
        },
      });
    }
    
    // Define system message to restrict conversation to agricultural topics
    const systemMessage = {
      role: "system",
      content: `Bạn là một trợ lý AI chuyên về nông nghiệp. Nhiệm vụ của bạn là cung cấp thông tin, hướng dẫn, và giải đáp thắc mắc về các chủ đề liên quan đến nông nghiệp như:
      
      - Trồng trọt và canh tác
      - Chăn nuôi và thú y
      - Thủy sản và nuôi trồng thủy sản
      - Bảo vệ thực vật và phòng trừ sâu bệnh
      - Nông nghiệp công nghệ cao và nông nghiệp thông minh
      - Nông nghiệp hữu cơ và bền vững
      - Chế biến và bảo quản nông sản
      - Thị trường nông sản và kinh tế nông nghiệp
      - Chính sách và quy định về nông nghiệp
      
      Nếu người dùng hỏi về các chủ đề không liên quan đến nông nghiệp, hãy lịch sự giải thích rằng bạn chỉ được thiết kế để hỗ trợ về các vấn đề nông nghiệp và đề nghị họ đặt câu hỏi liên quan đến lĩnh vực này.
     
      Hãy trả lời bằng tiếng Việt và thân thiện, đồng thời cung cấp thông tin chính xác và hữu ích.
       LƯU Ý: CHỈ TRẢ LỜI CÁC THÔNG TIN LIÊN QUAN TỚI CHỦ ĐỀ NÔNG NGHIỆP. KHÔNG ĐƯỢC TRẢ LỜI CÁC CÂU HỎI KHÁC.`
    };
    
    // Convert message history to API message format
    const conversationHistory = messageHistory.map(msg => {
      if (msg.sender === 'user') {
        // For user messages, check if they have an image
        if (msg.image) {
          return {
            role: "user",
            content: [
              { type: "text", text: msg.content || "" },
              { 
                type: "image_url", 
                image_url: { 
                  url: msg.image,
                  detail: "auto" 
                } 
              }
            ]
          };
        }
        return { role: "user", content: msg.content || "" };
      } else {
        // For AI messages
        return { role: "assistant", content: msg.content || "" };
      }
    });
    
    // Add current user message
    const currentUserMessage = {
      role: "user",
      content: content
    };
    
    // Prepare payload with system message, conversation history, and current user message
    const payload = {
      model: "gpt-4o",
      messages: [
        systemMessage,
        ...conversationHistory,
        currentUserMessage
      ],
      max_tokens: 4000,
    };
    
    // Call the API endpoint
    const response = await fetch("https://my-api-sage-ten.vercel.app/api/gpt-vision", {
      method: "POST", 
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    const data = await response.json();
    console.log("API response from OpenAI:", data);
    
    const answer = data?.choices?.[0]?.message?.content || "No response content.";
    
    // Return the answer
    return answer;
  } catch (error) {
    console.error("Error calling bot API:", error);
    throw error;
  }
}; 