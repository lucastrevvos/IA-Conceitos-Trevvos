import {
  createSession,
  chatAssistant,
} from "../../services/chat/chatService.js";

export const chatController = {
  start: async (req, res) => {
    try {
      const { documentId } = req.body;
      const sessionId = await createSession({ documentId });

      return res.json({
        ok: true,
        sessionId,
      });
    } catch (error) {
      return res.status(500).json({
        error: error.message,
      });
    }
  },

  message: async (req, res) => {
    try {
      const { sessionId, message } = req.body;

      const answer = await chatAssistant({ sessionId, message });

      return res.json({
        ok: true,
        answer,
      });
    } catch (error) {
      return res.status(500).json({
        error: error.message,
      });
    }
  },
};
